/**
 * Tier 11 — Citation validator for Polish legal references.
 * Detects malformed or hallucinated citations (e.g. art. 9999 k.p.c.).
 */
export interface CitationFinding {
  raw: string;
  kind: "article" | "ruling" | "act" | "unknown";
  valid: boolean;
  reason?: string;
}

const ART_RE = /art\.\s*(\d+[a-z]?)\s*(?:§\s*(\d+))?\s*(k\.?c\.?|k\.?p\.?c\.?|k\.?k\.?|k\.?p\.?k\.?|u\.?\s*\w+)/gi;
const RULING_RE = /(?:wyrok|postanowienie|uchwała)\s+\w+\s+z\s+\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4},?\s+sygn\.\s*akt\s*[\w\d\/\-]+/gi;

const MAX_ARTICLE: Record<string, number> = {
  "kc": 1088,
  "kpc": 1217,
  "kk": 363,
  "kpk": 682,
};

function normalize(code: string): string {
  return code.toLowerCase().replace(/[.\s]/g, "").replace(/^k$/, "");
}

export function validateCitations(text: string): CitationFinding[] {
  const findings: CitationFinding[] = [];
  let m: RegExpExecArray | null;
  while ((m = ART_RE.exec(text))) {
    const num = parseInt(m[1].replace(/[a-z]/i, ""), 10);
    const codeRaw = m[3] ?? "";
    const code = normalize(codeRaw);
    const max = MAX_ARTICLE[code];
    const valid = max ? num > 0 && num <= max : true;
    findings.push({
      raw: m[0],
      kind: "article",
      valid,
      reason: valid ? undefined : `art. ${num} przekracza maks. ${max} w ${codeRaw}`,
    });
  }
  while ((m = RULING_RE.exec(text))) {
    findings.push({ raw: m[0], kind: "ruling", valid: true });
  }
  return findings;
}

export function hasHallucinatedCitations(text: string): boolean {
  return validateCitations(text).some((f) => !f.valid);
}
