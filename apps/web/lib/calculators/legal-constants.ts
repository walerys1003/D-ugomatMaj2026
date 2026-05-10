/**
 * Stałe prawne — kwoty roczne wpływające na obliczenia kwot wolnych
 * od potrąceń i egzekucji. Wartości w groszach (Number bezpieczny do
 * 2^53 — wystarczający dla kwot rocznych w PLN).
 *
 * Źródła:
 *   - Rozporządzenie Rady Ministrów ws. wysokości minimalnego wynagrodzenia
 *     za pracę (publikowane co roku w Dz.U.).
 *   - Ustawa z dnia 17 grudnia 1998 r. o emeryturach i rentach z FUS
 *     (art. 141 — kwoty wolne od potrąceń ze świadczeń ZUS, waloryzacja).
 *   - Komunikat Prezesa ZUS o najniższej emeryturze (waloryzacja marcowa).
 *   - Art. 54 ustawy z dnia 29 sierpnia 1997 r. — Prawo bankowe
 *     (UFG = limit kwoty wolnej dla rachunków bankowych = 75% min. wynagr.).
 *
 * UWAGA: stawki muszą być aktualizowane corocznie (najpóźniej 1 stycznia,
 * ZUS — 1 marca dla waloryzacji emerytur). Każda pozycja ma okres
 * obowiązywania (validFrom / validTo).
 *
 * Wartości w groszach (1 PLN = 100 gr).
 */

export type LegalYear = 2024 | 2025 | 2026;

export interface MinWageEntry {
  /** Pierwszy dzień obowiązywania (YYYY-MM-DD). */
  validFrom: string;
  /** Ostatni dzień obowiązywania (YYYY-MM-DD), null jeśli nadal obowiązuje. */
  validTo: string | null;
  /** Minimalne wynagrodzenie BRUTTO miesięcznie (w groszach). */
  bruttoGrosze: number;
  /**
   * Minimalne wynagrodzenie NETTO miesięcznie (w groszach) — przy
   * standardowym opodatkowaniu (PIT 12%, ulga, podst. ZUS, bez PPK).
   * To jest kwota wolna od potrąceń niealimentacyjnych z art. 87¹ § 1 KP.
   */
  nettoGrosze: number;
  /**
   * Podstawa prawna (Dziennik Ustaw lub Monitor Polski).
   */
  source: string;
}

/**
 * Minimalne wynagrodzenie za pracę — historyczne i bieżące.
 * 2024-01: bruto 4242 zł, 2024-07: 4300 zł (półroczna podwyżka),
 * 2025-01: 4666 zł, 2026-01: 4806 zł (zapowiedziane przez RM,
 * faktyczna kwota zostanie potwierdzona przed startem produkcyjnym).
 *
 * Kwoty netto pochodzą z oficjalnych kalkulatorów PIT/ZUS GOV i są
 * wartościami przybliżonymi — w generowanych pismach zawsze podajemy je
 * jako "około" i odsyłamy użytkownika do bieżącego paska wynagrodzenia.
 */
export const MIN_WAGE_HISTORY: readonly MinWageEntry[] = [
  {
    validFrom: "2024-01-01",
    validTo: "2024-06-30",
    bruttoGrosze: 4_242_00,
    nettoGrosze: 3_221_98,
    source: "Dz.U. 2023 poz. 1893",
  },
  {
    validFrom: "2024-07-01",
    validTo: "2024-12-31",
    bruttoGrosze: 4_300_00,
    nettoGrosze: 3_261_53,
    source: "Dz.U. 2023 poz. 1893",
  },
  {
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    bruttoGrosze: 4_666_00,
    nettoGrosze: 3_510_92,
    source: "Dz.U. 2024 poz. 1362",
  },
  {
    validFrom: "2026-01-01",
    validTo: null,
    bruttoGrosze: 4_806_00,
    nettoGrosze: 3_606_36,
    source: "Projekt rozporządzenia RM (do potwierdzenia)",
  },
] as const;

/**
 * Najniższa emerytura — kwota waloryzowana 1 marca każdego roku.
 * Stanowi punkt odniesienia dla kwot wolnych od potrąceń ze świadczeń
 * ZUS (art. 141 ustawy emerytalnej).
 */
export interface MinPensionEntry {
  validFrom: string;
  validTo: string | null;
  /** Najniższa emerytura BRUTTO miesięcznie (w groszach). */
  bruttoGrosze: number;
  source: string;
}

export const MIN_PENSION_HISTORY: readonly MinPensionEntry[] = [
  {
    validFrom: "2024-03-01",
    validTo: "2025-02-28",
    bruttoGrosze: 1_780_96,
    source: "Komunikat Prezesa ZUS (Dz.U. 2024)",
  },
  {
    validFrom: "2025-03-01",
    validTo: "2026-02-28",
    bruttoGrosze: 1_878_91,
    source: "Komunikat Prezesa ZUS (Dz.U. 2025)",
  },
  {
    validFrom: "2026-03-01",
    validTo: null,
    bruttoGrosze: 1_972_85,
    source: "Komunikat Prezesa ZUS (do potwierdzenia w 2026)",
  },
] as const;

/**
 * Pobiera obowiązującą stawkę dla danej daty (domyślnie: dziś).
 * Jeśli żadna pozycja nie pasuje (np. data spoza zakresu) — zwraca
 * najnowszą dostępną i loguje ostrzeżenie.
 */
export function resolveMinWage(at: Date = new Date()): MinWageEntry {
  const iso = at.toISOString().slice(0, 10);
  const match = MIN_WAGE_HISTORY.find(
    (e) => e.validFrom <= iso && (e.validTo === null || iso <= e.validTo),
  );
  if (match) return match;
  // Fallback — najnowsza pozycja.
  const last = MIN_WAGE_HISTORY[MIN_WAGE_HISTORY.length - 1]!;
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[legal-constants] no min-wage entry for ${iso} — using ${last.validFrom}`,
    );
  }
  return last;
}

export function resolveMinPension(at: Date = new Date()): MinPensionEntry {
  const iso = at.toISOString().slice(0, 10);
  const match = MIN_PENSION_HISTORY.find(
    (e) => e.validFrom <= iso && (e.validTo === null || iso <= e.validTo),
  );
  if (match) return match;
  const last = MIN_PENSION_HISTORY[MIN_PENSION_HISTORY.length - 1]!;
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[legal-constants] no min-pension entry for ${iso} — using ${last.validFrom}`,
    );
  }
  return last;
}

/**
 * 75% minimalnego wynagrodzenia BRUTTO — limit kwoty wolnej od zajęcia
 * dla rachunków bankowych (art. 54 ust. 1 Prawa bankowego).
 * Limit jest miesięczny, kumuluje się do wysokości 75% min. wynagrodzenia
 * za każdy miesiąc (a nie 75% bieżącego salda).
 */
export function ufgBankAccountLimitGrosze(at: Date = new Date()): number {
  const wage = resolveMinWage(at);
  return Math.floor(wage.bruttoGrosze * 0.75);
}
