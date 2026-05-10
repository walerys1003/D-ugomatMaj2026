/**
 * Tier 22 — Agent run live stream (SSE).
 *
 * GET /api/ai/agent/[id]/stream  → text/event-stream
 *   Subskrybuje topic `agent:<id>` przez channel-broker.
 *   Agent loop publikuje progress events (kind=ai.generation.progress) podczas
 *   wykonania (TBD: w T23 dodamy emit do agent-loop).
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { buildSseResponse } from "@/lib/realtime/channel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Ownership check
  const { data: run } = await supabase
    .from("agent_runs")
    .select("user_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!run || (run as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return buildSseResponse({ topic: `agent:${params.id}`, userId: user.id });
}
