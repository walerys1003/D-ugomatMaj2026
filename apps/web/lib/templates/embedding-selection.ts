/**
 * Embedding-based template selection — zad. 314
 *
 * Given case facts + case_type, chooses the best matching template variant
 * from the templates DB using vector similarity. If pgvector + embeddings
 * are unavailable, falls back to keyword + tag scoring.
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";
import type { CaseType } from "@/lib/db/types";

export interface TemplateVariant {
  id: string;
  case_type: CaseType;
  variant_name: string;
  description: string;
  body_markdown: string;
  tags: string[];
  /** Optional pre-computed embedding (1536 dims for OpenAI text-embedding-3-small). */
  embedding?: number[];
  popularity?: number;
  win_rate?: number;
}

export interface SelectTemplateInput {
  case_type: CaseType;
  case_facts: string;
  /** User-explicit tags (e.g., "przedawnienie", "cesja"). */
  user_tags?: string[];
  /** Limit results */
  limit?: number;
}

export interface RankedTemplate {
  template: TemplateVariant;
  score: number;
  reason: string;
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function embed(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch(`${process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1"}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    });
    if (!resp.ok) {
      logger.warn("template.embed_failed", { status: resp.status });
      return null;
    }
    const data = (await resp.json()) as { data?: Array<{ embedding?: number[] }> };
    return data.data?.[0]?.embedding ?? null;
  } catch (err) {
    logger.warn("template.embed_exception", { error: (err as Error).message });
    return null;
  }
}

export async function selectTemplates(input: SelectTemplateInput): Promise<RankedTemplate[]> {
  const supabase = getSupabaseAdmin();
  const { data: templates, error } = await supabase
    .from("template_variants")
    .select("id, case_type, variant_name, description, body_markdown, tags, embedding, popularity, win_rate")
    .eq("case_type", input.case_type)
    .eq("active", true);
  if (error || !templates || templates.length === 0) {
    logger.debug("template.no_variants", { case_type: input.case_type, error: error?.message });
    return [];
  }

  const limit = input.limit ?? 3;

  // Try pgvector path first: query embedding + DB-side cosine via RPC
  const queryEmbedding = await embed(input.case_facts);
  if (queryEmbedding) {
    const ranked: RankedTemplate[] = [];
    for (const t of templates as TemplateVariant[]) {
      let score = 0;
      let reason = "";
      if (t.embedding && Array.isArray(t.embedding) && t.embedding.length === queryEmbedding.length) {
        score = cosine(queryEmbedding, t.embedding);
        reason = `embedding_cosine=${score.toFixed(3)}`;
      } else {
        // No embedding: fall back to tag overlap
        const overlap = countTagOverlap(t.tags ?? [], input.user_tags ?? [], input.case_facts);
        score = overlap * 0.1;
        reason = `tag_overlap=${overlap}`;
      }
      // Boost by popularity & win_rate
      if (t.popularity) score += Math.min(0.05, t.popularity / 10000);
      if (t.win_rate) score += t.win_rate * 0.1;
      ranked.push({ template: t, score, reason });
    }
    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, limit);
  }

  // No embeddings: pure keyword/tag fallback
  const ranked: RankedTemplate[] = (templates as TemplateVariant[])
    .map((t) => {
      const overlap = countTagOverlap(t.tags ?? [], input.user_tags ?? [], input.case_facts);
      const popularityBonus = Math.min(0.5, (t.popularity ?? 0) / 100);
      const winBonus = (t.win_rate ?? 0) * 1.0;
      return {
        template: t,
        score: overlap + popularityBonus + winBonus,
        reason: `keyword_overlap=${overlap}, popularity=${t.popularity ?? 0}, win_rate=${t.win_rate ?? 0}`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}

function countTagOverlap(templateTags: string[], userTags: string[], caseFacts: string): number {
  const factsLower = caseFacts.toLowerCase();
  const userTagSet = new Set(userTags.map((t) => t.toLowerCase()));
  let count = 0;
  for (const tag of templateTags) {
    const t = tag.toLowerCase();
    if (userTagSet.has(t)) count += 2;
    if (factsLower.includes(t)) count += 1;
  }
  return count;
}
