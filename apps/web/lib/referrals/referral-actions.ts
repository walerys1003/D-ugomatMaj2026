/**
 * Tier 5 zad. 246 — Server-side helpers dla affiliate / referral.
 *
 * Public surface:
 *   - getOrCreateReferralCode(userId)  → kod polecający (idempotent)
 *   - logReferralClick(code, ctx)      → insert do referral_clicks
 *   - readReferralCookie()             → odczyt cookie 'dlugomat-ref'
 *   - setReferralCookie(code)          → set cookie (90d, lax)
 *   - clearReferralCookie()            → po sign-up
 *   - listReferralStats(userId)        → kod + clicks + conversions dashboard
 *   - recordReferralConversion(...)    → wywoływane z webhook stripe
 *
 * Wszystko działa przez `createSupabaseAdminClient` (service_role) — bo:
 *   - kod jest tworzony przy sign-up zanim user ma sesję RLS (jeszcze nie),
 *   - clicks są anonimowe (RLS blokuje wszystko poza service),
 *   - conversions kontrolowane są przez webhook (no user session).
 */
import { cookies, headers } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

/** Cookie ustawiany przez `/r/[code]` redirect. 90 dni. */
export const REFERRAL_COOKIE = "dlugomat-ref";
const REFERRAL_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

export interface ReferralCodeRow {
  id: string;
  user_id: string;
  code: string;
  reward_pct: number;
  is_active: boolean;
  total_clicks: number;
  total_signups: number;
  total_revenue_grosze: number;
  created_at: string;
  updated_at: string;
}

/* ─────────────────────────────────────────────────────────────────────
   Generowanie kodu — short, czytelny, unikalny.
   Format: 8 znaków [A-Z0-9], unikamy zbitki I/O/0/1 (ambigous).
   ───────────────────────────────────────────────────────────────────── */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 znaki
const CODE_LENGTH = 8;

function generateCandidateCode(): string {
  let s = "";
  const buf = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(buf);
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length];
  }
  return s;
}

/**
 * Zwraca aktywny kod referralowy usera lub tworzy nowy (idempotent).
 *
 * Próbuje 5× wygenerować unikalny kod; przy kolizji przerywamy.
 * UNIQUE INDEX `uq_referral_codes_user_active` gwarantuje, że nie
 * stworzymy 2× aktywnego kodu dla tego samego usera (race-safe).
 */
export async function getOrCreateReferralCode(
  userId: string,
): Promise<ReferralCodeRow> {
  const adminBase = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = adminBase;

  // 1) Spróbuj odczytać istniejący aktywny kod.
  const { data: existing, error: selErr } = await admin
    .from("referral_codes")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (selErr) throw new Error(`referral select failed: ${selErr.message}`);
  if (existing) return existing as ReferralCodeRow;

  // 2) Wygeneruj — z retry przy kolizji code.
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCandidateCode();
    const { data, error } = await admin
      .from("referral_codes")
      .insert({ user_id: userId, code, is_active: true })
      .select("*")
      .single();

    if (!error && data) return data as ReferralCodeRow;
    lastErr = error;
    // 23505 = unique_violation → retry; inne błędy → break.
    if (error && (error as { code?: string }).code !== "23505") break;
  }
  throw new Error(
    `referral code creation failed after retries: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Click tracking
   ───────────────────────────────────────────────────────────────────── */

export interface ReferralClickContext {
  ip?: string | null;
  userAgent?: string | null;
  landingPath?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  httpReferrer?: string | null;
}

/**
 * Hash IP z salt (env). Jeśli salt nieustawiony → null (logujemy bez IP,
 * ale wciąż liczymy click).
 *
 * Używamy SubtleCrypto (Edge-safe), nie node:crypto.
 */
async function hashIp(ip: string | null | undefined): Promise<string | null> {
  if (!ip) return null;
  const salt = process.env.REFERRAL_IP_SALT;
  if (!salt) return null;
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  // hex
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex.slice(0, 32); // wystarczy 16 bajtów dla bucketingu
}

/**
 * Loguje kliknięcie. Idempotency: nie próbujemy deduplikować — każdy click
 * to event (analitycznie jak Pixel). Anti-spam: per-IP rate-limit zostawiamy
 * caller-owi (route handler), tu tylko zapis.
 */
export async function logReferralClick(
  code: string,
  ctx: ReferralClickContext,
): Promise<void> {
  const adminBase = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = adminBase;
  const ipHash = await hashIp(ctx.ip ?? null);

  const { error } = await admin.from("referral_clicks").insert({
    code,
    ip_hash: ipHash,
    ua: ctx.userAgent?.slice(0, 200) ?? null,
    landing_path: ctx.landingPath?.slice(0, 200) ?? null,
    utm_source: ctx.utmSource?.slice(0, 100) ?? null,
    utm_medium: ctx.utmMedium?.slice(0, 100) ?? null,
    utm_campaign: ctx.utmCampaign?.slice(0, 100) ?? null,
    http_referrer: ctx.httpReferrer?.slice(0, 500) ?? null,
  });

  if (error) {
    // Best-effort — nie blokujemy redirectu klienta na log error.
    // eslint-disable-next-line no-console
    console.warn("[referrals] log click failed:", error.message);
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Cookie helpers
   ───────────────────────────────────────────────────────────────────── */

export function readReferralCookie(): string | null {
  const v = cookies().get(REFERRAL_COOKIE)?.value?.trim();
  if (!v) return null;
  if (!/^[a-zA-Z0-9_-]{6,24}$/.test(v)) return null;
  return v.toUpperCase();
}

export function setReferralCookie(code: string): void {
  if (!/^[a-zA-Z0-9_-]{6,24}$/.test(code)) return;
  try {
    cookies().set(REFERRAL_COOKIE, code, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
    });
  } catch {
    /* read-only ctx — ignore */
  }
}

export function clearReferralCookie(): void {
  try {
    cookies().set(REFERRAL_COOKIE, "", { path: "/", maxAge: 0 });
  } catch {
    /* read-only ctx */
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Dashboard query: kod + ostatnie konwersje
   ───────────────────────────────────────────────────────────────────── */

export interface ReferralStats {
  code: ReferralCodeRow | null;
  recentConversions: Array<{
    id: string;
    code: string;
    amount_grosze: number;
    reward_grosze: number;
    status: string;
    created_at: string;
  }>;
  totals: {
    pending_grosze: number;
    approved_grosze: number;
    paid_grosze: number;
  };
}

export async function listReferralStats(
  userId: string,
): Promise<ReferralStats> {
  const adminBase = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = adminBase;

  const [codeRes, convRes] = await Promise.all([
    admin
      .from("referral_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
    admin
      .from("referral_conversions")
      .select("id, code, amount_grosze, reward_grosze, status, created_at")
      .eq("referrer_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (codeRes.error)
    throw new Error(`referral code load: ${codeRes.error.message}`);
  if (convRes.error)
    throw new Error(`referral conv load: ${convRes.error.message}`);

  const conversions = (convRes.data ?? []) as Array<{
    id: string;
    code: string;
    amount_grosze: number;
    reward_grosze: number;
    status: string;
    created_at: string;
  }>;

  const totals = conversions.reduce(
    (acc, c) => {
      if (c.status === "pending") acc.pending_grosze += c.reward_grosze;
      if (c.status === "approved") acc.approved_grosze += c.reward_grosze;
      if (c.status === "paid") acc.paid_grosze += c.reward_grosze;
      return acc;
    },
    { pending_grosze: 0, approved_grosze: 0, paid_grosze: 0 },
  );

  return {
    code: (codeRes.data as ReferralCodeRow | null) ?? null,
    recentConversions: conversions,
    totals,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Webhook: zapisz konwersję po udanym Stripe payment.
   Wywoływane z app/api/stripe/webhook/route.ts (payment_intent.succeeded
   lub checkout.session.completed).
   ───────────────────────────────────────────────────────────────────── */

export interface RecordConversionInput {
  refereeUserId: string;
  paymentId: string;
  caseId: string | null;
  amountGrosze: number;
}

/**
 * Sprawdza profile.referred_by_code → odnajduje aktywny kod → liczy reward
 * i wstawia referral_conversions (status='pending', do akceptacji adminem).
 *
 * Idempotent — uq_referral_conv_payment blokuje duplikaty.
 * Nigdy nie throw (logujemy warning) — payment flow nie może padnąć z
 * powodu błędu w referrals.
 */
export async function recordReferralConversion(
  input: RecordConversionInput,
): Promise<{ recorded: boolean; reason?: string }> {
  try {
    const adminBase = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = adminBase;

    // 1) Sprawdź profile.referred_by_code
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("id, referred_by_code")
      .eq("id", input.refereeUserId)
      .maybeSingle();

    if (pErr) {
      return { recorded: false, reason: `profile load: ${pErr.message}` };
    }
    if (!profile?.referred_by_code) {
      return { recorded: false, reason: "no_referred_by" };
    }

    // 2) Znajdź aktywny kod
    const { data: codeRow, error: cErr } = await admin
      .from("referral_codes")
      .select("user_id, code, reward_pct")
      .eq("code", profile.referred_by_code)
      .eq("is_active", true)
      .maybeSingle();

    if (cErr || !codeRow) {
      return { recorded: false, reason: "code_inactive" };
    }
    if (codeRow.user_id === input.refereeUserId) {
      return { recorded: false, reason: "self_referral" };
    }

    // 3) Snapshot reward
    const rewardPct = Number(codeRow.reward_pct);
    const rewardGrosze = Math.floor((input.amountGrosze * rewardPct) / 100);

    const { error: insErr } = await admin
      .from("referral_conversions")
      .insert({
        referrer_user_id: codeRow.user_id,
        referee_user_id: input.refereeUserId,
        code: codeRow.code,
        payment_id: input.paymentId,
        case_id: input.caseId,
        amount_grosze: input.amountGrosze,
        reward_pct: rewardPct,
        reward_grosze: rewardGrosze,
        status: "pending",
      });

    if (insErr) {
      // 23505 = duplicate (już raz zaksięgowane) → idempotent ok.
      if ((insErr as { code?: string }).code === "23505") {
        return { recorded: false, reason: "already_recorded" };
      }
      return { recorded: false, reason: `insert: ${insErr.message}` };
    }
    return { recorded: true };
  } catch (e) {
    return {
      recorded: false,
      reason: e instanceof Error ? e.message : String(e),
    };
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Helper: pełny URL polecający (do udostępnienia na social/mailem)
   ───────────────────────────────────────────────────────────────────── */

export function buildReferralLink(code: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://dlugomat.pl";
  return `${base}/r/${code}`;
}

/* ─────────────────────────────────────────────────────────────────────
   Helper: extract IP from request headers (fallback chain)
   ───────────────────────────────────────────────────────────────────── */

export function clientIpFromRequest(): string | null {
  const h = headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return null;
}
