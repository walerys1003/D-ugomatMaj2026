/**
 * D3 KomornikShield — definicja wizarda z conditional graphem.
 *
 * 6 wariantów pism. Wszystkie mają wspólne kroki 1-5:
 *   wariant → dluznik → komornik → zajecie → uzasadnienie
 *
 * Następnie graf rozgałęzia się:
 *   skarga       → step-skarga (czynnosc + data_doreczenia 7 dni!) → review
 *   raty         → step-raty (rata_miesieczna + liczba_rat)        → review
 *   pozostałe    → review (bez dodatkowego kroku)
 *
 * Mapowanie wariantu na case_type:
 *   zwolnienie_konta     → komornik_zwolnienie_konta
 *   zwolnienie_swiadczen → komornik_zwolnienie_swiadczen
 *   skarga               → komornik_skarga
 *   ograniczenie         → komornik_ograniczenie
 *   umorzenie            → komornik_umorzenie
 *   raty                 → komornik_raty
 *
 * Każdy wariant ma osobny case_type w bazie + osobny prompt template,
 * dlatego rejestrujemy 6 oddzielnych WizardDefinition (dzielą tę samą
 * tablicę kroków, ale `caseType` różni się).
 */
import type {
  WizardDefinition,
  WizardStepDefinition,
} from "@/lib/wizard/wizard-types";

import {
  dluznikSchema,
  komornikSchema,
  komornikReviewSchema,
  ratySchema,
  skargaSchema,
  uzasadnienieSchema,
  wariantSchema,
  zajecieSchema,
} from "./schemas";
import { StepDluznik } from "./steps/step-dluznik";
import { StepKomornik } from "./steps/step-komornik";
import { StepKomornikReview } from "./steps/step-review";
import { StepRaty } from "./steps/step-raty";
import { StepSkarga } from "./steps/step-skarga";
import { StepUzasadnienie } from "./steps/step-uzasadnienie";
import { StepWariant } from "./steps/step-wariant";
import { StepZajecie } from "./steps/step-zajecie";

const stepWariant: WizardStepDefinition = {
  id: "wariant",
  title: "Wariant",
  description: "Które pismo do komornika piszemy?",
  schema: wariantSchema,
  Component: StepWariant as WizardStepDefinition["Component"],
  next: () => "dluznik",
};

const stepDluznik: WizardStepDefinition = {
  id: "dluznik",
  title: "Twoje dane",
  description: "Dane dłużnika — wpiszemy je w nagłówku pisma.",
  schema: dluznikSchema,
  Component: StepDluznik as WizardStepDefinition["Component"],
  next: () => "komornik",
};

const stepKomornik: WizardStepDefinition = {
  id: "komornik",
  title: "Komornik",
  description: "Kancelaria, sygnatura Km, wierzyciel.",
  schema: komornikSchema,
  Component: StepKomornik as WizardStepDefinition["Component"],
  next: () => "zajecie",
};

const stepZajecie: WizardStepDefinition = {
  id: "zajecie",
  title: "Zajęcie",
  description: "Co zostało zajęte i w jakiej kwocie.",
  schema: zajecieSchema,
  Component: StepZajecie as WizardStepDefinition["Component"],
  next: () => "uzasadnienie",
};

const stepUzasadnienie: WizardStepDefinition = {
  id: "uzasadnienie",
  title: "Uzasadnienie",
  description: "Twoja sytuacja życiowa — kluczowy element pisma.",
  schema: uzasadnienieSchema,
  Component: StepUzasadnienie as WizardStepDefinition["Component"],
  next: (answers) => {
    if (answers.variant === "skarga") return "skarga";
    if (answers.variant === "raty") return "raty";
    return "review";
  },
};

const stepSkarga: WizardStepDefinition = {
  id: "skarga",
  title: "Czynność komornika",
  description: "Zaskarżana czynność + data doręczenia (termin 7 dni).",
  schema: skargaSchema,
  Component: StepSkarga as WizardStepDefinition["Component"],
  next: () => "review",
  skipIf: (answers) => answers.variant !== "skarga",
};

const stepRaty: WizardStepDefinition = {
  id: "raty",
  title: "Propozycja rat",
  description: "Kwota miesięczna i liczba rat.",
  schema: ratySchema,
  Component: StepRaty as WizardStepDefinition["Component"],
  next: () => "review",
  skipIf: (answers) => answers.variant !== "raty",
};

const stepReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: komornikReviewSchema,
  Component: StepKomornikReview as WizardStepDefinition["Component"],
  next: () => null,
};

const STEPS = [
  stepWariant,
  stepDluznik,
  stepKomornik,
  stepZajecie,
  stepUzasadnienie,
  stepSkarga,
  stepRaty,
  stepReview,
];

/**
 * 6 wizardów — każdy pod własnym case_type, dzielą identyczne kroki.
 * Pozwala loaderowi prompt template wybrać właściwy szablon per case_type.
 */
export const komornikWizardZwolnienieKonta: WizardDefinition = {
  caseType: "komornik_zwolnienie_konta",
  startStepId: "wariant",
  steps: STEPS,
};

export const komornikWizardZwolnienieSwiadczen: WizardDefinition = {
  caseType: "komornik_zwolnienie_swiadczen",
  startStepId: "wariant",
  steps: STEPS,
};

export const komornikWizardSkarga: WizardDefinition = {
  caseType: "komornik_skarga",
  startStepId: "wariant",
  steps: STEPS,
};

export const komornikWizardOgraniczenie: WizardDefinition = {
  caseType: "komornik_ograniczenie",
  startStepId: "wariant",
  steps: STEPS,
};

export const komornikWizardUmorzenie: WizardDefinition = {
  caseType: "komornik_umorzenie",
  startStepId: "wariant",
  steps: STEPS,
};

export const komornikWizardRaty: WizardDefinition = {
  caseType: "komornik_raty",
  startStepId: "wariant",
  steps: STEPS,
};
