/**
 * D6 CesjaCheck — definicja wizarda (linearny graf, 1 case_type).
 *
 * Mapowanie: cesja_odpowiedz → cesjaWizard
 *
 * Krok po kroku:
 *   dluznik → fundusz → wezwanie → wierzytelnosc → zarzuty → review
 */
import type {
  WizardDefinition,
  WizardStepDefinition,
} from "@/lib/wizard/wizard-types";

import {
  cesjaReviewSchema,
  dluznikSchema,
  funduszSchema,
  wezwanieSchema,
  wierzytelnoscSchema,
  zarzutySchema,
} from "./schemas";
import { StepDluznik } from "./steps/step-dluznik";
import { StepFundusz } from "./steps/step-fundusz";
import { StepReview } from "./steps/step-review";
import { StepWezwanie } from "./steps/step-wezwanie";
import { StepWierzytelnosc } from "./steps/step-wierzytelnosc";
import { StepZarzuty } from "./steps/step-zarzuty";

const stepDluznik: WizardStepDefinition = {
  id: "dluznik",
  title: "Twoje dane",
  description: "Dane wnioskodawcy — pojawią się w nagłówku odpowiedzi.",
  schema: dluznikSchema,
  Component: StepDluznik as WizardStepDefinition["Component"],
  next: () => "fundusz",
};

const stepFundusz: WizardStepDefinition = {
  id: "fundusz",
  title: "Fundusz / windykator",
  description: "Adresat odpowiedzi — fundusz sekurytyzacyjny lub firma windykacyjna.",
  schema: funduszSchema,
  Component: StepFundusz as WizardStepDefinition["Component"],
  next: () => "wezwanie",
};

const stepWezwanie: WizardStepDefinition = {
  id: "wezwanie",
  title: "Wezwanie",
  description: "Data wezwania, sygnatura sprawy funduszu, kwota dochodzona.",
  schema: wezwanieSchema,
  Component: StepWezwanie as WizardStepDefinition["Component"],
  next: () => "wierzytelnosc",
};

const stepWierzytelnosc: WizardStepDefinition = {
  id: "wierzytelnosc",
  title: "Pierwotna wierzytelność",
  description: "Pierwotny wierzyciel, numer umowy, data wymagalności.",
  schema: wierzytelnoscSchema,
  Component: StepWierzytelnosc as WizardStepDefinition["Component"],
  next: () => "zarzuty",
};

const stepZarzuty: WizardStepDefinition = {
  id: "zarzuty",
  title: "Zarzuty",
  description: "Brak dokumentacji, przedawnienie, błędna kwota itd.",
  schema: zarzutySchema,
  Component: StepZarzuty as WizardStepDefinition["Component"],
  next: () => "review",
};

const stepReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: cesjaReviewSchema,
  Component: StepReview as WizardStepDefinition["Component"],
  next: () => null,
};

export const cesjaWizard: WizardDefinition = {
  caseType: "cesja_odpowiedz",
  startStepId: "dluznik",
  steps: [
    stepDluznik,
    stepFundusz,
    stepWezwanie,
    stepWierzytelnosc,
    stepZarzuty,
    stepReview,
  ],
};
