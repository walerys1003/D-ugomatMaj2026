/**
 * Długomat — Tier 8 — subscription management (Stripe-backed).
 *
 * Reprezentuje aktywną subskrypcję usera (tabela `subscriptions`).
 * Logika:
 *  - createSubscriptionCheckout: tworzy Stripe Checkout Session w trybie subscription
 *  - syncSubscriptionFromStripe: webhook handler — upsert do `subscriptions`
 *  - cancelSubscription: ustawia cancel_at_period_end=true w Stripe + marker w DB
 *  - resumeSubscription: cofa cancellation
 *  - getActiveSubscription: zwraca aktywny plan dla user_id (z fallback do `free`)
 *  - usage tracking: `subscription_usage` (period-bucketed liczniki)
 *
 * Reguły wyboru planu:
 *  - Default = `free` (gdy brak rekordu)
 *  - Active subscription = status in (active, trialing, past_due)
 *    (past_due tolerujemy ~7 dni do retry payment)
 *  - Canceled przy końcu okresu — plan działa do current_period_end
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { getPlan, getStripePriceId, type BillingPlanId, type BillingCycle } from "./plans";
import { getStripeClient } from "./stripe-client";

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  tenant_id: string | null;
  plan_id: BillingPlanId;
  cycle: BillingCycle;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "unpaid";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionInput {
  userId: string;
  email: string;
  planId: Exclude<BillingPlanId, "free">;
  cycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
  promotionCode?: string | null;
  trialDays?: number;
  tenantId?: string | null;
}

export interface CreateSubscriptionResult {
  checkoutUrl: string;
  sessionId: string;
}

/**
 * Tworzy Stripe Checkout Session dla subskrypcji. Lazy-imports stripe.
 */
export async function createSubscriptionCheckout(
  input: CreateSubscriptionInput,
): Promise<CreateSubscriptionResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY nie jest skonfigurowany.");
  }
  const priceId = getStripePriceId(input.planId, input.cycle);

  // Lazy import — stripe SDK is heavy (typowany loader, bez `as any`)
  const stripe = await getStripeClient(secretKey);
  if (!stripe) {
    throw new Error("stripe SDK nie jest zainstalowany.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    discounts: input.promotionCode ? [{ promotion_code: input.promotionCode }] : undefined,
    subscription_data: {
      trial_period_days: input.trialDays,
      metadata: {
        user_id: input.userId,
        plan_id: input.planId,
        cycle: input.cycle,
        tenant_id: input.tenantId ?? "",
      },
    },
    metadata: {
      user_id: input.userId,
      plan_id: input.planId,
      cycle: input.cycle,
      kind: "subscription",
    },
  });

  return { checkoutUrl: session.url ?? "", sessionId: session.id };
}

/**
 * Upsert do `subscriptions` na podstawie Stripe Subscription object.
 * Wywoływane z webhooka customer.subscription.{created,updated,deleted}.
 */
export async function syncSubscriptionFromStripe(
  stripeSub: Record<string, any>,
): Promise<void> {
  const sb = createSupabaseAdminClient();
  const userId = stripeSub.metadata?.user_id;
  if (!userId) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[subscriptions] sync: brak user_id w metadata", stripeSub.id);
    }
    return;
  }
  const planId = (stripeSub.metadata?.plan_id ?? "starter") as BillingPlanId;
  const cycle = (stripeSub.metadata?.cycle ?? "monthly") as BillingCycle;
  const tenantId = stripeSub.metadata?.tenant_id || null;

  const row = {
    user_id: userId,
    tenant_id: tenantId,
    plan_id: planId,
    cycle,
    status: stripeSub.status,
    stripe_customer_id: stripeSub.customer,
    stripe_subscription_id: stripeSub.id,
    current_period_start: new Date((stripeSub.current_period_start ?? 0) * 1000).toISOString(),
    current_period_end: new Date((stripeSub.current_period_end ?? 0) * 1000).toISOString(),
    cancel_at_period_end: !!stripeSub.cancel_at_period_end,
    trial_end: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  await sb
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });
}

export async function getActiveSubscription(userId: string): Promise<SubscriptionRecord | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as SubscriptionRecord) ?? null;
}

export async function getEffectivePlan(userId: string): Promise<BillingPlanId> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return "free";
  // Cancel at period end — nadal aktywny do current_period_end
  return sub.plan_id;
}

export async function cancelSubscription(stripeSubscriptionId: string): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY missing");
  const stripe = await getStripeClient(secretKey);
  if (!stripe) throw new Error("stripe SDK missing");
  await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });
}

export async function resumeSubscription(stripeSubscriptionId: string): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY missing");
  const stripe = await getStripeClient(secretKey);
  if (!stripe) throw new Error("stripe SDK missing");
  await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: false });
}

// -----------------------------------------------------------------------------
// Usage tracking — limity per plan (cases / AI gen)
// -----------------------------------------------------------------------------

export interface UsageSnapshot {
  planId: BillingPlanId;
  periodStart: string;
  periodEnd: string;
  casesCreated: number;
  aiGenerations: number;
  caseLimit: number | null;
  aiGenerationsLimit: number | null;
}

export async function getCurrentUsage(userId: string): Promise<UsageSnapshot> {
  const sb = createSupabaseAdminClient();
  const sub = await getActiveSubscription(userId);
  const planId = sub?.plan_id ?? "free";
  const plan = getPlan(planId);

  const periodStart = sub?.current_period_start ?? monthStartIso();
  const periodEnd = sub?.current_period_end ?? monthEndIso();

  const { data } = await sb
    .from("subscription_usage")
    .select("cases_created, ai_generations")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();

  return {
    planId,
    periodStart,
    periodEnd,
    casesCreated: data?.cases_created ?? 0,
    aiGenerations: data?.ai_generations ?? 0,
    caseLimit: plan.caseLimit,
    aiGenerationsLimit: plan.aiGenerationsPerMonth,
  };
}

export async function incrementUsage(
  userId: string,
  field: "cases_created" | "ai_generations",
  delta: number = 1,
): Promise<void> {
  const sb = createSupabaseAdminClient();
  const sub = await getActiveSubscription(userId);
  const periodStart = sub?.current_period_start ?? monthStartIso();
  const periodEnd = sub?.current_period_end ?? monthEndIso();

  // Upsert + atomic increment via RPC (created in migration)
  await sb.rpc("fn_increment_subscription_usage", {
    p_user_id: userId,
    p_period_start: periodStart,
    p_period_end: periodEnd,
    p_field: field,
    p_delta: delta,
  });
}

export async function canConsume(
  userId: string,
  field: "cases_created" | "ai_generations",
): Promise<{ allowed: boolean; reason?: string; usage: UsageSnapshot }> {
  const usage = await getCurrentUsage(userId);
  if (field === "cases_created") {
    if (usage.caseLimit === null) return { allowed: true, usage };
    if (usage.casesCreated < usage.caseLimit) return { allowed: true, usage };
    return {
      allowed: false,
      reason: `Limit ${usage.caseLimit} spraw / okres rozliczeniowy osiągnięty.`,
      usage,
    };
  }
  if (usage.aiGenerationsLimit === null) return { allowed: true, usage };
  if (usage.aiGenerations < usage.aiGenerationsLimit) return { allowed: true, usage };
  return {
    allowed: false,
    reason: `Limit ${usage.aiGenerationsLimit} generacji AI osiągnięty.`,
    usage,
  };
}

function monthStartIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function monthEndIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59)).toISOString();
}
