import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ReasoningTrace — wizualizacja rozumowania prawniczego IRAC
 * (Issue–Rule–Application–Conclusion). Redesign 02 §5.2, 03 §6 (AIEdge),
 * 04 §8 (tab „Analiza" na stronie sprawy).
 *
 * Konsumuje wynik `api/ai/irac` (docs/redesign/01 §2). Pokazuje, że Długomat
 * „myśli jak prawnik", nie generuje ściany tekstu — wyróżnik vs konkurencja.
 *
 * Tokeny kanoniczne wyłącznie.
 */

export interface IracStep {
  /** Etykieta kroku: Kwestia / Przepis / Zastosowanie / Wniosek */
  phase: "issue" | "rule" | "application" | "conclusion";
  text: string;
}

export interface ReasoningTraceProps {
  steps?: IracStep[];
  className?: string;
}

const PHASE_META: Record<
  IracStep["phase"],
  { label: string; short: string; dot: string; accent: string }
> = {
  issue: {
    label: "Kwestia",
    short: "I",
    dot: "bg-dlugomat-500",
    accent: "text-dlugomat-700 dark:text-dlugomat-300",
  },
  rule: {
    label: "Przepis",
    short: "R",
    dot: "bg-dlugomat-600",
    accent: "text-dlugomat-700 dark:text-dlugomat-300",
  },
  application: {
    label: "Zastosowanie",
    short: "A",
    dot: "bg-warn-500",
    accent: "text-warn-600 dark:text-warn-500",
  },
  conclusion: {
    label: "Wniosek",
    short: "C",
    dot: "bg-accent-500",
    accent: "text-accent-700 dark:text-accent-300",
  },
};

const DEFAULT_STEPS: IracStep[] = [
  { phase: "issue", text: "Czy roszczenie z nakazu uległo przedawnieniu przed wniesieniem pozwu?" },
  { phase: "rule", text: "Art. 118 k.c. — termin przedawnienia dla roszczeń o świadczenia okresowe wynosi 3 lata." },
  {
    phase: "application",
    text: "Wymagalność roszczenia nastąpiła ponad 3 lata przed datą pozwu w EPU; brak czynności przerywających bieg terminu.",
  },
  { phase: "conclusion", text: "Zarzut przedawnienia jest skuteczny — wnosimy o oddalenie powództwa." },
];

export function ReasoningTrace({ steps = DEFAULT_STEPS, className }: ReasoningTraceProps) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {steps.map((step, i) => {
        const meta = PHASE_META[step.phase];
        const last = i === steps.length - 1;
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {/* linia łącząca */}
            {!last ? (
              <span
                aria-hidden
                className="absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-px bg-ink-200"
              />
            ) : null}
            {/* dot z literą fazy */}
            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                meta.dot
              )}
              aria-hidden
            >
              {meta.short}
            </span>
            <div className="min-w-0 pt-0.5">
              <span
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-[0.05em]",
                  meta.accent
                )}
              >
                {meta.label}
              </span>
              <p className="mt-0.5 text-[14px] leading-relaxed text-ink-700">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
