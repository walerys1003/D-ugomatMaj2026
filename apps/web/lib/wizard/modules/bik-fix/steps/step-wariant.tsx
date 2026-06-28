"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, FileBadge2, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { wariantSchema, type WariantValues } from "../schemas";

const VARIANTS = [
  {
    id: "reklamacja_bank" as const,
    icon: Building2,
    title: "Reklamacja do banku",
    subtitle: "Krok 1/3",
    body: "Pierwsze pismo — kierowane bezpośrednio do banku, który dokonał wpisu. Podstawa: art. 70a Pr. bank., art. 16 RODO. Bank ma 30 dni na odpowiedź.",
  },
  {
    id: "reklamacja_bik" as const,
    icon: FileBadge2,
    title: "Reklamacja do BIK S.A.",
    subtitle: "Krok 2/3",
    body: "Składasz, gdy bank odmówił korekty. Pismo idzie wprost do Biura Informacji Kredytowej S.A. BIK ma 30 dni na decyzję.",
  },
  {
    id: "skarga_uodo" as const,
    icon: Landmark,
    title: "Skarga do Prezesa UODO",
    subtitle: "Krok 3/3",
    body: "Ostatnie ogniwo — skarga do organu nadzorczego. Podstawa: art. 77 RODO. Składasz w 30 dni od decyzji BIK.",
  },
];

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
      variant: defaultValues.variant ?? "reklamacja_bank",
    },
  });

  const variant = watch("variant");

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-6"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Ścieżka BIK-Fix to procedura 3-stopniowa. Zacznij od reklamacji w banku;
        dopiero po wyczerpaniu tego kroku przechodzimy dalej. Każdy etap możesz
        wygenerować osobno — odzielnie dla każdej sprawy.
      </div>

      <div role="radiogroup" aria-label="Wariant pisma" className="grid gap-3">
        {VARIANTS.map((v) => {
          const Icon = v.icon;
          const active = variant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() =>
                setValue("variant", v.id, { shouldValidate: true, shouldDirty: true })
              }
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
                active
                  ? "border-shield-500 bg-shield-50/70 shadow-card"
                  : "border-ink-200 bg-white hover:border-shield-300 hover:bg-shield-50/30",
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
                  <h3 className="text-fluid-base font-semibold text-ink-900">
                    {v.title}
                  </h3>
                  <span className="text-fluid-xs font-medium uppercase tracking-wide text-shield-700">
                    {v.subtitle}
                  </span>
                </div>
                <p className="mt-1 text-fluid-sm text-ink-700">{v.body}</p>
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
