"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { wierzycielSchema, type WierzycielValues } from "../schemas";

export function StepWierzyciel({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<WierzycielValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WierzycielValues>({
    resolver: zodResolver(wierzycielSchema),
    defaultValues: {
      wierzyciel_nazwa: defaultValues.wierzyciel_nazwa ?? "",
      wierzyciel_adres: defaultValues.wierzyciel_adres ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Wskaż adresata propozycji ugody — bank, fundusz sekurytyzacyjny lub
        firmę windykacyjną. Pismo powinno trafić bezpośrednio do działu
        windykacji / negocjacji.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wierzyciel_nazwa">Wierzyciel</Label>
        <Input
          id="wierzyciel_nazwa"
          placeholder="np. ABC Bank S.A. / Fundusz ..."
          aria-invalid={Boolean(errors.wierzyciel_nazwa)}
          {...register("wierzyciel_nazwa")}
        />
        {errors.wierzyciel_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.wierzyciel_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wierzyciel_adres">Adres (opcjonalnie)</Label>
        <Input
          id="wierzyciel_adres"
          aria-invalid={Boolean(errors.wierzyciel_adres)}
          {...register("wierzyciel_adres")}
        />
        {errors.wierzyciel_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.wierzyciel_adres.message}
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
