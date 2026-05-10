"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { CESJA_ZARZUTY, zarzutySchema, type ZarzutyValues } from "../schemas";

export function StepZarzuty({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<ZarzutyValues>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ZarzutyValues>({
    resolver: zodResolver(zarzutySchema),
    defaultValues: {
      zarzuty: defaultValues.zarzuty ?? [],
      okolicznosci: defaultValues.okolicznosci ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-iron-700">
        Zaznacz wszystkie zarzuty, które dotyczą Twojej sprawy. Każdy z nich
        zostanie rozwinięty z odpowiednią podstawą prawną w piśmie.
      </div>

      <div className="space-y-2">
        <Label>Zarzuty (wybierz przynajmniej jeden)</Label>
        <Controller
          control={control}
          name="zarzuty"
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
                {CESJA_ZARZUTY.map((z) => {
                  const active = value.includes(z.id);
                  return (
                    <button
                      key={z.id}
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      onClick={() => toggle(z.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-fluid-sm transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500",
                        active
                          ? "border-shield-500 bg-shield-50/70 text-iron-900"
                          : "border-iron-200 bg-white text-iron-800 hover:border-shield-300",
                      )}
                    >
                      <div className="font-medium">{z.label}</div>
                      <div className="text-fluid-xs text-iron-600">
                        {z.helper}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
        {errors.zarzuty?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.zarzuty.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="okolicznosci">Dodatkowe okoliczności (opcjonalnie)</Label>
        <Textarea
          id="okolicznosci"
          rows={4}
          maxLength={2000}
          placeholder="Np. spłaty częściowe, korespondencja z bankiem, daty graniczne..."
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
