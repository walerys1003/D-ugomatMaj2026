/**
 * Publiczny facade modułu kalkulatorów Długomat.
 *
 * Eksportuje 3 kalkulatory kwot wolnych zgodnie z PLAN.md (zadania 173, 181, 182):
 *   - obliczKwoteWolnaWynagrodzenie  (art. 87, 87¹ KP) — D4 PotrąceniaStop
 *   - obliczKwoteWolnaEmerytura      (art. 139–141 ustawy emerytalnej) — D4
 *   - obliczKwoteWolnaRachunek       (art. 54 Prawa bankowego, UFG) — D3 Komornik
 *
 * Plus stałe prawne (resolveMinWage, resolveMinPension) i Zod schemas
 * do walidacji wejść w API i formularzach.
 */
export {
  obliczKwoteWolnaWynagrodzenie,
  type WynagrodzenieInput,
  type WynagrodzenieResult,
  type PotracenieKategoria,
} from "./wynagrodzenie";

export {
  obliczKwoteWolnaEmerytura,
  type EmeryturaInput,
  type EmeryturaResult,
  type EmeryturaKategoria,
} from "./emerytura";

export {
  obliczKwoteWolnaRachunek,
  type RachunekInput,
  type RachunekResult,
} from "./rachunek-bankowy";

export {
  resolveMinWage,
  resolveMinPension,
  ufgBankAccountLimitGrosze,
  MIN_WAGE_HISTORY,
  MIN_PENSION_HISTORY,
  type MinWageEntry,
  type MinPensionEntry,
  type LegalYear,
} from "./legal-constants";

export {
  wynagrodzenieInputSchema,
  emeryturaInputSchema,
  rachunekInputSchema,
  type WynagrodzenieInputDTO,
  type EmeryturaInputDTO,
  type RachunekInputDTO,
} from "./schemas";
