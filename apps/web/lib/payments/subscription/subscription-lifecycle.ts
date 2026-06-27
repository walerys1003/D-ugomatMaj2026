/**
 * Tier 19 — Subscription lifecycle.
 *
 * Stany subskrypcji (FSM):
 *   trialing → active ⇄ past_due → canceled
 *               ↓
 *           paused ↺ resumed
 *
 * Powiązania:
 *  - Stripe webhooks: invoice.payment_succeeded/failed, customer.subscription.*
 *  - fakturownia: po payment_succeeded wystawiamy fakturę VAT
 *  - notifications: email D-7 przed renewal, D-1 past_due, D+3 final
 *
 * Reguły:
 *  - Trial 14 dni (configurable per plan), bez wymogu karty
 *  - 3 retries co 3 dni przy past_due, potem auto-cancel
 *  - Pauza max 90 dni, potem auto-resume z capture
 *  - Downgrade działa na koniec okresu, upgrade z pro-rata
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "canceled"
  | "incomplete"
  | "incomplete_expired";

export type PlanCode = "free" | "lite" | "pro" | "business" | "enterprise";

export interface Subscription {
  id: string;
  user_id: string;
  org_id: string | null;
  plan_code: PlanCode;
  status: SubscriptionStatus;
  trial_end: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  paused_at: string | null;
  paused_until: string | null;
  past_due_retries: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  pending_plan_change: PlanCode | null;
  pending_effective_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const PAST_DUE_MAX_RETRIES = 3;
const PAUSE_MAX_DAYS = 90;

export async function startTrial(args: {
  userId: string;
  orgId?: string | null;
  planCode: PlanCode;
  trialDays?: number;
}): Promise<Subscription> {
  const supabase = await createSupabaseServerClient();
  const trialDays = args.trialDays ?? 14;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: args.userId,
      org_id: args.orgId ?? null,
      plan_code: args.planCode,
      status: "trialing",
      trial_end: trialEnd.toISOString(),
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      cancel_at_period_end: false,
      past_due_retries: 0,
      metadata: {},
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Subscription;
}

export async function activateSubscription(
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      past_due_retries: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function markPastDue(subscriptionId: string): Promise<{ shouldCancel: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("subscriptions")
    .select("past_due_retries")
    .eq("id", subscriptionId)
    .single();
  if (error || !row) throw error ?? new Error("subscription not found");

  const retries = (row.past_due_retries ?? 0) + 1;
  if (retries > PAST_DUE_MAX_RETRIES) {
    await cancelSubscription(subscriptionId, { reason: "max_retries_exceeded" });
    return { shouldCancel: true };
  }
  const { error: updErr } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      past_due_retries: retries,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
  if (updErr) throw updErr;
  return { shouldCancel: false };
}

export async function pauseSubscription(
  subscriptionId: string,
  resumeAt: Date,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const maxResume = new Date(now.getTime() + PAUSE_MAX_DAYS * 24 * 60 * 60 * 1000);
  const effective = resumeAt > maxResume ? maxResume : resumeAt;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "paused",
      paused_at: now.toISOString(),
      paused_until: effective.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function resumeSubscription(subscriptionId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      paused_at: null,
      paused_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function scheduleDowngrade(
  subscriptionId: string,
  newPlan: PlanCode,
  effectiveAt: Date,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      pending_plan_change: newPlan,
      pending_effective_at: effectiveAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function applyImmediateUpgrade(
  subscriptionId: string,
  newPlan: PlanCode,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_code: newPlan,
      pending_plan_change: null,
      pending_effective_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function cancelSubscription(
  subscriptionId: string,
  opts: { atPeriodEnd?: boolean; reason?: string } = {},
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const update = opts.atPeriodEnd
    ? { cancel_at_period_end: true }
    : { status: "canceled" as const, cancel_at_period_end: false };
  const { error } = await supabase
    .from("subscriptions")
    .update({
      ...update,
      metadata: { cancel_reason: opts.reason ?? "user_request" },
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["trialing", "active", "past_due", "paused"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Subscription | null;
}

/**
 * Pro-rata charge calculation for mid-cycle upgrade.
 *   pro_rata = (newPrice - oldPrice) * (daysRemaining / daysInCycle)
 */
export function computeProRata(args: {
  oldPriceCents: number;
  newPriceCents: number;
  periodStart: Date;
  periodEnd: Date;
  now?: Date;
}): { proRataCents: number; daysRemaining: number; daysInCycle: number } {
  const now = args.now ?? new Date();
  const daysInCycle = Math.max(
    1,
    Math.round((args.periodEnd.getTime() - args.periodStart.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const daysRemaining = Math.max(
    0,
    Math.round((args.periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const diff = args.newPriceCents - args.oldPriceCents;
  const proRataCents = Math.max(0, Math.round((diff * daysRemaining) / daysInCycle));
  return { proRataCents, daysRemaining, daysInCycle };
}
