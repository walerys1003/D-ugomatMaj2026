import "server-only";

/**
 * Tier 7 zad. 316 — Citation verification.
 *
 * Po wygenerowaniu pisma sprawdza, czy każde przytoczone:
 *   - art. ustawy (np. "art. 505^36 § 1 k.p.c.")
 *   - orzeczenie SN (np. "wyrok SN z 13 czerwca 2018 r., II CSK 405/17")
 *   - uchwała SN (np. "uchwała SN z ... III CZP 23/19")
 *
 * istnieje w naszej bazie referencji `legal_references`. Niezweryfikowane
 * cytaty są flagowane (severity=high) i klient widzi badge "do weryfikacji".
 *
 * Strategia 2-fazowa:
 *   1. Regex extract — wyciągnij wszystkie potencjalne cytaty
 *   2. DB lookup — sprawdź w `legal_references` (full-text + slug match)
 *
 * Cost: ZERO AI tokens (tylko DB) → tani i deterministyczny.
 */

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";

export type CitationKind = "article" | "supreme_court_judgment" | "supreme_court_resolution" | "ec_judgment" | "tk_judgment";

export interface ExtractedCitation {
  raw: string;
  kind: CitationKind;
  normalized: string;
  startIdx: number;
  endIdx: number;
}

export interface VerifiedCitation extends ExtractedCitation {
  verified: boolean;
  source_url?: string;
  match_score?: number;
}

export interface CitationVerificationResult {
  citations: VerifiedCitation[];
  unverified_count: number;
  verified_count: number;
  warnings: string[];
}

// Regex'y dla typowych wzorców cytowania w polskim prawie
const RX_ARTICLE = /art\.\s*(\d+(?:\^\d+)?(?:\s*[a-z]+)?)\s*(?:§\s*(\d+(?:\^\d+)?))?\s*(?:pkt\s*(\d+))?\s*(?:lit\.\s*([a-z]))?\s+([a-zżąśłęóćńź.]{1,15})/gi;
const RX_SN_JUDGMENT = /(?:wyrok|postanowienie)\s+S(?:ąd|N)[a-zżąśłęóćńź]*\s+(?:Najwy[żz]szego\s+)?z(?:e\s+dnia)?\s+(\d{1,2}\s+\w+\s+\d{4})\s*r?\.?,?\s*(?:sygn\.?\s*akt\s*)?([IVX]+\s+[A-Z]{2,5}\s*\d+\/\d{2,4})/gi;
const RX_SN_RESOLUTION = /uchwała\s+S(?:ąd|N)[a-zżąśłęóćńź]*\s+z(?:e\s+dnia)?\s+(\d{1,2}\s+\w+\s+\d{4})\s*r?\.?,?\s*(?:sygn\.?\s*akt\s*)?(III\s+CZP\s*\d+\/\d{2,4})/gi;
const RX_TSUE = /(?:wyrok|orzeczenie)\s+TSUE\s+z(?:e\s+dnia)?\s+(\d{1,2}\s+\w+\s+\d{4})\s*r?\.?,?\s*(?:sprawa\s+)?(C-\d+\/\d{2,4})/gi;
const RX_TK = /(?:wyrok|orzeczenie)\s+T(?:rybun[a-zżąśłęóćńź]*\s+Konstytucyjnego|K)\s+z(?:e\s+dnia)?\s+(\d{1,2}\s+\w+\s+\d{4})\s*r?\.?,?\s*(?:sygn\.?\s*akt\s*)?([SKPUSygn]+\s*\d+\/\d{2,4})/gi;

const VALID_LAW_ABBREV = new Set([
  "k.c.", "kc",
  "k.p.c.", "kpc",
  "k.k.", "kk",
  "k.p.k.", "kpk",
  "p.u.", "pu",
  "p.r.", "pr",
  "u.r.k.s.", "urks",
  "u.k.k.", "ukk",
  "u.o.k.k.", "uokik",
  "u.k.s.e.", "ukse",
]);

function normalizeLawAbbrev(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "").replace(/\.$/, "");
}

export function extractCitations(text: string): ExtractedCitation[] {
  const out: ExtractedCitation[] = [];

  // Articles
  RX_ARTICLE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RX_ARTICLE.exec(text)) !== null) {
    const lawAbbrev = m[5]?.toLowerCase().replace(/[^a-zżąśłęóćńź.]/g, "");
    if (!lawAbbrev) continue;
    const normAbbrev = normalizeLawAbbrev(lawAbbrev);
    if (!VALID_LAW_ABBREV.has(normAbbrev)) continue;

    const articleNo = m[1];
    const para = m[2];
    const point = m[3];
    const letter = m[4];
    const norm = [
      `art.${articleNo}`,
      para ? `§${para}` : null,
      point ? `pkt${point}` : null,
      letter ? `lit${letter}` : null,
      normAbbrev,
    ]
      .filter(Boolean)
      .join("|");

    out.push({
      raw: m[0],
      kind: "article",
      normalized: norm,
      startIdx: m.index,
      endIdx: m.index + m[0].length,
    });
  }

  // SN judgments
  RX_SN_JUDGMENT.lastIndex = 0;
  while ((m = RX_SN_JUDGMENT.exec(text)) !== null) {
    out.push({
      raw: m[0],
      kind: "supreme_court_judgment",
      normalized: m[2].replace(/\s+/g, " ").trim().toUpperCase(),
      startIdx: m.index,
      endIdx: m.index + m[0].length,
    });
  }

  // SN resolutions
  RX_SN_RESOLUTION.lastIndex = 0;
  while ((m = RX_SN_RESOLUTION.exec(text)) !== null) {
    out.push({
      raw: m[0],
      kind: "supreme_court_resolution",
      normalized: m[2].replace(/\s+/g, " ").trim().toUpperCase(),
      startIdx: m.index,
      endIdx: m.index + m[0].length,
    });
  }

  // TSUE
  RX_TSUE.lastIndex = 0;
  while ((m = RX_TSUE.exec(text)) !== null) {
    out.push({
      raw: m[0],
      kind: "ec_judgment",
      normalized: m[2].replace(/\s+/g, "").toUpperCase(),
      startIdx: m.index,
      endIdx: m.index + m[0].length,
    });
  }

  // TK
  RX_TK.lastIndex = 0;
  while ((m = RX_TK.exec(text)) !== null) {
    out.push({
      raw: m[0],
      kind: "tk_judgment",
      normalized: m[2].replace(/\s+/g, " ").trim().toUpperCase(),
      startIdx: m.index,
      endIdx: m.index + m[0].length,
    });
  }

  return out;
}

export async function verifyCitations(
  text: string,
): Promise<CitationVerificationResult> {
  const extracted = extractCitations(text);
  if (extracted.length === 0) {
    return {
      citations: [],
      unverified_count: 0,
      verified_count: 0,
      warnings: [],
    };
  }

  const supabase = createSupabaseAdminClient();
  const verified: VerifiedCitation[] = [];

  if (!supabase) {
    // Brak admin clienta — nie weryfikujemy, ale zwracamy listę (UI pokazuje badge "?")
    return {
      citations: extracted.map((e) => ({ ...e, verified: false })),
      unverified_count: extracted.length,
      verified_count: 0,
      warnings: ["citation_verifier.no_admin_client"],
    };
  }

  for (const c of extracted) {
    try {
      const { data } = await supabase
        .from("legal_references")
        .select("id,source_url,citation_text,kind,slug")
        .eq("kind", c.kind)
        .eq("normalized", c.normalized)
        .maybeSingle();

      if (data) {
        verified.push({
          ...c,
          verified: true,
          source_url: (data.source_url as string | null) ?? undefined,
          match_score: 1.0,
        });
      } else {
        verified.push({ ...c, verified: false });
      }
    } catch (e) {
      logger.warn("citation_verifier.lookup_failed", {
        kind: c.kind,
        normalized: c.normalized,
        error: e instanceof Error ? e.message : String(e),
      });
      verified.push({ ...c, verified: false });
    }
  }

  const unverified_count = verified.filter((v) => !v.verified).length;
  const verified_count = verified.length - unverified_count;

  const warnings: string[] = [];
  if (unverified_count > 0) {
    warnings.push(`${unverified_count} cytatów nie zostało zweryfikowanych w bazie LegalRef.`);
  }

  return { citations: verified, unverified_count, verified_count, warnings };
}
