/**
 * POST /api/billing/subscribe — tworzy Stripe Checkout dla subskrypcji.
 *
 * Body: { plan_id, cycle, promotion_code?, trial_days? }
 * Returns: { checkout_url, session_id }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { createSubscriptionCheckout } from "@/lib/billing/subscriptions";
import type { BillingPlanId, BillingCycle } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    plan_id?: BillingPlanId;
    cycle?: BillingCycle;
    promotion_code?: string;
    trial_days?: number;
    success_url?: string;
    cancel_url?: string;
    tenant_id?: string;
  };

  if (!body.plan_id || body.plan_id === "free") {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  if (!body.cycle || !["monthly", "annual"].includes(body.cycle)) {
    return NextResponse.json({ error: "invalid_cycle" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const result = await createSubscriptionCheckout({
      userId: auth.user.id,
      email: auth.user.email ?? "",
      planId: body.plan_id as Exclude<BillingPlanId, "free">,
      cycle: body.cycle,
      successUrl: body.success_url ?? `${baseUrl(req)}/dashboard?subscribed=1`,
      cancelUrl: body.cancel_url ?? `${baseUrl(req)}/cennik`,
      promotionCode: body.promotion_code ?? null,
      trialDays: body.trial_days,
      tenantId: body.tenant_id ?? null,
    });
    return NextResponse.json({ checkout_url: result.checkoutUrl, session_id: result.sessionId });
  } catch (err) {
    return NextResponse.json(
      { error: "checkout_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

function baseUrl(req: Request): string {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}
