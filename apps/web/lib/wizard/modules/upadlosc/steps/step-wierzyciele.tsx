"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { wierzycieleSchema, type WierzycieleValues } from "../schemas";

export function StepWierzyciele({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<WierzycieleValues>) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WierzycieleValues>({
    resolver: zodResolver(wierzycieleSchema),
    defaultValues: {
      wierzyciele:
        defaultValues.wierzyciele && defaultValues.wierzyciele.length > 0
          ? defaultValues.wierzyciele
          : [{ nazwa: "", tytul: "", kwota: 0, data_wymagalnosci: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "wierzyciele",
  });

  const watched = watch("wierzyciele");
  const sumaZobowiazan =
    watched?.reduce((acc, w) => acc + (Number(w.kwota) || 0), 0) ?? 0;

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Spis wierzycieli musi być pełny (art. 22a ust. 1 pkt 1 Pr.up.). Wpisz
        każdego wierzyciela osobno — banki, fundusze, komorników, osoby fizyczne,
        ZUS, urzędy skarbowe.
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-fluid-sm font-medium text-ink-700">
                Wierzyciel #{index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-temporal-red-600 hover:bg-temporal-red-50"
                  aria-label={`Usuń wierzyciela #${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Usuń
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`wierzyciele.${index}.nazwa`}>
                  Nazwa wierzyciela
                </Label>
                <Input
                  id={`wierzyciele.${index}.nazwa`}
                  placeholder="np. Bank Pekao S.A. / KRUK S.A. / Komornik X"
                  aria-invalid={Boolean(errors.wierzyciele?.[index]?.nazwa)}
                  {...register(`wierzyciele.${index}.nazwa` as const)}
                />
                {errors.wierzyciele?.[index]?.nazwa?.message && (
                  <p role="alert" className="text-fluid-sm text-temporal-red-600">
                    {errors.wierzyciele[index]?.nazwa?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`wierzyciele.${index}.tytul`}>
                  Tytuł zobowiązania
                </Label>
                <Input
                  id={`wierzyciele.${index}.tytul`}
                  placeholder="np. kredyt gotówkowy, pożyczka chwilowa, alimenty, zaległości ZUS"
                  aria-invalid={Boolean(errors.wierzyciele?.[index]?.tytul)}
                  {...register(`wierzyciele.${index}.tytul` as const)}
                />
                {errors.wierzyciele?.[index]?.tytul?.message && (
                  <p role="alert" className="text-fluid-sm text-temporal-red-600">
                    {errors.wierzyciele[index]?.tytul?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`wierzyciele.${index}.kwota`}>Kwota (PLN)</Label>
                <Input
                  id={`wierzyciele.${index}.kwota`}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0}
                  aria-invalid={Boolean(errors.wierzyciele?.[index]?.kwota)}
                  {...register(`wierzyciele.${index}.kwota` as const)}
                />
                {errors.wierzyciele?.[index]?.kwota?.message && (
                  <p role="alert" className="text-fluid-sm text-temporal-red-600">
                    {errors.wierzyciele[index]?.kwota?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`wierzyciele.${index}.data_wymagalnosci`}>
                  Data wymagalności (opcjonalnie)
                </Label>
                <Input
                  id={`wierzyciele.${index}.data_wymagalnosci`}
                  type="date"
                  aria-invalid={Boolean(
                    errors.wierzyciele?.[index]?.data_wymagalnosci,
                  )}
                  {...register(
                    `wierzyciele.${index}.data_wymagalnosci` as const,
                  )}
                />
                {errors.wierzyciele?.[index]?.data_wymagalnosci?.message && (
                  <p role="alert" className="text-fluid-sm text-temporal-red-600">
                    {errors.wierzyciele[index]?.data_wymagalnosci?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() =>
          append({ nazwa: "", tytul: "", kwota: 0, data_wymagalnosci: "" })
        }
        className="w-full"
      >
        <Plus className="mr-1 h-4 w-4" />
        Dodaj kolejnego wierzyciela
      </Button>

      <div className="rounded-lg border border-shield-200 bg-shield-50/40 p-3 text-sm text-ink-800">
        Łączna kwota zobowiązań:{" "}
        <strong>
          {new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
            maximumFractionDigits: 2,
          }).format(sumaZobowiazan)}
        </strong>
      </div>

      {errors.wierzyciele?.message && (
        <p role="alert" className="text-fluid-sm text-temporal-red-600">
          {errors.wierzyciele.message}
        </p>
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
