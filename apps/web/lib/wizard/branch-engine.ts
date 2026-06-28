import "server-only";

/**
 * Tier 7 zad. 309 — Wizard branching engine.
 *
 * Pozwala definiować warunkowe kroki w wizardzie (np. "czy masz dzieci?" →
 * krok o alimentach pokazuje się tylko gdy answer.has_children=true).
 *
 * Format: każdy moduł D2..D16 dostarcza listę WizardStep[]; engine
 * decyduje, które kroki pokazać na podstawie dotychczas zebranych
 * answers (Record<string, Json>).
 *
 * Reguły evaluowane w kolejności:
 *   - skip_if  → ukryj krok jeśli predicate true
 *   - show_if  → pokaż krok tylko jeśli predicate true (default: show)
 *   - branches → dynamiczny next-step po answers
 *
 * Predicate: { answer_key: string; op: "eq"|"neq"|"gt"|"lt"|"in"|"truthy"|"falsy"; value?: Json }
 *
 * Użycie:
 *   const steps = WIZARD_STEPS["sprzeciw_epu"];
 *   const next = nextStep(steps, currentStepId, answers);
 *   const visible = visibleSteps(steps, answers);
 */

import type { Json } from "@/lib/db/types";

export type PredicateOp = "eq" | "neq" | "gt" | "lt" | "in" | "truthy" | "falsy";

export interface Predicate {
  answer_key: string;
  op: PredicateOp;
  value?: Json | Json[];
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  show_if?: Predicate[];
  skip_if?: Predicate[];
  category?: "identity" | "facts" | "claims" | "evidence" | "preferences" | "review";
  estimated_minutes?: number;
}

function evalPredicate(p: Predicate, answers: Record<string, Json>): boolean {
  const v = answers[p.answer_key];
  switch (p.op) {
    case "eq":
      return JSON.stringify(v) === JSON.stringify(p.value);
    case "neq":
      return JSON.stringify(v) !== JSON.stringify(p.value);
    case "gt":
      return typeof v === "number" && typeof p.value === "number" && v > p.value;
    case "lt":
      return typeof v === "number" && typeof p.value === "number" && v < p.value;
    case "in":
      return Array.isArray(p.value) && p.value.some((x) => JSON.stringify(x) === JSON.stringify(v));
    case "truthy":
      return Boolean(v) && v !== "" && v !== "false";
    case "falsy":
      return !v || v === "" || v === "false";
    default:
      return false;
  }
}

function evalAll(preds: Predicate[] | undefined, answers: Record<string, Json>): boolean {
  if (!preds || preds.length === 0) return true;
  return preds.every((p) => evalPredicate(p, answers));
}

export function isStepVisible(step: WizardStep, answers: Record<string, Json>): boolean {
  if (step.skip_if && evalAll(step.skip_if, answers)) return false;
  if (step.show_if && !evalAll(step.show_if, answers)) return false;
  return true;
}

export function visibleSteps(
  steps: WizardStep[],
  answers: Record<string, Json>,
): WizardStep[] {
  return steps.filter((s) => isStepVisible(s, answers));
}

export function nextStep(
  steps: WizardStep[],
  currentStepId: string,
  answers: Record<string, Json>,
): WizardStep | null {
  const visible = visibleSteps(steps, answers);
  const idx = visible.findIndex((s) => s.id === currentStepId);
  if (idx === -1) return visible[0] ?? null;
  return visible[idx + 1] ?? null;
}

export function previousStep(
  steps: WizardStep[],
  currentStepId: string,
  answers: Record<string, Json>,
): WizardStep | null {
  const visible = visibleSteps(steps, answers);
  const idx = visible.findIndex((s) => s.id === currentStepId);
  if (idx <= 0) return null;
  return visible[idx - 1] ?? null;
}

export function progressPercent(
  steps: WizardStep[],
  currentStepId: string,
  answers: Record<string, Json>,
): number {
  const visible = visibleSteps(steps, answers);
  if (visible.length === 0) return 0;
  const idx = visible.findIndex((s) => s.id === currentStepId);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / visible.length) * 100);
}
