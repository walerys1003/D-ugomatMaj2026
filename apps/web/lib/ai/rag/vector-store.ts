/**
 * Tier 11 — Vector store backed by Postgres + pgvector.
 * Falls back to in-memory cosine search when pgvector is unavailable (dev).
 */
import { createServerSupabase } from "@/lib/db/supabase-server";
import { embed, cosineSim } from "./embeddings";

export interface VectorDoc {
  id: string;
  corpus: string; // e.g. "kpc", "kc", "ustawa-upadlosciowa", "orzeczenia-sn"
  source_ref: string;
  title: string;
  chunk_index: number;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface RetrievedDoc extends VectorDoc {
  score: number;
}

export async function upsertVectorDoc(doc: VectorDoc & { vector: number[] }): Promise<void> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  await sb.from("rag_documents").upsert(
    {
      id: doc.id,
      corpus: doc.corpus,
      source_ref: doc.source_ref,
      title: doc.title,
      chunk_index: doc.chunk_index,
      text: doc.text,
      metadata: doc.metadata ?? {},
      embedding: doc.vector,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function searchSimilar(query: string, opts?: { corpus?: string; topK?: number }): Promise<RetrievedDoc[]> {
  const topK = opts?.topK ?? 5;
  const qVec = (await embed(query)).vector;
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  // Try pgvector RPC first
  try {
    const { data, error } = await sb.rpc("rag_search", {
      query_embedding: qVec,
      filter_corpus: opts?.corpus ?? null,
      match_count: topK,
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((r: any) => ({
        id: r.id,
        corpus: r.corpus,
        source_ref: r.source_ref,
        title: r.title,
        chunk_index: r.chunk_index,
        text: r.text,
        metadata: r.metadata ?? {},
        score: Number(r.score ?? 0),
      }));
    }
  } catch {
    // fallthrough
  }
  // In-memory fallback: load up to 500 docs and rank locally
  let q = sb.from("rag_documents").select("*").limit(500);
  if (opts?.corpus) q = q.eq("corpus", opts.corpus);
  const { data } = await q;
  const items = (data ?? []).map((r: any) => ({
    doc: r as VectorDoc & { embedding: number[] },
    score: cosineSim(qVec, (r.embedding as number[]) ?? []),
  }));
  items.sort((a: any, b: any) => b.score - a.score);
  return items.slice(0, topK).map(({ doc, score }) => ({
    id: doc.id,
    corpus: doc.corpus,
    source_ref: doc.source_ref,
    title: doc.title,
    chunk_index: doc.chunk_index,
    text: doc.text,
    metadata: doc.metadata ?? {},
    score,
  }));
}

export function chunkText(text: string, opts?: { maxChars?: number; overlap?: number }): string[] {
  const maxChars = opts?.maxChars ?? 1200;
  const overlap = opts?.overlap ?? 150;
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + maxChars);
    out.push(text.slice(i, end));
    if (end === text.length) break;
    i = end - overlap;
  }
  return out;
}
