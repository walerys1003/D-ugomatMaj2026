"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { WizardStepDefinition } from "@/lib/wizard/wizard-types";

interface Props {
  steps: WizardStepDefinition[];
  currentStepId: string;
  completedStepIds: string[];
}

/**
 * Tarcza-style stepper. Calm, monochromatyczny, z tabular-nums numeracją.
 * Bez szybkich animacji — tylko subtelny fade na zmianie stanu.
 */
export function WizardProgress({
  steps,
  currentStepId,
  completedStepIds,
}: Props) {
  const completed = new Set(completedStepIds);
  const currentIdx = steps.findIndex((s) => s.id === currentStepId);

  return (
    <ol
      className="flex flex-wrap items-center gap-x-2 gap-y-3 text-fluid-xs"
      aria-label="Postęp kreatora"
    >
      {steps.map((step, idx) => {
        const isDone = completed.has(step.id);
        const isCurrent = step.id === currentStepId;
        const isFuture = idx > currentIdx && !isDone;
        return (
          <li
            key={step.id}
            className="flex items-center gap-2"
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-fluid-xs font-semibold tabular-nums transition-colors",
                isDone &&
                  "border-accent-500 bg-accent-500 text-white",
                isCurrent &&
                  "border-dlugomat-600 bg-dlugomat-600 text-white",
                isFuture &&
                  "border-iron-300 bg-white text-iron-500 dark:border-iron-700 dark:bg-iron-900 dark:text-iron-400",
              )}
            >
              {isDone ? <Check className="size-3.5" aria-hidden /> : idx + 1}
            </span>
            <span
              className={cn(
                "hidden whitespace-nowrap sm:inline",
                isCurrent
                  ? "font-medium text-iron-900 dark:text-iron-50"
                  : "text-iron-500 dark:text-iron-400",
              )}
            >
              {step.title}
            </span>
            {idx < steps.length - 1 && (
              <span
                aria-hidden
                className="hidden h-px w-6 bg-iron-300 dark:bg-iron-700 sm:inline-block"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
