/**
 * Tier 11 — Content safety filter for inputs and outputs.
 * Detects PII (PESEL, NIP, account numbers, addresses) and disallowed content.
 */
export interface SafetyFinding {
  kind: "pesel" | "nip" | "account_iban" | "phone" | "email" | "address_hint";
  match: string;
  start: number;
  end: number;
}

const PESEL_RE = /\b\d{11}\b/g;
const NIP_RE = /\b\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b/g;
const IBAN_RE = /\bPL\d{2}\s?(?:\d{4}\s?){5}\d{4}\b/g;
const PHONE_RE = /(?:\+?48[\s-]?)?(?:\d{3}[\s-]?){2}\d{3}\b/g;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

export function scanForPii(text: string): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  const collect = (re: RegExp, kind: SafetyFinding["kind"]) => {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      findings.push({ kind, match: m[0], start: m.index, end: m.index + m[0].length });
    }
  };
  collect(PESEL_RE, "pesel");
  collect(NIP_RE, "nip");
  collect(IBAN_RE, "account_iban");
  collect(PHONE_RE, "phone");
  collect(EMAIL_RE, "email");
  return findings;
}

export function redactPii(text: string): { text: string; findings: SafetyFinding[] } {
  const findings = scanForPii(text);
  // Sort desc by start to splice without offset issues
  const sorted = [...findings].sort((a, b) => b.start - a.start);
  let out = text;
  for (const f of sorted) {
    const placeholder = `[${f.kind.toUpperCase()}_REDACTED]`;
    out = out.slice(0, f.start) + placeholder + out.slice(f.end);
  }
  return { text: out, findings };
}

const DISALLOWED_RE = /\b(?:bomba|wybuchowa|terror|samobój)/gi;

export function isDisallowed(text: string): boolean {
  return DISALLOWED_RE.test(text);
}
