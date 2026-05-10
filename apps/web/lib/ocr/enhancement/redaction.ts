/**
 * Tier 18 — OCR enhancement: PII redaction.
 *
 * Maskuje wrażliwe dane (PESEL, NIP, REGON, IBAN, dowód osobisty, telefon, email)
 * w surowym tekście OCR oraz zwraca listę offsetów do nadrukowania czarnych
 * prostokątów na wyrenderowanej stronie PDF/PNG.
 *
 * Polityka redakcji:
 *  - PESEL: pełna maska "***********" (11 znaków).
 *  - NIP/REGON: zachowujemy pierwsze 3 cyfry, reszta "*".
 *  - IBAN: zachowujemy PL + ostatnie 4 cyfry.
 *  - Dowód osobisty: pełna maska 9 znaków.
 *  - Telefon: zachowujemy prefix +48 + ostatnie 3 cyfry.
 *  - Email: zachowujemy pierwszą literę i domenę.
 */

export type PiiKind =
  | "pesel"
  | "nip"
  | "regon"
  | "iban"
  | "id_card"
  | "phone"
  | "email";

export interface PiiMatch {
  kind: PiiKind;
  raw: string;
  masked: string;
  start: number;
  end: number;
}

export interface RedactionResult {
  redactedText: string;
  matches: PiiMatch[];
}

const PATTERNS: Array<{ kind: PiiKind; re: RegExp; mask: (v: string) => string }> = [
  {
    kind: "pesel",
    re: /\b\d{11}\b/g,
    mask: () => "***********",
  },
  {
    kind: "nip",
    re: /\b\d{3}[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}\b/g,
    mask: (v) => v.slice(0, 3) + "*".repeat(v.length - 3),
  },
  {
    kind: "regon",
    re: /\b\d{9}(?:\d{5})?\b/g,
    mask: (v) => v.slice(0, 3) + "*".repeat(v.length - 3),
  },
  {
    kind: "iban",
    re: /\bPL\s?\d{2}(?:\s?\d{4}){5,6}\b/gi,
    mask: (v) => {
      const compact = v.replace(/\s+/g, "");
      const last4 = compact.slice(-4);
      return `${compact.slice(0, 2)}${"*".repeat(compact.length - 6)}${last4}`;
    },
  },
  {
    kind: "id_card",
    re: /\b[A-Z]{3}\d{6}\b/g,
    mask: () => "*********",
  },
  {
    kind: "phone",
    re: /\b(?:\+48[\s-]?)?(?:\d{3}[\s-]?){3}\b/g,
    mask: (v) => {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 6) return "*".repeat(digits.length);
      const tail = digits.slice(-3);
      return `+48-***-***-${tail}`;
    },
  },
  {
    kind: "email",
    re: /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
    mask: (v) => {
      const at = v.indexOf("@");
      if (at <= 0) return v;
      return `${v[0]}***@${v.slice(at + 1)}`;
    },
  },
];

/**
 * Wyszukuje i maskuje PII w surowym tekście.
 * Zwraca redactedText + listę dopasowań (offsety w oryginalnym tekście).
 */
export function redactPii(text: string): RedactionResult {
  const matches: PiiMatch[] = [];
  for (const { kind, re, mask } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        kind,
        raw: m[0],
        masked: mask(m[0]),
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  // Sort by start asc, dedupe overlapping ranges (longest wins).
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const deduped: PiiMatch[] = [];
  let lastEnd = -1;
  for (const mm of matches) {
    if (mm.start < lastEnd) continue;
    deduped.push(mm);
    lastEnd = mm.end;
  }

  // Build redacted string with masks applied right-to-left to keep offsets sane.
  let out = text;
  for (let i = deduped.length - 1; i >= 0; i--) {
    const mm = deduped[i];
    out = out.slice(0, mm.start) + mm.masked + out.slice(mm.end);
  }

  return { redactedText: out, matches: deduped };
}

/**
 * Walidacja PESEL — checksum (suma kontrolna).
 */
export function isValidPesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += weights[i] * Number(pesel[i]);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(pesel[10]);
}

/**
 * Walidacja NIP — checksum.
 */
export function isValidNip(nip: string): boolean {
  const compact = nip.replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(compact)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += weights[i] * Number(compact[i]);
  const check = sum % 11;
  return check === Number(compact[9]);
}
