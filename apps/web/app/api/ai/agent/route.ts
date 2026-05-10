import { NextRequest, NextResponse } from "next/server";
import { runLegalAgent } from "@/lib/ai/agents/legal-agent";
import { recordAiUsage } from "@/lib/ai/usage-tracker";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.question) return NextResponse.json({ error: "missing question" }, { status: 400 });
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const res = await runLegalAgent(body.question, Math.min(6, body.maxIterations ?? 4));
  await recordAiUsage({
    user_id: user.id,
    model_id: "agent-chain",
    task_type: "agent",
    input_tokens: 0,
    output_tokens: 0,
    cost_grosze: res.cost_grosze,
    metadata: { iterations: res.iterations, tool_calls: res.tool_calls.length },
  });
  return NextResponse.json(res);
}
