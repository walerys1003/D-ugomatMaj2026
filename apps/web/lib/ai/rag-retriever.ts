import "server-only";

/**
 * RAG retriever — szuka relevant chunks w `legal_knowledge` (pgvector)
 * z fallbackiem na offline TF-IDF index w `knowledge-base/index/`.
 *
 * Kontrakt:
 *   const ctx = await retrieveContext('przedawnienie sprzeciw EPU', { k: 5 });
 *   ctx.chunks  -> tablica { title, content, source } (gotowe do wstrzyknięcia w prompt)
 *   ctx.source  -> 'pgvector' | 'tfidf-offline'
 *
 * pgvector używamy gdy:
 *   - tabela `legal_knowledge` zawiera ≥ 50 rekordów z embedding ≠ NULL,
 *   - mamy działający backend embeddingów.
 * W przeciwnym razie spadamy na TF-IDF z `knowledge-base/index/tfidf.json`.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { embedText, hasEmbeddingBackend } from "./embeddings";

export interface RagChunk {
  title: string;
  content: string;
  source: string;
  score: number;
}

export interface RagContext {
  chunks: RagChunk[];
  source: "pgvector" | "tfidf-offline" | "empty";
}

export interface RetrieveOptions {
  k?: number;
  category?: string;
  /** Dopuszczalne tags z knowledge-base/index/tfidf.json (offline fallback). */
  tags?: string[];
}

const DEFAULT_K = 6;

// =============================================================================
// Public entry point
// =============================================================================
export async function retrieveContext(
  query: string,
  options: RetrieveOptions = {},
): Promise<RagContext> {
  const k = options.k ?? DEFAULT_K;

  // 1) Try pgvector (production)
  if (hasEmbeddingBackend()) {
    try {
      const fromDb = await retrieveFromPgvector(query, k, options.category);
      if (fromDb.length > 0) {
        return { chunks: fromDb, source: "pgvector" };
      }
    } catch (err) {
      console.warn("[rag] pgvector retrieval failed, falling back:", err);
    }
  }

  // 2) Fallback: offline TF-IDF (always available, ships in repo)
  try {
    const fromTfidf = await retrieveFromTfidf(query, k, options.tags);
    if (fromTfidf.length > 0) {
      return { chunks: fromTfidf, source: "tfidf-offline" };
    }
  } catch (err) {
    console.warn("[rag] tfidf-offline retrieval failed:", err);
  }

  return { chunks: [], source: "empty" };
}

// =============================================================================
// Backend 1 — pgvector
// =============================================================================
async function retrieveFromPgvector(
  query: string,
  k: number,
  category?: string,
): Promise<RagChunk[]> {
  const queryVec = await embedText(query);
  const supabase = createSupabaseAdminClient();

  // Supabase PostgREST nie potrafi natywnie filtrować po cosine distance,
  // dlatego używamy RPC. Funkcję `match_legal_knowledge` dodamy w Tier 3
  // jako migrację (poniżej zostawiamy graceful-degrade do .select()).
  const { data, error } = await supabase.rpc("match_legal_knowledge", {
    query_embedding: queryVec,
    match_count: k,
    filter_category: category ?? null,
  } as never);

  if (error) {
    // RPC nie istnieje (Tier 3 jeszcze nie wgrał migracji) — zwróć puste,
    // wyższy poziom spadnie na TF-IDF.
    if (error.code === "42883" || error.message.includes("function")) {
      return [];
    }
    throw error;
  }

  const rows = (data ?? []) as Array<{
    title: string;
    content: string;
    source: string;
    similarity: number;
  }>;

  return rows.map((r) => ({
    title: r.title,
    content: r.content,
    source: r.source,
    score: r.similarity,
  }));
}

// =============================================================================
// Backend 2 — offline TF-IDF (knowledge-base/index/)
// =============================================================================
interface TfidfIndex {
  vocabulary: Record<string, number>; // term → term-id
  idf: number[];                      // length = |vocab|
  documents: Array<{
    chunk_id: string;
    section: string;
    title: string;
    tags: string[];
    file: string;                     // relative path (md)
    tf: Record<string, number>;       // sparse: term-id → tf
    norm: number;
  }>;
}

let cachedIndex: TfidfIndex | null = null;

async function loadTfidfIndex(): Promise<TfidfIndex> {
  if (cachedIndex) return cachedIndex;
  // knowledge-base/ siedzi w workspace root; w runtime Next.js cwd to apps/web,
  // więc nawigujemy 2 poziomy w górę.
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const indexPath = path.join(repoRoot, "knowledge-base", "index", "tfidf.json");
  const raw = await fs.readFile(indexPath, "utf8");
  cachedIndex = JSON.parse(raw) as TfidfIndex;
  return cachedIndex;
}

async function retrieveFromTfidf(
  query: string,
  k: number,
  tagsFilter?: string[],
): Promise<RagChunk[]> {
  const idx = await loadTfidfIndex();
  const queryTerms = tokenize(query);

  // Sparse tf-idf vector dla zapytania
  const queryVec = new Map<number, number>();
  let queryNorm = 0;
  for (const t of queryTerms) {
    const id = idx.vocabulary[t];
    if (id === undefined) continue;
    const w = (queryVec.get(id) ?? 0) + idx.idf[id];
    queryVec.set(id, w);
  }
  for (const v of queryVec.values()) queryNorm += v * v;
  queryNorm = Math.sqrt(queryNorm) || 1;

  const filterSet = tagsFilter && tagsFilter.length > 0
    ? new Set(tagsFilter)
    : null;

  const scored: Array<{ doc: TfidfIndex["documents"][number]; score: number }> = [];
  for (const doc of idx.documents) {
    if (filterSet) {
      const hit = doc.tags.some((t) => filterSet.has(t));
      if (!hit) continue;
    }
    let dot = 0;
    for (const [termId, qw] of queryVec) {
      const dw = doc.tf[String(termId)] ?? 0;
      if (dw) dot += qw * idx.idf[termId] * dw;
    }
    if (dot <= 0) continue;
    const score = dot / (queryNorm * (doc.norm || 1));
    scored.push({ doc, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k);

  // Wczytaj pełną treść z plików md (lazy)
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const out: RagChunk[] = [];
  for (const { doc, score } of top) {
    try {
      const full = await fs.readFile(
        path.join(repoRoot, doc.file),
        "utf8",
      );
      // Wytnij sam content (po pierwszej pustej linii po nagłówku)
      const body = stripFrontmatter(full);
      out.push({
        title: doc.title || `${doc.section}`,
        content: body,
        source: `SPEC §${doc.section}`,
        score,
      });
    } catch {
      // skip missing files silently
    }
  }
  return out;
}

function tokenize(text: string): string[] {
  // Match build_kb.py — lowercase, alfa+digit, drop ≤2-char tokens.
  const normalized = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  return Array.from(normalized.matchAll(/[a-z0-9]+/g))
    .map((m) => m[0])
    .filter((t) => t.length > 2);
}

function stripFrontmatter(md: string): string {
  // Markdown chunks zaczynają się od `# N — title\n\n_source: ...\n\n`
  // Wycinamy do pierwszej pustej linii po `_source:`.
  const sourceIdx = md.indexOf("_source:");
  if (sourceIdx < 0) return md;
  const afterSource = md.indexOf("\n\n", sourceIdx);
  if (afterSource < 0) return md;
  return md.slice(afterSource + 2).trim();
}

/**
 * Format chunks for prompt injection. Wstawiamy je w sekcji
 * "## Kontekst prawny" w prompcie systemowym/uzytkownika.
 */
export function formatRagContext(ctx: RagContext): string {
  if (ctx.chunks.length === 0) return "";
  const lines: string[] = [];
  lines.push("## Kontekst prawny (źródło: " + ctx.source + ")");
  lines.push("");
  for (const c of ctx.chunks) {
    lines.push(`### ${c.title} — _${c.source}_`);
    lines.push(c.content.slice(0, 1200));
    lines.push("");
  }
  return lines.join("\n");
}
