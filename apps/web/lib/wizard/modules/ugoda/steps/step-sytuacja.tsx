"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  SYTUACJA_ZYCIOWA,
  sytuacjaSchema,
  type SytuacjaValues,
} from "../schemas";

export function StepSytuacja({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<SytuacjaValues>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SytuacjaValues>({
    resolver: zodResolver(sytuacjaSchema),
    defaultValues: {
      sytuacja: defaultValues.sytuacja ?? [],
      okolicznosci: defaultValues.okolicznosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Uzasadnienie propozycji jest kluczowe — wierzyciel chętniej akceptuje
        ugodę, gdy widzi realne okoliczności po Twojej stronie.
      </div>

      <div className="space-y-2">
        <Label>Sytuacja życiowa (możesz zaznaczyć kilka)</Label>
        <Controller
          control={control}
          name="sytuacja"
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
              <div className="grid gap-2">
                {SYTUACJA_ZYCIOWA.map((s) => {
                  const active = value.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-fluid-sm transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500",
                        active
                          ? "border-shield-500 bg-shield-50/70 text-ink-900"
                          : "border-ink-200 bg-white text-ink-800 hover:border-shield-300",
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
        {errors.sytuacja?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.sytuacja.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="okolicznosci">Dodatkowe uzasadnienie (opcjonalnie)</Label>
        <Textarea
          id="okolicznosci"
          rows={4}
          maxLength={2000}
          placeholder="Np. utrata pracy, choroba w rodzinie, jednorazowe okoliczności..."
          aria-invalid={Boolean(errors.okolicznosci)}
          {...register("okolicznosci")}
        />
        {errors.okolicznosci?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.okolicznosci.message}
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
