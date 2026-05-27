/**
 * D9 — Pełny wniosek o upadłość konsumencką (KRS-FORM-UPK1).
 *
 * Wizard rozszerzony — 11 kroków = 8 D8 (Upadłość-Lite) + 3 D9-specific:
 *
 *   1. dluznik
 *   2. sad
 *   3. sytuacja_zawodowa
 *   4. majatek
 *   5. wierzyciele
 *   6. niewyplacalnosc
 *   7. dochody_historyczne       ← D9 only (Pr.up. art. 491² ust. 1)
 *   8. plan_splaty               ← D9 only (Pr.up. art. 491¹⁴)
 *   9. uzasadnienie              ← D9 only (Pr.up. art. 491² ust. 4)
 *  10. zalaczniki
 *  11. review
 *
 * Decyzja architektoniczna: D9 NIE duplikuje schematów ani komponentów D8.
 * Reusuje 8 step-ów D8 1:1 i dodaje 3 nowe. Template generowania pisma
 * (lib/documents/templates/upadlosc.ts) dostanie wariant `pelny` decydujący
 * o tym, które sekcje renderować w DOCX/PDF.
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
  dochodyHistoryczneSchema,
  planSplatySchema,
  uzasadnienieSchema,
} from "./schemas";

import { StepDluznik } from "./steps/step-dluznik";
import { StepMajatek } from "./steps/step-majatek";
import { StepNiewyplacalnosc } from "./steps/step-niewyplacalnosc";
import { StepReview } from "./steps/step-review";
import { StepSad } from "./steps/step-sad";
import { StepSytuacjaZawodowa } from "./steps/step-sytuacja-zawodowa";
import { StepWierzyciele } from "./steps/step-wierzyciele";
import { StepZalaczniki } from "./steps/step-zalaczniki";
import { StepDochodyHistoryczne } from "./steps/step-dochody-historyczne";
import { StepPlanSplaty } from "./steps/step-plan-splaty";
import { StepUzasadnienie } from "./steps/step-uzasadnienie";

const steps: WizardStepDefinition[] = [
  {
    id: "dluznik",
    title: "Twoje dane",
    description: "Wnioskodawca — dane do nagłówka wniosku.",
    schema: dluznikSchema,
    Component: StepDluznik as WizardStepDefinition["Component"],
    next: () => "sad",
  },
  {
    id: "sad",
    title: "Sąd właściwy",
    description: "Sąd rejonowy wg miejsca zwykłego pobytu.",
    schema: sadSchema,
    Component: StepSad as WizardStepDefinition["Component"],
    next: () => "sytuacja_zawodowa",
  },
  {
    id: "sytuacja_zawodowa",
    title: "Sytuacja zawodowa",
    description: "Status zawodowy, dochód bieżący, osoby na utrzymaniu.",
    schema: sytuacjaZawodowaSchema,
    Component: StepSytuacjaZawodowa as WizardStepDefinition["Component"],
    next: () => "majatek",
  },
  {
    id: "majatek",
    title: "Majątek",
    description: "Wykaz majątku — nieruchomości, pojazdy, środki, inne składniki.",
    schema: majatekSchema,
    Component: StepMajatek as WizardStepDefinition["Component"],
    next: () => "wierzyciele",
  },
  {
    id: "wierzyciele",
    title: "Wierzyciele",
    description: "Spis wierzycieli — banki, fundusze, ZUS, osoby fizyczne.",
    schema: wierzycieleSchema,
    Component: StepWierzyciele as WizardStepDefinition["Component"],
    next: () => "niewyplacalnosc",
  },
  {
    id: "niewyplacalnosc",
    title: "Niewypłacalność",
    description: "Przyczyny utraty zdolności do regulowania zobowiązań.",
    schema: niewyplacalnoscSchema,
    Component: StepNiewyplacalnosc as WizardStepDefinition["Component"],
    next: () => "dochody_historyczne",
  },
  // ---------- D9 only ----------------------------------------------------
  {
    id: "dochody_historyczne",
    title: "Dochody — 12 miesięcy",
    description: "Historia dochodów wymagana przez art. 491² Pr.up.",
    schema: dochodyHistoryczneSchema,
    Component: StepDochodyHistoryczne as WizardStepDefinition["Component"],
    next: () => "plan_splaty",
  },
  {
    id: "plan_splaty",
    title: "Plan spłaty",
    description: "Proponowana rata miesięczna i okres planu (standard 36 mc).",
    schema: planSplatySchema,
    Component: StepPlanSplaty as WizardStepDefinition["Component"],
    next: () => "uzasadnienie",
  },
  {
    id: "uzasadnienie",
    title: "Uzasadnienie szczegółowe",
    description: "Okoliczności, próby polubowne, sytuacja rodzinna.",
    schema: uzasadnienieSchema,
    Component: StepUzasadnienie as WizardStepDefinition["Component"],
    next: () => "zalaczniki",
  },
  // ---------- back to shared ---------------------------------------------
  {
    id: "zalaczniki",
    title: "Załączniki",
    description: "Lista dokumentów dołączanych do wniosku.",
    schema: zalacznikiSchema,
    Component: StepZalaczniki as WizardStepDefinition["Component"],
    next: () => "review",
  },
  {
    id: "review",
    title: "Podsumowanie",
    description: "Sprawdź dane i wygeneruj pełny wniosek.",
    schema: upadloscReviewSchema,
    Component: StepReview as WizardStepDefinition["Component"],
    next: () => null,
  },
];

export const upadloscPelnyWizard: WizardDefinition = {
  caseType: "upadlosc_pelny_wniosek",
  startStepId: "dluznik",
  steps,
};
