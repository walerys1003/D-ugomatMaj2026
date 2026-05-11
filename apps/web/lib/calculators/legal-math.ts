/**
 * Tier 35 — Legal math library (kalkulatory prawne).
 *
 * Funkcje stosowane w 5 publicznych kalkulatorach:
 *   - przedawnienie roszczeń (art. 117-125 KC)
 *   - kwota wolna od egzekucji z wynagrodzenia (art. 87 KP)
 *   - koszty postępowania sądowego (Ustawa o kosztach sądowych)
 *   - raty sądowe i zwolnienie z kosztów (art. 100-103 UKSC)
 *   - ROI Długomat vs kancelaria
 *
 * Wszystkie funkcje są czyste (pure) — łatwe do testowania i bezpieczne
 * do użycia po stronie klienta. Daty traktujemy jako 'YYYY-MM-DD' ISO.
 */

// ============================================================
// PRZEDAWNIENIE
// ============================================================

export type ClaimKind =
  | "consumer_general"          // 3 lata (umowy konsumenckie)
  | "consumer_periodic"         // 3 lata (świadczenia okresowe — najem, abonament)
  | "business_general"          // 3 lata (działalność gospodarcza)
  | "tort"                      // 3 lata od wiedzy, max 10 lat od czynu
  | "general_civil"             // 6 lat (ogólne, od 9.07.2018)
  | "labor"                     // 3 lata (roszczenia ze stosunku pracy)
  | "tax";                      // 5 lat (zobowiązania podatkowe)

export interface LimitationInput {
  /** Data wymagalności roszczenia. */
  claimDueDate: string;
  kind: ClaimKind;
  /** Czy nastąpiło przerwanie biegu (np. uznanie długu, wszczęcie postępowania). */
  interrupted?: boolean;
  interruptionDate?: string;
}

export interface LimitationResult {
  isLimited: boolean;
  limitationEndDate: string;
  daysRemaining: number;
  yearsApplicable: number;
  legalBasis: string[];
  warning: string | null;
}

const KIND_YEARS: Record<ClaimKind, number> = {
  consumer_general: 3,
  consumer_periodic: 3,
  business_general: 3,
  tort: 3,
  general_civil: 6,
  labor: 3,
  tax: 5,
};

const KIND_LEGAL_BASIS: Record<ClaimKind, string[]> = {
  consumer_general: ["art. 118 KC", "art. 117 § 2¹ KC"],
  consumer_periodic: ["art. 118 KC", "art. 117 § 2¹ KC"],
  business_general: ["art. 118 KC"],
  tort: ["art. 442¹ KC"],
  general_civil: ["art. 118 KC (nowelizacja 9.07.2018)"],
  labor: ["art. 291 § 1 KP"],
  tax: ["art. 70 § 1 Ordynacji podatkowej"],
};

/**
 * Oblicza przedawnienie zgodnie z art. 118 i 117 § 2¹ KC.
 * Reguła "koniec roku kalendarzowego" — okresy 2-letnie i dłuższe biegną do końca
 * roku kalendarzowego (od 9.07.2018).
 */
export function calculateLimitation(input: LimitationInput): LimitationResult {
  const years = KIND_YEARS[input.kind];
  const baseDate = input.interrupted && input.interruptionDate
    ? new Date(input.interruptionDate)
    : new Date(input.claimDueDate);

  if (Number.isNaN(baseDate.getTime())) {
    throw new Error("invalid_date");
  }

  let endDate = new Date(baseDate);
  endDate.setFullYear(endDate.getFullYear() + years);

  // Reguła końca roku (art. 118 KC zd. 2) — dla okresów >= 2 lat
  if (years >= 2) {
    endDate = new Date(endDate.getFullYear(), 11, 31, 23, 59, 59);
  }

  const today = new Date();
  const daysRemaining = Math.floor(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isLimited = daysRemaining < 0;

  let warning: string | null = null;
  if (isLimited) {
    warning =
      "Roszczenie jest przedawnione. Możesz podnieść zarzut przedawnienia w sprzeciwie/odpowiedzi na pozew (art. 117 § 2¹ KC).";
  } else if (daysRemaining < 90) {
    warning = `Pozostało tylko ${daysRemaining} dni do przedawnienia — działaj szybko.`;
  }

  return {
    isLimited,
    limitationEndDate: endDate.toISOString().slice(0, 10),
    daysRemaining,
    yearsApplicable: years,
    legalBasis: KIND_LEGAL_BASIS[input.kind],
    warning,
  };
}

// ============================================================
// KWOTA WOLNA OD EGZEKUCJI (art. 87¹ i 87² KP)
// ============================================================

export interface WageGarnishmentInput {
  /** Wynagrodzenie netto miesięczne (PLN). */
  netSalaryPln: number;
  /** Rodzaj wierzytelności egzekwowanej. */
  debtKind: "alimony" | "other";
  /** Liczba dzieci na utrzymaniu (wpływa na kwotę wolną). */
  dependents: number;
}

export interface WageGarnishmentResult {
  amountSeizable: number;
  amountProtected: number;
  maxSeizurePercent: number;
  minimumWageBase: number;
  legalBasis: string[];
}

/**
 * Oblicza maksymalną kwotę zajęcia z wynagrodzenia 2026.
 *
 * Minimum wage 2026: 4666 PLN brutto (~3540 netto) — wartość referencyjna,
 * w produkcji powinna być pobrana z konfiguracji.
 */
export function calculateWageGarnishment(
  input: WageGarnishmentInput,
  minimumWageNet = 3540,
): WageGarnishmentResult {
  const maxPercent = input.debtKind === "alimony" ? 0.6 : 0.5;

  // Kwota wolna: 100% min. wynagrodzenia netto (alimentacja: 40% min. wynagrodzenia)
  const baseExemption = input.debtKind === "alimony"
    ? minimumWageNet * 0.4
    : minimumWageNet;

  // Dodatek na utrzymywane osoby (~10% min. wynagrodzenia za każdą osobę)
  const dependentBonus = input.dependents * minimumWageNet * 0.1;
  const totalExemption = baseExemption + dependentBonus;

  const maxByPercent = input.netSalaryPln * maxPercent;
  const maxByExemption = Math.max(0, input.netSalaryPln - totalExemption);
  const seizable = Math.min(maxByPercent, maxByExemption);

  return {
    amountSeizable: Math.round(seizable * 100) / 100,
    amountProtected: Math.round((input.netSalaryPln - seizable) * 100) / 100,
    maxSeizurePercent: maxPercent * 100,
    minimumWageBase: minimumWageNet,
    legalBasis:
      input.debtKind === "alimony"
        ? ["art. 87¹ § 1 pkt 2 KP", "art. 87² KP"]
        : ["art. 87¹ § 1 pkt 1 KP", "art. 87² KP"],
  };
}

// ============================================================
// KOSZTY POSTĘPOWANIA SĄDOWEGO (Ustawa o kosztach sądowych w sprawach cywilnych)
// ============================================================

export interface CourtFeesInput {
  /** Wartość przedmiotu sporu (PLN). */
  claimValue: number;
  /** Typ postępowania. */
  procedureKind: "epu" | "regular" | "appeal" | "small_claims";
}

export interface CourtFeesResult {
  filingFee: number;
  appealFee: number;
  cassationFee: number;
  bailiffFee: number;
  totalEstimate: number;
  legalBasis: string[];
  notes: string[];
}

/**
 * Stawki na podstawie ustawy o kosztach sądowych w sprawach cywilnych
 * (Dz.U. 2005 Nr 167 poz. 1398, t.j. Dz.U. 2024).
 */
export function calculateCourtFees(input: CourtFeesInput): CourtFeesResult {
  const v = Math.max(0, input.claimValue);

  // EPU — 1.25% wartości, min. 30 zł
  const epuFee = Math.max(30, Math.round(v * 0.0125));
  // Postępowanie zwykłe — 5% wartości, min. 30 zł, max 200 000 zł
  const regularFee = Math.min(200_000, Math.max(30, Math.round(v * 0.05)));
  // Drobne — 100 zł / 200 zł / 500 zł próg
  const smallClaimsFee = v <= 2000 ? 100 : v <= 5000 ? 250 : 500;

  const filingFee =
    input.procedureKind === "epu"
      ? epuFee
      : input.procedureKind === "small_claims"
        ? smallClaimsFee
        : regularFee;

  return {
    filingFee,
    appealFee: filingFee, // identyczna co opłata sądowa od pozwu
    cassationFee: filingFee, // identyczna
    bailiffFee: Math.round(v * 0.1), // opłata stosunkowa komornika ~10% (max 50 000)
    totalEstimate: filingFee,
    legalBasis: ["art. 13 UKSC", "art. 13a UKSC", "art. 19 UKSC"],
    notes: [
      "Powyższe wartości są szacunkowe. Sąd może doliczyć opłaty kancelaryjne (np. uwierzytelnienie odpisu).",
      "Jeśli nie stać Cię na opłatę — masz prawo do zwolnienia z kosztów sądowych (art. 100 UKSC).",
    ],
  };
}

// ============================================================
// RATY SĄDOWE / ZWOLNIENIE Z KOSZTÓW (art. 100-103 UKSC)
// ============================================================

export interface CostsExemptionInput {
  monthlyIncomeNet: number;
  householdSize: number;
  monthlyExpenses: number;
  liquidAssets: number;
}

export interface CostsExemptionResult {
  eligibilityScore: number;       // 0..100
  exemptionRecommendation: "full" | "partial" | "installments" | "none";
  installmentMonthsRecommended: number;
  legalBasis: string[];
  notes: string[];
}

export function evaluateCostsExemption(input: CostsExemptionInput): CostsExemptionResult {
  const perPersonIncome = input.monthlyIncomeNet / Math.max(1, input.householdSize);
  const disposable = input.monthlyIncomeNet - input.monthlyExpenses;

  let score = 0;
  if (perPersonIncome < 1000) score += 50;
  else if (perPersonIncome < 1500) score += 35;
  else if (perPersonIncome < 2500) score += 20;
  else score += 5;

  if (disposable < 0) score += 30;
  else if (disposable < 300) score += 20;
  else if (disposable < 800) score += 10;

  if (input.liquidAssets < 1000) score += 20;
  else if (input.liquidAssets < 5000) score += 10;

  score = Math.min(100, score);

  let rec: CostsExemptionResult["exemptionRecommendation"] = "none";
  let months = 0;
  if (score >= 75) {
    rec = "full";
  } else if (score >= 55) {
    rec = "partial";
    months = 6;
  } else if (score >= 35) {
    rec = "installments";
    months = 12;
  }

  return {
    eligibilityScore: score,
    exemptionRecommendation: rec,
    installmentMonthsRecommended: months,
    legalBasis: ["art. 100 UKSC", "art. 101 UKSC", "art. 103 UKSC"],
    notes: [
      "Ocena jest wstępna — sąd indywidualnie ocenia sytuację majątkową i rodzinną.",
      "Wniosek wymaga załączenia oświadczenia o stanie rodzinnym, majątku i dochodach (formularz oficjalny).",
    ],
  };
}

// ============================================================
// ROI Długomat vs kancelaria
// ============================================================

export interface RoiInput {
  /** Średnia stawka kancelarii (PLN/godzina). */
  hourlyRateKancelaria: number;
  /** Szacunkowy czas pracy radcy nad sprawą (godziny). */
  hoursPerCase: number;
  /** Liczba spraw rocznie. */
  casesPerYear: number;
  /** Plan Długomat (PLN/miesiąc). */
  dlugomatPlanPln: number;
}

export interface RoiResult {
  kancelariaCostYearly: number;
  dlugomatCostYearly: number;
  savingsYearly: number;
  savingsPercent: number;
  paybackMonths: number;
}

export function calculateRoi(input: RoiInput): RoiResult {
  const kancelariaCostYearly = input.hourlyRateKancelaria * input.hoursPerCase * input.casesPerYear;
  const dlugomatCostYearly = input.dlugomatPlanPln * 12;
  const savings = kancelariaCostYearly - dlugomatCostYearly;
  const savingsPercent = kancelariaCostYearly > 0 ? (savings / kancelariaCostYearly) * 100 : 0;
  const paybackMonths = savings > 0
    ? input.dlugomatPlanPln / (savings / 12)
    : Infinity;

  return {
    kancelariaCostYearly: Math.round(kancelariaCostYearly),
    dlugomatCostYearly: Math.round(dlugomatCostYearly),
    savingsYearly: Math.round(savings),
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
  };
}
