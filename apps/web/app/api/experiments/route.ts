/**
 * Tier 20 — Experiments API.
 *
 * GET  /api/experiments?key=...     → assign current user + return variant
 * POST /api/experiments/exposure    → log exposure (dedupe per user/day)
 * POST /api/experiments/goal        → record goal event for current user
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { assignVariant, trackExposure, trackGoal } from "@/lib/experiments/ab";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });
  const assignment = await assignVariant(key, {
    userId: user.id,
    email: user.email ?? undefined,
  });
  return NextResponse.json({ assignment });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | {
        action?: "exposure" | "goal";
        experimentKey?: string;
        variant?: string;
        goalEvent?: string;
        value?: number;
        context?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
      }
    | null;
  if (!body?.action || !body?.experimentKey) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (body.action === "exposure") {
    if (!body.variant) return NextResponse.json({ error: "missing_variant" }, { status: 400 });
    await trackExposure({
      experimentKey: body.experimentKey,
      userId: user.id,
      variant: body.variant,
      context: body.context,
    });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "goal") {
    if (!body.goalEvent) return NextResponse.json({ error: "missing_goal_event" }, { status: 400 });
    await trackGoal({
      experimentKey: body.experimentKey,
      userId: user.id,
      goalEvent: body.goalEvent,
      value: body.value,
      metadata: body.metadata,
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
