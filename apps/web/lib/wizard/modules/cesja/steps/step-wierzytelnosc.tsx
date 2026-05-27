"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  wierzytelnoscSchema,
  type WierzytelnoscValues,
} from "../schemas";

export function StepWierzytelnosc({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<WierzytelnoscValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WierzytelnoscValues>({
    resolver: zodResolver(wierzytelnoscSchema),
    defaultValues: {
      pierwotny_wierzyciel: defaultValues.pierwotny_wierzyciel ?? "",
      numer_umowy: defaultValues.numer_umowy ?? "",
      data_umowy: defaultValues.data_umowy ?? "",
      data_wymagalnosci: defaultValues.data_wymagalnosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Wskaż pierwotnego wierzyciela (najczęściej bank lub firma
        pożyczkowa) — to fundament żądania udokumentowania cesji
        oraz zarzutu przedawnienia.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pierwotny_wierzyciel">Pierwotny wierzyciel</Label>
        <Input
          id="pierwotny_wierzyciel"
          placeholder="np. ABC Bank S.A."
          aria-invalid={Boolean(errors.pierwotny_wierzyciel)}
          {...register("pierwotny_wierzyciel")}
        />
        {errors.pierwotny_wierzyciel?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.pierwotny_wierzyciel.message}
          </p>
        )}
      </div>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="data_umowy">Data umowy (opcjonalnie)</Label>
          <Input
            id="data_umowy"
            type="date"
            aria-invalid={Boolean(errors.data_umowy)}
            {...register("data_umowy")}
          />
          {errors.data_umowy?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.data_umowy.message}
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
          <p className="text-fluid-xs text-ink-600">
            Kluczowa dla zarzutu przedawnienia (art. 117 KC).
          </p>
          {errors.data_wymagalnosci?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.data_wymagalnosci.message}
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
