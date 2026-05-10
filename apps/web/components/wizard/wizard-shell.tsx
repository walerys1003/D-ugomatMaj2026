"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn, formatDateTimePL } from "@/lib/utils";
import { useWizardAutosave } from "@/lib/wizard/use-wizard-autosave";
import type {
  WizardDefinition,
  WizardSnapshot,
} from "@/lib/wizard/wizard-types";
import type { WizardState } from "@/lib/db/types";

import { WizardProgress } from "./wizard-progress";

interface Props {
  definition: WizardDefinition;
  snapshot: WizardSnapshot;
  /**
   * Wywoływane gdy user przeszedł przez ostatni krok i potwierdził.
   * Implementacja musi:
   *   1) zapisać answers do metadata,
   *   2) zmienić status sprawy na 'analysis',
   *   3) wygenerować dokument (Tier 2: static template, Tier 3: AI),
   *   4) przekierować lub odświeżyć widok.
   */
  onSubmit: (allAnswers: Record<string, unknown>) => Promise<void>;
}

export function WizardShell({ definition, snapshot, onSubmit }: Props) {
  const { save, status, lastSavedAt } = useWizardAutosave({
    caseId: snapshot.caseId,
  });

  const [answers, setAnswers] = useState<Record<string, unknown>>(
    () => snapshot.state.answers ?? {},
  );
  const [completed, setCompleted] = useState<string[]>(
    () => snapshot.state.completed_steps ?? [],
  );
  const [currentStepId, setCurrentStepId] = useState<string>(() => {
    const initial = snapshot.state.current_step;
    const known = definition.steps.some((s) => s.id === initial);
    return known ? initial : definition.startStepId;
  });
  const [submitting, setSubmitting] = useState(false);

  const currentIdx = definition.steps.findIndex((s) => s.id === currentStepId);
  const currentStep = definition.steps[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === definition.steps.length - 1;

  const persist = useCallback(
    (nextAnswers: Record<string, unknown>, nextStepId: string, nextCompleted: string[]) => {
      const wizardState: WizardState = {
        current_step: nextStepId,
        completed_steps: nextCompleted,
        answers: nextAnswers as WizardState["answers"],
        last_saved_at: null,
      };
      save(wizardState);
    },
    [save],
  );

  const handleStepSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const nextAnswers = { ...answers, ...values };
      const nextCompleted = Array.from(new Set([...completed, currentStepId]));

      if (isLast) {
        // ostatni krok — przekaż do ownera (zazwyczaj submitCaseAction)
        setSubmitting(true);
        try {
          // zapisz finalny stan PRZED submit, żeby na backendzie mieć aktualne answers
          persist(nextAnswers, currentStepId, nextCompleted);
          await onSubmit(nextAnswers);
        } finally {
          setSubmitting(false);
        }
        return;
      }

      const nextId = currentStep.next(nextAnswers);
      if (!nextId) return;

      setAnswers(nextAnswers);
      setCompleted(nextCompleted);
      setCurrentStepId(nextId);
      persist(nextAnswers, nextId, nextCompleted);
    },
    [answers, completed, currentStep, currentStepId, isLast, onSubmit, persist],
  );

  const handleBack = useCallback(() => {
    if (isFirst) return;
    const prev = definition.steps[currentIdx - 1];
    setCurrentStepId(prev.id);
    persist(answers, prev.id, completed);
  }, [answers, completed, currentIdx, definition.steps, isFirst, persist]);

  // dynamic Component rendering — review needs allAnswers
  const StepComponent = currentStep.Component;
  const stepProps = useMemo(
    () => ({
      caseId: snapshot.caseId,
      defaultValues: answers as never,
      onSubmit: handleStepSubmit,
      onBack: handleBack,
      isSaving: submitting,
      isFirst,
      isLast,
      // Review extra prop:
      allAnswers: answers,
    }),
    [answers, handleBack, handleStepSubmit, isFirst, isLast, snapshot.caseId, submitting],
  );

  return (
    <section
      className="space-y-6"
      aria-labelledby="wizard-heading"
    >
      <header className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="wizard-heading"
              className="font-serif text-fluid-2xl text-iron-900 dark:text-iron-50"
            >
              {currentStep.title}
            </h2>
            {currentStep.description && (
              <p className="text-fluid-sm text-iron-600 dark:text-iron-400">
                {currentStep.description}
              </p>
            )}
          </div>
          <SaveIndicator status={status} lastSavedAt={lastSavedAt} />
        </div>
        <WizardProgress
          steps={definition.steps}
          currentStepId={currentStepId}
          completedStepIds={completed}
        />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStepId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-iron-200 bg-white p-6 shadow-card dark:border-iron-800 dark:bg-iron-950"
        >
          {/* @ts-expect-error: Components have varying schema types — wizard registry guarantees runtime compatibility */}
          <StepComponent {...stepProps} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function SaveIndicator({
  status,
  lastSavedAt,
}: {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 text-fluid-xs tabular-nums",
        status === "error"
          ? "text-danger-600 dark:text-danger-400"
          : "text-iron-500 dark:text-iron-400",
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          <span>Zapisuję…</span>
        </>
      )}
      {status === "saved" && lastSavedAt && (
        <>
          <CheckCircle2 className="size-3.5 text-accent-600" aria-hidden />
          <span>Zapisano · {formatDateTimePL(new Date(lastSavedAt))}</span>
        </>
      )}
      {status === "error" && (
        <>
          <CircleAlert className="size-3.5" aria-hidden />
          <span>Zapis nie powiódł się — spróbuj ponownie.</span>
        </>
      )}
      {status === "idle" && <span aria-hidden>&nbsp;</span>}
    </div>
  );
}
