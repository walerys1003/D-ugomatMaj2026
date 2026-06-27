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
import { getStripeClient } from "./stripe-client";

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
  const stripe = await getStripeClient(secretKey);
  if (!stripe) throw new Error("stripe SDK missing");

  const priceId = getStripePriceId(targetPlan, targetCycle);
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

  // `customer` może być stringiem albo rozwiniętym obiektem Customer — Stripe
  // API oczekuje tu identyfikatora. Wyciągamy id (wcześniej maskowane `as any`).
  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer.id;

  // Stripe Invoice Preview — co user zapłaci natychmiast
  const upcoming = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
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
  const stripe = await getStripeClient(secretKey);
  if (!stripe) throw new Error("stripe SDK missing");

  const priceId = getStripePriceId(targetPlan, targetCycle);
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: stripeSub.items.data[0].id, price: priceId }],
    proration_behavior: "create_prorations",
    metadata: { ...stripeSub.metadata, plan_id: targetPlan, cycle: targetCycle },
  });

  return { ok: true, effectiveDate: new Date().toISOString() };
}
