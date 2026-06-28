"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPLN } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  UGODA_VARIANTS,
  propozycjaSchema,
  type PropozycjaValues,
  type UgodaAnswers,
} from "../schemas";

interface PropozycjaProps extends WizardStepProps<PropozycjaValues> {
  allAnswers?: Partial<UgodaAnswers>;
}

export function StepPropozycja({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
  allAnswers,
}: PropozycjaProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropozycjaValues>({
    resolver: zodResolver(propozycjaSchema),
    defaultValues: {
      rata_miesieczna: defaultValues.rata_miesieczna,
      liczba_rat: defaultValues.liczba_rat,
      data_pierwszej_raty: defaultValues.data_pierwszej_raty ?? "",
      kwota_proponowana: defaultValues.kwota_proponowana,
      procent_umorzenia: defaultValues.procent_umorzenia,
      termin_zaplaty: defaultValues.termin_zaplaty ?? "",
    },
  });

  const variant = (allAnswers?.variant ?? "propozycja_raty") as
    | UgodaAnswers["variant"]
    | undefined;
  const showRaty =
    variant === "propozycja_raty" || variant === "propozycja_indywidualna";
  const showUmorzenie =
    variant === "propozycja_umorzenie" ||
    variant === "propozycja_indywidualna";
  const showTerminJednorazowy = variant === "propozycja_umorzenie";

  const variantMeta =
    UGODA_VARIANTS.find((v) => v.id === variant) ?? UGODA_VARIANTS[0];

  const rata = watch("rata_miesieczna");
  const liczba = watch("liczba_rat");
  const suma =
    typeof rata === "number" && typeof liczba === "number"
      ? rata * liczba
      : 0;

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-2xl border border-shield-200 bg-shield-50/50 p-4">
        <div className="text-fluid-sm font-semibold text-shield-700">
          {variantMeta.label}
        </div>
        <p className="mt-1 text-fluid-xs text-ink-700">
          {variantMeta.helper}
        </p>
      </div>

      {showRaty && (
        <div className="space-y-4 rounded-xl border border-ink-200 bg-white p-4">
          <h4 className="text-fluid-sm font-semibold text-ink-900">
            Propozycja rat
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rata_miesieczna">Rata miesięczna (zł)</Label>
              <Input
                id="rata_miesieczna"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                aria-invalid={Boolean(errors.rata_miesieczna)}
                {...register("rata_miesieczna", { valueAsNumber: true })}
              />
              {errors.rata_miesieczna?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.rata_miesieczna.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="liczba_rat">Liczba rat (1–120)</Label>
              <Input
                id="liczba_rat"
                type="number"
                step="1"
                min="1"
                max="120"
                inputMode="numeric"
                aria-invalid={Boolean(errors.liczba_rat)}
                {...register("liczba_rat", { valueAsNumber: true })}
              />
              {errors.liczba_rat?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.liczba_rat.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="data_pierwszej_raty">
              Data pierwszej raty (opcjonalnie)
            </Label>
            <Input
              id="data_pierwszej_raty"
              type="date"
              aria-invalid={Boolean(errors.data_pierwszej_raty)}
              {...register("data_pierwszej_raty")}
            />
            {errors.data_pierwszej_raty?.message && (
              <p role="alert" className="text-fluid-sm text-temporal-red-600">
                {errors.data_pierwszej_raty.message}
              </p>
            )}
          </div>

          {suma > 0 && (
            <p className="rounded-lg bg-shield-50 p-2 text-fluid-xs text-ink-700">
              Suma proponowanych rat: <strong>{formatPLN(suma)}</strong>
            </p>
          )}
        </div>
      )}

      {showUmorzenie && (
        <div className="space-y-4 rounded-xl border border-ink-200 bg-white p-4">
          <h4 className="text-fluid-sm font-semibold text-ink-900">
            Propozycja {variant === "propozycja_indywidualna" ? "częściowego umorzenia" : "umorzenia + zapłaty"}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kwota_proponowana">
                Kwota do zapłaty (zł)
              </Label>
              <Input
                id="kwota_proponowana"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                aria-invalid={Boolean(errors.kwota_proponowana)}
                {...register("kwota_proponowana", { valueAsNumber: true })}
              />
              {errors.kwota_proponowana?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.kwota_proponowana.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="procent_umorzenia">
                % umorzenia (opcjonalnie)
              </Label>
              <Input
                id="procent_umorzenia"
                type="number"
                step="0.01"
                min="0"
                max="100"
                inputMode="decimal"
                aria-invalid={Boolean(errors.procent_umorzenia)}
                {...register("procent_umorzenia", { valueAsNumber: true })}
              />
              {errors.procent_umorzenia?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.procent_umorzenia.message}
                </p>
              )}
            </div>
          </div>

          {showTerminJednorazowy && (
            <div className="space-y-1.5">
              <Label htmlFor="termin_zaplaty">
                Proponowany termin zapłaty (opcjonalnie)
              </Label>
              <Input
                id="termin_zaplaty"
                type="date"
                aria-invalid={Boolean(errors.termin_zaplaty)}
                {...register("termin_zaplaty")}
              />
              {errors.termin_zaplaty?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.termin_zaplaty.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
