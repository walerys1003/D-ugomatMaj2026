/**
 * Tier 22 — Workflows CRUD.
 *
 * POST   /api/automation/workflows  → create workflow
 * GET    /api/automation/workflows  → list user's workflows
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  createWorkflow,
  listWorkflows,
  type WorkflowDefinition,
} from "@/lib/automation/workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const workflows = await listWorkflows(user.id);
  return NextResponse.json({ workflows });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        description?: string;
        trigger?: WorkflowDefinition["trigger"];
        conditions?: WorkflowDefinition["conditions"];
        actions?: WorkflowDefinition["actions"];
        enabled?: boolean;
      }
    | null;

  if (!body?.name || !body?.trigger || !Array.isArray(body.actions)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (body.actions.length === 0) {
    return NextResponse.json({ error: "no_actions" }, { status: 400 });
  }
  if (body.actions.length > 10) {
    return NextResponse.json({ error: "too_many_actions" }, { status: 400 });
  }

  const wf = await createWorkflow({
    userId: user.id,
    name: body.name,
    description: body.description,
    trigger: body.trigger,
    conditions: body.conditions,
    actions: body.actions,
    enabled: body.enabled,
  });
  return NextResponse.json({ workflow: wf }, { status: 201 });
}
