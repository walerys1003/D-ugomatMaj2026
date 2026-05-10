/**
 * LEX/LegalMind RAG integration scaffold — zad. 315
 *
 * Pluggable RAG provider interface. Default implementation is in-house
 * (knowledge_articles + legal_references + pgvector cosine).
 * External providers (LEX, LegalMind, Lex Polonica) can be added when API
 * credentials become available — only the implementation layer changes.
 */

import { logger } from "@/lib/observability/logger";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";

export type RagProvider = "in_house" | "lex" | "legalmind" | "stub";

export interface RagQuery {
  query: string;
  /** Filter by reference type (jurisprudence, articles, both). */
  scope?: "all" | "jurisprudence" | "articles" | "statutes";
  case_type?: string;
  limit?: number;
}

export interface RagResult {
  citation: string;
  title: string;
  body: string;
  score: number;
  source_url?: string;
  ref_type: "article" | "sn_judgment" | "sn_resolution" | "tsue" | "tk" | "other";
  retrieved_at: string;
}

export interface RagResponse {
  query: string;
  provider: RagProvider;
  results: RagResult[];
  total_ms: number;
}

interface RagProviderImpl {
  name: RagProvider;
  search(q: RagQuery): Promise<RagResult[]>;
  available(): boolean;
}

class InHouseProvider implements RagProviderImpl {
  name: RagProvider = "in_house";

  available(): boolean {
    return true;
  }

  async search(q: RagQuery): Promise<RagResult[]> {
    const supabase = getSupabaseAdmin();
    const limit = q.limit ?? 5;
    const tokens = tokenize(q.query);
    if (tokens.length === 0) return [];

    const ftsExpr = tokens.map((t) => `${t}:*`).join(" | ");

    let query = supabase
      .from("legal_references")
      .select("citation, body, abbreviation, article_number, ref_type, url, publication_date")
      .eq("verified", true)
      .limit(limit * 3);
    if (q.scope === "jurisprudence") {
      query = query.in("ref_type", ["sn_judgment", "sn_resolution", "tsue", "tk"]);
    } else if (q.scope === "articles" || q.scope === "statutes") {
      query = query.eq("ref_type", "article");
    }
    const { data, error } = await query;
    if (error || !data) {
      logger.warn("rag.in_house_failed", { error: error?.message });
      return [];
    }

    // Score by token overlap with body+citation
    const scored = data.map((r) => {
      const haystack = `${r.citation} ${r.body ?? ""}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        const matches = (haystack.match(new RegExp(t, "g")) ?? []).length;
        score += Math.min(matches, 5);
      }
      return {
        citation: r.citation,
        title: r.citation,
        body: (r.body ?? "").slice(0, 600),
        score,
        source_url: r.url ?? undefined,
        ref_type: r.ref_type as RagResult["ref_type"],
        retrieved_at: new Date().toISOString(),
      };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

class StubProvider implements RagProviderImpl {
  name: RagProvider = "stub";
  available(): boolean {
    return true;
  }
  async search(): Promise<RagResult[]> {
    return [];
  }
}

class LexProvider implements RagProviderImpl {
  name: RagProvider = "lex";
  available(): boolean {
    return !!(process.env.LEX_API_KEY && process.env.LEX_API_BASE);
  }
  async search(_q: RagQuery): Promise<RagResult[]> {
    // TODO: integrate when LEX API credentials are available
    logger.info("rag.lex_not_implemented");
    return [];
  }
}

class LegalMindProvider implements RagProviderImpl {
  name: RagProvider = "legalmind";
  available(): boolean {
    return !!(process.env.LEGALMIND_API_KEY && process.env.LEGALMIND_API_BASE);
  }
  async search(_q: RagQuery): Promise<RagResult[]> {
    logger.info("rag.legalmind_not_implemented");
    return [];
  }
}

const PROVIDERS: Record<RagProvider, RagProviderImpl> = {
  in_house: new InHouseProvider(),
  lex: new LexProvider(),
  legalmind: new LegalMindProvider(),
  stub: new StubProvider(),
};

export async function searchLegalContext(query: RagQuery, preferredProvider?: RagProvider): Promise<RagResponse> {
  const startedAt = Date.now();
  const order: RagProvider[] = preferredProvider
    ? [preferredProvider, "in_house", "stub"]
    : ["lex", "legalmind", "in_house", "stub"];

  for (const name of order) {
    const provider = PROVIDERS[name];
    if (!provider || !provider.available()) continue;
    try {
      const results = await provider.search(query);
      if (results.length > 0 || name === "in_house" || name === "stub") {
        return {
          query: query.query,
          provider: name,
          results,
          total_ms: Date.now() - startedAt,
        };
      }
    } catch (err) {
      logger.warn("rag.provider_failed", { provider: name, error: (err as Error).message });
    }
  }
  return { query: query.query, provider: "stub", results: [], total_ms: Date.now() - startedAt };
}

const STOPWORDS = new Set(["i", "w", "z", "do", "na", "od", "po", "za", "to", "a", "ale", "lub"]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    .slice(0, 12);
}
