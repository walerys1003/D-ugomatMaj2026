import "server-only";

/**
 * Tier 7 zad. 325-326 — OCR pism od wierzyciela + auto-tagowanie.
 *
 * Flow:
 *   1. User uploaduje PDF / zdjęcie pisma
 *   2. Tesseract / Google Vision wyciąga tekst (lazy import — nie wymagamy
 *      twardej zależności w MVP)
 *   3. Heurystyki + Haiku rozpoznają typ pisma (nakaz/pozew/komornik/cesja)
 *   4. Auto-fill pól: sygnatura, sąd, data nakazu, kwota, powód, pozwany
 *   5. Sugeruje moduł D2-D16 do utworzenia
 *
 * Output: ParsedLetter — dane do prefill wizarda + classification confidence.
 */

import { complete } from "@/lib/ai/apipod-client";
import { logger } from "@/lib/observability/logger";
import { withSpan } from "@/lib/observability/otel";
import type { CaseType } from "@/lib/db/types";

export type LetterKind =
  | "nakaz_zaplaty_epu"
  | "nakaz_zaplaty_zwykly"
  | "pozew"
  | "wezwanie_do_zaplaty"
  | "monit_windykatora"
  | "pismo_komornika"
  | "zawiadomienie_o_cesji"
  | "wyrok"
  | "postanowienie"
  | "wpis_do_big"
  | "unknown";

export interface ParsedLetter {
  kind: LetterKind;
  confidence: number;
  fields: {
    sygnatura?: string;
    sad?: string;
    komornik?: string;
    data_nakazu?: string; // ISO
    data_doreczenia?: string; // ISO (jeśli wykryjemy)
    powod_nazwa?: string;
    powod_adres?: string;
    pozwany_nazwa?: string;
    pozwany_adres?: string;
    kwota_glowna?: number;
    kwota_odsetki?: number;
    kwota_koszty?: number;
    waluta?: string;
    numer_umowy?: string;
    deadline_iso?: string;
  };
  suggested_modules: Array<{ caseType: CaseType; reason: string }>;
  raw_text_sample: string;
  warnings: string[];
}

// ----- 1. Heuristic kind detection -----

const KIND_PATTERNS: Array<{ kind: LetterKind; rx: RegExp; weight: number }> = [
  { kind: "nakaz_zaplaty_epu", rx: /elektronicznym?\s+post[ęe]powaniu\s+upomin/i, weight: 5 },
  { kind: "nakaz_zaplaty_epu", rx: /\bSI?d\s+Rejonowy\s+Lublin[- ]Zach/i, weight: 4 },
  { kind: "nakaz_zaplaty_epu", rx: /\bNc-?e\b/i, weight: 4 },
  { kind: "nakaz_zaplaty_zwykly", rx: /nakaz(?:em)?\s+zap[łl]aty/i, weight: 3 },
  { kind: "pozew", rx: /\bpozew\b/i, weight: 3 },
  { kind: "wezwanie_do_zaplaty", rx: /wezwanie\s+do\s+zap[łl]aty/i, weight: 4 },
  { kind: "monit_windykatora", rx: /monit|windykac[jy]/i, weight: 3 },
  { kind: "pismo_komornika", rx: /komornik\s+s[ąa]dowy|km\s*\d+\/\d+/i, weight: 4 },
  { kind: "pismo_komornika", rx: /KMP?\s*\d+\/\d{2,4}/i, weight: 4 },
  { kind: "zawiadomienie_o_cesji", rx: /cesj[aęi]\s+wierzytelno[śs]ci|nabywca\s+wierzytelno/i, weight: 4 },
  { kind: "wyrok", rx: /\bwyrok\b/i, weight: 2 },
  { kind: "postanowienie", rx: /\bpostanowienie\b/i, weight: 2 },
  { kind: "wpis_do_big", rx: /BIG\s+InfoMonitor|KRD\b|ERIF\b/i, weight: 3 },
];

export function classifyLetterByHeuristics(text: string): {
  kind: LetterKind;
  confidence: number;
} {
  const scores = new Map<LetterKind, number>();
  for (const p of KIND_PATTERNS) {
    if (p.rx.test(text)) {
      scores.set(p.kind, (scores.get(p.kind) ?? 0) + p.weight);
    }
  }

  if (scores.size === 0) {
    return { kind: "unknown", confidence: 0 };
  }

  let best: { kind: LetterKind; score: number } = { kind: "unknown", score: 0 };
  for (const [kind, score] of scores) {
    if (score > best.score) best = { kind, score };
  }

  // Confidence: ratio of best to total weight observed
  const total = Array.from(scores.values()).reduce((a, b) => a + b, 0);
  const confidence = total > 0 ? Math.min(1, best.score / Math.max(total, 5)) : 0;

  return { kind: best.kind, confidence };
}

// ----- 2. Field extraction (regex + heuristics) -----

const RX_SYGNATURA = /\b(?:sygn\.?\s*akt[au]?\s*[:.]?\s*|sygnatura\s*[:.]?\s*)?((?:[IVX]{1,5}\s+)?(?:Nc-?e?|N[cs]|C|GC|Co|Ko|Km|Kmp|Ns)\s*\d+\s*\/\s*\d{2,4})/i;
const RX_DATE_PL = /\b(\d{1,2})[.\- ]+(\d{1,2}|stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|wrze[śs]nia|pa[źz]dziernika|listopada|grudnia)[.\- ]+(\d{4})\b/gi;
const RX_AMOUNT = /\b(\d{1,3}(?:[\s.]\d{3})*(?:,\d{2})?)\s*(?:z[łl]|PLN)\b/g;
const RX_NIP = /\bNIP[:\s]*(\d{10}|\d{3}[- ]\d{3}[- ]\d{2}[- ]\d{2})\b/;
const RX_KRS = /\bKRS[:\s]*(\d{10}|0?\d{10})\b/;

const POLISH_MONTHS: Record<string, number> = {
  stycznia: 1, lutego: 2, marca: 3, kwietnia: 4, maja: 5, czerwca: 6,
  lipca: 7, sierpnia: 8, września: 9, wrzesnia: 9, października: 10,
  pazdziernika: 10, listopada: 11, grudnia: 12,
};

function parsePolishDate(d: string, m: string, y: string): string | null {
  const day = parseInt(d, 10);
  let month: number;
  if (/^\d+$/.test(m)) {
    month = parseInt(m, 10);
  } else {
    const norm = m.toLowerCase().replace(/[śź]/, (c) => (c === "ś" ? "s" : "z"));
    month = POLISH_MONTHS[norm] ?? 0;
  }
  const year = parseInt(y, 10);
  if (!day || !month || !year || day > 31 || month > 12 || year < 1900 || year > 2100) {
    return null;
  }
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return iso;
}

function parsePolishAmount(s: string): number | null {
  // "1 234,56" → 1234.56; "1.234,56" → 1234.56
  const cleaned = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function extractFieldsHeuristic(text: string): ParsedLetter["fields"] {
  const fields: ParsedLetter["fields"] = {};

  const sygMatch = text.match(RX_SYGNATURA);
  if (sygMatch) fields.sygnatura = sygMatch[1].replace(/\s+/g, " ").trim();

  // Sąd — szukaj "Sąd Rejonowy w XYZ"
  const sadMatch = text.match(/S[ąa]d\s+(?:Rejonowy|Okręgowy|Apelacyjny)\s+(?:w\s+)?([A-ZŻĘĆŁÓŚŹŻ][a-zżęćłóśźń-]+(?:\s+[A-Z][a-zżęćłóśźń-]+)*)/);
  if (sadMatch) fields.sad = sadMatch[0].trim();

  // Komornik
  const komMatch = text.match(/komornik\s+s[ąa]dowy(?:\s+przy\s+S[ąa]dzie\s+\w+)?[\s\S]{0,80}?([A-ZŻĘĆŁÓŚŹŻ][a-z][a-zżęćłóśźń-]+\s+[A-ZŻĘĆŁÓŚŹŻ][a-z][a-zżęćłóśźń-]+)/);
  if (komMatch) fields.komornik = komMatch[1];

  // Daty — pierwsza data jest zwykle data nakazu
  RX_DATE_PL.lastIndex = 0;
  const dates: string[] = [];
  let dm: RegExpExecArray | null;
  while ((dm = RX_DATE_PL.exec(text)) !== null && dates.length < 3) {
    const iso = parsePolishDate(dm[1], dm[2], dm[3]);
    if (iso) dates.push(iso);
  }
  if (dates[0]) fields.data_nakazu = dates[0];
  if (dates[1]) fields.data_doreczenia = dates[1];

  // Kwoty — pierwsza najczęściej kwota główna
  RX_AMOUNT.lastIndex = 0;
  const amounts: number[] = [];
  let am: RegExpExecArray | null;
  while ((am = RX_AMOUNT.exec(text)) !== null && amounts.length < 5) {
    const n = parsePolishAmount(am[1]);
    if (n !== null && n > 1) amounts.push(n);
  }
  if (amounts.length > 0) fields.kwota_glowna = amounts[0];
  if (amounts.length > 1) fields.kwota_odsetki = amounts[1];
  if (amounts.length > 2) fields.kwota_koszty = amounts[2];
  fields.waluta = /PLN|z[łl]/i.test(text) ? "PLN" : undefined;

  // Powód — często blok adresowy po słowie "powód"
  const powMatch = text.match(/pow[óo]d[:\s]+([A-ZŻĘĆŁÓŚŹŻ][^\n]{5,200})/);
  if (powMatch) fields.powod_nazwa = powMatch[1].split(/[,;]/)[0].trim().slice(0, 200);

  return fields;
}

// ----- 3. Suggest module(s) -----

export function suggestModulesByKind(kind: LetterKind): Array<{ caseType: CaseType; reason: string }> {
  switch (kind) {
    case "nakaz_zaplaty_epu":
      return [
        { caseType: "sprzeciw_epu", reason: "Wykryty nakaz EPU — masz 14 dni na sprzeciw." },
        { caseType: "zazalenie_klauzula_wykonalnosci", reason: "Jeśli klauzula nadana błędnie — zażalenie." },
      ];
    case "nakaz_zaplaty_zwykly":
    case "pozew":
      return [{ caseType: "sprzeciw_epu", reason: "Sprzeciw lub odpowiedź na pozew (14 dni)." }];
    case "wezwanie_do_zaplaty":
    case "monit_windykatora":
      return [
        { caseType: "pozew_zwrot_oplat_windykacyjnych", reason: "Możesz zażądać zwrotu opłat windykacyjnych." },
        { caseType: "ugoda_propozycja", reason: "Propozycja ugody przed eskalacją." },
      ];
    case "pismo_komornika":
      return [
        { caseType: "komornik_skarga", reason: "Skarga w 7 dni od czynności." },
        { caseType: "komornik_zwolnienie_konta", reason: "Zwolnienie zajętego rachunku." },
        { caseType: "komornik_ograniczenie", reason: "Ograniczenie egzekucji." },
      ];
    case "zawiadomienie_o_cesji":
      return [{ caseType: "cesja_odpowiedz", reason: "Odpowiedź na zawiadomienie o cesji." }];
    case "wpis_do_big":
      return [
        { caseType: "bik_reklamacja_bik", reason: "Reklamacja bezpodstawnego wpisu." },
        { caseType: "bik_skarga_uodo", reason: "Skarga RODO do PUODO." },
      ];
    default:
      return [];
  }
}

// ----- 4. Optional AI augmentation (Haiku) for low-confidence cases -----

interface HaikuClassification {
  kind?: LetterKind;
  confidence?: number;
  notes?: string;
}

export async function augmentWithHaiku(
  textSample: string,
  heuristicResult: { kind: LetterKind; confidence: number },
): Promise<{ kind: LetterKind; confidence: number; notes?: string }> {
  if (heuristicResult.confidence > 0.8) return heuristicResult;

  return withSpan("ai.letter_ocr.augment_haiku", async () => {
    const prompt = `
Sklasyfikuj poniższy fragment pisma sądowego/windykacyjnego.

Możliwe kategorie:
- nakaz_zaplaty_epu (z Lublin-Zachód, sygn. Nc-e)
- nakaz_zaplaty_zwykly
- pozew
- wezwanie_do_zaplaty
- monit_windykatora
- pismo_komornika (sygn. Km)
- zawiadomienie_o_cesji
- wyrok / postanowienie
- wpis_do_big
- unknown

Tekst:
${textSample.slice(0, 3000)}

Zwróć JSON: { "kind": "...", "confidence": 0..1, "notes": "..." }`.trim();

    try {
      const result = await complete({
        system: "Jesteś asystentem klasyfikacji dokumentów prawniczych w Polsce.",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 200,
        temperature: 0.0,
        modelHint: "haiku",
      });
      const cleaned = result.text.replace(/^```(?:json)?\s*/, "").replace(/\s*```\s*$/, "");
      const parsed = JSON.parse(cleaned) as HaikuClassification;
      if (parsed.kind && typeof parsed.confidence === "number") {
        return {
          kind: parsed.kind,
          confidence: Math.max(heuristicResult.confidence, parsed.confidence),
          notes: parsed.notes,
        };
      }
    } catch (e) {
      logger.warn("letter_ocr.haiku_augment_failed", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
    return heuristicResult;
  });
}

// ----- 5. Top-level orchestrator -----

export async function parseLetterText(
  text: string,
  options: { useAi?: boolean } = {},
): Promise<ParsedLetter> {
  const warnings: string[] = [];
  if (text.length < 50) warnings.push("Tekst zbyt krótki dla wiarygodnej klasyfikacji.");
  if (text.length > 50_000) warnings.push("Tekst bardzo długi — analizujemy próbkę.");

  const sample = text.slice(0, 8000);
  let classification = classifyLetterByHeuristics(sample);

  if (options.useAi && classification.confidence < 0.7) {
    classification = await augmentWithHaiku(sample, classification);
  }

  const fields = extractFieldsHeuristic(sample);
  const suggested = suggestModulesByKind(classification.kind);

  return {
    kind: classification.kind,
    confidence: classification.confidence,
    fields,
    suggested_modules: suggested,
    raw_text_sample: sample.slice(0, 500),
    warnings,
  };
}
