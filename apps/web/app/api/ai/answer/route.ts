import { NextRequest, NextResponse } from "next/server";
import { answerWithRag } from "@/lib/ai/rag/retriever";
import { checkOutput } from "@/lib/ai/reasoning/hallucination-guard";
import { recordAiUsage } from "@/lib/ai/usage-tracker";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { redactPii } from "@/lib/ai/safety/content-filter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.question) return NextResponse.json({ error: "missing question" }, { status: 400 });
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const safeQuestion = redactPii(String(body.question)).text;
  const result = await answerWithRag(safeQuestion, { corpus: body.corpus, topK: body.topK ?? 5 });
  const guard = await checkOutput(result.answer, { corpus: body.corpus });
  await recordAiUsage({
    user_id: user.id,
    model_id: result.model_id,
    task_type: "rag_answer",
    input_tokens: result.input_tokens,
    output_tokens: result.output_tokens,
    cost_grosze: result.cost_grosze,
  });
  return NextResponse.json({ ...result, guard });
}
