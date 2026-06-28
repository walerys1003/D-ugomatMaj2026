"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  SYTUACJA_ZYCIOWA,
  uzasadnienieSchema,
  type UzasadnienieValues,
} from "../schemas";

export function StepKomornikUzasadnienie({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<UzasadnienieValues>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UzasadnienieValues>({
    resolver: zodResolver(uzasadnienieSchema),
    defaultValues: {
      sytuacja: defaultValues.sytuacja ?? [],
      okolicznosci: defaultValues.okolicznosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <p className="text-fluid-sm text-ink-700">
        Zaznacz wszystkie okoliczności, które Cię dotyczą — to one stanowią
        merytoryczne uzasadnienie wniosku. Możesz dopisać własne szczegóły w
        polu poniżej (max 2000 znaków).
      </p>

      <Controller
        control={control}
        name="sytuacja"
        render={({ field }) => (
          <fieldset>
            <legend className="text-fluid-sm font-medium text-ink-800">
              Twoja sytuacja
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SYTUACJA_ZYCIOWA.map((s) => {
                const active = field.value?.includes(s.id) ?? false;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    onClick={() => {
                      const current = field.value ?? [];
                      field.onChange(
                        active
                          ? current.filter((x) => x !== s.id)
                          : [...current, s.id],
                      );
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-fluid-sm transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
                      active
                        ? "border-shield-500 bg-shield-50/70"
                        : "border-ink-200 bg-white hover:border-shield-300",
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      />

      <FormField
        label="Dodatkowe okoliczności (opcjonalnie)"
        htmlFor="okolicznosci"
        hint="Krótko opisz sytuację — np. utrata pracy, choroba, dziecko na utrzymaniu."
        error={errors.okolicznosci?.message}
      >
        <textarea
          id="okolicznosci"
          rows={5}
          {...register("okolicznosci")}
          className="w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-fluid-sm focus:border-shield-500 focus:outline-none focus:ring-2 focus:ring-shield-500/20 dark:border-ink-700 dark:bg-ink-950"
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}

// BRAMA 4 alias — index.ts imports the short name (`StepUzasadnienie`).
export { StepKomornikUzasadnienie as StepUzasadnienie };
