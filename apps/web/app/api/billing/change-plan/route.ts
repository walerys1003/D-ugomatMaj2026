/**
 * POST /api/billing/change-plan — upgrade/downgrade plan z proration.
 * Body: { plan_id, cycle, preview? }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { previewPlanChange, executePlanChange } from "@/lib/billing/upgrade-flow";
import type { BillingPlanId, BillingCycle } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    plan_id?: BillingPlanId;
    cycle?: BillingCycle;
    preview?: boolean;
  };
  if (!body.plan_id || body.plan_id === "free" || !body.cycle) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    if (body.preview) {
      const preview = await previewPlanChange(
        auth.user.id,
        body.plan_id as Exclude<BillingPlanId, "free">,
        body.cycle,
      );
      return NextResponse.json({ preview });
    }
    const result = await executePlanChange(
      auth.user.id,
      body.plan_id as Exclude<BillingPlanId, "free">,
      body.cycle,
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "change_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
