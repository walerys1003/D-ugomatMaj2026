import { describe, it, expect } from "vitest";
import {
  calculateLimitation,
  calculateWageGarnishment,
  calculateCourtFees,
  evaluateCostsExemption,
  calculateRoi,
} from "@/lib/calculators/legal-math";

// =============================================================================
// calculateLimitation — przedawnienie roszczeń (art. 117-125 KC)
// =============================================================================
describe("calculateLimitation", () => {
  it("oblicza 3 lata dla roszczenia konsumenckiego (consumer_general)", () => {
    // Roszczenie wymagalne 2030-01-15 → przedawnienie z końcem 2033 (reguła końca roku)
    const r = calculateLimitation({
      claimDueDate: "2030-01-15",
      kind: "consumer_general",
    });
    expect(r.yearsApplicable).toBe(3);
    expect(r.limitationEndDate).toBe("2033-12-31");
    expect(r.legalBasis).toContain("art. 118 KC");
    expect(r.legalBasis).toContain("art. 117 § 2¹ KC");
  });

  it("oblicza 6 lat dla roszczenia general_civil", () => {
    const r = calculateLimitation({
      claimDueDate: "2030-06-01",
      kind: "general_civil",
    });
    expect(r.yearsApplicable).toBe(6);
    expect(r.limitationEndDate).toBe("2036-12-31");
  });

  it("oblicza 5 lat dla zobowiązań podatkowych", () => {
    const r = calculateLimitation({
      claimDueDate: "2030-06-01",
      kind: "tax",
    });
    expect(r.yearsApplicable).toBe(5);
    expect(r.legalBasis[0]).toContain("Ordynacji");
  });

  it("flaguje roszczenie jako przedawnione gdy data minęła", () => {
    const r = calculateLimitation({
      claimDueDate: "2010-01-01",
      kind: "consumer_general",
    });
    expect(r.isLimited).toBe(true);
    expect(r.daysRemaining).toBeLessThan(0);
    expect(r.warning).toMatch(/przedawnione/i);
  });

  it("respektuje przerwanie biegu przedawnienia", () => {
    const noInterrupt = calculateLimitation({
      claimDueDate: "2020-01-15",
      kind: "consumer_general",
    });
    const withInterrupt = calculateLimitation({
      claimDueDate: "2020-01-15",
      kind: "consumer_general",
      interrupted: true,
      interruptionDate: "2024-06-01",
    });
    // Przerwanie powinno przesunąć datę końca dalej w przyszłość
    expect(new Date(withInterrupt.limitationEndDate).getTime()).toBeGreaterThan(
      new Date(noInterrupt.limitationEndDate).getTime(),
    );
  });

  it("rzuca błąd przy niepoprawnej dacie", () => {
    expect(() =>
      calculateLimitation({ claimDueDate: "not-a-date", kind: "tort" }),
    ).toThrow("invalid_date");
  });
});

// =============================================================================
// calculateWageGarnishment — kwota wolna od egzekucji (art. 87 KP)
// =============================================================================
describe("calculateWageGarnishment", () => {
  it("zwykła wierzytelność — max 50% wynagrodzenia, kwota wolna = min. wynagrodzenie", () => {
    const r = calculateWageGarnishment({
      netSalaryPln: 5000,
      debtKind: "other",
      dependents: 0,
    });
    expect(r.maxSeizurePercent).toBe(50);
    expect(r.minimumWageBase).toBe(3540);
    // amountSeizable = min(50% × 5000, 5000 - 3540) = min(2500, 1460) = 1460
    expect(r.amountSeizable).toBeCloseTo(1460, 1);
    expect(r.amountProtected).toBeCloseTo(3540, 1);
    expect(r.legalBasis).toContain("art. 87¹ § 1 pkt 1 KP");
  });

  it("alimenty — max 60% wynagrodzenia, niższa kwota wolna (40% min)", () => {
    const r = calculateWageGarnishment({
      netSalaryPln: 5000,
      debtKind: "alimony",
      dependents: 0,
    });
    expect(r.maxSeizurePercent).toBe(60);
    // baseExemption = 0.4 × 3540 = 1416
    // amountSeizable = min(60% × 5000, 5000 - 1416) = min(3000, 3584) = 3000
    expect(r.amountSeizable).toBeCloseTo(3000, 1);
    expect(r.legalBasis).toContain("art. 87¹ § 1 pkt 2 KP");
  });

  it("dodaje bonus na utrzymywane osoby (10% min. wynagrodzenia per osoba)", () => {
    const r0 = calculateWageGarnishment({
      netSalaryPln: 6000,
      debtKind: "other",
      dependents: 0,
    });
    const r2 = calculateWageGarnishment({
      netSalaryPln: 6000,
      debtKind: "other",
      dependents: 2,
    });
    // 2 dzieci → +20% min. wynagrodzenia (708 PLN) do kwoty wolnej
    expect(r2.amountProtected).toBeGreaterThan(r0.amountProtected);
  });

  it("przy bardzo niskim wynagrodzeniu — nic nie do zajęcia", () => {
    const r = calculateWageGarnishment({
      netSalaryPln: 3000, // poniżej min. wynagrodzenia
      debtKind: "other",
      dependents: 0,
    });
    expect(r.amountSeizable).toBe(0);
    expect(r.amountProtected).toBe(3000);
  });

  it("respektuje custom minimumWageNet (parametr)", () => {
    const r = calculateWageGarnishment(
      { netSalaryPln: 5000, debtKind: "other", dependents: 0 },
      4000, // niestandardowe min. wynagrodzenie
    );
    expect(r.minimumWageBase).toBe(4000);
  });
});

// =============================================================================
// calculateCourtFees — koszty postępowania sądowego (UKSC)
// =============================================================================
describe("calculateCourtFees", () => {
  it("EPU — 1.25% wartości, min 30 zł", () => {
    const r = calculateCourtFees({ claimValue: 10_000, procedureKind: "epu" });
    expect(r.filingFee).toBe(125); // 10000 × 0.0125
  });

  it("EPU — minimum 30 zł dla małych kwot", () => {
    const r = calculateCourtFees({ claimValue: 100, procedureKind: "epu" });
    expect(r.filingFee).toBe(30);
  });

  it("regular — 5% wartości, min 30 zł, max 200 000 zł", () => {
    const r = calculateCourtFees({ claimValue: 10_000, procedureKind: "regular" });
    expect(r.filingFee).toBe(500); // 5% × 10000
  });

  it("regular — clamp do 200 000 zł", () => {
    const r = calculateCourtFees({
      claimValue: 10_000_000,
      procedureKind: "regular",
    });
    expect(r.filingFee).toBe(200_000);
  });

  it("small_claims — progi 100/250/500 zł", () => {
    expect(
      calculateCourtFees({ claimValue: 1500, procedureKind: "small_claims" }).filingFee,
    ).toBe(100);
    expect(
      calculateCourtFees({ claimValue: 3000, procedureKind: "small_claims" }).filingFee,
    ).toBe(250);
    expect(
      calculateCourtFees({ claimValue: 10_000, procedureKind: "small_claims" }).filingFee,
    ).toBe(500);
  });

  it("oblicza bailiffFee jako ~10% wartości", () => {
    const r = calculateCourtFees({ claimValue: 10_000, procedureKind: "regular" });
    expect(r.bailiffFee).toBe(1000);
  });

  it("zawiera podstawy prawne UKSC", () => {
    const r = calculateCourtFees({ claimValue: 5000, procedureKind: "epu" });
    expect(r.legalBasis).toContain("art. 13 UKSC");
    expect(r.notes.length).toBeGreaterThan(0);
  });

  it("ujemne wartości są clamp'owane do 0", () => {
    const r = calculateCourtFees({ claimValue: -1000, procedureKind: "regular" });
    expect(r.filingFee).toBe(30); // minimum
  });
});

// =============================================================================
// evaluateCostsExemption — raty / zwolnienie z kosztów (art. 100-103 UKSC)
// =============================================================================
describe("evaluateCostsExemption", () => {
  it("zwraca full exemption dla bardzo trudnej sytuacji (score >= 75)", () => {
    const r = evaluateCostsExemption({
      monthlyIncomeNet: 1500,
      householdSize: 4, // 375 PLN per capita → 50 pkt
      monthlyExpenses: 2000, // disposable < 0 → 30 pkt
      liquidAssets: 0, // < 1000 → 20 pkt
    });
    expect(r.eligibilityScore).toBeGreaterThanOrEqual(75);
    expect(r.exemptionRecommendation).toBe("full");
  });

  it("zwraca partial dla średniej trudności (55-74 pkt)", () => {
    const r = evaluateCostsExemption({
      monthlyIncomeNet: 4500,
      householdSize: 3, // 1500 → 20 pkt (border: <2500 nie <1500)
      monthlyExpenses: 4400, // disposable=100 → 20 pkt (<300)
      liquidAssets: 500, // < 1000 → 20 pkt
    });
    // 20 + 20 + 20 = 60 pkt → partial
    expect(r.eligibilityScore).toBeGreaterThanOrEqual(55);
    expect(r.eligibilityScore).toBeLessThan(75);
    expect(r.exemptionRecommendation).toBe("partial");
    expect(r.installmentMonthsRecommended).toBe(6);
  });

  it("zwraca installments dla umiarkowanej trudności (35-54 pkt)", () => {
    const r = evaluateCostsExemption({
      monthlyIncomeNet: 3000,
      householdSize: 2, // 1500 → 20 pkt (border: nie <1500, więc <2500)
      monthlyExpenses: 2500, // disposable=500 → 10 pkt (<800)
      liquidAssets: 800, // < 1000 → 20 pkt
    });
    // 20 + 10 + 20 = 50 pkt → installments
    expect(r.eligibilityScore).toBeGreaterThanOrEqual(35);
    expect(r.eligibilityScore).toBeLessThan(55);
    expect(r.exemptionRecommendation).toBe("installments");
    expect(r.installmentMonthsRecommended).toBe(12);
  });

  it("zwraca none dla dobrej sytuacji majątkowej", () => {
    const r = evaluateCostsExemption({
      monthlyIncomeNet: 15_000,
      householdSize: 2,
      monthlyExpenses: 5000,
      liquidAssets: 50_000,
    });
    expect(r.eligibilityScore).toBeLessThan(35);
    expect(r.exemptionRecommendation).toBe("none");
    expect(r.installmentMonthsRecommended).toBe(0);
  });

  it("zwraca legalBasis dla UKSC", () => {
    const r = evaluateCostsExemption({
      monthlyIncomeNet: 2000,
      householdSize: 1,
      monthlyExpenses: 1000,
      liquidAssets: 100,
    });
    expect(r.legalBasis).toContain("art. 100 UKSC");
    expect(r.notes.length).toBeGreaterThanOrEqual(2);
  });

  it("clampuje score do 0..100", () => {
    const r = evaluateCostsExemption({
      monthlyIncomeNet: 0,
      householdSize: 10,
      monthlyExpenses: 100_000,
      liquidAssets: 0,
    });
    expect(r.eligibilityScore).toBeLessThanOrEqual(100);
  });
});

// =============================================================================
// calculateRoi — Długomat vs kancelaria
// =============================================================================
describe("calculateRoi", () => {
  it("oblicza oszczędności roczne (kancelaria 300 PLN/h, 10h/sprawa, 12 spraw/rok, plan 99 PLN)", () => {
    const r = calculateRoi({
      hourlyRateKancelaria: 300,
      hoursPerCase: 10,
      casesPerYear: 12,
      dlugomatPlanPln: 99,
    });
    expect(r.kancelariaCostYearly).toBe(36_000); // 300 × 10 × 12
    expect(r.dlugomatCostYearly).toBe(1188); // 99 × 12
    expect(r.savingsYearly).toBe(34_812);
    expect(r.savingsPercent).toBeCloseTo(96.7, 1);
    expect(r.paybackMonths).toBeLessThan(1);
  });

  it("zwraca savingsPercent = 0 gdy nie ma porównania (kancelaria koszt 0)", () => {
    const r = calculateRoi({
      hourlyRateKancelaria: 0,
      hoursPerCase: 10,
      casesPerYear: 1,
      dlugomatPlanPln: 99,
    });
    expect(r.savingsPercent).toBe(0);
  });

  it("zwraca paybackMonths = Infinity gdy plan droższy niż kancelaria", () => {
    const r = calculateRoi({
      hourlyRateKancelaria: 50,
      hoursPerCase: 1,
      casesPerYear: 1,
      dlugomatPlanPln: 500, // 6000/rok vs 50/rok kancelaria
    });
    expect(r.savingsYearly).toBeLessThan(0);
    expect(r.paybackMonths).toBe(Infinity);
  });

  it("zaokrągla wszystkie kwoty do całych złotych", () => {
    const r = calculateRoi({
      hourlyRateKancelaria: 333.33,
      hoursPerCase: 7.5,
      casesPerYear: 11,
      dlugomatPlanPln: 89,
    });
    expect(Number.isInteger(r.kancelariaCostYearly)).toBe(true);
    expect(Number.isInteger(r.dlugomatCostYearly)).toBe(true);
    expect(Number.isInteger(r.savingsYearly)).toBe(true);
  });
});
