"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  zarzutySchema,
  ZARZUTY_OPTIONS,
  type ZarzutyValues,
} from "../schemas";

export function StepZarzuty({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<ZarzutyValues>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ZarzutyValues>({
    resolver: zodResolver(zarzutySchema),
    defaultValues: {
      zarzuty: (defaultValues.zarzuty as ZarzutyValues["zarzuty"]) ?? [],
      okolicznosci: defaultValues.okolicznosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-6"
      noValidate
    >
      <FormField
        label="Zarzuty"
        hint="Zaznacz wszystkie, które dotyczą Twojej sprawy. Sąd rozpatrzy każdy z nich osobno."
        error={errors.zarzuty?.message as string | undefined}
        htmlFor="zarzuty"
        required
      >
        <Controller
          control={control}
          name="zarzuty"
          render={({ field }) => {
            const selected = new Set<string>(field.value ?? []);
            const toggle = (id: string) => {
              const next = new Set(selected);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              field.onChange(Array.from(next));
            };
            return (
              <ul className="space-y-2" id="zarzuty">
                {ZARZUTY_OPTIONS.map((opt) => {
                  const checked = selected.has(opt.id);
                  return (
                    <li key={opt.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                          "hover:border-dlugomat-400 focus-within:ring-2 focus-within:ring-dlugomat-500/40",
                          checked
                            ? "border-dlugomat-500 bg-dlugomat-50/60 dark:border-dlugomat-400 dark:bg-dlugomat-950/40"
                            : "border-ink-200 dark:border-ink-800",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 accent-dlugomat-600"
                          checked={checked}
                          onChange={() => toggle(opt.id)}
                        />
                        <span className="space-y-1">
                          <span className="block text-fluid-sm font-medium text-ink-900 dark:text-ink-50">
                            {opt.label}
                          </span>
                          <span className="block text-fluid-xs text-ink-600 dark:text-ink-400">
                            {opt.helper}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        />
      </FormField>

      <FormField
        label="Okoliczności (opcjonalnie)"
        hint="Krótko opisz sytuację — co wydarzyło się przed otrzymaniem nakazu. Ta sekcja zostanie użyta w uzasadnieniu."
        error={errors.okolicznosci?.message}
        htmlFor="okolicznosci"
      >
        <textarea
          id="okolicznosci"
          rows={5}
          maxLength={2000}
          className={cn(
            "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-fluid-sm text-ink-900",
            "placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dlugomat-500/40",
            "dark:border-ink-800 dark:bg-ink-950 dark:text-ink-50",
          )}
          placeholder="Np. brak umowy z powodem, zapłaciłem(-am) całość 2 lata temu…"
          {...register("okolicznosci")}
        />
      </FormField>

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
