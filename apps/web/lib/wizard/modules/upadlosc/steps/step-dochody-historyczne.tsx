"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Surface } from "@/components/ui/surface";
import { Divider } from "@/components/ui/divider";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  dochodyHistoryczneSchema,
  type DochodyHistoryczneValues,
} from "../schemas";

/**
 * D9 — Krok 9: Dochody historyczne (12 miesięcy).
 *
 * Wymagane przez art. 491² Pr.up. dla pełnego wniosku. Sąd ocenia
 * zdolność do realizacji planu spłaty na podstawie ostatnich 12 miesięcy.
 *
 * UX: useFieldArray dla dodawania wierszy, auto-compute średniej netto,
 * subtelna sugestia „dodaj 12 miesięcy" jeśli user dodał mniej.
 */
export function StepDochodyHistoryczne({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<DochodyHistoryczneValues>) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DochodyHistoryczneValues>({
    resolver: zodResolver(dochodyHistoryczneSchema),
    defaultValues: {
      dochody: defaultValues.dochody ?? [
        { miesiac: "", zrodlo: "", brutto_pln: 0, netto_pln: 0, uwagi: "" },
      ],
      srednia_netto_pln: defaultValues.srednia_netto_pln ?? 0,
      miesiace_bez_dochodu: defaultValues.miesiace_bez_dochodu ?? 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "dochody" });
  const watchDochody = watch("dochody");

  // Auto-compute średniej netto
  React.useEffect(() => {
    if (!watchDochody || watchDochody.length === 0) return;
    const sum = watchDochody.reduce((acc, r) => acc + (Number(r.netto_pln) || 0), 0);
    setValue("srednia_netto_pln", Math.round(sum / watchDochody.length));
  }, [watchDochody, setValue]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <Surface elevation="flat" padded="md" className="bg-dlugomat-50/60 dark:bg-dlugomat-900/40">
        <p className="text-fluid-sm text-iron-700 dark:text-iron-200">
          Wymagane przez <strong>art. 491² Pr.up.</strong> — sąd ocenia plan spłaty na podstawie
          dochodów z ostatnich 12 miesięcy. Wpisz każdy miesiąc osobno. Jeśli były miesiące bez
          dochodu, zaznacz to na końcu.
        </p>
      </Surface>

      <div className="space-y-3">
        {fields.map((field, idx) => (
          <Surface key={field.id} elevation="raised" padded="sm">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_1fr_1fr_auto]">
              <div className="space-y-1">
                <Label htmlFor={`dochody.${idx}.miesiac`} className="text-fluid-xs">
                  Miesiąc (1. dzień)
                </Label>
                <Input
                  id={`dochody.${idx}.miesiac`}
                  type="date"
                  {...register(`dochody.${idx}.miesiac` as const)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`dochody.${idx}.zrodlo`} className="text-fluid-xs">
                  Źródło
                </Label>
                <Input
                  id={`dochody.${idx}.zrodlo`}
                  placeholder="Umowa o pracę / 500+ / alimenty"
                  {...register(`dochody.${idx}.zrodlo` as const)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`dochody.${idx}.brutto_pln`} className="text-fluid-xs">
                  Brutto PLN
                </Label>
                <Input
                  id={`dochody.${idx}.brutto_pln`}
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register(`dochody.${idx}.brutto_pln` as const, { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`dochody.${idx}.netto_pln`} className="text-fluid-xs">
                  Netto PLN
                </Label>
                <Input
                  id={`dochody.${idx}.netto_pln`}
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register(`dochody.${idx}.netto_pln` as const, { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(idx)}
                  aria-label={`Usuń wiersz ${idx + 1}`}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </Surface>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            append({ miesiac: "", zrodlo: "", brutto_pln: 0, netto_pln: 0, uwagi: "" })
          }
        >
          <Plus className="size-4" aria-hidden />
          Dodaj kolejny miesiąc {fields.length < 12 ? `(${12 - fields.length} do kompletu)` : ""}
        </Button>

        {errors.dochody?.message && (
          <p role="alert" className="text-fluid-sm text-danger-600">
            {errors.dochody.message}
          </p>
        )}
      </div>

      <Divider />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="srednia_netto_pln">Średni dochód netto (PLN/mc) — auto</Label>
          <Input
            id="srednia_netto_pln"
            type="number"
            readOnly
            {...register("srednia_netto_pln", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="miesiace_bez_dochodu">Miesiące bez dochodu (z ostatnich 12)</Label>
          <Input
            id="miesiace_bez_dochodu"
            type="number"
            min={0}
            max={36}
            {...register("miesiace_bez_dochodu", { valueAsNumber: true })}
          />
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
