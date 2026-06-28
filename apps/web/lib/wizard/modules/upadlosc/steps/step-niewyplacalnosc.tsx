"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  PRZYCZYNY_NIEWYPLACALNOSCI,
  niewyplacalnoscSchema,
  type NiewyplacalnoscValues,
} from "../schemas";

export function StepNiewyplacalnosc({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<NiewyplacalnoscValues>) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NiewyplacalnoscValues>({
    resolver: zodResolver(niewyplacalnoscSchema),
    defaultValues: {
      przyczyny: defaultValues.przyczyny ?? [],
      data_powstania_niewyplacalnosci:
        defaultValues.data_powstania_niewyplacalnosci ?? "",
      uzasadnienie: defaultValues.uzasadnienie ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Przyczyny niewypłacalności są kluczowe dla sądu — od nich zależy ocena
        moralności płatniczej (art. 491¹ ust. 1 i 491⁴ ust. 1 Pr.up.). Sąd może
        odmówić oddłużenia, jeśli niewypłacalność wynika z rażącego niedbalstwa.
      </div>

      <Controller
        control={control}
        name="przyczyny"
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
              <Label>Wybierz przyczyny (zaznacz wszystkie pasujące)</Label>
              <div className="grid gap-2">
                {PRZYCZYNY_NIEWYPLACALNOSCI.map((p) => {
                  const checked = value.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                        checked
                          ? "border-shield-400 bg-shield-50/60"
                          : "border-ink-200 hover:border-shield-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(p.id)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span className="text-ink-800">{p.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.przyczyny?.message && (
                <p role="alert" className="text-fluid-sm text-temporal-red-600">
                  {errors.przyczyny.message}
                </p>
              )}
            </div>
          );
        }}
      />

      <div className="space-y-1.5">
        <Label htmlFor="data_powstania_niewyplacalnosci">
          Data powstania stanu niewypłacalności (opcjonalnie)
        </Label>
        <Input
          id="data_powstania_niewyplacalnosci"
          type="date"
          aria-invalid={Boolean(errors.data_powstania_niewyplacalnosci)}
          {...register("data_powstania_niewyplacalnosci")}
        />
        <p className="text-fluid-xs text-ink-600">
          Moment, w którym przestałeś regulować zobowiązania (art. 11 Pr.up.).
        </p>
        {errors.data_powstania_niewyplacalnosci?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.data_powstania_niewyplacalnosci.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="uzasadnienie">Opis sytuacji własnymi słowami</Label>
        <Textarea
          id="uzasadnienie"
          placeholder="Opisz, jak doszło do niewypłacalności — chronologicznie, rzeczowo, bez pomijania faktów. Min. 50 znaków, max 3000."
          rows={8}
          aria-invalid={Boolean(errors.uzasadnienie)}
          {...register("uzasadnienie")}
        />
        {errors.uzasadnienie?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.uzasadnienie.message}
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
