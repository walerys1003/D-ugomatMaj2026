/**
 * Tier 19 — Skeleton loading patterns.
 *
 * Centralizujemy konfiguracje skeleton screens (placeholderów ładowania)
 * dla najczęstszych widoków: lista spraw, dashboard, wizard form, OCR upload,
 * timeline, settings panel. Zwracają deskryptory bloków (rect/circle/line),
 * które komponent renderuje (Tailwind animate-pulse + neutralny kolor).
 *
 * Cechy:
 *  - shimmer/pulse mode toggle
 *  - respektowanie prefers-reduced-motion (statyczne wypełnienie zamiast animacji)
 *  - aria-busy + aria-label automatycznie
 */

export type SkeletonBlockKind = "rect" | "circle" | "line";

export interface SkeletonBlock {
  kind: SkeletonBlockKind;
  width: string;   // CSS width — "100%", "12rem", "32px"
  height: string;  // CSS height
  radius?: string; // border-radius override
  gap?: string;    // margin-bottom
}

export interface SkeletonPattern {
  id: string;
  ariaLabel: string;
  blocks: SkeletonBlock[];
  repeat?: number;
}

export const SKELETON_PATTERNS: Record<string, SkeletonPattern> = {
  case_list_row: {
    id: "case_list_row",
    ariaLabel: "Ładowanie listy spraw",
    blocks: [
      { kind: "circle", width: "2.5rem", height: "2.5rem" },
      { kind: "line", width: "60%", height: "0.85rem", gap: "0.4rem" },
      { kind: "line", width: "40%", height: "0.75rem" },
    ],
    repeat: 6,
  },
  dashboard_kpi: {
    id: "dashboard_kpi",
    ariaLabel: "Ładowanie wskaźników",
    blocks: [
      { kind: "line", width: "30%", height: "0.7rem", gap: "0.5rem" },
      { kind: "rect", width: "55%", height: "1.5rem", gap: "0.3rem" },
      { kind: "line", width: "20%", height: "0.6rem" },
    ],
    repeat: 4,
  },
  wizard_form: {
    id: "wizard_form",
    ariaLabel: "Ładowanie kreatora",
    blocks: [
      { kind: "line", width: "40%", height: "1rem", gap: "0.75rem" },
      { kind: "rect", width: "100%", height: "3rem", radius: "0.5rem", gap: "1rem" },
      { kind: "rect", width: "100%", height: "3rem", radius: "0.5rem", gap: "1rem" },
      { kind: "rect", width: "100%", height: "6rem", radius: "0.5rem" },
    ],
  },
  ocr_upload: {
    id: "ocr_upload",
    ariaLabel: "Ładowanie dokumentu",
    blocks: [
      { kind: "rect", width: "100%", height: "12rem", radius: "0.75rem", gap: "1rem" },
      { kind: "line", width: "70%", height: "0.85rem", gap: "0.3rem" },
      { kind: "line", width: "50%", height: "0.75rem" },
    ],
  },
  timeline_event: {
    id: "timeline_event",
    ariaLabel: "Ładowanie historii sprawy",
    blocks: [
      { kind: "circle", width: "1.5rem", height: "1.5rem" },
      { kind: "line", width: "65%", height: "0.8rem", gap: "0.3rem" },
      { kind: "line", width: "35%", height: "0.7rem" },
    ],
    repeat: 5,
  },
  settings_section: {
    id: "settings_section",
    ariaLabel: "Ładowanie ustawień",
    blocks: [
      { kind: "line", width: "35%", height: "1rem", gap: "0.75rem" },
      { kind: "rect", width: "100%", height: "2.5rem", radius: "0.5rem", gap: "0.5rem" },
      { kind: "rect", width: "100%", height: "2.5rem", radius: "0.5rem" },
    ],
  },
};

export function getSkeleton(id: keyof typeof SKELETON_PATTERNS): SkeletonPattern {
  return SKELETON_PATTERNS[id];
}

/**
 * Klient: czy user preferuje zredukowany ruch?
 */
export function prefersReducedMotionSafe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
