/**
 * D5 BIK-Fix — definicja wizarda z conditional graph.
 *
 * Graf zależy od wybranego wariantu:
 *   reklamacja_bank: wariant → zglaszajacy → wpis → zarzuty → review
 *   reklamacja_bik:  wariant → zglaszajacy → wpis → zarzuty → historia → review
 *   skarga_uodo:     wariant → zglaszajacy → wpis → zarzuty → historia → review
 *
 * Czyli: krok `historia` jest skipowany dla wariantu `reklamacja_bank`.
 *
 * Mapowanie wariantu na case_type:
 *   reklamacja_bank → bik_reklamacja_bank
 *   reklamacja_bik  → bik_reklamacja_bik
 *   skarga_uodo     → bik_skarga_uodo
 *
 * Uwaga: ten wizard rejestrujemy pod 3 różnymi case_type w wizard-registry —
 * każda sprawa BIK ma własny case_type, ale dzielą tę samą definicję wizarda.
 */
import type {
  WizardDefinition,
  WizardStepDefinition,
} from "@/lib/wizard/wizard-types";

import {
  bikReviewSchema,
  bikZarzutySchema,
  historiaSchema,
  wariantSchema,
  wpisSchema,
  zglaszajacySchema,
} from "./schemas";
import { StepBikReview } from "./steps/step-review";
import { StepBikZarzuty } from "./steps/step-zarzuty";
import { StepHistoria } from "./steps/step-historia";
import { StepWariant } from "./steps/step-wariant";
import { StepWpis } from "./steps/step-wpis";
import { StepZglaszajacy } from "./steps/step-zglaszajacy";

const stepWariant: WizardStepDefinition = {
  id: "wariant",
  title: "Wariant",
  description: "Który etap procedury BIK-Fix piszemy?",
  schema: wariantSchema,
  Component: StepWariant as WizardStepDefinition["Component"],
  next: () => "zglaszajacy",
};

const stepZglaszajacy: WizardStepDefinition = {
  id: "zglaszajacy",
  title: "Twoje dane",
  description: "Dane reklamującego — wpiszemy je w nagłówek pisma.",
  schema: zglaszajacySchema,
  Component: StepZglaszajacy as WizardStepDefinition["Component"],
  next: () => "wpis",
};

const stepWpis: WizardStepDefinition = {
  id: "wpis",
  title: "Wpis BIK",
  description: "Bank, numer umowy, kwota i data wpisu.",
  schema: wpisSchema,
  Component: StepWpis as WizardStepDefinition["Component"],
  next: () => "zarzuty",
};

const stepBikZarzuty: WizardStepDefinition = {
  id: "zarzuty",
  title: "Zarzuty",
  description: "Charakter nieprawidłowości — fundament reklamacji.",
  schema: bikZarzutySchema,
  Component: StepBikZarzuty as WizardStepDefinition["Component"],
  next: (answers) =>
    answers.variant === "reklamacja_bank" ? "review" : "historia",
};

const stepHistoria: WizardStepDefinition = {
  id: "historia",
  title: "Historia reklamacji",
  description: "Daty i streszczenia poprzednich pism.",
  schema: historiaSchema,
  Component: StepHistoria as WizardStepDefinition["Component"],
  next: () => "review",
  skipIf: (answers) => answers.variant === "reklamacja_bank",
};

const stepBikReview: WizardStepDefinition = {
  id: "review",
  title: "Podsumowanie",
  description: "Sprawdź dane i wygeneruj pismo.",
  schema: bikReviewSchema,
  Component: StepBikReview as WizardStepDefinition["Component"],
  next: () => null,
};

const STEPS = [
  stepWariant,
  stepZglaszajacy,
  stepWpis,
  stepBikZarzuty,
  stepHistoria,
  stepBikReview,
];

/**
 * Trzy wizardy — każdy pod własnym case_type, ale dzielą identyczne kroki.
 *
 * Powód: w bazie cases.type jest ENUM, a każdy wariant ma osobny prompt
 * template (D5/1, D5/2, D5/3) — łatwiej trzymać 1:1 mapowanie case_type ↔ pismo.
 *
 * Dla user'a — ekran wyboru wariantu po prostu nadpisze startCaseAction
 * tworzącą sprawę o właściwym typie. W MVP traktujemy `bik_reklamacja_bank`
 * jako wariant domyślny (bo logicznie zawsze zaczynamy od kroku 1/3).
 */
export const bikFixWizardBank: WizardDefinition = {
  caseType: "bik_reklamacja_bank",
  startStepId: "wariant",
  steps: STEPS,
};

export const bikFixWizardBik: WizardDefinition = {
  caseType: "bik_reklamacja_bik",
  startStepId: "wariant",
  steps: STEPS,
};

export const bikFixWizardUodo: WizardDefinition = {
  caseType: "bik_skarga_uodo",
  startStepId: "wariant",
  steps: STEPS,
};
