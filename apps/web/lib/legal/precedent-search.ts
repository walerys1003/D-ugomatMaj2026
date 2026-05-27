/**
 * Public legal precedent search — zad. 335
 *
 * Searches `legal_references` table (jurisprudence) by query terms, filterable
 * by court (SN/TSUE/TK), year range, and legal area. No user authentication
 * required — purely educational/research.
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export type PrecedentCourt = "sn" | "tsue" | "tk" | "all";

export interface PrecedentSearchInput {
  query: string;
  court?: PrecedentCourt;
  year_from?: number;
  year_to?: number;
  legal_area?: string;
  limit?: number;
  offset?: number;
}

export interface PrecedentResult {
  id: string;
  citation: string;
  signature: string;
  court: string;
  publication_date: string | null;
  legal_area: string | null;
  body: string;
  url?: string;
  relevance_score: number;
}

export async function searchPrecedents(input: PrecedentSearchInput): Promise<{ results: PrecedentResult[]; total: number }> {
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const limit = Math.min(input.limit ?? 20, 50);
  const offset = Math.max(input.offset ?? 0, 0);
  const tokens = tokenize(input.query);
  if (tokens.length === 0) return { results: [], total: 0 };

  let query = sb
    .from("legal_references")
    .select("id, citation, signature, ref_type, publication_date, legal_area, body, url", { count: "exact" })
    .eq("verified", true)
    .in("ref_type", ["sn_judgment", "sn_resolution", "tsue", "tk"]);

  if (input.court && input.court !== "all") {
    if (input.court === "sn") {
      query = query.in("ref_type", ["sn_judgment", "sn_resolution"]);
    } else {
      query = query.eq("ref_type", input.court === "tsue" ? "tsue" : "tk");
    }
  }
  if (input.year_from) query = query.gte("publication_date", `${input.year_from}-01-01`);
  if (input.year_to) query = query.lte("publication_date", `${input.year_to}-12-31`);
  if (input.legal_area) query = query.eq("legal_area", input.legal_area);

  // Use textSearch if available, otherwise ilike OR
  const orFilter = tokens.map((t) => `body.ilike.%${t}%,citation.ilike.%${t}%`).join(",");
  query = query.or(orFilter);
  query = query.range(offset, offset + limit - 1).order("publication_date", { ascending: false });

  const { data, error, count } = await query;
  if (error || !data) {
    logger.warn("precedent.search_failed", { error: error?.message });
    return { results: [], total: 0 };
  }

  const results: PrecedentResult[] = data.map((r) => {
    const haystack = `${r.citation ?? ""} ${r.body ?? ""}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      const matches = (haystack.match(new RegExp(t, "g")) ?? []).length;
      score += Math.min(matches, 5);
    }
    return {
      id: r.id,
      citation: r.citation,
      signature: r.signature ?? "",
      court: courtLabel(r.ref_type),
      publication_date: r.publication_date,
      legal_area: r.legal_area,
      body: (r.body ?? "").slice(0, 800),
      url: r.url ?? undefined,
      relevance_score: score,
    };
  });
  results.sort((a, b) => b.relevance_score - a.relevance_score);
  return { results, total: count ?? results.length };
}

function courtLabel(type: string): string {
  switch (type) {
    case "sn_judgment": return "SN (wyrok)";
    case "sn_resolution": return "SN (uchwała)";
    case "tsue": return "TSUE";
    case "tk": return "TK";
    default: return type;
  }
}

const STOPWORDS = new Set(["i", "w", "z", "do", "na", "od", "po", "za", "to", "a", "ale", "lub"]);
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    .slice(0, 10);
}
