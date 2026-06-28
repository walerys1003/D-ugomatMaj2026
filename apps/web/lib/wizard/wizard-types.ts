/**
 * Wizard engine — typy fundamentalne.
 *
 * Wizard = skończony, deterministyczny graf kroków per case_type.
 * Każdy krok ma:
 *   - id (string slug)
 *   - title (Polish, dla UI)
 *   - schema (Zod) — walidacja odpowiedzi
 *   - render (React) — komponent kroku
 *   - next(answers) — funkcja przejścia (linear lub branching)
 *
 * Konwencja: ostatni krok wraca id = "review", po nim transition do "submit".
 */
import type { ComponentType } from "react";
import type { z } from "zod";
import type { CaseType, WizardState } from "@/lib/db/types";

export interface WizardStepDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string;
  title: string;
  description?: string;
  schema: TSchema;
  /** Render formularza dla kroku. Otrzymuje aktualne odpowiedzi. */
  Component: ComponentType<WizardStepProps<z.infer<TSchema>>>;
  /** Wynik next: id następnego kroku lub null jeśli koniec wizarda. */
  next: (answers: Record<string, unknown>) => string | null;
  /** Optional: czy krok można pominąć w bieżącym kontekście. */
  skipIf?: (answers: Record<string, unknown>) => boolean;
}

export interface WizardStepProps<TValues> {
  caseId: string;
  defaultValues: Partial<TValues>;
  onSubmit: (values: TValues) => Promise<void> | void;
  onBack?: () => void;
  isSaving: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface WizardDefinition {
  caseType: CaseType;
  startStepId: string;
  steps: WizardStepDefinition[];
}

export interface WizardSnapshot {
  caseId: string;
  caseType: CaseType;
  state: WizardState;
}
