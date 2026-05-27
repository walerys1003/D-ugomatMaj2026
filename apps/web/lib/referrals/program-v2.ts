/**
 * Długomat — Tier 8 — Referral program v2 (invite-a-friend).
 *
 * Mechanizm różny od affiliate:
 *  - Affiliate = profesjonalna promocja (kancelaria/blog) z prowizją %.
 *  - Referral = peer-to-peer "polecenie znajomemu" → both get credit.
 *
 * Flow:
 *  1. User A klika "Zaproś znajomego" → generuje invite_code (np. "DLK-A4F2C9")
 *  2. User A wysyła link: dlugomat.pl/r/DLK-A4F2C9
 *  3. User B rejestruje się przez ten link → INSERT referral_redemption
 *  4. User B opłaca pierwsze pismo → BOTH dostają credit:
 *      - User A: 30 zł zniżki na następne pismo (referral_credit)
 *      - User B: 30 zł zniżki już na bieżące pismo (auto-applied)
 *  5. Limit: 10 udanych poleceń na usera / 12 miesięcy.
 */
import "server-only";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export const REFERRAL_CREDIT_GROSZE = 3_000; // 30 zł
export const REFERRAL_LIMIT_PER_YEAR = 10;

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses: number;
  created_at: string;
}

export async function getOrCreateReferralCode(userId: string): Promise<ReferralCode> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: existing } = await sb
    .from("referral_codes_v2")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing as ReferralCode;

  const code = `DLK-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const { data, error } = await sb
    .from("referral_codes_v2")
    .insert({ user_id: userId, code, uses: 0 })
    .select("*")
    .single();
  if (error) throw error;
  return data as ReferralCode;
}

export async function findReferralByCode(code: string): Promise<ReferralCode | null> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data } = await sb
    .from("referral_codes_v2")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  return (data as ReferralCode) ?? null;
}

/**
 * Wywołuje przy signup nowego usera (jeśli ma ?ref=DLK-XXX).
 */
export async function recordReferralRedemption(
  inviteeUserId: string,
  code: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const ref = await findReferralByCode(code);
  if (!ref) return;
  if (ref.user_id === inviteeUserId) return; // self-referral block

  await sb
    .from("referral_redemptions_v2")
    .upsert(
      {
        referrer_user_id: ref.user_id,
        invitee_user_id: inviteeUserId,
        code: ref.code,
        status: "signed_up",
      },
      { onConflict: "referrer_user_id,invitee_user_id", ignoreDuplicates: true },
    );
}

/**
 * Wywołuje z webhooka payment.completed dla pierwszej płatności usera B.
 */
export async function awardReferralCredits(inviteeUserId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: redemption } = await sb
    .from("referral_redemptions_v2")
    .select("*")
    .eq("invitee_user_id", inviteeUserId)
    .eq("status", "signed_up")
    .maybeSingle();
  if (!redemption) return;

  const r = redemption as any;

  // Check yearly limit
  const yearAgo = new Date(Date.now() - 365 * 86_400_000).toISOString();
  const { count } = await sb
    .from("referral_credits_v2")
    .select("id", { count: "exact", head: true })
    .eq("user_id", r.referrer_user_id)
    .gte("created_at", yearAgo);
  if ((count ?? 0) >= REFERRAL_LIMIT_PER_YEAR) {
    await sb
      .from("referral_redemptions_v2")
      .update({ status: "limit_exceeded" })
      .eq("id", r.id);
    return;
  }

  // Award credit to referrer
  await sb.from("referral_credits_v2").insert({
    user_id: r.referrer_user_id,
    amount_grosze: REFERRAL_CREDIT_GROSZE,
    source_redemption_id: r.id,
    expires_at: new Date(Date.now() + 365 * 86_400_000).toISOString(),
  });

  // Award credit to invitee (already used or pending — depends on UX)
  await sb.from("referral_credits_v2").insert({
    user_id: r.invitee_user_id,
    amount_grosze: REFERRAL_CREDIT_GROSZE,
    source_redemption_id: r.id,
    expires_at: new Date(Date.now() + 90 * 86_400_000).toISOString(),
  });

  await sb
    .from("referral_redemptions_v2")
    .update({
      status: "credited",
      credited_at: new Date().toISOString(),
    })
    .eq("id", r.id);

  await sb.rpc("fn_increment_referral_uses", { p_code: r.code });
}

export interface ReferralBalance {
  totalGrosze: number;
  expiringSoonGrosze: number;
  credits: Array<{
    id: string;
    amount_grosze: number;
    expires_at: string;
    used_grosze: number;
    remaining_grosze: number;
  }>;
}

export async function getReferralBalance(userId: string): Promise<ReferralBalance> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const now = new Date().toISOString();
  const soon = new Date(Date.now() + 30 * 86_400_000).toISOString();

  const { data } = await sb
    .from("referral_credits_v2")
    .select("id, amount_grosze, expires_at, used_grosze")
    .eq("user_id", userId)
    .gt("expires_at", now)
    .order("expires_at", { ascending: true });

  const credits = ((data as any[]) ?? []).map((c) => ({
    id: c.id,
    amount_grosze: c.amount_grosze,
    expires_at: c.expires_at,
    used_grosze: c.used_grosze ?? 0,
    remaining_grosze: c.amount_grosze - (c.used_grosze ?? 0),
  }));
  const total = credits.reduce((s, c) => s + c.remaining_grosze, 0);
  const expiringSoon = credits
    .filter((c) => c.expires_at <= soon)
    .reduce((s, c) => s + c.remaining_grosze, 0);

  return { totalGrosze: total, expiringSoonGrosze: expiringSoon, credits };
}

/**
 * Przy checkout — konsumuje credity (FIFO po dacie wygaśnięcia).
 */
export async function consumeReferralCredits(
  userId: string,
  amountGrosze: number,
): Promise<number> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const balance = await getReferralBalance(userId);
  let remaining = Math.min(amountGrosze, balance.totalGrosze);
  const consumed = remaining;

  for (const credit of balance.credits) {
    if (remaining <= 0) break;
    const take = Math.min(credit.remaining_grosze, remaining);
    await sb
      .from("referral_credits_v2")
      .update({ used_grosze: credit.used_grosze + take })
      .eq("id", credit.id);
    remaining -= take;
  }

  return consumed;
}
