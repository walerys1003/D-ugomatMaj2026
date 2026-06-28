/**
 * D2 Sprzeciw EPU — definicja wizarda.
 *
 * Linearny graf 5 kroków:
 *   start → nakaz → strony → kwoty → zarzuty → review → (submit)
 */
import type { WizardDefinition, WizardStepDefinition } from "@/lib/wizard/wizard-types";

import {
  kwotySchema,
  nakazSchema,
  reviewSchema,
  stronySchema,
  zarzutySchema,
} from "./schemas";
import { StepKwoty } from "./steps/step-kwoty";
import { StepNakaz } from "./steps/step-nakaz";
import { StepReview } from "./steps/step-review";
import { StepStrony } from "./steps/step-strony";
import { StepZarzuty } from "./steps/step-zarzuty";

const stepNakaz: WizardStepDefinition = {
  id: "nakaz",
  title: "Nakaz",
  description: "Sygnatura, sąd i daty z otrzymanego pisma.",
  schema: nakazSchema,
  Component: StepNakaz as WizardStepDefinition["Component"],
  next: () => "strony",
};

const stepStrony: WizardStepDefinition = {
  id: "strony",
  title: "Strony",
  description: "Dane powoda (wierzyciela) i Twoje.",
  schema: stronySchema,
  Component: StepStrony as WizardStepDefinition["Component"],
  next: () => "kwoty",
};

const stepKwoty: WizardStepDefinition = {
  id: "kwoty",
  title: "Kwoty",
  description: "Należność główna, odsetki, koszty.",
  schema: kwotySchema,
  Component: StepKwoty as WizardStepDefinition["Component"],
  next: () => "zarzuty",
};

const stepZarzuty: WizardStepDefinition = {
  id: "zarzuty",
  title: "Zarzuty",
  description: "Wskaż podstawy sprzeciwu — kluczowy krok.",
  schema: zarzutySchema,
  Component: StepZarzuty as WizardStepDefinition["Component"],
  next: () => "review",
};

const stepReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: reviewSchema,
  Component: StepReview as WizardStepDefinition["Component"],
  next: () => null,
};

export const sprzeciwEpuWizard: WizardDefinition = {
  caseType: "sprzeciw_epu",
  startStepId: "nakaz",
  steps: [stepNakaz, stepStrony, stepKwoty, stepZarzuty, stepReview],
};
