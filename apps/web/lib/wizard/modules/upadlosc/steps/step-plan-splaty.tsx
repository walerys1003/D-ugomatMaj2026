"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Surface } from "@/components/ui/surface";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { planSplatySchema, type PlanSplatyValues } from "../schemas";

/**
 * D9 — Krok 10: Plan spłaty wierzycieli.
 *
 * Wnioskodawca proponuje sądowi konkretną kwotę raty miesięcznej i okres.
 * Standardowy plan = 36 miesięcy (Pr.up. art. 491¹⁴ ust. 1); krótszy okres
 * wymaga mocniejszego uzasadnienia. Jeśli kwoty są nieadekwatne do dochodu,
 * sąd przyjmie własną propozycję na rozprawie.
 */
export function StepPlanSplaty({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<PlanSplatyValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlanSplatyValues>({
    resolver: zodResolver(planSplatySchema),
    defaultValues: {
      rata_miesieczna_pln: defaultValues.rata_miesieczna_pln ?? 0,
      liczba_miesiecy: defaultValues.liczba_miesiecy ?? 36,
      uzasadnienie_kwoty: defaultValues.uzasadnienie_kwoty ?? "",
      wnioskuje_umorzenie_reszty: defaultValues.wnioskuje_umorzenie_reszty ?? true,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <Surface elevation="flat" padded="md" className="bg-dlugomat-50/60 dark:bg-dlugomat-900/40">
        <p className="text-fluid-sm text-iron-700 dark:text-iron-200">
          Standardowy plan spłaty trwa <strong>36 miesięcy</strong> (Pr.up. art. 491¹⁴ ust. 1).
          Krótszy okres wymaga mocniejszego uzasadnienia. Wpisz kwotę, którą realistycznie jesteś
          w stanie spłacać po pokryciu kosztów utrzymania.
        </p>
      </Surface>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rata_miesieczna_pln">Proponowana rata miesięczna (PLN)</Label>
          <Input
            id="rata_miesieczna_pln"
            type="number"
            step="1"
            min={0}
            inputMode="decimal"
            aria-invalid={Boolean(errors.rata_miesieczna_pln)}
            {...register("rata_miesieczna_pln", { valueAsNumber: true })}
          />
          {errors.rata_miesieczna_pln?.message && (
            <p role="alert" className="text-fluid-sm text-danger-600">
              {errors.rata_miesieczna_pln.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="liczba_miesiecy">Czas trwania planu (miesiące)</Label>
          <Input
            id="liczba_miesiecy"
            type="number"
            step="1"
            min={0}
            max={84}
            aria-invalid={Boolean(errors.liczba_miesiecy)}
            {...register("liczba_miesiecy", { valueAsNumber: true })}
          />
          {errors.liczba_miesiecy?.message && (
            <p role="alert" className="text-fluid-sm text-danger-600">
              {errors.liczba_miesiecy.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="uzasadnienie_kwoty">Uzasadnienie kwoty raty</Label>
        <Textarea
          id="uzasadnienie_kwoty"
          rows={5}
          placeholder="Dochód netto 2 800 PLN, koszty utrzymania (rodzina, lekarstwa) 2 400 PLN, pozostałe 400 PLN — z tego proponuję 350 PLN na raty…"
          aria-invalid={Boolean(errors.uzasadnienie_kwoty)}
          {...register("uzasadnienie_kwoty")}
        />
        {errors.uzasadnienie_kwoty?.message && (
          <p role="alert" className="text-fluid-sm text-danger-600">
            {errors.uzasadnienie_kwoty.message}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-iron-200 bg-card p-3 dark:border-iron-800">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-dlugomat-700"
          {...register("wnioskuje_umorzenie_reszty")}
        />
        <span className="text-fluid-sm text-iron-700 dark:text-iron-200">
          Wnioskuję o <strong>umorzenie pozostałej części zobowiązań</strong> po zakończeniu planu
          spłaty (art. 491¹⁴ ust. 2 Pr.up.).
        </span>
      </label>

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
