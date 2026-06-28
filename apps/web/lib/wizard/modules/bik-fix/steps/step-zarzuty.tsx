"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  BIK_NIEPRAWIDLOWOSCI,
  bikZarzutySchema,
  type BikZarzutyValues,
} from "../schemas";

export function StepBikZarzuty({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<BikZarzutyValues>) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BikZarzutyValues>({
    resolver: zodResolver(bikZarzutySchema),
    defaultValues: {
      zarzuty: defaultValues.zarzuty ?? [],
      rodzaj_nieprawidlowosci: defaultValues.rodzaj_nieprawidlowosci ?? "",
      okolicznosci: defaultValues.okolicznosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/30 p-3 text-fluid-sm text-ink-700">
        Zaznacz wszystkie nieprawidłowości, które dotyczą Twojego wpisu.
        Każda z nich zostanie rozwinięta w piśmie z odpowiednią podstawą prawną
        (art. 70a Pr. bank., art. 16/17 RODO, art. 6 ust. 1 RODO).
      </div>

      <FormField
        label="Charakter nieprawidłowości"
        error={errors.zarzuty?.message as string | undefined}
        htmlFor="zarzuty"
        required
      >
        <Controller
          name="zarzuty"
          control={control}
          render={({ field }) => {
            const selected = new Set(field.value ?? []);
            const toggle = (id: string) => {
              const next = new Set(selected);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              field.onChange(Array.from(next));
            };
            return (
              <ul className="grid gap-2">
                {BIK_NIEPRAWIDLOWOSCI.map((opt) => {
                  const active = selected.has(opt.id);
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        onClick={() => toggle(opt.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
                          active
                            ? "border-shield-500 bg-shield-50/70"
                            : "border-ink-200 bg-white hover:border-shield-300 hover:bg-shield-50/30",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                            active
                              ? "border-shield-500 bg-shield-500 text-white"
                              : "border-ink-300 bg-white",
                          )}
                          aria-hidden
                        >
                          {active && <Check className="size-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-fluid-sm font-medium text-ink-900">
                            {opt.label}
                          </span>
                          <span className="mt-0.5 block text-fluid-xs text-ink-600">
                            {opt.helper}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        />
      </FormField>

      <FormField
        label="Krótkie hasło opisujące problem (opcjonalnie)"
        hint="Np. „Wpis dotyczy spłaconego kredytu z 2019 r.”"
        error={errors.rodzaj_nieprawidlowosci?.message}
        htmlFor="rodzaj_nieprawidlowosci"
      >
        <Textarea
          id="rodzaj_nieprawidlowosci"
          rows={2}
          maxLength={400}
          {...register("rodzaj_nieprawidlowosci")}
        />
      </FormField>

      <FormField
        label="Okoliczności sprawy (opcjonalnie)"
        hint="Krótko opisz historię — kiedy zaciągnąłeś, kiedy spłaciłeś, jakie dokumenty masz na potwierdzenie. Maks. 2000 znaków."
        error={errors.okolicznosci?.message}
        htmlFor="okolicznosci"
      >
        <Textarea
          id="okolicznosci"
          rows={5}
          maxLength={2000}
          {...register("okolicznosci")}
        />
      </FormField>

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
