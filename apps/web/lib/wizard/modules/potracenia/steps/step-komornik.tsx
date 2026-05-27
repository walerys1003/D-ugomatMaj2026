"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { komornikSchema, type KomornikValues } from "../schemas";

export function StepKomornik({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<KomornikValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KomornikValues>({
    resolver: zodResolver(komornikSchema),
    defaultValues: {
      kancelaria_nazwa: defaultValues.kancelaria_nazwa ?? "",
      kancelaria_adres: defaultValues.kancelaria_adres ?? "",
      sygnatura_km: defaultValues.sygnatura_km ?? "",
      wierzyciel: defaultValues.wierzyciel ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Pismo egzekucyjne kierujemy bezpośrednio do komornika. Sygnatura
        rozpoczyna się od „Km" — znajdziesz ją w nagłówku zawiadomienia.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kancelaria_nazwa">Komornik / kancelaria</Label>
        <Input
          id="kancelaria_nazwa"
          placeholder="Komornik Sądowy przy Sądzie Rejonowym ... Jan Kowalski"
          aria-invalid={Boolean(errors.kancelaria_nazwa)}
          {...register("kancelaria_nazwa")}
        />
        {errors.kancelaria_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.kancelaria_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kancelaria_adres">Adres kancelarii (opcjonalnie)</Label>
        <Input
          id="kancelaria_adres"
          aria-invalid={Boolean(errors.kancelaria_adres)}
          {...register("kancelaria_adres")}
        />
        {errors.kancelaria_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.kancelaria_adres.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sygnatura_km">Sygnatura akt</Label>
          <Input
            id="sygnatura_km"
            placeholder="Km 1234/24"
            aria-invalid={Boolean(errors.sygnatura_km)}
            {...register("sygnatura_km")}
          />
          {errors.sygnatura_km?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.sygnatura_km.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wierzyciel">Wierzyciel</Label>
          <Input
            id="wierzyciel"
            placeholder="np. Bank ... S.A."
            aria-invalid={Boolean(errors.wierzyciel)}
            {...register("wierzyciel")}
          />
          {errors.wierzyciel?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.wierzyciel.message}
            </p>
          )}
        </div>
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
