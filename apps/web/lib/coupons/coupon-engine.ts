/**
 * Długomat — Tier 8 — Coupon engine v2 (extension of promo-codes for subscriptions).
 *
 * Różnica vs `payments/promo-codes.ts`:
 *  - promo-codes = jednorazowy zakup (per case_type / bundle).
 *  - coupons     = subskrypcje (Stripe Coupons + Promotion Codes), dłuższe okresy
 *    rabatu (np. 50% off pierwsze 3 miesiące, lub 10% off na zawsze).
 *
 * Sync z Stripe:
 *  - createStripeCoupon() — tworzy Coupon + PromotionCode w Stripe
 *  - syncCouponFromStripe() — webhook coupon.{created,updated}
 *
 * Lokalna tabela `subscription_coupons` przechowuje metadata + analytics
 * (ile razy użyty, jaka konwersja).
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export interface SubscriptionCoupon {
  id: string;
  code: string;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  discount_pct: number | null;
  discount_grosze: number | null;
  duration: "once" | "repeating" | "forever";
  duration_in_months: number | null;
  max_redemptions: number | null;
  current_redemptions: number;
  applies_to_plans: string[] | null;
  valid_until: string | null;
  is_active: boolean;
  campaign_label: string | null;
  created_at: string;
}

export interface CreateCouponInput {
  code: string;
  discountPct?: number;
  discountGrosze?: number;
  duration: "once" | "repeating" | "forever";
  durationInMonths?: number;
  maxRedemptions?: number;
  appliesToPlans?: string[];
  validUntil?: string;
  campaignLabel?: string;
}

export async function createSubscriptionCoupon(
  input: CreateCouponInput,
): Promise<SubscriptionCoupon> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY missing");
  const StripeMod = await import("stripe").catch(() => null);
  if (!StripeMod) throw new Error("stripe SDK missing");
  const Stripe = StripeMod.default ?? StripeMod;
  const stripe = new (Stripe as any)(secretKey, { apiVersion: "2024-06-20" });

  const couponPayload: Record<string, unknown> = {
    duration: input.duration,
  };
  if (input.discountPct) couponPayload.percent_off = input.discountPct;
  if (input.discountGrosze) {
    couponPayload.amount_off = input.discountGrosze;
    couponPayload.currency = "pln";
  }
  if (input.duration === "repeating") {
    couponPayload.duration_in_months = input.durationInMonths ?? 3;
  }
  if (input.maxRedemptions) couponPayload.max_redemptions = input.maxRedemptions;
  if (input.validUntil) {
    couponPayload.redeem_by = Math.floor(new Date(input.validUntil).getTime() / 1000);
  }

  const stripeCoupon = await stripe.coupons.create(couponPayload);
  const stripePromo = await stripe.promotionCodes.create({
    coupon: stripeCoupon.id,
    code: input.code,
    max_redemptions: input.maxRedemptions,
    expires_at: input.validUntil
      ? Math.floor(new Date(input.validUntil).getTime() / 1000)
      : undefined,
  });

  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("subscription_coupons")
    .insert({
      code: input.code.toUpperCase(),
      stripe_coupon_id: stripeCoupon.id,
      stripe_promotion_code_id: stripePromo.id,
      discount_pct: input.discountPct ?? null,
      discount_grosze: input.discountGrosze ?? null,
      duration: input.duration,
      duration_in_months: input.durationInMonths ?? null,
      max_redemptions: input.maxRedemptions ?? null,
      current_redemptions: 0,
      applies_to_plans: input.appliesToPlans ?? null,
      valid_until: input.validUntil ?? null,
      is_active: true,
      campaign_label: input.campaignLabel ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as SubscriptionCoupon;
}

export async function getCouponByCode(code: string): Promise<SubscriptionCoupon | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("subscription_coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();
  return (data as SubscriptionCoupon) ?? null;
}

export async function recordCouponRedemption(
  couponId: string,
  userId: string,
  subscriptionId: string,
): Promise<void> {
  const sb = createSupabaseAdminClient();
  await sb.from("subscription_coupon_redemptions").insert({
    coupon_id: couponId,
    user_id: userId,
    subscription_id: subscriptionId,
  });
  await sb.rpc("fn_increment_coupon_redemption", { p_coupon_id: couponId });
}

export async function listActiveCampaigns(): Promise<SubscriptionCoupon[]> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("subscription_coupons")
    .select("*")
    .eq("is_active", true)
    .not("campaign_label", "is", null)
    .order("created_at", { ascending: false });
  return (data as SubscriptionCoupon[]) ?? [];
}
