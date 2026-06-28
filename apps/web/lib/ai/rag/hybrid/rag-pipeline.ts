/**
 * Tier 19 — Full RAG pipeline orchestrator.
 *
 * Skleja:
 *   query → expandQuery (synonimy + akronimy + HyDE)
 *         → embed(hyde||normalized)
 *         → hybridRetrieve (BM25 multi-query OR + dense vector)
 *         → rerank (cross-encoder Cohere / local / heuristic)
 *         → trimContext (max tokenów do LLM)
 *
 * Output: lista finałowych chunków + sklejony kontekst gotowy do
 * wstrzyknięcia w prompt.
 */

import { expandQuery, type HydeGenerator } from "../query-expansion/query-expander";
import { hybridRetrieve, type RetrievedChunk } from "./hybrid-retriever";
import { rerank, type RerankResult, type RerankerStrategy } from "../reranker/cross-encoder-reranker";

export interface RagPipelineOptions {
  query: string;
  embed: (text: string) => Promise<number[]>;
  hydeGen?: HydeGenerator;
  topK?: number;
  rerankerStrategy?: RerankerStrategy;
  maxContextChars?: number;
  filter?: { documentIds?: string[]; tenantId?: string; caseType?: string };
}

export interface RagPipelineResult {
  finalChunks: RerankResult[];
  context: string;
  expansion: {
    normalized: string;
    variantCount: number;
    hydeUsed: boolean;
  };
  retrievalSize: number;
}

const DEFAULT_TOPK = 8;
const DEFAULT_MAX_CTX = 6000;

export async function runRagPipeline(opts: RagPipelineOptions): Promise<RagPipelineResult> {
  const topK = opts.topK ?? DEFAULT_TOPK;
  const maxCtx = opts.maxContextChars ?? DEFAULT_MAX_CTX;

  // 1) query expansion (+ optional HyDE)
  const expanded = await expandQuery(opts.query, opts.hydeGen);
  const textForEmbed = expanded.hyde ?? expanded.normalized;

  // 2) embed
  const queryEmbedding = await opts.embed(textForEmbed);

  // 3) run hybrid retrieval per variant (do max 3 variants by latency)
  const variants = expanded.variants.slice(0, 3);
  const results = await Promise.all(
    variants.map((q) =>
      hybridRetrieve({
        query: q,
        queryEmbedding,
        topK: 30,
        filter: opts.filter,
      }).catch(() => [] as RetrievedChunk[]),
    ),
  );

  // 4) merge & dedupe by id, keep best per chunk
  const merged = new Map<string, RetrievedChunk>();
  for (const list of results) {
    for (const chunk of list) {
      const existing = merged.get(chunk.id);
      if (!existing || chunk.rrfScore > existing.rrfScore) {
        merged.set(chunk.id, chunk);
      }
    }
  }
  const candidates = Array.from(merged.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, 30);

  // 5) rerank
  const reranked = await rerank({
    query: expanded.normalized,
    chunks: candidates,
    topK,
    strategy: opts.rerankerStrategy,
  });

  // 6) trim to context budget
  const context = trimContext(reranked, maxCtx);

  return {
    finalChunks: reranked,
    context,
    expansion: {
      normalized: expanded.normalized,
      variantCount: variants.length,
      hydeUsed: expanded.hyde !== null,
    },
    retrievalSize: candidates.length,
  };
}

function trimContext(chunks: RerankResult[], maxChars: number): string {
  const parts: string[] = [];
  let used = 0;
  for (const r of chunks) {
    const block = `[doc:${r.chunk.documentId} #${r.chunk.id} rerank=${r.rerankScore.toFixed(3)}]\n${r.chunk.text}`;
    if (used + block.length + 2 > maxChars) {
      const remaining = maxChars - used - 2;
      if (remaining > 200) parts.push(block.slice(0, remaining));
      break;
    }
    parts.push(block);
    used += block.length + 2;
  }
  return parts.join("\n\n");
}
