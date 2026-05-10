/**
 * Długomat — Tier 8 — Stripe Customer Portal helper.
 *
 * Pozwala userowi self-service zarządzać:
 *  - aktualizacją karty,
 *  - zmianą planu (upgrade/downgrade z proration),
 *  - anulowaniem subskrypcji,
 *  - historią faktur.
 *
 * Wymaga `STRIPE_PORTAL_CONFIGURATION_ID` (skonfigurowany w Stripe Dashboard).
 */
import "server-only";

export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<{ url: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY missing");
  const StripeMod = await import("stripe").catch(() => null);
  if (!StripeMod) throw new Error("stripe SDK missing");
  const Stripe = StripeMod.default ?? StripeMod;
  const stripe = new (Stripe as any)(secretKey, { apiVersion: "2024-06-20" });

  const portalConfig = process.env.STRIPE_PORTAL_CONFIGURATION_ID;
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
    configuration: portalConfig || undefined,
  });

  return { url: session.url };
}
