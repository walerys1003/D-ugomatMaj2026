/**
 * Tier 22 — Workflow manual run + toggle + delete.
 *
 * POST   /api/automation/workflows/[id]/run    → wykonaj manual (z body jako triggerPayload)
 * GET    /api/automation/workflows/[id]/run    → ostatnie biegi
 * PATCH  /api/automation/workflows/[id]/run    → toggle enabled
 * DELETE /api/automation/workflows/[id]/run    → delete workflow
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  getWorkflow,
  executeWorkflow,
  setWorkflowEnabled,
  deleteWorkflow,
} from "@/lib/automation/workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const wf = await getWorkflow(params.id, user.id);
  if (!wf) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const run = await executeWorkflow({
    workflowId: params.id,
    triggerPayload: { ...body, trigger: "manual", user_id: user.id },
  });
  return NextResponse.json({ run });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const wf = await getWorkflow(params.id, user.id);
  if (!wf) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: runs } = await supabase
    .from("automation_runs")
    .select("*")
    .eq("workflow_id", params.id)
    .order("started_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ workflow: wf, runs: runs ?? [] });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { enabled?: boolean };
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "missing_enabled" }, { status: 400 });
  }
  await setWorkflowEnabled(params.id, user.id, body.enabled);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await deleteWorkflow(params.id, user.id);
  return NextResponse.json({ ok: true });
}
