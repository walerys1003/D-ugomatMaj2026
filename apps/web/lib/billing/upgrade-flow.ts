/**
 * Długomat — Tier 8 — Upgrade/downgrade flow with proration.
 *
 * Reguły zmian planu:
 *  - Upgrade (Starter → Pro) — natychmiast, proration credit za niewykorzystany okres
 *  - Downgrade (Pro → Starter) — wchodzi w życie na koniec current_period_end
 *  - Same-plan cycle change (monthly → annual) — natychmiast z proration
 *  - Trial → Paid — automatycznie po trial_end
 *
 * Stripe robi proration automatycznie gdy `proration_behavior=create_prorations`.
 */
import "server-only";
import type { BillingPlanId, BillingCycle } from "./plans";
import { getStripePriceId } from "./plans";
import { getActiveSubscription } from "./subscriptions";

export interface UpgradePreview {
  currentPlan: BillingPlanId;
  targetPlan: BillingPlanId;
  immediateChargeGrosze: number;
  effectiveDate: string;
  prorationCredit: number;
  isImmediate: boolean;
}

export async function previewPlanChange(
  userId: string,
  targetPlan: Exclude<BillingPlanId, "free">,
  targetCycle: BillingCycle,
): Promise<UpgradePreview | null> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return null;
  if (!sub.stripe_subscription_id) return null;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY missing");
  const StripeMod = await import("stripe").catch(() => null);
  if (!StripeMod) throw new Error("stripe SDK missing");
  const Stripe = StripeMod.default ?? StripeMod;
  const stripe = new (Stripe as any)(secretKey, { apiVersion: "2024-06-20" });

  const priceId = getStripePriceId(targetPlan, targetCycle);
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

  // Stripe Invoice Preview — co user zapłaci natychmiast
  const upcoming = await stripe.invoices.retrieveUpcoming({
    customer: stripeSub.customer,
    subscription: sub.stripe_subscription_id,
    subscription_items: [
      {
        id: stripeSub.items.data[0].id,
        price: priceId,
      },
    ],
    subscription_proration_behavior: "create_prorations",
  });

  const immediate = (upcoming.total ?? 0) as number; // grosze
  const credit =
    (upcoming.lines?.data ?? [])
      .filter((l: any) => (l.amount ?? 0) < 0)
      .reduce((s: number, l: any) => s + Math.abs(l.amount ?? 0), 0) ?? 0;

  return {
    currentPlan: sub.plan_id,
    targetPlan,
    immediateChargeGrosze: immediate,
    effectiveDate: new Date().toISOString(),
    prorationCredit: credit,
    isImmediate: true,
  };
}

export async function executePlanChange(
  userId: string,
  targetPlan: Exclude<BillingPlanId, "free">,
  targetCycle: BillingCycle,
): Promise<{ ok: boolean; effectiveDate: string }> {
  const sub = await getActiveSubscription(userId);
  if (!sub || !sub.stripe_subscription_id) return { ok: false, effectiveDate: "" };

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY missing");
  const StripeMod = await import("stripe").catch(() => null);
  if (!StripeMod) throw new Error("stripe SDK missing");
  const Stripe = StripeMod.default ?? StripeMod;
  const stripe = new (Stripe as any)(secretKey, { apiVersion: "2024-06-20" });

  const priceId = getStripePriceId(targetPlan, targetCycle);
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: stripeSub.items.data[0].id, price: priceId }],
    proration_behavior: "create_prorations",
    metadata: { ...stripeSub.metadata, plan_id: targetPlan, cycle: targetCycle },
  });

  return { ok: true, effectiveDate: new Date().toISOString() };
}
