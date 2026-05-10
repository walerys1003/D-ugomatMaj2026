import { NextRequest, NextResponse } from "next/server";
import { upsertVectorDoc, chunkText } from "@/lib/ai/rag/vector-store";
import { embed } from "@/lib/ai/rag/embeddings";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createHash } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const body = await req.json().catch(() => null);
  if (!body?.text || !body?.corpus || !body?.source_ref || !body?.title) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const chunks = chunkText(body.text);
  let inserted = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const id = createHash("sha256").update(`${body.source_ref}|${i}`).digest("hex").slice(0, 32);
    const e = await embed(chunk);
    await upsertVectorDoc({
      id,
      corpus: body.corpus,
      source_ref: body.source_ref,
      title: body.title,
      chunk_index: i,
      text: chunk,
      metadata: body.metadata ?? {},
      vector: e.vector,
    });
    inserted++;
  }
  return NextResponse.json({ ok: true, chunks: inserted });
}
