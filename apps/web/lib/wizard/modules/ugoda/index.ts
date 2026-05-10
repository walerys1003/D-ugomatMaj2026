/**
 * D7 UgodoMat — definicja wizarda (linearny graf, 3 case_type współdzielą STEPS).
 *
 * Mapowanie wariantu na case_type:
 *   propozycja_raty           → ugoda_raty
 *   propozycja_umorzenie      → ugoda_umorzenie
 *   propozycja_indywidualna   → ugoda_propozycja
 *
 * Krok po kroku (wszystkie warianty mają taki sam graf):
 *   wariant → dluznik → wierzyciel → zobowiazanie → propozycja
 *           → sytuacja → review
 *
 * Krok `propozycja` jest wewnętrznie warunkowy (pola raty / kwota / %)
 * w zależności od wybranego wariantu — patrz step-propozycja.tsx.
 */
import type {
  WizardDefinition,
  WizardStepDefinition,
} from "@/lib/wizard/wizard-types";

import {
  dluznikSchema,
  propozycjaSchema,
  sytuacjaSchema,
  ugodaReviewSchema,
  wariantSchema,
  wierzycielSchema,
  zobowiazanieSchema,
} from "./schemas";
import { StepDluznik } from "./steps/step-dluznik";
import { StepPropozycja } from "./steps/step-propozycja";
import { StepReview } from "./steps/step-review";
import { StepSytuacja } from "./steps/step-sytuacja";
import { StepWariant } from "./steps/step-wariant";
import { StepWierzyciel } from "./steps/step-wierzyciel";
import { StepZobowiazanie } from "./steps/step-zobowiazanie";

const stepWariant: WizardStepDefinition = {
  id: "wariant",
  title: "Wariant",
  description: "Który typ propozycji ugody piszemy?",
  schema: wariantSchema,
  Component: StepWariant as WizardStepDefinition["Component"],
  next: () => "dluznik",
};

const stepDluznik: WizardStepDefinition = {
  id: "dluznik",
  title: "Twoje dane",
  description: "Wnioskodawca — pojawi się w nagłówku pisma.",
  schema: dluznikSchema,
  Component: StepDluznik as WizardStepDefinition["Component"],
  next: () => "wierzyciel",
};

const stepWierzyciel: WizardStepDefinition = {
  id: "wierzyciel",
  title: "Wierzyciel",
  description: "Bank, fundusz lub firma windykacyjna — adresat propozycji.",
  schema: wierzycielSchema,
  Component: StepWierzyciel as WizardStepDefinition["Component"],
  next: () => "zobowiazanie",
};

const stepZobowiazanie: WizardStepDefinition = {
  id: "zobowiazanie",
  title: "Zobowiązanie",
  description: "Numer umowy, sygnatura, kwota zadłużenia.",
  schema: zobowiazanieSchema,
  Component: StepZobowiazanie as WizardStepDefinition["Component"],
  next: () => "propozycja",
};

const stepPropozycja: WizardStepDefinition = {
  id: "propozycja",
  title: "Propozycja",
  description: "Szczegóły propozycji — zależnie od wybranego wariantu.",
  schema: propozycjaSchema,
  Component: StepPropozycja as WizardStepDefinition["Component"],
  next: () => "sytuacja",
};

const stepSytuacja: WizardStepDefinition = {
  id: "sytuacja",
  title: "Uzasadnienie",
  description: "Sytuacja życiowa i okoliczności wzmacniające propozycję.",
  schema: sytuacjaSchema,
  Component: StepSytuacja as WizardStepDefinition["Component"],
  next: () => "review",
};

const stepReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: ugodaReviewSchema,
  Component: StepReview as WizardStepDefinition["Component"],
  next: () => null,
};

const STEPS: WizardStepDefinition[] = [
  stepWariant,
  stepDluznik,
  stepWierzyciel,
  stepZobowiazanie,
  stepPropozycja,
  stepSytuacja,
  stepReview,
];

export const ugodaWizardRaty: WizardDefinition = {
  caseType: "ugoda_raty",
  startStepId: "wariant",
  steps: STEPS,
};

export const ugodaWizardUmorzenie: WizardDefinition = {
  caseType: "ugoda_umorzenie",
  startStepId: "wariant",
  steps: STEPS,
};

export const ugodaWizardPropozycja: WizardDefinition = {
  caseType: "ugoda_propozycja",
  startStepId: "wariant",
  steps: STEPS,
};
