/**
 * AI Q&A panel for /baza-wiedzy/ — zad. 334
 *
 * Hybrid retrieval over knowledge articles:
 *  - keyword pre-filter (Polish stem matching, BM25-like scoring)
 *  - optional embedding similarity (if pgvector + OpenAI/Voyage embeddings available)
 *  - Haiku as the answerer, citing source article slugs
 *
 * Stays cheap: only Haiku, max 3 articles in context, max ~1500 input tokens.
 */

import { logger } from "@/lib/observability/logger";
import { sendApipodRequest } from "@/lib/ai/apipod-client";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";

export interface KnowledgeArticle {
  slug: string;
  title: string;
  category?: string;
  excerpt?: string;
  content: string;
  updated_at?: string;
}

export interface QaSource {
  slug: string;
  title: string;
  url: string;
  excerpt: string;
  score: number;
}

export interface QaResult {
  answer: string;
  sources: QaSource[];
  no_answer: boolean;
  confidence: "low" | "medium" | "high";
  duration_ms: number;
  tokens_used: { input: number; output: number };
}

const POLISH_STOPWORDS = new Set([
  "i", "w", "z", "na", "do", "od", "po", "za", "o", "u", "to", "się", "nie", "ja", "ty", "on",
  "ona", "ono", "my", "wy", "oni", "one", "być", "jest", "są", "był", "była", "było", "byli",
  "co", "kto", "jak", "gdzie", "kiedy", "dlaczego", "który", "która", "które",
  "ten", "ta", "to", "te", "tego", "tej", "tych", "tym", "lub", "albo", "ale", "a",
  "że", "by", "aby", "żeby", "mi", "ci", "mu", "jej", "im",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !POLISH_STOPWORDS.has(w));
}

/**
 * BM25-like keyword score.
 */
function scoreArticle(article: KnowledgeArticle, queryTokens: string[]): number {
  const docTokens = tokenize(article.title + " " + (article.excerpt ?? "") + " " + article.content);
  if (docTokens.length === 0) return 0;
  const tokenFreq = new Map<string, number>();
  for (const t of docTokens) tokenFreq.set(t, (tokenFreq.get(t) ?? 0) + 1);
  let score = 0;
  for (const q of queryTokens) {
    const tf = tokenFreq.get(q) ?? 0;
    if (tf === 0) continue;
    // BM25 simplified: tf / (tf + 1.5)
    score += tf / (tf + 1.5);
    // bonus for title hits
    if (article.title.toLowerCase().includes(q)) score += 1.0;
  }
  return score;
}

export async function loadKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("slug, title, category, excerpt, content, updated_at")
      .eq("published", true);
    if (error) {
      logger.warn("qa.knowledge_articles_load_failed", { error: error.message });
      return [];
    }
    // Kolumny DB to `string | null`; interfejs KnowledgeArticle używa
    // opcjonalnych `string | undefined` — mapujemy null → undefined.
    return (data ?? []).map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category ?? undefined,
      excerpt: a.excerpt ?? undefined,
      content: a.content,
      updated_at: a.updated_at,
    }));
  } catch (err) {
    logger.warn("qa.knowledge_articles_exception", { error: (err as Error).message });
    return [];
  }
}

export async function retrieveRelevantArticles(
  question: string,
  limit = 3,
): Promise<Array<KnowledgeArticle & { score: number }>> {
  const articles = await loadKnowledgeArticles();
  if (articles.length === 0) return [];
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];

  const scored = articles
    .map((a) => ({ ...a, score: scoreArticle(a, queryTokens) }))
    .filter((a) => a.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

const QA_SYSTEM_PROMPT = `Jesteś asystentem prawnym Długomat. Odpowiadaj WYŁĄCZNIE na podstawie udostępnionych artykułów.

ZASADY:
- Jeśli artykuły nie zawierają odpowiedzi, napisz dokładnie: "Nie mam pewnej odpowiedzi w bazie wiedzy."
- Cytuj źródła w formacie [slug] po każdym kluczowym fakcie.
- Nie zmyślaj artykułów ani przepisów.
- Pisz po polsku, krótko (max 200 słów), w 2-3 akapitach.
- Nie udzielaj porad prawnych w sposób wiążący — to materiał edukacyjny.
- Przy złożonych sprawach sugeruj kontakt z radcą prawnym.

FORMAT ODPOWIEDZI: zwykły tekst (markdown lekki: pogrubienia OK, listy OK).`;

export async function askKnowledgeBase(question: string): Promise<QaResult> {
  const startedAt = Date.now();
  const sources_raw = await retrieveRelevantArticles(question, 3);

  if (sources_raw.length === 0) {
    return {
      answer: "Nie mam pewnej odpowiedzi w bazie wiedzy. Spróbuj przeszukać kategorie lub zadaj bardziej szczegółowe pytanie.",
      sources: [],
      no_answer: true,
      confidence: "low",
      duration_ms: Date.now() - startedAt,
      tokens_used: { input: 0, output: 0 },
    };
  }

  // Build context (truncate each article to ~600 chars)
  const context = sources_raw
    .map((a, idx) => {
      const body = a.content.slice(0, 600);
      return `[${idx + 1}] slug=${a.slug} | title="${a.title}"\n${body}${a.content.length > 600 ? "…" : ""}`;
    })
    .join("\n\n---\n\n");

  const userPrompt = `PYTANIE:\n${question}\n\nARTYKUŁY:\n${context}\n\nOdpowiedz krótko i cytuj [slug].`;

  let answer = "Nie mam pewnej odpowiedzi w bazie wiedzy.";
  let inputTokens = 0;
  let outputTokens = 0;
  let no_answer = false;

  try {
    const resp = await sendApipodRequest({
      model: "claude-haiku-4-5",
      system: QA_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 600,
      temperature: 0.2,
    });
    answer = resp.content?.[0]?.text ?? answer;
    inputTokens = resp.usage?.input_tokens ?? 0;
    outputTokens = resp.usage?.output_tokens ?? 0;
    no_answer = /nie mam pewnej odpowiedzi/i.test(answer) && answer.length < 200;
  } catch (err) {
    logger.warn("qa.haiku_failed", { error: (err as Error).message });
    return {
      answer: "Wystąpił błąd po stronie AI. Spróbuj ponownie za chwilę.",
      sources: sources_raw.map((a) => ({
        slug: a.slug,
        title: a.title,
        url: `/baza-wiedzy/${a.slug}`,
        excerpt: a.excerpt ?? a.content.slice(0, 160),
        score: a.score,
      })),
      no_answer: true,
      confidence: "low",
      duration_ms: Date.now() - startedAt,
      tokens_used: { input: 0, output: 0 },
    };
  }

  // Confidence heuristic: based on top score
  const topScore = sources_raw[0]?.score ?? 0;
  const confidence: "low" | "medium" | "high" =
    no_answer ? "low" : topScore >= 3 ? "high" : topScore >= 1.5 ? "medium" : "low";

  return {
    answer,
    sources: sources_raw.map((a) => ({
      slug: a.slug,
      title: a.title,
      url: `/baza-wiedzy/${a.slug}`,
      excerpt: a.excerpt ?? a.content.slice(0, 160),
      score: a.score,
    })),
    no_answer,
    confidence,
    duration_ms: Date.now() - startedAt,
    tokens_used: { input: inputTokens, output: outputTokens },
  };
}
