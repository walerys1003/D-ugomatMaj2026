import { NextRequest, NextResponse } from "next/server";
import { runIracAnalysis } from "@/lib/ai/reasoning/chain-of-thought";
import { recordAiUsage } from "@/lib/ai/usage-tracker";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.question || !body?.facts) return NextResponse.json({ error: "missing question or facts" }, { status: 400 });
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const res = await runIracAnalysis(body.question, body.facts);
  await recordAiUsage({
    user_id: user.id,
    model_id: res.model_id,
    task_type: "irac",
    input_tokens: 0,
    output_tokens: 0,
    cost_grosze: res.cost_grosze,
  });
  return NextResponse.json(res);
}
