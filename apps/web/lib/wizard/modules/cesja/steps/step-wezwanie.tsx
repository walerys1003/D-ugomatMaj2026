"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { wezwanieSchema, type WezwanieValues } from "../schemas";

export function StepWezwanie({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<WezwanieValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WezwanieValues>({
    resolver: zodResolver(wezwanieSchema),
    defaultValues: {
      data_wezwania: defaultValues.data_wezwania ?? "",
      sygnatura_funduszu: defaultValues.sygnatura_funduszu ?? "",
      kwota_dochodzona: defaultValues.kwota_dochodzona ?? 0,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="data_wezwania">Data wezwania</Label>
        <Input
          id="data_wezwania"
          type="date"
          aria-invalid={Boolean(errors.data_wezwania)}
          {...register("data_wezwania")}
        />
        {errors.data_wezwania?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.data_wezwania.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sygnatura_funduszu">
          Sygnatura sprawy funduszu (opcjonalnie)
        </Label>
        <Input
          id="sygnatura_funduszu"
          placeholder="np. CASE/2024/12345"
          aria-invalid={Boolean(errors.sygnatura_funduszu)}
          {...register("sygnatura_funduszu")}
        />
        {errors.sygnatura_funduszu?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.sygnatura_funduszu.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kwota_dochodzona">Kwota dochodzona (zł)</Label>
        <Input
          id="kwota_dochodzona"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          aria-invalid={Boolean(errors.kwota_dochodzona)}
          {...register("kwota_dochodzona", { valueAsNumber: true })}
        />
        {errors.kwota_dochodzona?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.kwota_dochodzona.message}
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
