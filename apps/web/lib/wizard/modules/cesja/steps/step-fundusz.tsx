"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { funduszSchema, type FunduszValues } from "../schemas";

export function StepFundusz({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<FunduszValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FunduszValues>({
    resolver: zodResolver(funduszSchema),
    defaultValues: {
      fundusz_nazwa: defaultValues.fundusz_nazwa ?? "",
      fundusz_adres: defaultValues.fundusz_adres ?? "",
      fundusz_nip: defaultValues.fundusz_nip ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Dane funduszu sekurytyzacyjnego lub firmy windykacyjnej, która
        skierowała do Ciebie wezwanie. Znajdziesz je w nagłówku pisma.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fundusz_nazwa">Nazwa funduszu / windykatora</Label>
        <Input
          id="fundusz_nazwa"
          placeholder="np. Niestandaryzowany Sekurytyzacyjny FIZ ..."
          aria-invalid={Boolean(errors.fundusz_nazwa)}
          {...register("fundusz_nazwa")}
        />
        {errors.fundusz_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.fundusz_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fundusz_adres">Adres (opcjonalnie)</Label>
        <Input
          id="fundusz_adres"
          aria-invalid={Boolean(errors.fundusz_adres)}
          {...register("fundusz_adres")}
        />
        {errors.fundusz_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.fundusz_adres.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fundusz_nip">NIP / KRS (opcjonalnie)</Label>
        <Input
          id="fundusz_nip"
          aria-invalid={Boolean(errors.fundusz_nip)}
          {...register("fundusz_nip")}
        />
        {errors.fundusz_nip?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.fundusz_nip.message}
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
