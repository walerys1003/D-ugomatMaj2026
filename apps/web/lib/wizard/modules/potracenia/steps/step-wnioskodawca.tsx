"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { wnioskodawcaSchema, type WnioskodawcaValues } from "../schemas";

export function StepWnioskodawca({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<WnioskodawcaValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WnioskodawcaValues>({
    resolver: zodResolver(wnioskodawcaSchema),
    defaultValues: {
      wnioskodawca_nazwa: defaultValues.wnioskodawca_nazwa ?? "",
      wnioskodawca_adres: defaultValues.wnioskodawca_adres ?? "",
      wnioskodawca_pesel: defaultValues.wnioskodawca_pesel ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="wnioskodawca_nazwa">Imię i nazwisko</Label>
        <Input
          id="wnioskodawca_nazwa"
          autoComplete="name"
          aria-invalid={Boolean(errors.wnioskodawca_nazwa)}
          {...register("wnioskodawca_nazwa")}
        />
        {errors.wnioskodawca_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.wnioskodawca_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wnioskodawca_adres">Adres zamieszkania</Label>
        <Input
          id="wnioskodawca_adres"
          placeholder="ul. Przykładowa 12/3, 00-000 Warszawa"
          autoComplete="street-address"
          aria-invalid={Boolean(errors.wnioskodawca_adres)}
          {...register("wnioskodawca_adres")}
        />
        {errors.wnioskodawca_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.wnioskodawca_adres.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wnioskodawca_pesel">PESEL (opcjonalnie)</Label>
        <Input
          id="wnioskodawca_pesel"
          inputMode="numeric"
          maxLength={11}
          placeholder="11 cyfr"
          aria-invalid={Boolean(errors.wnioskodawca_pesel)}
          {...register("wnioskodawca_pesel")}
        />
        <p className="text-fluid-xs text-ink-600">
          PESEL pojawi się w piśmie zamaskowany (XXX*****1234).
        </p>
        {errors.wnioskodawca_pesel?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.wnioskodawca_pesel.message}
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
