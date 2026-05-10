/**
 * AI redaction tool — zad. 337
 *
 * Detects PII in document text and redacts it. Used before sharing with lawyer
 * or before uploading to public templates.
 *
 * Detection: regex-first (PESEL, NIP, REGON, IBAN, phone, email, addresses) +
 * optional Haiku augmentation for free-form names/addresses.
 */

import { logger } from "@/lib/observability/logger";
import { sendApipodRequest } from "@/lib/ai/apipod-client";

export type PiiKind =
  | "pesel"
  | "nip"
  | "regon"
  | "iban"
  | "krs"
  | "phone_pl"
  | "email"
  | "address"
  | "name"
  | "id_card"
  | "passport"
  | "credit_card";

export interface PiiMatch {
  kind: PiiKind;
  value: string;
  start: number;
  end: number;
  confidence: "low" | "medium" | "high";
}

const REGEX: Record<Exclude<PiiKind, "name" | "address" | "passport" | "id_card">, RegExp> = {
  pesel: /\b\d{11}\b/g,
  nip: /\b\d{3}-?\d{3}-?\d{2}-?\d{2}\b|\b\d{10}\b/g,
  regon: /\b\d{9}\b|\b\d{14}\b/g,
  iban: /\bPL\s?\d{2}(?:\s?\d{4}){6}\b|\b\d{26}\b/g,
  krs: /\bKRS[:\s]*\d{10}\b|\b0{2}\d{8}\b/gi,
  phone_pl: /(?:\+48[\s-]?)?(?:\d{3}[\s-]?){3}\b|(?:\+48[\s-]?)?\d{9}\b/g,
  email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  credit_card: /\b(?:\d[ -]*?){13,19}\b/g,
};

function isValidPesel(s: string): boolean {
  if (!/^\d{11}$/.test(s)) return false;
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(s[i], 10) * w[i];
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(s[10], 10);
}

function isValidNip(s: string): boolean {
  const digits = s.replace(/[^0-9]/g, "");
  if (digits.length !== 10) return false;
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * w[i];
  return sum % 11 === parseInt(digits[9], 10);
}

export function detectPiiByRegex(text: string): PiiMatch[] {
  const matches: PiiMatch[] = [];
  for (const [kind, rx] of Object.entries(REGEX)) {
    rx.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
      const value = m[0];
      let confidence: "low" | "medium" | "high" = "medium";
      // Validate checksums where applicable
      if (kind === "pesel" && !isValidPesel(value)) continue;
      if (kind === "nip" && !isValidNip(value)) confidence = "low";
      if (kind === "pesel" || kind === "iban") confidence = "high";
      matches.push({
        kind: kind as PiiKind,
        value,
        start: m.index,
        end: m.index + value.length,
        confidence,
      });
    }
  }
  // Sort by position; deduplicate overlaps (keep higher-confidence)
  matches.sort((a, b) => a.start - b.start || (a.confidence === "high" ? -1 : 1));
  const filtered: PiiMatch[] = [];
  for (const m of matches) {
    const prev = filtered[filtered.length - 1];
    if (prev && m.start < prev.end) {
      // overlap — keep the higher-confidence one
      if (
        m.confidence === "high" &&
        prev.confidence !== "high"
      ) {
        filtered.pop();
        filtered.push(m);
      }
      continue;
    }
    filtered.push(m);
  }
  return filtered;
}

export function applyRedactions(text: string, matches: PiiMatch[], style: "block" | "label" | "hash" = "label"): string {
  if (matches.length === 0) return text;
  // Apply right-to-left so indices stay valid
  const sorted = [...matches].sort((a, b) => b.start - a.start);
  let out = text;
  for (const m of sorted) {
    let replacement: string;
    if (style === "block") {
      replacement = "█".repeat(Math.max(4, m.value.length));
    } else if (style === "hash") {
      replacement = `[***${m.kind.toUpperCase()}***]`;
    } else {
      replacement = `[${m.kind.toUpperCase()} REDACTED]`;
    }
    out = out.slice(0, m.start) + replacement + out.slice(m.end);
  }
  return out;
}

export interface RedactOptions {
  style?: "block" | "label" | "hash";
  /** Use Haiku to detect names/addresses too. */
  use_ai?: boolean;
  /** Don't redact these kinds. */
  exclude?: PiiKind[];
  /** Only redact these kinds. */
  include?: PiiKind[];
}

export interface RedactResult {
  redacted_text: string;
  matches: PiiMatch[];
  count_by_kind: Record<string, number>;
}

const AI_PII_PROMPT = `Identyfikuj w tekście dane osobowe (imię + nazwisko, adresy zamieszkania, numery dowodu osobistego, paszportu).

Zwróć JSON: { "matches": [{"kind": "name|address|id_card|passport", "value": "wartość", "context_before": "max 30 znaków przed"}] }

Zwracaj WYŁĄCZNIE realne dane osobowe, nie nazwy firm/sądów/instytucji.
Limit: max 30 znalezisk.`;

export async function redactPii(text: string, opts: RedactOptions = {}): Promise<RedactResult> {
  let matches = detectPiiByRegex(text);

  if (opts.use_ai && text.length < 12000) {
    try {
      const resp = await sendApipodRequest({
        model: "claude-haiku-4-5",
        system: AI_PII_PROMPT,
        messages: [{ role: "user", content: text.slice(0, 12000) }],
        max_tokens: 1500,
        temperature: 0,
      });
      const raw = resp.content?.[0]?.text ?? "{}";
      const cleaned = raw.replace(/```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed?.matches)) {
        for (const m of parsed.matches) {
          if (typeof m?.value !== "string" || m.value.length < 3) continue;
          const idx = text.indexOf(m.value);
          if (idx < 0) continue;
          matches.push({
            kind: m.kind === "address" ? "address" : m.kind === "id_card" ? "id_card" : m.kind === "passport" ? "passport" : "name",
            value: m.value,
            start: idx,
            end: idx + m.value.length,
            confidence: "medium",
          });
        }
      }
    } catch (err) {
      logger.debug("redact.ai_failed", { error: (err as Error).message });
    }
  }

  // Apply filters
  if (opts.include && opts.include.length > 0) {
    const inc = new Set(opts.include);
    matches = matches.filter((m) => inc.has(m.kind));
  }
  if (opts.exclude && opts.exclude.length > 0) {
    const exc = new Set(opts.exclude);
    matches = matches.filter((m) => !exc.has(m.kind));
  }

  const redacted_text = applyRedactions(text, matches, opts.style ?? "label");
  const count_by_kind: Record<string, number> = {};
  for (const m of matches) count_by_kind[m.kind] = (count_by_kind[m.kind] ?? 0) + 1;
  return { redacted_text, matches, count_by_kind };
}
