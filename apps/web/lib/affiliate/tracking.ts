/**
 * Długomat — Tier 8 — Affiliate program tracking.
 *
 * Flow:
 *  1. Affiliate signs up → gets unique slug (e.g., "kancelaria-nowak").
 *  2. Affiliate shares link: https://dlugomat.pl/?ref=kancelaria-nowak
 *  3. Middleware/landing reads ?ref → cookie 90d, INSERT affiliate_clicks.
 *  4. User signs up → affiliate_referrals row (status: signed_up).
 *  5. User pays → affiliate_referrals.status = converted, commission computed.
 *  6. Monthly batch → affiliate_payouts (po przekroczeniu progu 200 zł).
 *
 * Commission: 20% pierwszego płatnego okresu (pierwsza faktura), 10% kolejnych
 * przez 12 miesięcy (life-time-attribution z TTL 365 dni od signup).
 */
import "server-only";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export const AFFILIATE_COOKIE = "dlk_ref";
export const AFFILIATE_COOKIE_TTL_DAYS = 90;
export const ATTRIBUTION_WINDOW_DAYS = 365;

export interface AffiliateAccount {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  payout_email: string;
  commission_first_payment_pct: number;
  commission_recurring_pct: number;
  commission_recurring_months: number;
  status: "pending" | "active" | "suspended";
  created_at: string;
}

export interface CreateAffiliateInput {
  userId: string;
  displayName: string;
  payoutEmail: string;
  preferredSlug?: string;
}

export async function createAffiliateAccount(
  input: CreateAffiliateInput,
): Promise<AffiliateAccount> {
  const sb = createSupabaseAdminClient();
  const slug = await ensureUniqueSlug(input.preferredSlug ?? slugify(input.displayName));

  const { data, error } = await sb
    .from("affiliate_accounts")
    .insert({
      user_id: input.userId,
      slug,
      display_name: input.displayName,
      payout_email: input.payoutEmail,
      commission_first_payment_pct: 20,
      commission_recurring_pct: 10,
      commission_recurring_months: 12,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as AffiliateAccount;
}

export async function getAffiliateBySlug(slug: string): Promise<AffiliateAccount | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("affiliate_accounts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return (data as AffiliateAccount) ?? null;
}

export async function trackAffiliateClick(
  slug: string,
  meta: { ipHash?: string; userAgent?: string; referer?: string; landingPath?: string },
): Promise<void> {
  const sb = createSupabaseAdminClient();
  const aff = await getAffiliateBySlug(slug);
  if (!aff) return;
  await sb.from("affiliate_clicks").insert({
    affiliate_id: aff.id,
    slug,
    ip_hash: meta.ipHash ?? null,
    user_agent: (meta.userAgent ?? "").slice(0, 500),
    referer: (meta.referer ?? "").slice(0, 500),
    landing_path: (meta.landingPath ?? "/").slice(0, 200),
  });
}

/**
 * Wywoływane przy signup nowego usera — łączy go z affiliate (jeśli jest cookie).
 * Stosuje atrybucję first-touch (kto pierwszy ten lepszy w oknie 365d).
 */
export async function attributeSignup(
  userId: string,
  affiliateSlug: string | null,
): Promise<void> {
  if (!affiliateSlug) return;
  const sb = createSupabaseAdminClient();
  const aff = await getAffiliateBySlug(affiliateSlug);
  if (!aff) return;

  // Idempotent — unique on (affiliate_id, user_id)
  await sb
    .from("affiliate_referrals")
    .upsert(
      {
        affiliate_id: aff.id,
        user_id: userId,
        status: "signed_up",
        attributed_at: new Date().toISOString(),
        attribution_expires_at: new Date(
          Date.now() + ATTRIBUTION_WINDOW_DAYS * 86_400_000,
        ).toISOString(),
      },
      { onConflict: "affiliate_id,user_id", ignoreDuplicates: true },
    );
}

/**
 * Wywoływane z webhooka payment.completed — kapituluje prowizję.
 */
export async function recordCommission(
  userId: string,
  paymentId: string,
  paymentGrosze: number,
  isFirstPayment: boolean,
): Promise<void> {
  const sb = createSupabaseAdminClient();
  // Find active referral for this user. Embedded resource
  // (affiliate:affiliate_accounts) nie jest inferowany przez typed-select,
  // więc modelujemy kształt złączenia lokalnym typem (jeden, udokumentowany
  // rzut zamiast rozsianych `as any`).
  const { data } = await sb
    .from("affiliate_referrals")
    .select("*, affiliate:affiliate_accounts(*)")
    .eq("user_id", userId)
    .gt("attribution_expires_at", new Date().toISOString())
    .order("attributed_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const ref = data as
    | { id: string; affiliate: AffiliateAccount | null }
    | null;
  if (!ref || !ref.affiliate) return;
  const aff = ref.affiliate;
  const pct = isFirstPayment
    ? aff.commission_first_payment_pct
    : aff.commission_recurring_pct;
  const commission = Math.floor((paymentGrosze * pct) / 100);

  await sb.from("affiliate_commissions").insert({
    affiliate_id: aff.id,
    referral_id: ref.id,
    user_id: userId,
    payment_id: paymentId,
    amount_grosze: commission,
    commission_pct: pct,
    is_first_payment: isFirstPayment,
    status: "pending",
  });

  // Mark referral as converted on first payment
  if (isFirstPayment) {
    await sb
      .from("affiliate_referrals")
      .update({ status: "converted", converted_at: new Date().toISOString() })
      .eq("id", ref.id);
  }
}

export interface AffiliateStats {
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  pendingCommissionGrosze: number;
  paidCommissionGrosze: number;
  conversionRate: number;
}

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  const sb = createSupabaseAdminClient();
  const [{ count: clicks }, { count: signups }, { count: conv }, { data: comms }] =
    await Promise.all([
      sb
        .from("affiliate_clicks")
        .select("id", { count: "exact", head: true })
        .eq("affiliate_id", affiliateId),
      sb
        .from("affiliate_referrals")
        .select("id", { count: "exact", head: true })
        .eq("affiliate_id", affiliateId),
      sb
        .from("affiliate_referrals")
        .select("id", { count: "exact", head: true })
        .eq("affiliate_id", affiliateId)
        .eq("status", "converted"),
      sb
        .from("affiliate_commissions")
        .select("amount_grosze, status")
        .eq("affiliate_id", affiliateId),
    ]);

  let pending = 0;
  let paid = 0;
  for (const c of (comms as Array<{ amount_grosze: number; status: string }>) ?? []) {
    if (c.status === "paid") paid += c.amount_grosze;
    else pending += c.amount_grosze;
  }

  const totalSignups = signups ?? 0;
  const totalConversions = conv ?? 0;
  return {
    totalClicks: clicks ?? 0,
    totalSignups,
    totalConversions,
    pendingCommissionGrosze: pending,
    paidCommissionGrosze: paid,
    conversionRate: totalSignups > 0 ? totalConversions / totalSignups : 0,
  };
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "affiliate";
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const sb = createSupabaseAdminClient();
  let slug = base;
  for (let i = 0; i < 10; i += 1) {
    const { data } = await sb
      .from("affiliate_accounts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${crypto.randomBytes(2).toString("hex")}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
