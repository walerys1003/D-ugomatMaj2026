/**
 * Tier 19 — Cross-encoder reranker.
 *
 * Po hybrid retrieval (BM25 + dense) zostaje ~12-30 kandydatów. Cross-encoder
 * (bge-reranker-large lub Cohere rerank-multilingual-v3) ocenia pary
 * (query, chunk) i zwraca prawdopodobieństwo trafienia. Reranker dramatycznie
 * poprawia precision@k vs samo retrieval (typowo +15-25 nDCG@10).
 *
 * Strategie:
 *   - cohere: REST API (cohere.com/rerank), multilingual, najlepsza jakość PL
 *   - local: wywołanie self-hosted endpoint (np. bge-reranker via vLLM)
 *   - heuristic: fallback bez sieci (BM25-score + lexical overlap)
 */

import type { RetrievedChunk } from "../hybrid/hybrid-retriever";

export interface RerankResult {
  chunk: RetrievedChunk;
  rerankScore: number;
  rank: number;
}

export type RerankerStrategy = "cohere" | "local" | "heuristic";

export interface RerankOptions {
  query: string;
  chunks: RetrievedChunk[];
  topK?: number;
  strategy?: RerankerStrategy;
}

export async function rerank(opts: RerankOptions): Promise<RerankResult[]> {
  const strategy = opts.strategy ?? pickDefaultStrategy();
  const topK = opts.topK ?? 8;
  if (opts.chunks.length === 0) return [];

  let scores: number[];
  try {
    if (strategy === "cohere") scores = await cohereRerank(opts.query, opts.chunks);
    else if (strategy === "local") scores = await localRerank(opts.query, opts.chunks);
    else scores = heuristicRerank(opts.query, opts.chunks);
  } catch {
    scores = heuristicRerank(opts.query, opts.chunks);
  }

  const ranked = opts.chunks
    .map((chunk, i) => ({ chunk, rerankScore: scores[i] ?? 0 }))
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, topK)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  return ranked;
}

function pickDefaultStrategy(): RerankerStrategy {
  if (process.env.COHERE_API_KEY) return "cohere";
  if (process.env.LOCAL_RERANKER_URL) return "local";
  return "heuristic";
}

async function cohereRerank(query: string, chunks: RetrievedChunk[]): Promise<number[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY not set");
  const res = await fetch("https://api.cohere.com/v2/rerank", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "rerank-multilingual-v3.0",
      query,
      documents: chunks.map((c) => c.text),
      top_n: chunks.length,
    }),
  });
  if (!res.ok) throw new Error(`Cohere rerank failed: ${res.status}`);
  const json = (await res.json()) as { results: Array<{ index: number; relevance_score: number }> };
  const out = new Array<number>(chunks.length).fill(0);
  for (const r of json.results ?? []) {
    if (r.index >= 0 && r.index < out.length) out[r.index] = r.relevance_score;
  }
  return out;
}

async function localRerank(query: string, chunks: RetrievedChunk[]): Promise<number[]> {
  const url = process.env.LOCAL_RERANKER_URL;
  if (!url) throw new Error("LOCAL_RERANKER_URL not set");
  const res = await fetch(`${url.replace(/\/+$/, "")}/rerank`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, documents: chunks.map((c) => c.text) }),
  });
  if (!res.ok) throw new Error(`Local rerank failed: ${res.status}`);
  const json = (await res.json()) as { scores: number[] };
  return json.scores ?? new Array(chunks.length).fill(0);
}

/**
 * Heurystyczny reranker bez sieci. Łączy:
 *  - BM25 score normalizowany (jeśli mamy)
 *  - vector score normalizowany
 *  - lexical overlap (Jaccard nad tokenami)
 *  - length penalty — zbyt długie chunki dostają lekki minus
 */
function heuristicRerank(query: string, chunks: RetrievedChunk[]): number[] {
  const queryTokens = tokenize(query);
  const qSet = new Set(queryTokens);

  const bm25Max = Math.max(1e-6, ...chunks.map((c) => c.bm25Score ?? 0));
  const vecMax = Math.max(1e-6, ...chunks.map((c) => c.vectorScore ?? 0));

  return chunks.map((c) => {
    const bm = (c.bm25Score ?? 0) / bm25Max;
    const vec = (c.vectorScore ?? 0) / vecMax;
    const tokens = tokenize(c.text);
    const tSet = new Set(tokens);
    const inter = countIntersection(qSet, tSet);
    const union = qSet.size + tSet.size - inter || 1;
    const jaccard = inter / union;
    const lenPenalty = c.text.length > 2000 ? -0.05 : 0;
    return 0.35 * bm + 0.35 * vec + 0.3 * jaccard + lenPenalty;
  });
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function countIntersection<T>(a: Set<T>, b: Set<T>): number {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n;
}
