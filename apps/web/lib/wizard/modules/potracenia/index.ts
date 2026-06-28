/**
 * D4 PotrąceniaStop — definicja wizarda z conditional graph.
 *
 * Graf zależy od wybranego wariantu:
 *   wniosek_pracodawca: wariant → wnioskodawca → zatrudnienie → potracenie
 *                       → sytuacja → review
 *   wniosek_komornik:   wariant → wnioskodawca → zatrudnienie → potracenie
 *                       → sytuacja → komornik → review
 *
 * Czyli: krok `komornik` jest skipowany dla wariantu `wniosek_pracodawca`.
 *
 * Mapowanie wariantu na case_type:
 *   wniosek_pracodawca → potracenia_wniosek_pracodawca
 *   wniosek_komornik   → potracenia_wniosek_komornik
 *
 * Ten sam zestaw STEPS rejestrujemy pod 2 case_type w wizard-registry —
 * każda sprawa potrąceniowa ma własny case_type, ale dzielą definicję wizarda.
 */
import type {
  WizardDefinition,
  WizardStepDefinition,
} from "@/lib/wizard/wizard-types";

import {
  komornikSchema,
  potracenieSchema,
  potraceniaReviewSchema,
  sytuacjaSchema,
  wariantSchema,
  wnioskodawcaSchema,
  zatrudnienieSchema,
} from "./schemas";
import { StepKomornik } from "./steps/step-komornik";
import { StepPotracenie } from "./steps/step-potracenie";
import { StepReview } from "./steps/step-review";
import { StepSytuacja } from "./steps/step-sytuacja";
import { StepWariant } from "./steps/step-wariant";
import { StepWnioskodawca } from "./steps/step-wnioskodawca";
import { StepZatrudnienie } from "./steps/step-zatrudnienie";

const stepWariant: WizardStepDefinition = {
  id: "wariant",
  title: "Wariant",
  description: "Komu kierujemy pismo — pracodawcy czy komornikowi?",
  schema: wariantSchema,
  Component: StepWariant as WizardStepDefinition["Component"],
  next: () => "wnioskodawca",
};

const stepWnioskodawca: WizardStepDefinition = {
  id: "wnioskodawca",
  title: "Twoje dane",
  description: "Dane wnioskodawcy — pojawią się w nagłówku pisma.",
  schema: wnioskodawcaSchema,
  Component: StepWnioskodawca as WizardStepDefinition["Component"],
  next: () => "zatrudnienie",
};

const stepZatrudnienie: WizardStepDefinition = {
  id: "zatrudnienie",
  title: "Zatrudnienie",
  description: "Pracodawca, forma umowy i wynagrodzenie netto.",
  schema: zatrudnienieSchema,
  Component: StepZatrudnienie as WizardStepDefinition["Component"],
  next: () => "potracenie",
};

const stepPotracenie: WizardStepDefinition = {
  id: "potracenie",
  title: "Potrącenie",
  description: "Typ potrącenia, kwota, procent wynagrodzenia.",
  schema: potracenieSchema,
  Component: StepPotracenie as WizardStepDefinition["Component"],
  next: () => "sytuacja",
};

const stepSytuacja: WizardStepDefinition = {
  id: "sytuacja",
  title: "Sytuacja życiowa",
  description: "Okoliczności wpływające na argumentację wniosku.",
  schema: sytuacjaSchema,
  Component: StepSytuacja as WizardStepDefinition["Component"],
  next: (answers) =>
    answers.variant === "wniosek_komornik" ? "komornik" : "review",
};

const stepKomornik: WizardStepDefinition = {
  id: "komornik",
  title: "Komornik",
  description: "Sygnatura Km i dane kancelarii — do nagłówka pisma.",
  schema: komornikSchema,
  Component: StepKomornik as WizardStepDefinition["Component"],
  skipIf: (answers) => answers.variant !== "wniosek_komornik",
  next: () => "review",
};

const stepReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: potraceniaReviewSchema,
  Component: StepReview as WizardStepDefinition["Component"],
  next: () => null,
};

const STEPS: WizardStepDefinition[] = [
  stepWariant,
  stepWnioskodawca,
  stepZatrudnienie,
  stepPotracenie,
  stepSytuacja,
  stepKomornik,
  stepReview,
];

export const potraceniaWizardPracodawca: WizardDefinition = {
  caseType: "potracenia_wniosek_pracodawca",
  startStepId: "wariant",
  steps: STEPS,
};

export const potraceniaWizardKomornik: WizardDefinition = {
  caseType: "potracenia_wniosek_komornik",
  startStepId: "wariant",
  steps: STEPS,
};
