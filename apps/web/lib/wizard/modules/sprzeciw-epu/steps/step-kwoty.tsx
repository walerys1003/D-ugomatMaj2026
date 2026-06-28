"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { formatPLN } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { kwotySchema, type KwotyValues } from "../schemas";

export function StepKwoty({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<KwotyValues>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<KwotyValues>({
    resolver: zodResolver(kwotySchema),
    defaultValues: {
      kwota_glowna: defaultValues.kwota_glowna ?? 0,
      kwota_odsetki: defaultValues.kwota_odsetki ?? 0,
      kwota_koszty: defaultValues.kwota_koszty ?? 0,
    },
  });

  const watched = useWatch({ control });
  const total =
    Number(watched.kwota_glowna ?? 0) +
    Number(watched.kwota_odsetki ?? 0) +
    Number(watched.kwota_koszty ?? 0);

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <FormField
        label="Kwota główna"
        hint="Należność główna z nakazu (bez odsetek i kosztów)."
        error={errors.kwota_glowna?.message}
        htmlFor="kwota_glowna"
        required
      >
        <Input
          id="kwota_glowna"
          type="number"
          step="0.01"
          min={0}
          inputMode="decimal"
          autoFocus
          {...register("kwota_glowna")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Odsetki"
          error={errors.kwota_odsetki?.message}
          htmlFor="kwota_odsetki"
        >
          <Input
            id="kwota_odsetki"
            type="number"
            step="0.01"
            min={0}
            inputMode="decimal"
            {...register("kwota_odsetki")}
          />
        </FormField>
        <FormField
          label="Koszty"
          error={errors.kwota_koszty?.message}
          htmlFor="kwota_koszty"
        >
          <Input
            id="kwota_koszty"
            type="number"
            step="0.01"
            min={0}
            inputMode="decimal"
            {...register("kwota_koszty")}
          />
        </FormField>
      </div>

      <div
        className="flex items-baseline justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-800 dark:bg-ink-900"
        aria-live="polite"
      >
        <span className="text-fluid-sm text-ink-600 dark:text-ink-400">
          Razem
        </span>
        <span className="text-fluid-lg font-semibold tabular-nums text-ink-900 dark:text-ink-50">
          {formatPLN(total)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          Wstecz
        </Button>
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
