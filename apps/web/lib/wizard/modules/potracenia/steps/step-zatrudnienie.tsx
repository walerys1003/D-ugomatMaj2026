"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  FORMA_ZATRUDNIENIA,
  zatrudnienieSchema,
  type ZatrudnienieValues,
} from "../schemas";

export function StepZatrudnienie({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<ZatrudnienieValues>) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ZatrudnienieValues>({
    resolver: zodResolver(zatrudnienieSchema),
    defaultValues: {
      pracodawca_nazwa: defaultValues.pracodawca_nazwa ?? "",
      pracodawca_adres: defaultValues.pracodawca_adres ?? "",
      stanowisko: defaultValues.stanowisko ?? "",
      forma_zatrudnienia:
        defaultValues.forma_zatrudnienia ?? "umowa_o_prace",
      wynagrodzenie_netto: defaultValues.wynagrodzenie_netto ?? 0,
    },
  });

  const forma = watch("forma_zatrudnienia");

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="pracodawca_nazwa">Pracodawca / płatnik</Label>
        <Input
          id="pracodawca_nazwa"
          aria-invalid={Boolean(errors.pracodawca_nazwa)}
          {...register("pracodawca_nazwa")}
        />
        {errors.pracodawca_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.pracodawca_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pracodawca_adres">Adres pracodawcy (opcjonalnie)</Label>
        <Input
          id="pracodawca_adres"
          aria-invalid={Boolean(errors.pracodawca_adres)}
          {...register("pracodawca_adres")}
        />
        {errors.pracodawca_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.pracodawca_adres.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="stanowisko">Stanowisko (opcjonalnie)</Label>
        <Input
          id="stanowisko"
          aria-invalid={Boolean(errors.stanowisko)}
          {...register("stanowisko")}
        />
      </div>

      <div className="space-y-2">
        <Label>Forma zatrudnienia</Label>
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
          {FORMA_ZATRUDNIENIA.map((f) => {
            const active = forma === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() =>
                  setValue("forma_zatrudnienia", f.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-fluid-sm transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500",
                  active
                    ? "border-shield-500 bg-shield-50/70 text-ink-900"
                    : "border-ink-200 bg-white text-ink-800 hover:border-shield-300",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        {errors.forma_zatrudnienia?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.forma_zatrudnienia.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wynagrodzenie_netto">
          Wynagrodzenie netto (miesięcznie, w zł)
        </Label>
        <Input
          id="wynagrodzenie_netto"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          aria-invalid={Boolean(errors.wynagrodzenie_netto)}
          {...register("wynagrodzenie_netto", { valueAsNumber: true })}
        />
        <p className="text-fluid-xs text-ink-600">
          Potrzebne, aby wskazać kwotę wolną od potrąceń (minimalne wynagrodzenie).
        </p>
        {errors.wynagrodzenie_netto?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.wynagrodzenie_netto.message}
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
