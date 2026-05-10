"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Briefcase, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  POTRACENIA_VARIANTS,
  wariantSchema,
  type WariantValues,
} from "../schemas";

const ICONS: Record<string, typeof Briefcase> = {
  wniosek_pracodawca: Briefcase,
  wniosek_komornik: Scale,
};

export function StepWariant({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<WariantValues>) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WariantValues>({
    resolver: zodResolver(wariantSchema),
    defaultValues: {
      variant: defaultValues.variant ?? "wniosek_pracodawca",
    },
  });

  const variant = watch("variant");

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-6"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-iron-700">
        PotrąceniaStop chroni Twoje wynagrodzenie. Wybierz adresata pisma —
        szybsza ścieżka to wniosek do pracodawcy, bardziej formalna to wniosek
        do komornika.
      </div>

      <div role="radiogroup" aria-label="Wariant pisma" className="grid gap-3">
        {POTRACENIA_VARIANTS.map((v) => {
          const Icon = ICONS[v.id] ?? Briefcase;
          const active = variant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() =>
                setValue("variant", v.id, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
                active
                  ? "border-shield-500 bg-shield-50/70 shadow-card"
                  : "border-iron-200 bg-white hover:border-shield-300 hover:bg-shield-50/30",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg",
                  active
                    ? "bg-shield-500 text-white"
                    : "bg-shield-100 text-shield-700",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-fluid-base font-semibold text-iron-900">
                    {v.label}
                  </h3>
                  <span className="text-fluid-xs font-medium uppercase tracking-wide text-shield-700">
                    {v.art}
                  </span>
                </div>
                <p className="mt-1 text-fluid-sm text-iron-700">{v.helper}</p>
              </div>
            </button>
          );
        })}
      </div>

      {errors.variant?.message && (
        <p role="alert" className="text-fluid-sm text-temporal-red-600">
          {errors.variant.message}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
