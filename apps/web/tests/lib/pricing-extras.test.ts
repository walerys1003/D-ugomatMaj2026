/**
 * Uzupełnienie testów pricing.ts — funkcje, których nie pokrywa stripe-webhook.test.ts:
 *   - bundles (komornik_pakiet, bik_pakiet)
 *   - getBundle
 *   - productForCaseType
 *   - formatPriceGrosze (Intl.NumberFormat dla pl-PL)
 *   - formatVatRate
 */
import { describe, it, expect } from "vitest";
import {
  bundles,
  getBundle,
  productForCaseType,
  formatPriceGrosze,
  formatVatRate,
} from "@/lib/payments/pricing";

// =============================================================================
// bundles + getBundle
// =============================================================================
describe("bundles — fiksowane pakiety case_types", () => {
  it("zawiera komornik_pakiet z 3 pismami i ceną 199 PLN", () => {
    const b = bundles.komornik_pakiet;
    expect(b).toBeDefined();
    expect(b.bundleId).toBe("komornik_pakiet");
    expect(b.caseTypes).toHaveLength(3);
    expect(b.grossGrosze).toBe(19_900);
    expect(b.vatRate).toBe(23);
    expect(b.productName).toMatch(/KomornikShield/i);
  });

  it("zawiera bik_pakiet z 3 pismami i ceną 249 PLN", () => {
    const b = bundles.bik_pakiet;
    expect(b).toBeDefined();
    expect(b.bundleId).toBe("bik_pakiet");
    expect(b.caseTypes).toHaveLength(3);
    expect(b.grossGrosze).toBe(24_900);
    expect(b.productName).toMatch(/BIK-Fix/i);
  });

  it("pakiety są tańsze niż suma pojedynczych pism (~33% rabat)", () => {
    // Każde pojedyncze pismo ~99 PLN brutto = 9900 grosze (założenie modułu D2)
    // 3× 9900 = 29 700 grosze
    // komornik_pakiet kosztuje 19 900 → rabat ~33%
    const singleSum = 3 * 9_900;
    expect(bundles.komornik_pakiet.grossGrosze).toBeLessThan(singleSum);
  });
});

describe("getBundle", () => {
  it("zwraca bundle po prawidłowym ID", () => {
    const b = getBundle("komornik_pakiet");
    expect(b).not.toBeNull();
    expect(b?.bundleId).toBe("komornik_pakiet");
  });

  it("zwraca null dla nieistniejącego ID", () => {
    expect(getBundle("nieistnieje")).toBeNull();
    expect(getBundle("")).toBeNull();
  });
});

// =============================================================================
// productForCaseType
// =============================================================================
describe("productForCaseType", () => {
  it("zwraca produkt dla sprzeciw_epu (D1)", () => {
    const p = productForCaseType("sprzeciw_epu");
    expect(p.productType).toBe("sprzeciw_epu");
    expect(p.productName).toBeTruthy();
    expect(p.grossGrosze).toBeGreaterThan(0);
    expect(p.vatRate).toBe(23);
  });

  it("zwraca produkt dla komornik_zwolnienie_konta (D2)", () => {
    const p = productForCaseType("komornik_zwolnienie_konta");
    expect(p.productType).toBe("komornik_zwolnienie_konta");
    expect(p.grossGrosze).toBeGreaterThan(0);
  });

  it("rzuca Error dla nieznanego case_type", () => {
    // @ts-expect-error — test runtime guard dla błędnego inputu
    expect(() => productForCaseType("fake_type")).toThrow(/case_type/);
  });
});

// =============================================================================
// formatPriceGrosze — pl-PL locale formatter
// =============================================================================
describe("formatPriceGrosze", () => {
  it("formatuje 9900 grosze jako '99,00 zł'", () => {
    const formatted = formatPriceGrosze(9_900);
    // Może być różny non-breaking space — sprawdzamy znaki kluczowe
    expect(formatted).toContain("99,00");
    expect(formatted).toMatch(/zł/);
  });

  it("formatuje 19900 grosze jako '199,00 zł'", () => {
    const formatted = formatPriceGrosze(19_900);
    expect(formatted).toContain("199,00");
  });

  it("zachowuje 2 miejsca po przecinku nawet dla okrągłych kwot", () => {
    expect(formatPriceGrosze(10_000)).toContain("100,00");
  });

  it("formatuje 0 grosze jako '0,00 zł'", () => {
    expect(formatPriceGrosze(0)).toContain("0,00");
  });

  it("formatuje duże kwoty z separatorem tysięcy (pl-PL)", () => {
    // 1 234 567 grosze = 12 345,67 zł
    const formatted = formatPriceGrosze(1_234_567);
    // pl-PL używa spacji jako separator tysięcy
    expect(formatted).toContain("345,67");
    expect(formatted).toMatch(/12.345,67|12 345,67/);
  });
});

// =============================================================================
// formatVatRate
// =============================================================================
describe("formatVatRate", () => {
  it("formatuje 23 jako '23%'", () => {
    expect(formatVatRate(23)).toBe("23%");
  });

  it("formatuje 0 jako '0%' (reverse charge UE)", () => {
    expect(formatVatRate(0)).toBe("0%");
  });

  it("formatuje 8 jako '8%' (preferencyjna stawka)", () => {
    expect(formatVatRate(8)).toBe("8%");
  });

  it("zaokrągla wartości ułamkowe do całych", () => {
    expect(formatVatRate(23.4)).toBe("23%");
    expect(formatVatRate(22.9)).toBe("23%"); // toFixed(0) zaokrągla
  });
});
