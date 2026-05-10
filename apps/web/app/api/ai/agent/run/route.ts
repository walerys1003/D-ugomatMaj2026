/**
 * Tier 22 — Agent run endpoint.
 *
 * POST /api/ai/agent/run
 *   body: { goal: string, options?: { maxSteps?, budgetGrosze?, toolset?, contextHint? }, usePlanner?: boolean }
 *   → uruchamia agent loop (lub plan-and-execute jeśli usePlanner=true)
 *
 * GET /api/ai/agent/run?id=<runId>
 *   → status biegu z krokami
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { runAgent } from "@/lib/ai/agents/orchestrator";
import { planAndExecute } from "@/lib/ai/agents/planning";
import { buildMemoryContextHint, extractAndStoreLessons } from "@/lib/ai/agents/memory";
import type { ToolName } from "@/lib/ai/agents/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | {
        goal?: string;
        usePlanner?: boolean;
        options?: {
          maxSteps?: number;
          budgetGrosze?: number;
          toolset?: ToolName[];
          contextHint?: string;
          useMemory?: boolean;
        };
      }
    | null;
  if (!body?.goal || typeof body.goal !== "string" || body.goal.length < 3) {
    return NextResponse.json({ error: "missing_or_invalid_goal" }, { status: 400 });
  }
  if (body.goal.length > 4000) {
    return NextResponse.json({ error: "goal_too_long" }, { status: 400 });
  }

  // Optional: pre-warm with semantic memory
  let contextHint = body.options?.contextHint;
  if (body.options?.useMemory !== false) {
    try {
      const memHint = await buildMemoryContextHint({ userId: user.id, goal: body.goal });
      if (memHint) contextHint = contextHint ? `${contextHint}\n\n${memHint}` : memHint;
    } catch {
      /* memory best-effort */
    }
  }

  if (body.usePlanner) {
    const result = await planAndExecute({
      userId: user.id,
      goal: body.goal,
      contextHint,
      budgetGrosze: body.options?.budgetGrosze,
      maxStepsPerSub: body.options?.maxSteps,
    });
    return NextResponse.json({ kind: "plan_and_execute", result });
  }

  const run = await runAgent({
    userId: user.id,
    goal: body.goal,
    options: {
      ...body.options,
      contextHint,
    },
  });

  // Background lessons extraction
  if (run.status === "completed" && run.final_answer) {
    void extractAndStoreLessons({
      userId: user.id,
      runId: run.id,
      finalAnswer: run.final_answer,
      goal: body.goal,
    }).catch(() => null);
  }

  return NextResponse.json({ kind: "agent_run", run });
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const { data: run, error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!run) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: steps } = await supabase
    .from("agent_steps")
    .select("*")
    .eq("run_id", id)
    .order("index", { ascending: true });

  return NextResponse.json({ run, steps: steps ?? [] });
}
