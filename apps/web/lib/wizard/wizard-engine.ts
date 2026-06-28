/**
 * Wizard engine — funkcje pomocnicze do nawigacji po grafie kroków.
 */
import type { WizardDefinition, WizardStepDefinition } from "./wizard-types";

export function findStep(
  def: WizardDefinition,
  stepId: string,
): WizardStepDefinition | null {
  return def.steps.find((s) => s.id === stepId) ?? null;
}

export function findStepIndex(def: WizardDefinition, stepId: string): number {
  return def.steps.findIndex((s) => s.id === stepId);
}

export function getNextStepId(
  def: WizardDefinition,
  current: WizardStepDefinition,
  answers: Record<string, unknown>,
): string | null {
  return current.next(answers);
}

export function getPrevStepId(
  def: WizardDefinition,
  currentId: string,
): string | null {
  const idx = findStepIndex(def, currentId);
  if (idx <= 0) return null;
  return def.steps[idx - 1].id;
}

export function progressForStep(
  def: WizardDefinition,
  stepId: string,
): { current: number; total: number; pct: number } {
  const idx = Math.max(0, findStepIndex(def, stepId));
  const total = def.steps.length;
  const current = idx + 1;
  const pct = Math.round((current / total) * 100);
  return { current, total, pct };
}
