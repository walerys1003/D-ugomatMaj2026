/**
 * Długomat — Tier 8 — OSS (One Stop Shop) VAT for EU customers.
 *
 * EU VAT B2C dla cyfrowych usług (telecommunication, broadcasting,
 * electronically supplied services — TBE):
 *  - Cross-border B2C w UE → VAT kraju kupującego (np. DE 19%, FR 20%)
 *  - Próg roczny 10_000 EUR — poniżej można zostać przy VAT PL
 *  - Powyżej progu — rejestracja w OSS, deklaracje kwartalne
 *
 * B2B z VIES-ważnym VAT-ID → reverse charge (VAT 0%, adnotacja na fakturze)
 *
 * Tabele VAT per kraj (Q4 2025/2026 standardowe stawki):
 */

export const EU_VAT_RATES: Record<string, number> = {
  AT: 20, BE: 21, BG: 20, HR: 25, CY: 19, CZ: 21, DK: 25, EE: 22,
  FI: 25.5, FR: 20, DE: 19, GR: 24, HU: 27, IE: 23, IT: 22, LV: 21,
  LT: 21, LU: 17, MT: 18, NL: 21, PL: 23, PT: 23, RO: 21, SK: 23,
  SI: 22, ES: 21, SE: 25,
};

export interface VatDecisionV2 {
  vatRate: number;
  vatCountry: string;
  reverseCharge: boolean;
  ossEligible: boolean;
  reason: string;
  taxId: string | null;
}

export interface VatDecisionInput {
  customerType: "b2c" | "b2b";
  countryCode: string; // ISO alpha-2
  vatId?: string | null; // VIES VAT-ID for B2B
  /** Czy mamy potwierdzenie ważności VIES (cache lub real-time). */
  viesValid?: boolean;
}

export function decideVatV2(input: VatDecisionInput): VatDecisionV2 {
  const country = input.countryCode.toUpperCase();
  const isEu = country in EU_VAT_RATES;

  // B2C
  if (input.customerType === "b2c") {
    if (country === "PL") {
      return {
        vatRate: 23,
        vatCountry: "PL",
        reverseCharge: false,
        ossEligible: false,
        reason: "B2C krajowy — VAT PL 23%.",
        taxId: null,
      };
    }
    if (isEu) {
      return {
        vatRate: EU_VAT_RATES[country],
        vatCountry: country,
        reverseCharge: false,
        ossEligible: true,
        reason: `B2C ${country} — OSS, VAT lokalny ${EU_VAT_RATES[country]}%.`,
        taxId: null,
      };
    }
    // Outside EU — exempt (export of services)
    return {
      vatRate: 0,
      vatCountry: country,
      reverseCharge: false,
      ossEligible: false,
      reason: `B2C ${country} (poza UE) — eksport usług, VAT 0%.`,
      taxId: null,
    };
  }

  // B2B
  if (country === "PL") {
    return {
      vatRate: 23,
      vatCountry: "PL",
      reverseCharge: false,
      ossEligible: false,
      reason: "B2B PL — VAT 23%.",
      taxId: input.vatId ?? null,
    };
  }
  if (isEu) {
    if (input.viesValid && input.vatId) {
      return {
        vatRate: 0,
        vatCountry: country,
        reverseCharge: true,
        ossEligible: false,
        reason: `B2B ${country} z ważnym VAT-ID — reverse charge, VAT 0%.`,
        taxId: input.vatId,
      };
    }
    // VIES nie zwalidowany → traktujemy jak B2C → OSS lokalny VAT
    return {
      vatRate: EU_VAT_RATES[country],
      vatCountry: country,
      reverseCharge: false,
      ossEligible: true,
      reason: `B2B ${country} bez ważnego VIES VAT-ID — fallback OSS, VAT lokalny ${EU_VAT_RATES[country]}%.`,
      taxId: input.vatId ?? null,
    };
  }
  // B2B poza UE → eksport
  return {
    vatRate: 0,
    vatCountry: country,
    reverseCharge: false,
    ossEligible: false,
    reason: `B2B ${country} (poza UE) — eksport usług, VAT 0%.`,
    taxId: input.vatId ?? null,
  };
}

/**
 * Walidacja VAT-ID przez VIES (online). Cache 30 dni w `vies_validations`.
 * Lazy fetch — można pominąć jeśli wcześniej zwalidowano.
 */
export async function validateViesVatId(
  countryCode: string,
  vatNumber: string,
): Promise<{ valid: boolean; name?: string; address?: string; cached: boolean }> {
  // Real call: SOAP do https://ec.europa.eu/taxation_customs/vies/services/checkVatService
  // Tutaj scaffold — w produkcji zaimplementować przez `vies-checker` lub własny SOAP
  if (!process.env.VIES_ENABLED) {
    return { valid: false, cached: false };
  }
  try {
    const res = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return { valid: false, cached: false };
    const json = (await res.json()) as { isValid?: boolean; name?: string; address?: string };
    return {
      valid: !!json.isValid,
      name: json.name,
      address: json.address,
      cached: false,
    };
  } catch {
    return { valid: false, cached: false };
  }
}
