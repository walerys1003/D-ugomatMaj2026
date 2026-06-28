import "server-only";

/**
 * Tier 7 zad. 301-308 — Wizard step definitions for new D9..D16 modules.
 *
 * Każdy moduł ma listę WizardStep[] z optional show_if/skip_if dla
 * branching engine (zad. 309). Steps grupują pytania per ekran;
 * pojedyncze pole = jedno mobile-first ekran (zad. 332).
 */

import type { CaseType } from "@/lib/db/types";
import type { WizardStep } from "./branch-engine";

// ----- D9 — Pełny wniosek o upadłość konsumencką -----
export const STEPS_D9: WizardStep[] = [
  {
    id: "intro",
    title: "Sprawdź, czy kwalifikujesz się do upadłości",
    description: "5 pytań — sprawdzimy podstawy z art. 491^4 Prawa upadłościowego.",
    category: "identity",
    estimated_minutes: 2,
  },
  {
    id: "personal",
    title: "Dane osobowe",
    category: "identity",
    estimated_minutes: 3,
  },
  {
    id: "income",
    title: "Dochody (ostatnie 12 miesięcy)",
    description: "Wynagrodzenie, świadczenia, alimenty, renta — wszystkie źródła.",
    category: "facts",
    estimated_minutes: 5,
  },
  {
    id: "assets",
    title: "Spis majątku",
    description: "Nieruchomości, pojazdy, oszczędności, papiery wartościowe.",
    category: "facts",
    estimated_minutes: 7,
  },
  {
    id: "creditors",
    title: "Lista wierzycieli",
    description: "Każdy wierzyciel + kwota + tytuł zobowiązania.",
    category: "claims",
    estimated_minutes: 8,
  },
  {
    id: "household",
    title: "Sytuacja rodzinna",
    description: "Współmałżonek, dzieci, osoby na utrzymaniu.",
    category: "facts",
    estimated_minutes: 3,
  },
  {
    id: "alimony",
    title: "Alimenty",
    description: "Czy płacisz lub otrzymujesz alimenty?",
    show_if: [{ answer_key: "has_dependents", op: "truthy" }],
    category: "facts",
    estimated_minutes: 2,
  },
  {
    id: "business",
    title: "Działalność gospodarcza",
    description: "Czy prowadzisz/prowadziłeś firmę w ostatnich 10 latach?",
    category: "facts",
    estimated_minutes: 3,
  },
  {
    id: "business_details",
    title: "Szczegóły działalności",
    show_if: [{ answer_key: "has_business", op: "truthy" }],
    category: "facts",
    estimated_minutes: 5,
  },
  {
    id: "insolvency_reason",
    title: "Przyczyna niewypłacalności",
    description: "Opisz, jak doszło do tej sytuacji (utrata pracy, choroba, rozwód).",
    category: "facts",
    estimated_minutes: 5,
  },
  {
    id: "review",
    title: "Podgląd wniosku",
    category: "review",
    estimated_minutes: 3,
  },
];

// ----- D10 — Pozew o zwrot opłat windykacyjnych -----
export const STEPS_D10: WizardStep[] = [
  {
    id: "creditor",
    title: "Wierzyciel/windykator",
    description: "Kto pobiera od Ciebie opłaty?",
    category: "identity",
    estimated_minutes: 2,
  },
  {
    id: "fees_history",
    title: "Historia opłat",
    description: "Daty + kwoty (30/40/100 zł monity, wezwania).",
    category: "claims",
    estimated_minutes: 5,
  },
  {
    id: "contract",
    title: "Umowa pierwotna",
    description: "Data zawarcia + klauzula o opłatach windykacyjnych.",
    category: "evidence",
    estimated_minutes: 3,
  },
  {
    id: "abusive_clause",
    title: "Klauzule abuzywne",
    description: "Wybierz, które klauzule kwestionujesz (lista UOKiK).",
    category: "claims",
    estimated_minutes: 4,
  },
  {
    id: "review",
    title: "Podgląd pozwu",
    category: "review",
    estimated_minutes: 3,
  },
];

// ----- D11 — Reklamacja bank/RF -----
export const STEPS_D11: WizardStep[] = [
  {
    id: "bank",
    title: "Bank i numer umowy",
    category: "identity",
    estimated_minutes: 2,
  },
  {
    id: "complaint_subject",
    title: "Czego dotyczy reklamacja",
    description: "Zawyżone odsetki, opłata abuzywna, błąd w księgowaniu.",
    category: "facts",
    estimated_minutes: 3,
  },
  {
    id: "complaint_facts",
    title: "Opis faktów",
    category: "facts",
    estimated_minutes: 5,
  },
  {
    id: "demand",
    title: "Żądanie",
    description: "Zwrot kwoty, korekta księgowania, anulacja opłaty.",
    category: "claims",
    estimated_minutes: 3,
  },
  {
    id: "rf_escalation",
    title: "Eskalacja do Rzecznika Finansowego",
    description: "Gdy bank nie odpowie w 30 dni — automatyczna eskalacja.",
    show_if: [{ answer_key: "want_rf_escalation", op: "truthy" }],
    category: "preferences",
    estimated_minutes: 2,
  },
  {
    id: "review",
    title: "Podgląd reklamacji",
    category: "review",
    estimated_minutes: 2,
  },
];

// ----- D12 — Skarga PUODO -----
export const STEPS_D12: WizardStep[] = [
  {
    id: "violator",
    title: "Kto naruszył RODO",
    description: "Windykator, BIG, fundusz sekurytyzacyjny, bank.",
    category: "identity",
    estimated_minutes: 2,
  },
  {
    id: "violation_type",
    title: "Rodzaj naruszenia",
    description: "Brak podstawy prawnej, niewłaściwy cel, nadmiarowe dane.",
    category: "facts",
    estimated_minutes: 3,
  },
  {
    id: "evidence",
    title: "Dowody naruszenia",
    description: "Pisma, zrzuty ekranu, korespondencja.",
    category: "evidence",
    estimated_minutes: 5,
  },
  {
    id: "demand",
    title: "Żądanie",
    description: "Ograniczenie przetwarzania, usunięcie, dostęp do danych.",
    category: "claims",
    estimated_minutes: 3,
  },
  {
    id: "review",
    title: "Podgląd skargi",
    category: "review",
    estimated_minutes: 2,
  },
];

// ----- D13 — Wniosek o rozłożenie należności sądowych na raty -----
export const STEPS_D13: WizardStep[] = [
  {
    id: "case_ref",
    title: "Sygnatura sprawy + sąd",
    category: "identity",
    estimated_minutes: 2,
  },
  {
    id: "amount",
    title: "Kwota do rozłożenia",
    category: "claims",
    estimated_minutes: 2,
  },
  {
    id: "proposed_schedule",
    title: "Proponowane raty",
    description: "Liczba rat + kwota miesięczna.",
    category: "preferences",
    estimated_minutes: 3,
  },
  {
    id: "financial_situation",
    title: "Sytuacja majątkowa",
    description: "Dochody, koszty, osoby na utrzymaniu.",
    category: "facts",
    estimated_minutes: 5,
  },
  {
    id: "extraordinary_circumstances",
    title: "Szczególne okoliczności",
    description: "Choroba, utrata pracy, rozwód — wzmacnia wniosek.",
    category: "facts",
    estimated_minutes: 4,
  },
  {
    id: "review",
    title: "Podgląd wniosku",
    category: "review",
    estimated_minutes: 2,
  },
];

// ----- D14 — Zwolnienie od kosztów sądowych -----
export const STEPS_D14: WizardStep[] = [
  {
    id: "case_ref",
    title: "Sprawa, w której wnosisz o zwolnienie",
    category: "identity",
    estimated_minutes: 2,
  },
  {
    id: "income",
    title: "Dochody",
    category: "facts",
    estimated_minutes: 4,
  },
  {
    id: "expenses",
    title: "Stałe koszty",
    description: "Czynsz, media, alimenty, kredyty.",
    category: "facts",
    estimated_minutes: 4,
  },
  {
    id: "household",
    title: "Osoby na utrzymaniu",
    category: "facts",
    estimated_minutes: 2,
  },
  {
    id: "assets",
    title: "Majątek",
    description: "Czy posiadasz nieruchomości, pojazdy, oszczędności?",
    category: "facts",
    estimated_minutes: 3,
  },
  {
    id: "review",
    title: "Podgląd wniosku + oświadczenie majątkowe",
    category: "review",
    estimated_minutes: 3,
  },
];

// ----- D15 — Zażalenie na klauzulę wykonalności -----
export const STEPS_D15: WizardStep[] = [
  {
    id: "title_details",
    title: "Tytuł wykonawczy",
    description: "Sąd, który nadał klauzulę + sygnatura.",
    category: "identity",
    estimated_minutes: 3,
  },
  {
    id: "no_delivery",
    title: "Czy nakaz został Ci doręczony?",
    description: "Brak doręczenia = silna podstawa zażalenia.",
    category: "facts",
    estimated_minutes: 2,
  },
  {
    id: "delivery_details",
    title: "Szczegóły doręczenia",
    show_if: [{ answer_key: "delivery_known", op: "truthy" }],
    category: "facts",
    estimated_minutes: 3,
  },
  {
    id: "address_history",
    title: "Adresy w okresie postępowania",
    show_if: [{ answer_key: "delivery_known", op: "falsy" }],
    description: "Gdzie mieszkałeś przez ostatnie 3 lata?",
    category: "evidence",
    estimated_minutes: 4,
  },
  {
    id: "grounds",
    title: "Podstawy zażalenia",
    description: "Brak doręczenia, błąd procesowy, niewymagalność.",
    category: "claims",
    estimated_minutes: 4,
  },
  {
    id: "review",
    title: "Podgląd zażalenia",
    category: "review",
    estimated_minutes: 2,
  },
];

// ----- D16 — Powództwo o pozbawienie tytułu wykonalności -----
export const STEPS_D16: WizardStep[] = [
  {
    id: "title_details",
    title: "Tytuł wykonawczy do pozbawienia",
    category: "identity",
    estimated_minutes: 3,
  },
  {
    id: "ground_selection",
    title: "Wybierz podstawę z art. 840 k.p.c.",
    description:
      "1) Przedawnienie po wydaniu tytułu, 2) Spełnienie świadczenia, 3) Brak wymagalności.",
    category: "claims",
    estimated_minutes: 4,
  },
  {
    id: "prescription_facts",
    title: "Fakty przedawnienia",
    show_if: [{ answer_key: "ground", op: "eq", value: "prescription" }],
    description: "Data wymagalności, ostatnia czynność przerywająca bieg.",
    category: "facts",
    estimated_minutes: 5,
  },
  {
    id: "payment_facts",
    title: "Fakty spełnienia świadczenia",
    show_if: [{ answer_key: "ground", op: "eq", value: "payment" }],
    description: "Daty i kwoty wpłat, dowody (potwierdzenia przelewu).",
    category: "evidence",
    estimated_minutes: 5,
  },
  {
    id: "non_due_facts",
    title: "Fakty braku wymagalności",
    show_if: [{ answer_key: "ground", op: "eq", value: "non_due" }],
    category: "facts",
    estimated_minutes: 4,
  },
  {
    id: "evidence",
    title: "Dowody dodatkowe",
    description: "Świadkowie, dokumenty, korespondencja.",
    category: "evidence",
    estimated_minutes: 4,
  },
  {
    id: "review",
    title: "Podgląd powództwa",
    category: "review",
    estimated_minutes: 3,
  },
];

// ----- Registry -----
export const WIZARD_STEPS_BY_TYPE: Partial<Record<CaseType, WizardStep[]>> = {
  upadlosc_pelny_wniosek: STEPS_D9,
  pozew_zwrot_oplat_windykacyjnych: STEPS_D10,
  reklamacja_bank_rf: STEPS_D11,
  skarga_puodo: STEPS_D12,
  wniosek_raty_sadowe: STEPS_D13,
  wniosek_zwolnienie_kosztow_sadowych: STEPS_D14,
  zazalenie_klauzula_wykonalnosci: STEPS_D15,
  pozbawienie_tytulu_wykonalnosci: STEPS_D16,
};

export function getWizardSteps(caseType: CaseType): WizardStep[] {
  return WIZARD_STEPS_BY_TYPE[caseType] ?? [];
}
