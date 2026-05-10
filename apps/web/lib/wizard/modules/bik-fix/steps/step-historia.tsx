"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  historiaSchema,
  type BikFixAnswers,
  type HistoriaValues,
} from "../schemas";

interface StepHistoriaProps extends WizardStepProps<HistoriaValues> {
  /** Wariant pochodzi z kroku 1 wizarda (przekazany przez WizardShell jako allAnswers). */
  variant?: "reklamacja_bik" | "skarga_uodo";
  /** Pełny snapshot odpowiedzi — używamy do odczytania `variant`, jeśli prop nie został podany. */
  allAnswers?: Partial<BikFixAnswers>;
}

/**
 * StepHistoria — wymagany przy:
 *   - reklamacja_bik (krok 2/3): potrzebujemy datę i treść odpowiedzi banku
 *   - skarga_uodo    (krok 3/3): potrzebujemy daty obu poprzednich pism
 *
 * Wszystkie pola opcjonalne — celowo, by user nie utknął jeżeli nie ma kompletu
 * dokumentów. AI generator dostanie placeholder `[__do uzupełnienia__]`.
 */
export function StepHistoria({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
  variant,
  allAnswers,
}: StepHistoriaProps) {
  // Wariant: prop > allAnswers.variant > domyślnie reklamacja_bik
  const effectiveVariant: "reklamacja_bik" | "skarga_uodo" =
    variant ??
    (allAnswers?.variant === "skarga_uodo" ? "skarga_uodo" : "reklamacja_bik");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HistoriaValues>({
    resolver: zodResolver(historiaSchema),
    defaultValues: {
      data_reklamacji_bank: defaultValues.data_reklamacji_bank ?? "",
      odpowiedz_banku: defaultValues.odpowiedz_banku ?? "",
      data_reklamacji_bik: defaultValues.data_reklamacji_bik ?? "",
      odpowiedz_bik: defaultValues.odpowiedz_bik ?? "",
    },
  });

  const showBikReklamacja = effectiveVariant === "skarga_uodo";

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/30 p-3 text-fluid-sm text-iron-700">
        {effectiveVariant === "reklamacja_bik" ? (
          <>
            BIK będzie potrzebować dowodu, że wcześniej próbowałeś u banku.
            Wpisz datę pierwszej reklamacji i krótkie streszczenie odpowiedzi —
            jeśli masz pismo banku, dołączysz je jako załącznik PDF.
          </>
        ) : (
          <>
            UODO bada, czy wyczerpałeś ścieżkę reklamacyjną. Wpisz daty obu
            wcześniejszych reklamacji (do banku i do BIK) oraz streszczenia
            ich odpowiedzi.
          </>
        )}
      </div>

      <section className="space-y-4">
        <h3 className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
          Reklamacja w banku (krok 1)
        </h3>
        <FormField
          label="Data złożenia reklamacji w banku"
          error={errors.data_reklamacji_bank?.message}
          htmlFor="data_reklamacji_bank"
        >
          <Input
            id="data_reklamacji_bank"
            type="date"
            {...register("data_reklamacji_bank")}
          />
        </FormField>
        <FormField
          label="Treść odpowiedzi banku"
          hint="Krótkie streszczenie — np. „Bank odmówił, powołując się na art. X”."
          error={errors.odpowiedz_banku?.message}
          htmlFor="odpowiedz_banku"
        >
          <Textarea
            id="odpowiedz_banku"
            rows={3}
            maxLength={1000}
            {...register("odpowiedz_banku")}
          />
        </FormField>
      </section>

      {showBikReklamacja && (
        <section className="space-y-4">
          <h3 className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
            Reklamacja w BIK (krok 2)
          </h3>
          <FormField
            label="Data złożenia reklamacji w BIK"
            error={errors.data_reklamacji_bik?.message}
            htmlFor="data_reklamacji_bik"
          >
            <Input
              id="data_reklamacji_bik"
              type="date"
              {...register("data_reklamacji_bik")}
            />
          </FormField>
          <FormField
            label="Treść odpowiedzi BIK"
            hint="Krótkie streszczenie decyzji BIK S.A."
            error={errors.odpowiedz_bik?.message}
            htmlFor="odpowiedz_bik"
          >
            <Textarea
              id="odpowiedz_bik"
              rows={3}
              maxLength={1000}
              {...register("odpowiedz_bik")}
            />
          </FormField>
        </section>
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
