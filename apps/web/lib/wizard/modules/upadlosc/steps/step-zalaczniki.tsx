"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  ZALACZNIKI,
  zalacznikiSchema,
  type ZalacznikiValues,
} from "../schemas";

export function StepZalaczniki({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<ZalacznikiValues>) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ZalacznikiValues>({
    resolver: zodResolver(zalacznikiSchema),
    defaultValues: {
      zalaczniki: defaultValues.zalaczniki ?? [],
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Zaznacz załączniki, które już posiadasz lub planujesz dostarczyć do
        sądu. Lista trafi do końcowej części pisma. Brakujące dokumenty można
        dosłać w wyznaczonym terminie (sąd zazwyczaj daje 7 dni).
      </div>

      <Controller
        control={control}
        name="zalaczniki"
        render={({ field }) => {
          const value = (field.value ?? []) as string[];
          const toggle = (id: string) => {
            if (value.includes(id)) {
              field.onChange(value.filter((v) => v !== id));
            } else {
              field.onChange([...value, id]);
            }
          };
          return (
            <div className="space-y-2">
              <Label>Posiadane / planowane załączniki</Label>
              <div className="grid gap-2">
                {ZALACZNIKI.map((z) => {
                  const checked = value.includes(z.id);
                  return (
                    <label
                      key={z.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                        checked
                          ? "border-shield-400 bg-shield-50/60"
                          : "border-ink-200 hover:border-shield-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(z.id)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span className="text-ink-800">{z.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.zalaczniki?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.zalaczniki.message}
                </p>
              )}
            </div>
          );
        }}
      />

      <div className="rounded-lg border border-temporal-amber-200 bg-temporal-amber-50/40 p-3 text-sm text-ink-800">
        <strong>Opłata sądowa:</strong> 30 zł (art. 76a ust. 1 ustawy o
        kosztach sądowych w sprawach cywilnych). Wpłata na rachunek
        bankowy sądu — potwierdzenie dołącz do wniosku.
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
