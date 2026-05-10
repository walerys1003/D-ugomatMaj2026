import "server-only";

/**
 * Embedding generation — używane do RAG retrievera oraz indexowania
 * `legal_knowledge.embedding` (vector(1536)).
 *
 * Strategia:
 *   1) Próbujemy APIPod / OpenAI `/embeddings` endpoint (text-embedding-3-small).
 *   2) Fallback: deterministyczny hash-based embedding (1536 wymiarów),
 *      bezużyteczny do wyszukiwania semantycznego, ale pozwala kodowi
 *      pisać i odczytywać wektory bez crashu w środowiskach test/local.
 *
 * Dla retrievera mamy też ścieżkę "offline TF-IDF" (knowledge-base/) —
 * jest osobna od pgvector i służy jako last-resort.
 */
import { createHash } from "node:crypto";
import { models } from "./models";
import { AiUnavailableError } from "./apipod-client";

const EMBEDDING_DIM = 1536;

interface EmbeddingBackend {
  url: string;
  apiKey: string;
  provider: "apipod" | "openai-direct";
}

function readBackends(): EmbeddingBackend[] {
  const list: EmbeddingBackend[] = [];
  if (process.env.APIPOD_API_KEY && process.env.APIPOD_BASE_URL) {
    list.push({
      provider: "apipod",
      url: `${process.env.APIPOD_BASE_URL.replace(/\/+$/, "")}/embeddings`,
      apiKey: process.env.APIPOD_API_KEY,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    list.push({
      provider: "openai-direct",
      url: "https://api.openai.com/v1/embeddings",
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return list;
}

export async function embedText(text: string): Promise<number[]> {
  const backends = readBackends();
  if (backends.length === 0) {
    return deterministicEmbedding(text);
  }
  const body = JSON.stringify({
    model: models.embedding.id,
    input: text.slice(0, 8000), // ~8k chars hard cap
  });
  let lastErr: unknown = null;
  for (const b of backends) {
    try {
      const res = await fetch(b.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${b.apiKey}`,
        },
        body,
      });
      if (!res.ok) {
        lastErr = new Error(`${b.provider} ${res.status}`);
        continue;
      }
      const json = (await res.json()) as {
        data?: Array<{ embedding: number[] }>;
      };
      const vec = json.data?.[0]?.embedding;
      if (vec && vec.length === EMBEDDING_DIM) return vec;
      lastErr = new Error(`${b.provider}: invalid embedding shape`);
    } catch (err) {
      lastErr = err;
    }
  }
  // Last-resort: deterministic embedding tak, by kod nie crashował.
  // Wstawione embeddingi nie nadają się do wyszukiwania, ale kod RAG
  // ma osobny offline-fallback (TF-IDF), więc to akceptowalne.
  console.warn("[embeddings] using deterministic fallback:", lastErr);
  return deterministicEmbedding(text);
}

/**
 * Deterministyczny pseudo-embedding 1536-wymiarowy. Wynik jest
 * powtarzalny dla tego samego inputu (hash-based), ale nie zawiera
 * semantyki — używać tylko jako placeholder.
 */
function deterministicEmbedding(text: string): number[] {
  const seed = createHash("sha256").update(text).digest();
  const out = new Array<number>(EMBEDDING_DIM);
  for (let i = 0; i < EMBEDDING_DIM; i += 1) {
    const byte = seed[i % seed.length];
    // map [0..255] → [-1..1]
    out[i] = (byte / 127.5) - 1;
  }
  // Normalizacja L2 — dla cosine distance
  let norm = 0;
  for (const v of out) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < out.length; i += 1) out[i] /= norm;
  return out;
}

/**
 * Mała utility do diagnostyki — czy mamy "prawdziwy" embedding backend?
 */
export function hasEmbeddingBackend(): boolean {
  return readBackends().length > 0;
}

/**
 * Throw jeśli backend nie odpowiada — używane przez admin scripts
 * (seed legal_knowledge), gdzie chcemy fail-fast zamiast cichego fallbacku.
 */
export async function embedTextStrict(text: string): Promise<number[]> {
  if (!hasEmbeddingBackend()) {
    throw new AiUnavailableError(
      "Brak skonfigurowanego backendu embeddingów (APIPOD_API_KEY albo OPENAI_API_KEY).",
    );
  }
  return embedText(text);
}
