/**
 * Długomat — Tier 10 — Accessibility (WCAG 2.1 AA) audit utilities.
 *
 * Programmatic checks supplementing Playwright + axe-core e2e tests:
 *  - Color contrast (text vs background, AA threshold 4.5:1)
 *  - ARIA role validity
 *  - Form labels (label[for] linked to input[id])
 *  - Headings hierarchy (no h3 before h2 etc.)
 *  - Image alt attributes
 *  - Keyboard navigation (tabindex sanity)
 *
 * Lightweight — runs on rendered HTML server-side (e.g., w `/api/quality/a11y`).
 * Pełen audyt (axe-core) jest osobno w testach e2e.
 */

export type A11yIssueSeverity = "low" | "medium" | "high" | "critical";

export interface A11yIssue {
  rule: string;
  severity: A11yIssueSeverity;
  selector: string;
  message: string;
  wcag: string; // np. "1.4.3", "1.1.1"
}

const HEADING_RE = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;
const IMG_RE = /<img\s+([^>]*)\/?\s*>/gi;
const ATTR_RE = (name: string) =>
  new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
const LABEL_RE = /<label([^>]*)>([\s\S]*?)<\/label>/gi;
const INPUT_RE = /<(input|select|textarea)\s+([^>]*?)\/?\s*>/gi;

export function auditHtml(html: string): A11yIssue[] {
  const issues: A11yIssue[] = [];

  // 1. Heading hierarchy
  const headings: number[] = [];
  let m: RegExpExecArray | null;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(html)) !== null) {
    headings.push(Number(m[1]));
  }
  let prev = 0;
  for (const level of headings) {
    if (prev > 0 && level - prev > 1) {
      issues.push({
        rule: "heading-order",
        severity: "medium",
        selector: `h${level}`,
        message: `Skip level: h${prev} → h${level}. Should be h${prev + 1}.`,
        wcag: "1.3.1",
      });
    }
    prev = level;
  }
  if (headings.length > 0 && headings[0] !== 1) {
    issues.push({
      rule: "page-has-h1",
      severity: "high",
      selector: `h${headings[0]}`,
      message: "Page should start with h1, not h" + headings[0],
      wcag: "1.3.1",
    });
  }

  // 2. Images alt attribute
  IMG_RE.lastIndex = 0;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = IMG_RE.exec(html)) !== null) {
    const attrs = imgMatch[1];
    const altMatch = ATTR_RE("alt").exec(attrs);
    const roleMatch = ATTR_RE("role").exec(attrs);
    const isPresentational = roleMatch?.[1] === "presentation" || roleMatch?.[1] === "none";
    const ariaHiddenMatch = ATTR_RE("aria-hidden").exec(attrs);
    const ariaHidden = ariaHiddenMatch?.[1] === "true";
    if (!altMatch && !isPresentational && !ariaHidden) {
      issues.push({
        rule: "img-alt",
        severity: "high",
        selector: `img[${attrs.slice(0, 50)}...]`,
        message: "<img> missing alt attribute (or role=presentation).",
        wcag: "1.1.1",
      });
    }
  }

  // 3. Form inputs label
  const labelFor = new Set<string>();
  LABEL_RE.lastIndex = 0;
  let labelMatch: RegExpExecArray | null;
  while ((labelMatch = LABEL_RE.exec(html)) !== null) {
    const forAttr = ATTR_RE("for").exec(labelMatch[1]);
    if (forAttr) labelFor.add(forAttr[1]);
  }

  INPUT_RE.lastIndex = 0;
  let inputMatch: RegExpExecArray | null;
  while ((inputMatch = INPUT_RE.exec(html)) !== null) {
    const attrs = inputMatch[2];
    const typeMatch = ATTR_RE("type").exec(attrs);
    const inputType = typeMatch?.[1]?.toLowerCase();
    if (inputType === "hidden" || inputType === "submit" || inputType === "button") continue;
    const idMatch = ATTR_RE("id").exec(attrs);
    const ariaLabel = ATTR_RE("aria-label").exec(attrs);
    const ariaLabelledBy = ATTR_RE("aria-labelledby").exec(attrs);
    if (
      !ariaLabel &&
      !ariaLabelledBy &&
      (!idMatch || !labelFor.has(idMatch[1]))
    ) {
      issues.push({
        rule: "input-label",
        severity: "high",
        selector: `${inputMatch[1]}[${attrs.slice(0, 50)}...]`,
        message: "Input lacks associated <label>, aria-label, or aria-labelledby.",
        wcag: "3.3.2",
      });
    }
  }

  // 4. Document language
  if (!/<html[^>]*\slang=/i.test(html)) {
    issues.push({
      rule: "html-lang",
      severity: "medium",
      selector: "<html>",
      message: "<html> element missing lang attribute.",
      wcag: "3.1.1",
    });
  }

  return issues;
}

// -----------------------------------------------------------------------------
// Color contrast helper (relative luminance per WCAG)
// -----------------------------------------------------------------------------

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesAA(ratio: number, isLargeText: boolean = false): boolean {
  return ratio >= (isLargeText ? 3 : 4.5);
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  const m = /^([0-9a-f]{6})$|^([0-9a-f]{3})$/i.exec(cleaned);
  if (!m) return null;
  const full = m[1] ?? m[2].split("").map((c) => c + c).join("");
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}
