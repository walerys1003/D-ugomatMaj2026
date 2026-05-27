"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { dluznikSchema, type DluznikValues } from "../schemas";

export function StepDluznik({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<DluznikValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DluznikValues>({
    resolver: zodResolver(dluznikSchema),
    defaultValues: {
      dluznik_nazwa: defaultValues.dluznik_nazwa ?? "",
      dluznik_adres: defaultValues.dluznik_adres ?? "",
      dluznik_pesel: defaultValues.dluznik_pesel ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="dluznik_nazwa">Imię i nazwisko</Label>
        <Input
          id="dluznik_nazwa"
          autoComplete="name"
          aria-invalid={Boolean(errors.dluznik_nazwa)}
          {...register("dluznik_nazwa")}
        />
        {errors.dluznik_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.dluznik_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dluznik_adres">Adres zamieszkania</Label>
        <Input
          id="dluznik_adres"
          placeholder="ul. Przykładowa 12/3, 00-000 Warszawa"
          autoComplete="street-address"
          aria-invalid={Boolean(errors.dluznik_adres)}
          {...register("dluznik_adres")}
        />
        {errors.dluznik_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.dluznik_adres.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dluznik_pesel">PESEL (opcjonalnie)</Label>
        <Input
          id="dluznik_pesel"
          inputMode="numeric"
          maxLength={11}
          placeholder="11 cyfr"
          aria-invalid={Boolean(errors.dluznik_pesel)}
          {...register("dluznik_pesel")}
        />
        <p className="text-fluid-xs text-ink-600">
          PESEL pojawi się w piśmie zamaskowany (XXX*****1234).
        </p>
        {errors.dluznik_pesel?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.dluznik_pesel.message}
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
