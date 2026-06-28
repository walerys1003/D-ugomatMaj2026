/**
 * Tier 19 — Subscription API.
 *
 * GET    /api/payments/subscription          → bieżąca aktywna subskrypcja
 * POST   /api/payments/subscription          → start trial / utwórz subskrypcję
 * PATCH  /api/payments/subscription          → akcje: pause/resume/cancel/upgrade/downgrade
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  startTrial,
  getActiveSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  scheduleDowngrade,
  applyImmediateUpgrade,
  type PlanCode,
} from "@/lib/payments/subscription/subscription-lifecycle";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sub = await getActiveSubscription(user.id);
  return NextResponse.json({ subscription: sub });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { planCode?: PlanCode; orgId?: string | null; trialDays?: number }
    | null;
  if (!body?.planCode) return NextResponse.json({ error: "missing_plan_code" }, { status: 400 });
  const existing = await getActiveSubscription(user.id);
  if (existing) return NextResponse.json({ error: "subscription_exists", subscription: existing }, { status: 409 });
  const sub = await startTrial({
    userId: user.id,
    orgId: body.orgId ?? null,
    planCode: body.planCode,
    trialDays: body.trialDays,
  });
  return NextResponse.json({ subscription: sub }, { status: 201 });
}

export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | {
        action?: "pause" | "resume" | "cancel" | "upgrade" | "downgrade";
        until?: string;
        atPeriodEnd?: boolean;
        reason?: string;
        newPlan?: PlanCode;
        effectiveAt?: string;
      }
    | null;
  if (!body?.action) return NextResponse.json({ error: "missing_action" }, { status: 400 });
  const sub = await getActiveSubscription(user.id);
  if (!sub) return NextResponse.json({ error: "no_active_subscription" }, { status: 404 });

  switch (body.action) {
    case "pause":
      if (!body.until) return NextResponse.json({ error: "missing_until" }, { status: 400 });
      await pauseSubscription(sub.id, new Date(body.until));
      break;
    case "resume":
      await resumeSubscription(sub.id);
      break;
    case "cancel":
      await cancelSubscription(sub.id, { atPeriodEnd: body.atPeriodEnd ?? true, reason: body.reason });
      break;
    case "upgrade":
      if (!body.newPlan) return NextResponse.json({ error: "missing_new_plan" }, { status: 400 });
      await applyImmediateUpgrade(sub.id, body.newPlan);
      break;
    case "downgrade":
      if (!body.newPlan || !body.effectiveAt) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
      }
      await scheduleDowngrade(sub.id, body.newPlan, new Date(body.effectiveAt));
      break;
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
