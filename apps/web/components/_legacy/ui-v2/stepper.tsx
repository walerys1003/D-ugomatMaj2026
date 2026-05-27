import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stepper — visualises progress in multi-step flows (wizard, ROI calculator).
 * Renders linearly on >=sm, vertically on mobile.
 */
export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  current: number; // 0-based index
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      aria-label="Postęp kroków"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2",
        className,
      )}
    >
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li
            key={s.id}
            aria-current={state === "active" ? "step" : undefined}
            className="flex flex-1 items-start gap-3 sm:flex-col sm:items-start"
          >
            <div className="flex items-center gap-2 sm:w-full">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 text-fluid-sm font-semibold transition",
                  state === "done" &&
                    "border-accent-500 bg-accent-500 text-white",
                  state === "active" &&
                    "border-dlugomat-700 bg-dlugomat-700 text-white",
                  state === "todo" &&
                    "border-iron-200 bg-white text-iron-500 dark:border-iron-800 dark:bg-iron-950",
                )}
              >
                {state === "done" ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-0.5 flex-1 transition sm:block",
                    state === "done" ? "bg-accent-500" : "bg-iron-200 dark:bg-dlugomat-800",
                  )}
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-fluid-sm font-semibold",
                  state === "todo"
                    ? "text-iron-500"
                    : "text-iron-900 dark:text-iron-50",
                )}
              >
                {s.label}
              </span>
              {s.description ? (
                <span className="text-fluid-xs text-iron-500">
                  {s.description}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
