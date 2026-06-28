import { NextRequest, NextResponse } from "next/server";
import { searchSimilar } from "@/lib/ai/rag/vector-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.query) return NextResponse.json({ error: "missing query" }, { status: 400 });
  const docs = await searchSimilar(body.query, { corpus: body.corpus, topK: body.topK ?? 5 });
  return NextResponse.json({ results: docs });
}
