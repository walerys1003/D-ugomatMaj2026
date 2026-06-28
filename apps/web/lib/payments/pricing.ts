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

// -----------------------------------------------------------------------------
// Tier 4 zad. 157 — VAT B2B logic (NIP-based)
// -----------------------------------------------------------------------------

/**
 * Walidator polskiego NIP-u (10 cyfr + checksum mod 11).
 *
 * Spec: https://pl.wikipedia.org/wiki/NIP
 * Wagi: [6, 5, 7, 2, 3, 4, 5, 6, 7]
 * Checksum: sum(d[i] * w[i]) mod 11 == d[9]
 */
const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const;

export function isValidNip(input: string): boolean {
  const digits = input.replace(/[^0-9]/g, "");
  if (digits.length !== 10) return false;
  // Edge case: same zera technicznie spełniają mod-11 (0 == 0), ale to nie jest
  // realny NIP — odrzucamy explicite. Analogicznie dla pozostałych "powtórek",
  // ale tylko all-zeros wpada w algorytm jako "valid" — pozostałe powtórki
  // (np. "1111111111") naturalnie nie przejdą sumy kontrolnej.
  if (/^0+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * NIP_WEIGHTS[i];
  }
  const checksum = sum % 11;
  if (checksum === 10) return false; // Niepoprawny — taki NIP nie istnieje
  return checksum === Number(digits[9]);
}

/**
 * Normalizuje NIP do formatu "PL1234567890" (do Stripe + Fakturownia).
 * Zwraca null jeżeli NIP niepoprawny.
 */
export function normalizeNip(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, "");
  if (!isValidNip(digits)) return null;
  return `PL${digits}`;
}

/**
 * Decyduje o stawce VAT na podstawie typu klienta + lokalizacji.
 *
 * Reguły:
 *   - B2C: zawsze 23% (klient krajowy, OSS dla UE jest poza zakresem MVP).
 *   - B2B krajowy (NIP poprawny, customerType=b2b): 23% (faktura z VAT).
 *   - B2B UE z VAT-ID (np. "DE..."): 0% (mechanizm reverse charge), ale
 *     w MVP zostawiamy 23% — wdrożenie reverse charge wymaga walidacji
 *     VIES + dedykowanej linii w fakturze Fakturownia (Tier 6 backlog).
 *
 * @returns stawka VAT % do użycia w fakturze + Stripe metadata.
 */
export interface VatDecisionInput {
  customerType: "b2c" | "b2b";
  nip?: string | null;
  /** ISO 3166-1 alpha-2 — domyślnie PL. */
  countryCode?: string;
}

export interface VatDecision {
  vatRate: number;
  reverseCharge: boolean;
  reason: string;
  /** Znormalizowany NIP (z prefiksem kraju) jeśli B2B. */
  taxId: string | null;
}

export function decideVat(input: VatDecisionInput): VatDecision {
  const country = (input.countryCode ?? "PL").toUpperCase();

  if (input.customerType === "b2c") {
    return {
      vatRate: DEFAULT_VAT_RATE,
      reverseCharge: false,
      reason: "B2C — pełna stawka krajowa 23%.",
      taxId: null,
    };
  }

  // B2B krajowy
  if (country === "PL") {
    if (!input.nip || !isValidNip(input.nip)) {
      // Niepoprawny NIP → traktujemy jak B2C (bezpieczeństwo księgowe).
      return {
        vatRate: DEFAULT_VAT_RATE,
        reverseCharge: false,
        reason: "B2B PL bez ważnego NIP — fallback na stawkę B2C 23%.",
        taxId: null,
      };
    }
    return {
      vatRate: DEFAULT_VAT_RATE,
      reverseCharge: false,
      reason: "B2B PL z ważnym NIP — faktura z VAT 23%.",
      taxId: normalizeNip(input.nip),
    };
  }

  // B2B UE — Tier 6 wdroży VIES + reverse charge.
  // Na razie wystawiamy fakturę z VAT 23%, ale flagujemy reverseCharge=false
  // i wpisujemy reason, by księgowość mogła zrobić korektę ręczną.
  return {
    vatRate: DEFAULT_VAT_RATE,
    reverseCharge: false,
    reason: `B2B ${country} — VIES validation outside MVP scope; wystawiamy z VAT 23%.`,
    taxId: input.nip ?? null,
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
