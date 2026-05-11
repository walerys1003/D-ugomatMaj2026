/**
 * Tier 32 — Stripe Tax automatic EU invoicing.
 *
 * Polska to obowiązkowa stawka 23% VAT na usługi cyfrowe.
 * Reverse charge dla B2B w UE poza PL.
 * 0% dla klientów poza UE.
 *
 * Integracja Stripe Tax:
 *   1. Włączone w Stripe Dashboard → Tax
 *   2. Tax Codes zarejestrowane per Product (digital services: txcd_10000000)
 *   3. Tax Behavior: 'exclusive' (cena netto)
 *   4. Customer Tax ID: VAT EU (PL/DE/FR...) → reverse charge auto
 */
import "server-only";

/** Stawki VAT per kraj UE (stan na 2026-05). */
export const EU_VAT_RATES: Record<string, number> = {
  PL: 0.23, // Polska
  DE: 0.19, // Niemcy
  FR: 0.2,
  IT: 0.22,
  ES: 0.21,
  NL: 0.21,
  BE: 0.21,
  AT: 0.2,
  PT: 0.23,
  IE: 0.23,
  DK: 0.25,
  SE: 0.25,
  FI: 0.24,
  GR: 0.24,
  CZ: 0.21,
  SK: 0.23,
  HU: 0.27,
  RO: 0.19,
  BG: 0.2,
  HR: 0.25,
  SI: 0.22,
  LV: 0.21,
  LT: 0.21,
  EE: 0.22,
  CY: 0.19,
  MT: 0.18,
  LU: 0.17,
};

export interface TaxCalculationInput {
  net_amount_grosze: number;
  customer_country: string; // ISO-2
  customer_vat_id?: string | null; // np. "PL1234567890" lub "DE..."
  is_business: boolean;
}

export interface TaxCalculationResult {
  net_amount_grosze: number;
  vat_rate: number;
  vat_amount_grosze: number;
  gross_amount_grosze: number;
  treatment:
    | "domestic_pl" // PL → PL, naliczamy 23%
    | "reverse_charge_eu_b2b" // PL → UE B2B z VAT-ID, reverse charge
    | "destination_eu_b2c" // PL → UE B2C bez VAT-ID, stawka kraju klienta (OSS)
    | "export_outside_eu"; // PL → poza UE, 0%
  legal_note: string;
}

const EU_COUNTRIES = new Set(Object.keys(EU_VAT_RATES));

export function calculateEuTax(input: TaxCalculationInput): TaxCalculationResult {
  const country = input.customer_country.toUpperCase();
  const net = input.net_amount_grosze;

  // 1) Poza UE → 0%
  if (!EU_COUNTRIES.has(country)) {
    return {
      net_amount_grosze: net,
      vat_rate: 0,
      vat_amount_grosze: 0,
      gross_amount_grosze: net,
      treatment: "export_outside_eu",
      legal_note: "Eksport usług elektronicznych poza UE — niepodlegające VAT w PL (art. 28k ust. 1 ustawy o VAT).",
    };
  }

  // 2) Klient PL → zawsze 23%
  if (country === "PL") {
    const rate = EU_VAT_RATES.PL;
    const vat = Math.round(net * rate);
    return {
      net_amount_grosze: net,
      vat_rate: rate,
      vat_amount_grosze: vat,
      gross_amount_grosze: net + vat,
      treatment: "domestic_pl",
      legal_note: "Sprzedaż krajowa — 23% VAT (art. 41 ust. 1 ustawy o VAT).",
    };
  }

  // 3) UE B2B z VAT-ID → reverse charge (0% u nas, klient rozlicza u siebie)
  const hasValidVatId =
    input.is_business && input.customer_vat_id && input.customer_vat_id.startsWith(country);
  if (hasValidVatId) {
    return {
      net_amount_grosze: net,
      vat_rate: 0,
      vat_amount_grosze: 0,
      gross_amount_grosze: net,
      treatment: "reverse_charge_eu_b2b",
      legal_note: `Odwrotne obciążenie (reverse charge) — nabywca rozlicza VAT w ${country} (art. 28b ustawy o VAT). VAT-ID: ${input.customer_vat_id}.`,
    };
  }

  // 4) UE B2C → stawka kraju klienta (one-stop-shop OSS)
  const rate = EU_VAT_RATES[country];
  const vat = Math.round(net * rate);
  return {
    net_amount_grosze: net,
    vat_rate: rate,
    vat_amount_grosze: vat,
    gross_amount_grosze: net + vat,
    treatment: "destination_eu_b2c",
    legal_note: `Usługa elektroniczna B2C — stawka VAT kraju nabywcy (${country}: ${(rate * 100).toFixed(0)}%). Rozliczenie OSS (One-Stop-Shop).`,
  };
}

/**
 * Walidacja VAT-ID przez VIES (Komisja Europejska).
 * Stub — w produkcji wywołuj VIES SOAP lub REST proxy.
 */
export async function validateEuVatId(vatId: string): Promise<{
  valid: boolean;
  name?: string;
  address?: string;
  country: string;
}> {
  const country = vatId.slice(0, 2).toUpperCase();
  if (!EU_COUNTRIES.has(country)) return { valid: false, country };

  // TODO: wywołaj https://ec.europa.eu/taxation_customs/vies/services/checkVatService
  // Na razie stub: każdy VAT-ID o formacie [PL][digits/letters] jest "valid"
  const numericPart = vatId.slice(2).replace(/\s/g, "");
  if (numericPart.length < 8) return { valid: false, country };

  return {
    valid: true,
    name: undefined,
    address: undefined,
    country,
  };
}

/**
 * Mapuje wynik tax calculation na pole `tax_behavior` w Stripe Invoice Item.
 */
export function mapToStripeTaxBehavior(treatment: TaxCalculationResult["treatment"]): {
  tax_behavior: "exclusive" | "inclusive";
  tax_rate_id?: string;
} {
  // Stripe Tax automatycznie kalkuluje VAT — używamy 'exclusive' (cena bez VAT)
  return { tax_behavior: "exclusive" };
}
