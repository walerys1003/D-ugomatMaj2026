/**
 * POST /api/billing/portal — tworzy Stripe Customer Portal session.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveSubscription } from "@/lib/billing/subscriptions";
import { createCustomerPortalSession } from "@/lib/billing/customer-portal";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const sub = await getActiveSubscription(auth.user.id);
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }
  const url = new URL(req.url);
  const returnUrl = `${url.protocol}//${url.host}/dashboard`;
  try {
    const { url: portalUrl } = await createCustomerPortalSession(
      sub.stripe_customer_id,
      returnUrl,
    );
    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "portal_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
