/**
 * Tier 19 — Hybrid retrieval (BM25 + dense vector fusion).
 *
 * Łączy klasyczne retrieval lexykalne (BM25 nad chunkami) z gęstym
 * retrieval po embeddings (pgvector). Wynik łączymy RRF (Reciprocal
 * Rank Fusion) — solidny baseline bez learnable weights.
 *
 *   RRF_score(d) = Σ 1 / (k + rank_i(d))
 *
 * gdzie k=60 (typowo), a rank_i to ranga w retrieverze i (1-based).
 *
 * Dokumenty:
 *  - tabela `rag_chunks` (id, document_id, text, embedding vector(1536), tsv tsvector)
 *  - indeks GIN(tsv) + HNSW/ivfflat na embedding
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface HybridRetrievalOptions {
  query: string;
  queryEmbedding: number[];
  topK?: number;
  bm25Limit?: number;
  vectorLimit?: number;
  rrfK?: number;
  filter?: { documentIds?: string[]; tenantId?: string; caseType?: string };
}

export interface RetrievedChunk {
  id: string;
  documentId: string;
  text: string;
  bm25Rank: number | null;
  vectorRank: number | null;
  bm25Score: number | null;
  vectorScore: number | null;
  rrfScore: number;
  metadata: Record<string, unknown>;
}

const DEFAULT_K = 60;
const DEFAULT_TOP_K = 12;
const DEFAULT_PER_RETRIEVER_LIMIT = 30;

export async function hybridRetrieve(opts: HybridRetrievalOptions): Promise<RetrievedChunk[]> {
  const supabase = await createSupabaseServerClient();
  const topK = opts.topK ?? DEFAULT_TOP_K;
  const bm25Limit = opts.bm25Limit ?? DEFAULT_PER_RETRIEVER_LIMIT;
  const vectorLimit = opts.vectorLimit ?? DEFAULT_PER_RETRIEVER_LIMIT;
  const rrfK = opts.rrfK ?? DEFAULT_K;

  // Wywołujemy dwa RPC równolegle, by minimalizować latencję.
  const [bm25Res, vectorRes] = await Promise.all([
    supabase.rpc("rag_bm25_search", {
      query_text: opts.query,
      max_results: bm25Limit,
      filter_document_ids: opts.filter?.documentIds ?? null,
      filter_tenant_id: opts.filter?.tenantId ?? null,
      filter_case_type: opts.filter?.caseType ?? null,
    }),
    supabase.rpc("rag_vector_search", {
      query_embedding: opts.queryEmbedding,
      max_results: vectorLimit,
      filter_document_ids: opts.filter?.documentIds ?? null,
      filter_tenant_id: opts.filter?.tenantId ?? null,
      filter_case_type: opts.filter?.caseType ?? null,
    }),
  ]);

  if (bm25Res.error) throw bm25Res.error;
  if (vectorRes.error) throw vectorRes.error;

  type Row = {
    id: string;
    document_id: string;
    text: string;
    score: number;
    metadata: Record<string, unknown> | null;
  };

  const bm25 = (bm25Res.data ?? []) as Row[];
  const vector = (vectorRes.data ?? []) as Row[];

  const byId = new Map<string, RetrievedChunk>();
  bm25.forEach((row, idx) => {
    byId.set(row.id, {
      id: row.id,
      documentId: row.document_id,
      text: row.text,
      bm25Rank: idx + 1,
      vectorRank: null,
      bm25Score: row.score,
      vectorScore: null,
      rrfScore: 0,
      metadata: row.metadata ?? {},
    });
  });
  vector.forEach((row, idx) => {
    const existing = byId.get(row.id);
    if (existing) {
      existing.vectorRank = idx + 1;
      existing.vectorScore = row.score;
    } else {
      byId.set(row.id, {
        id: row.id,
        documentId: row.document_id,
        text: row.text,
        bm25Rank: null,
        vectorRank: idx + 1,
        bm25Score: null,
        vectorScore: row.score,
        rrfScore: 0,
        metadata: row.metadata ?? {},
      });
    }
  });

  // RRF fusion
  for (const chunk of byId.values()) {
    let score = 0;
    if (chunk.bm25Rank !== null) score += 1 / (rrfK + chunk.bm25Rank);
    if (chunk.vectorRank !== null) score += 1 / (rrfK + chunk.vectorRank);
    chunk.rrfScore = score;
  }

  return Array.from(byId.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, topK);
}

/**
 * Lokalna fuzja gdy mamy listy z róznych in-memory źródeł
 * (np. cache + DB). Pure function — łatwa do testowania.
 */
export function fuseRrf(
  lists: Array<Array<{ id: string }>>,
  k: number = DEFAULT_K,
): Array<{ id: string; score: number }> {
  const scores = new Map<string, number>();
  for (const list of lists) {
    list.forEach((item, idx) => {
      const rank = idx + 1;
      scores.set(item.id, (scores.get(item.id) ?? 0) + 1 / (k + rank));
    });
  }
  return Array.from(scores.entries())
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
