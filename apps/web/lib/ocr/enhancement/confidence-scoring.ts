/**
 * Tier 18 — OCR enhancement: confidence scoring + escalation policy.
 *
 * Łączy sygnały:
 *  - mean line confidence (Tesseract/Textract zwraca per-line 0..100)
 *  - share of low-confidence lines (<60)
 *  - presence of corrupted characters (rzadkie znaki Unicode, replacement char)
 *  - parser success (czy dispatcher znalazł kluczowe pola)
 *
 * Decyzja:
 *  - "accept"   — score >= 0.85, idziemy dalej
 *  - "review"   — score 0.55..0.85, wymaga ludzkiego review w wizardzie
 *  - "escalate" — score < 0.55, eskalujemy do Textract (jeśli źródłem był Tesseract)
 */

import type { OcrLine } from "../ocr-types";

export interface ConfidenceReport {
  score: number; // 0..1
  decision: "accept" | "review" | "escalate";
  signals: {
    meanLineConfidence: number;
    lowConfidenceShare: number;
    corruptedCharShare: number;
    parserFieldsFound: number;
    parserFieldsExpected: number;
  };
  reasons: string[];
}

export interface ConfidenceInput {
  lines: OcrLine[];
  parserFieldsFound: number;
  parserFieldsExpected: number;
  rawText: string;
}

const CORRUPTED_RE = /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

export function scoreOcrConfidence(input: ConfidenceInput): ConfidenceReport {
  const reasons: string[] = [];
  const totalLines = input.lines.length || 1;

  const meanLineConfidence =
    input.lines.reduce((s, l) => s + (l.confidence || 0), 0) / totalLines / 100;
  const lowConfidenceShare =
    input.lines.filter((l) => (l.confidence || 0) < 60).length / totalLines;

  const corruptedMatches = input.rawText.match(CORRUPTED_RE);
  const corruptedCharShare = corruptedMatches
    ? corruptedMatches.length / Math.max(1, input.rawText.length)
    : 0;

  const parserRatio =
    input.parserFieldsExpected > 0
      ? input.parserFieldsFound / input.parserFieldsExpected
      : 1;

  // Composite score — ważona suma.
  const score =
    0.45 * meanLineConfidence +
    0.2 * (1 - lowConfidenceShare) +
    0.1 * (1 - Math.min(1, corruptedCharShare * 50)) +
    0.25 * parserRatio;

  if (meanLineConfidence < 0.6) reasons.push("low_mean_line_confidence");
  if (lowConfidenceShare > 0.3) reasons.push("many_low_conf_lines");
  if (corruptedCharShare > 0.005) reasons.push("corrupted_chars_present");
  if (parserRatio < 0.5) reasons.push("parser_missing_key_fields");

  let decision: ConfidenceReport["decision"];
  if (score >= 0.85) decision = "accept";
  else if (score >= 0.55) decision = "review";
  else decision = "escalate";

  return {
    score: Math.max(0, Math.min(1, score)),
    decision,
    signals: {
      meanLineConfidence,
      lowConfidenceShare,
      corruptedCharShare,
      parserFieldsFound: input.parserFieldsFound,
      parserFieldsExpected: input.parserFieldsExpected,
    },
    reasons,
  };
}
