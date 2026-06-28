"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { skargaSchema, type SkargaValues } from "../schemas";

/**
 * StepSkarga — wymagany TYLKO dla wariantu 'skarga'.
 *
 * KRYTYCZNE: termin 7 dni od `data_doreczenia` (art. 767 §4 KPC).
 * Po jego przekroczeniu skarga jest niedopuszczalna.
 */
export function StepSkarga({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<SkargaValues>) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SkargaValues>({
    resolver: zodResolver(skargaSchema),
    defaultValues: {
      czynnosc_komornika: defaultValues.czynnosc_komornika ?? "",
      data_doreczenia: defaultValues.data_doreczenia ?? "",
    },
  });

  const dataDoreczenia = watch("data_doreczenia");
  const daysLeft = computeDaysLeft(dataDoreczenia);

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="flex items-start gap-3 rounded-lg border border-temporal-amber-200 bg-temporal-amber-50/60 p-3 text-fluid-sm text-ink-800">
        <Clock className="mt-0.5 size-4 text-temporal-amber-700" aria-hidden />
        <div>
          <p className="font-semibold text-temporal-amber-900">
            Termin 7 dni od doręczenia
          </p>
          <p>
            Skargę składa się w terminie 7 dni od dnia doręczenia czynności
            (art. 767 §4 KPC). Po jego upływie sąd odrzuca skargę bez
            merytorycznego rozpoznania.
          </p>
        </div>
      </div>

      <FormField
        label="Co zaskarżasz (krótko)"
        hint="Konkretna czynność komornika — np. „zajęcie świadczenia 500+ na rachunku bankowym”."
        error={errors.czynnosc_komornika?.message}
        htmlFor="czynnosc_komornika"
      >
        <Textarea
          id="czynnosc_komornika"
          rows={3}
          maxLength={500}
          placeholder="np. zajęcie świadczenia 500+ na rachunku bankowym mimo wskazania, że są to środki niepodlegające egzekucji"
          {...register("czynnosc_komornika")}
        />
      </FormField>

      <FormField
        label="Data doręczenia czynności"
        hint="Data, w której odebrałeś(-aś) pismo / dowiedziałeś(-aś) się o czynności."
        error={errors.data_doreczenia?.message}
        htmlFor="data_doreczenia"
      >
        <Input
          id="data_doreczenia"
          type="date"
          {...register("data_doreczenia")}
        />
      </FormField>

      {daysLeft != null && (
        <div
          className={`rounded-lg border p-3 text-fluid-sm ${
            daysLeft < 0
              ? "border-danger-200 bg-danger-50/60 text-danger-900"
              : daysLeft <= 2
                ? "border-temporal-amber-200 bg-temporal-amber-50/60 text-temporal-amber-900"
                : "border-shield-200 bg-shield-50/60 text-shield-900"
          }`}
        >
          {daysLeft < 0 ? (
            <>
              <strong>Uwaga:</strong> termin upłynął{" "}
              {Math.abs(daysLeft)} {pluralDni(Math.abs(daysLeft))} temu.
              Skarga prawdopodobnie zostanie odrzucona — rozważ wniosek
              o przywrócenie terminu.
            </>
          ) : daysLeft === 0 ? (
            <>
              <strong>Dziś ostatni dzień!</strong> Złóż pismo przed końcem
              dnia roboczego (osobiście lub listem poleconym).
            </>
          ) : (
            <>
              Pozostało <strong>{daysLeft}</strong>{" "}
              {pluralDni(daysLeft)} na złożenie skargi.
            </>
          )}
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

function computeDaysLeft(dataDoreczenia: string | undefined): number | null {
  if (!dataDoreczenia || !/^\d{4}-\d{2}-\d{2}$/.test(dataDoreczenia)) {
    return null;
  }
  const start = new Date(dataDoreczenia);
  if (Number.isNaN(start.getTime())) return null;
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + 7);
  const now = new Date();
  const ms = deadline.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function pluralDni(n: number): string {
  if (n === 1) return "dzień";
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "dni";
  return "dni";
}
