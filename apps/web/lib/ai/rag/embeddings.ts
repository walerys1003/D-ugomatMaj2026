/**
 * Tier 11 — Embeddings for RAG over Polish legal corpus.
 * Uses OpenAI text-embedding-3-small by default; supports local fallback to deterministic hash.
 */
import { createHash } from "crypto";

export interface EmbeddingResult {
  vector: number[];
  model: string;
  dim: number;
}

const EMBEDDING_DIM = 1536;

export async function embed(text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const r = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
      });
      if (r.ok) {
        const j: any = await r.json();
        const vec = j.data?.[0]?.embedding as number[];
        if (Array.isArray(vec)) return { vector: vec, model: "text-embedding-3-small", dim: vec.length };
      }
    } catch {
      // fallthrough to local
    }
  }
  return { vector: deterministicEmbedding(text, EMBEDDING_DIM), model: "local-hash", dim: EMBEDDING_DIM };
}

export async function embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
  const out: EmbeddingResult[] = [];
  for (const t of texts) out.push(await embed(t));
  return out;
}

function deterministicEmbedding(text: string, dim: number): number[] {
  // Deterministic hash-based embedding for offline/dev use. Not semantically meaningful
  // but stable across calls so RAG glue keeps working without paid APIs.
  const vec = new Array(dim).fill(0);
  const tokens = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  for (const tok of tokens) {
    const h = createHash("sha256").update(tok).digest();
    for (let i = 0; i < dim; i++) {
      vec[i] += ((h[i % h.length] - 128) / 128) * 0.01;
    }
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map((x) => x / norm);
}

export function cosineSim(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
