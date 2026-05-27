"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  ZAJECIE_TYPY,
  zajecieSchema,
  type ZajecieValues,
} from "../schemas";

export function StepKomornikZajecie({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<ZajecieValues>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ZajecieValues>({
    resolver: zodResolver(zajecieSchema),
    defaultValues: {
      zajecie_typ: defaultValues.zajecie_typ ?? "rachunek_bankowy",
      kwota_dochodzona: defaultValues.kwota_dochodzona ?? 0,
      data_pisma: defaultValues.data_pisma ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <p className="text-fluid-sm text-ink-700">
        Co konkretnie zajął komornik? Od tego zależy podstawa prawna i argumenty
        w piśmie. Jeśli nie jesteś pewien — wybierz „Inne / nie jestem
        pewien(-a)".
      </p>

      <Controller
        control={control}
        name="zajecie_typ"
        render={({ field }) => (
          <fieldset>
            <legend className="text-fluid-sm font-medium text-ink-800">
              Typ zajęcia
            </legend>
            <div role="radiogroup" className="mt-3 grid gap-2 sm:grid-cols-2">
              {ZAJECIE_TYPY.map((t) => {
                const active = field.value === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => field.onChange(t.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-fluid-sm transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
                      active
                        ? "border-shield-500 bg-shield-50/70"
                        : "border-ink-200 bg-white hover:border-shield-300",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            {errors.zajecie_typ?.message && (
              <p role="alert" className="mt-2 text-fluid-sm text-temporal-red-600">
                {errors.zajecie_typ.message}
              </p>
            )}
          </fieldset>
        )}
      />

      <FormField
        label="Kwota dochodzona przez wierzyciela (PLN)"
        htmlFor="kwota_dochodzona"
        hint="Pełna kwota z postanowienia o zajęciu (jeżeli znasz)."
        error={errors.kwota_dochodzona?.message}
      >
        <Input
          id="kwota_dochodzona"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          {...register("kwota_dochodzona")}
        />
      </FormField>

      <FormField
        label="Data pisma od komornika (opcjonalnie)"
        htmlFor="data_pisma"
        hint="Pomocne przy obliczaniu terminów."
        error={errors.data_pisma?.message}
      >
        <Input
          id="data_pisma"
          type="date"
          {...register("data_pisma")}
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

// BRAMA 4 alias — index.ts imports the short name (`StepZajecie`).
export { StepKomornikZajecie as StepZajecie };
