/**
 * Tier 29 — Microcopy library with A/B variants.
 * Centralizuje teksty CTA / pustych stanów / błędów dla łatwego testowania.
 *
 * Wariant wybierany przez `getMicrocopyVariant(userId)` (deterministyczny hash %2).
 */

export interface MicrocopyEntry {
  A: string;
  B?: string;
  notes?: string;
}

export const MICROCOPY: Record<string, MicrocopyEntry> = {
  cta_start_case: {
    A: "Rozpocznij sprawę",
    B: "Zaczynam — w 60 sekund",
    notes: "Hero CTA panelu — wariant B jest bardziej osobisty.",
  },
  empty_cases_title: {
    A: "Brak spraw",
    B: "Twoja pierwsza sprawa czeka",
  },
  empty_cases_desc: {
    A: "Utwórz nową sprawę z kreatora albo zeskanuj pismo.",
    B: "Wybierz kreator dopasowany do Twojej sytuacji albo zrób zdjęcie pisma — AI zrobi resztę.",
  },
  cta_upgrade: {
    A: "Przejdź na plan Pro",
    B: "Odblokuj nielimitowane sprawy",
  },
  error_generic: {
    A: "Coś poszło nie tak. Spróbuj ponownie.",
    B: "Hmm, nie udało się. Odśwież stronę albo skontaktuj się z nami.",
  },
  success_payment: {
    A: "Płatność zaakceptowana",
    B: "Dzięki! Płatność zaksięgowana.",
  },
};

/**
 * Wybierz wariant A/B deterministycznie po userId (lub anonimowym ciasteczku).
 * Pozwala na spójne wyświetlanie tego samego wariantu w całej sesji użytkownika.
 */
export function getMicrocopyVariant(seed: string | null | undefined): "A" | "B" {
  if (!seed) return "A";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}

/**
 * Pobierz tekst z mikrokopii dla danego klucza i wariantu.
 * Fallback do "A" jeśli "B" nie istnieje.
 */
export function getCopy(key: keyof typeof MICROCOPY, variant: "A" | "B" = "A"): string {
  const entry = MICROCOPY[key];
  if (!entry) return key;
  return entry[variant] ?? entry.A;
}
