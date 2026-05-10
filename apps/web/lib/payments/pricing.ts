/**
 * Długomat — cennik per case_type / pakiet (Tier 4).
 *
 * Single source of truth dla cen w UI + Stripe Checkout. Wszystkie kwoty
 * są w **groszach** (1/100 PLN). VAT 23% (standardowa stawka PL).
 *
 * Cena bazowa pochodzi z `caseTypeMeta.priceGrosze`. Tutaj dodajemy:
 *  - VAT breakdown (do faktury Fakturownia),
 *  - pakiety (np. komornik_pakiet — 3 pisma w cenie 2),
 *  - reguły upsellu/rabatów (Tier 4 keep-it-simple — bez kuponów).
 */
import { caseTypeMeta } from "@/lib/cases/case-types";
import type { CaseType } from "@/lib/db/types";
import type { PriceBreakdown, ProductDefinition } from "./types";

const DEFAULT_VAT_RATE = 23;

/**
 * Przelicza kwotę brutto → netto + VAT (zaokrąglenie księgowe PL).
 *
 * Wzór (PL): netto = round(brutto / (1 + vat/100))
 * VAT = brutto - netto.
 */
export function computeBreakdown(
  grossGrosze: number,
  vatRate: number = DEFAULT_VAT_RATE,
): PriceBreakdown {
  const divisor = 1 + vatRate / 100;
  const netGrosze = Math.round(grossGrosze / divisor);
  const vatGrosze = grossGrosze - netGrosze;
  return {
    grossGrosze,
    vatRate,
    vatGrosze,
    netGrosze,
  };
}

/**
 * Zwraca definicję produktu dla danego case_type.
 * Używamy tego przy tworzeniu Stripe Checkout Session.
 */
export function productForCaseType(type: CaseType): ProductDefinition {
  const meta = caseTypeMeta[type];
  if (!meta) {
    throw new Error(`Brak metadanych cennika dla case_type=${type}.`);
  }
  return {
    productType: type,
    productName: meta.title,
    grossGrosze: meta.priceGrosze,
    vatRate: DEFAULT_VAT_RATE,
  };
}

/**
 * Pakiety bundle — Tier 4 dodatek nad bazowy cennik.
 * Każdy pakiet to fiksowana cena za zestaw case_types.
 */
export interface Bundle {
  bundleId: string;
  productName: string;
  caseTypes: CaseType[];
  grossGrosze: number;
  vatRate: number;
}

export const bundles: Record<string, Bundle> = {
  komornik_pakiet: {
    bundleId: "komornik_pakiet",
    productName: "KomornikShield — pakiet 3 pism",
    caseTypes: [
      "komornik_zwolnienie_konta",
      "komornik_zwolnienie_swiadczen",
      "komornik_skarga",
    ],
    grossGrosze: 19_900, // ~33% taniej niż 3× 9.900
    vatRate: DEFAULT_VAT_RATE,
  },
  bik_pakiet: {
    bundleId: "bik_pakiet",
    productName: "BIK-Fix — pełna ścieżka 3-stopniowa",
    caseTypes: [
      "bik_reklamacja_bank",
      "bik_reklamacja_bik",
      "bik_skarga_uodo",
    ],
    grossGrosze: 24_900,
    vatRate: DEFAULT_VAT_RATE,
  },
};

export function getBundle(bundleId: string): Bundle | null {
  return bundles[bundleId] ?? null;
}

/**
 * Czytelny napis ceny — używany w UI (cards, checkout summary).
 */
export function formatPriceGrosze(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(grosze / 100);
}

/** VAT-rate as readable label, np. "23%". */
export function formatVatRate(rate: number): string {
  return `${rate.toFixed(0)}%`;
}
