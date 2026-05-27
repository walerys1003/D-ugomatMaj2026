"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HandCoins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { formatPLN } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { ratySchema, type RatyValues } from "../schemas";

/**
 * StepRaty — wymagany TYLKO dla wariantu 'raty'.
 *
 * Propozycja dobrowolnej spłaty zaległości w ratach. Komornik nie ma
 * obowiązku zaakceptować, ale w praktyce — kiedy widzi udokumentowaną
 * sytuację życiową — często godzi się, bo jest to korzystniejsze niż
 * długotrwałe zajęcia.
 */
export function StepRaty({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<RatyValues>) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RatyValues>({
    resolver: zodResolver(ratySchema),
    defaultValues: {
      rata_miesieczna: defaultValues.rata_miesieczna ?? 0,
      liczba_rat: defaultValues.liczba_rat ?? 12,
      data_pierwszej_raty: defaultValues.data_pierwszej_raty ?? "",
    },
  });

  const rata = Number(watch("rata_miesieczna") ?? 0);
  const liczba = Number(watch("liczba_rat") ?? 0);
  const suma = rata > 0 && liczba > 0 ? rata * liczba : 0;

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="flex items-start gap-3 rounded-lg border border-shield-100 bg-shield-50/30 p-3 text-fluid-sm text-ink-700">
        <HandCoins className="mt-0.5 size-4 text-shield-700" aria-hidden />
        <p>
          Zaproponuj kwotę raty, którą rzeczywiście będziesz w stanie regularnie
          płacić. Lepsza niska, ale dotrzymywana propozycja niż wysoka
          obietnica, której nie da się utrzymać.
        </p>
      </div>

      <FormField
        label="Proponowana rata miesięczna (zł)"
        error={errors.rata_miesieczna?.message as string | undefined}
        htmlFor="rata_miesieczna"
      >
        <Input
          id="rata_miesieczna"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="np. 250.00"
          {...register("rata_miesieczna")}
        />
      </FormField>

      <FormField
        label="Liczba rat (miesięcy)"
        hint="Maksymalnie 120 (10 lat). Krótszy okres = większa szansa na akceptację."
        error={errors.liczba_rat?.message as string | undefined}
        htmlFor="liczba_rat"
      >
        <Input
          id="liczba_rat"
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          placeholder="np. 12"
          {...register("liczba_rat")}
        />
      </FormField>

      <FormField
        label="Data pierwszej raty (opcjonalnie)"
        hint="Realna data, od której zaczniesz płatności."
        error={errors.data_pierwszej_raty?.message}
        htmlFor="data_pierwszej_raty"
      >
        <Input
          id="data_pierwszej_raty"
          type="date"
          {...register("data_pierwszej_raty")}
        />
      </FormField>

      {suma > 0 && (
        <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-3 text-fluid-sm dark:border-ink-800 dark:bg-ink-900/40">
          <div className="flex items-center justify-between">
            <span className="text-ink-600 dark:text-ink-400">
              Łączna suma propozycji
            </span>
            <strong className="font-serif text-fluid-base text-ink-900 dark:text-ink-50">
              {formatPLN(suma)}
            </strong>
          </div>
          <p className="mt-1 text-fluid-xs text-ink-500">
            ({liczba} × {formatPLN(rata)}) — wartość bez odsetek i kosztów.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          Wstecz
        </Button>
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
