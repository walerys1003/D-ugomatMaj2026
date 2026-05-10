/**
 * D8 Upadłość-Lite — definicja wizarda (linearny graf, 8 kroków).
 *
 * 1 case_type: upadlosc_wniosek
 *
 * Krok po kroku:
 *   dluznik → sad → sytuacja_zawodowa → majatek → wierzyciele
 *   → niewyplacalnosc → zalaczniki → review
 */
import type {
  WizardDefinition,
  WizardStepDefinition,
} from "@/lib/wizard/wizard-types";

import {
  dluznikSchema,
  majatekSchema,
  niewyplacalnoscSchema,
  sadSchema,
  sytuacjaZawodowaSchema,
  upadloscReviewSchema,
  wierzycieleSchema,
  zalacznikiSchema,
} from "./schemas";
import { StepDluznik } from "./steps/step-dluznik";
import { StepMajatek } from "./steps/step-majatek";
import { StepNiewyplacalnosc } from "./steps/step-niewyplacalnosc";
import { StepReview } from "./steps/step-review";
import { StepSad } from "./steps/step-sad";
import { StepSytuacjaZawodowa } from "./steps/step-sytuacja-zawodowa";
import { StepWierzyciele } from "./steps/step-wierzyciele";
import { StepZalaczniki } from "./steps/step-zalaczniki";

const stepDluznik: WizardStepDefinition = {
  id: "dluznik",
  title: "Twoje dane",
  description: "Wnioskodawca — dane do nagłówka wniosku.",
  schema: dluznikSchema,
  Component: StepDluznik as WizardStepDefinition["Component"],
  next: () => "sad",
};

const stepSad: WizardStepDefinition = {
  id: "sad",
  title: "Sąd właściwy",
  description: "Sąd rejonowy wg miejsca zwykłego pobytu.",
  schema: sadSchema,
  Component: StepSad as WizardStepDefinition["Component"],
  next: () => "sytuacja_zawodowa",
};

const stepSytuacjaZawodowa: WizardStepDefinition = {
  id: "sytuacja_zawodowa",
  title: "Sytuacja zawodowa",
  description: "Status zawodowy, dochód, osoby na utrzymaniu.",
  schema: sytuacjaZawodowaSchema,
  Component: StepSytuacjaZawodowa as WizardStepDefinition["Component"],
  next: () => "majatek",
};

const stepMajatek: WizardStepDefinition = {
  id: "majatek",
  title: "Majątek",
  description: "Wykaz majątku — nieruchomości, pojazdy, środki, inne składniki.",
  schema: majatekSchema,
  Component: StepMajatek as WizardStepDefinition["Component"],
  next: () => "wierzyciele",
};

const stepWierzyciele: WizardStepDefinition = {
  id: "wierzyciele",
  title: "Wierzyciele",
  description: "Spis wierzycieli — banki, fundusze, ZUS, osoby fizyczne.",
  schema: wierzycieleSchema,
  Component: StepWierzyciele as WizardStepDefinition["Component"],
  next: () => "niewyplacalnosc",
};

const stepNiewyplacalnosc: WizardStepDefinition = {
  id: "niewyplacalnosc",
  title: "Niewypłacalność",
  description: "Przyczyny utraty zdolności do regulowania zobowiązań.",
  schema: niewyplacalnoscSchema,
  Component: StepNiewyplacalnosc as WizardStepDefinition["Component"],
  next: () => "zalaczniki",
};

const stepZalaczniki: WizardStepDefinition = {
  id: "zalaczniki",
  title: "Załączniki",
  description: "Lista dokumentów dołączanych do wniosku.",
  schema: zalacznikiSchema,
  Component: StepZalaczniki as WizardStepDefinition["Component"],
  next: () => "review",
};

const stepReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: upadloscReviewSchema,
  Component: StepReview as WizardStepDefinition["Component"],
  next: () => null,
};

const STEPS: WizardStepDefinition[] = [
  stepDluznik,
  stepSad,
  stepSytuacjaZawodowa,
  stepMajatek,
  stepWierzyciele,
  stepNiewyplacalnosc,
  stepZalaczniki,
  stepReview,
];

export const upadloscWizard: WizardDefinition = {
  caseType: "upadlosc_wniosek",
  startStepId: "dluznik",
  steps: STEPS,
};
