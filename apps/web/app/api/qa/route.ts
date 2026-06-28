import { NextResponse, type NextRequest } from "next/server";
import { askKnowledgeBase } from "@/lib/ai/qa-knowledge";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_LEN = 5;
const MAX_LEN = 600;

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < MIN_LEN) return NextResponse.json({ error: "question_too_short" }, { status: 400 });
  if (question.length > MAX_LEN) return NextResponse.json({ error: "question_too_long" }, { status: 400 });
  try {
    const result = await askKnowledgeBase(question);
    return NextResponse.json(result);
  } catch (err) {
    logger.error("qa.failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
