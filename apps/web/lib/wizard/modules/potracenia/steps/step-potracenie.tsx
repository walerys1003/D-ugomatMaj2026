"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  POTRACENIE_TYPY,
  potracenieSchema,
  type PotracenieValues,
} from "../schemas";

export function StepPotracenie({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<PotracenieValues>) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PotracenieValues>({
    resolver: zodResolver(potracenieSchema),
    defaultValues: {
      potracenie_typ: defaultValues.potracenie_typ ?? "niealimentacyjne",
      kwota_potracenia: defaultValues.kwota_potracenia ?? 0,
      procent_wynagrodzenia: defaultValues.procent_wynagrodzenia,
      data_pierwszego_potracenia:
        defaultValues.data_pierwszego_potracenia ?? "",
    },
  });

  const typ = watch("potracenie_typ");

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <Label>Typ potrącenia</Label>
        <div role="radiogroup" className="grid gap-2">
          {POTRACENIE_TYPY.map((t) => {
            const active = typ === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() =>
                  setValue("potracenie_typ", t.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-fluid-sm transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500",
                  active
                    ? "border-shield-500 bg-shield-50/70 text-iron-900"
                    : "border-iron-200 bg-white text-iron-800 hover:border-shield-300",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {errors.potracenie_typ?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.potracenie_typ.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="kwota_potracenia">Kwota potrącenia (zł)</Label>
          <Input
            id="kwota_potracenia"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            aria-invalid={Boolean(errors.kwota_potracenia)}
            {...register("kwota_potracenia", { valueAsNumber: true })}
          />
          {errors.kwota_potracenia?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.kwota_potracenia.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="procent_wynagrodzenia">% wynagrodzenia (opcjonalnie)</Label>
          <Input
            id="procent_wynagrodzenia"
            type="number"
            step="0.01"
            min="0"
            max="100"
            inputMode="decimal"
            aria-invalid={Boolean(errors.procent_wynagrodzenia)}
            {...register("procent_wynagrodzenia", { valueAsNumber: true })}
          />
          {errors.procent_wynagrodzenia?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.procent_wynagrodzenia.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_pierwszego_potracenia">
          Data pierwszego potrącenia (opcjonalnie)
        </Label>
        <Input
          id="data_pierwszego_potracenia"
          type="date"
          aria-invalid={Boolean(errors.data_pierwszego_potracenia)}
          {...register("data_pierwszego_potracenia")}
        />
        {errors.data_pierwszego_potracenia?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.data_pierwszego_potracenia.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            Wstecz
          </Button>
        )}
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
