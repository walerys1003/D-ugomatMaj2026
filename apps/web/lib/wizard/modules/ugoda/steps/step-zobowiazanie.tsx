"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  zobowiazanieSchema,
  type ZobowiazanieValues,
} from "../schemas";

export function StepZobowiazanie({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<ZobowiazanieValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ZobowiazanieValues>({
    resolver: zodResolver(zobowiazanieSchema),
    defaultValues: {
      numer_umowy: defaultValues.numer_umowy ?? "",
      sygnatura: defaultValues.sygnatura ?? "",
      kwota_zadluzenia: defaultValues.kwota_zadluzenia ?? 0,
      data_wymagalnosci: defaultValues.data_wymagalnosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="numer_umowy">Numer umowy (opcjonalnie)</Label>
          <Input
            id="numer_umowy"
            aria-invalid={Boolean(errors.numer_umowy)}
            {...register("numer_umowy")}
          />
          {errors.numer_umowy?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.numer_umowy.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sygnatura">Sygnatura sprawy (opcjonalnie)</Label>
          <Input
            id="sygnatura"
            placeholder="np. Km 123/24, sprawa funduszu ..."
            aria-invalid={Boolean(errors.sygnatura)}
            {...register("sygnatura")}
          />
          {errors.sygnatura?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.sygnatura.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kwota_zadluzenia">Aktualna kwota zadłużenia (zł)</Label>
        <Input
          id="kwota_zadluzenia"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          aria-invalid={Boolean(errors.kwota_zadluzenia)}
          {...register("kwota_zadluzenia", { valueAsNumber: true })}
        />
        <p className="text-fluid-xs text-iron-600">
          Wpisz kwotę z aktualnego wezwania / zawiadomienia.
        </p>
        {errors.kwota_zadluzenia?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.kwota_zadluzenia.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_wymagalnosci">
          Data wymagalności (opcjonalnie)
        </Label>
        <Input
          id="data_wymagalnosci"
          type="date"
          aria-invalid={Boolean(errors.data_wymagalnosci)}
          {...register("data_wymagalnosci")}
        />
        {errors.data_wymagalnosci?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.data_wymagalnosci.message}
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
