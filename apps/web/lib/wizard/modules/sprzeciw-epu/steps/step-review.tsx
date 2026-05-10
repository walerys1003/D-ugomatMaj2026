"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { formatPLN } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { reviewSchema, ZARZUTY_OPTIONS, type ReviewValues } from "../schemas";

interface ReviewProps extends WizardStepProps<ReviewValues> {
  /** Wszystkie zebrane odpowiedzi (read-only). */
  allAnswers: Record<string, unknown>;
}

export function StepReview({
  allAnswers,
  onSubmit,
  onBack,
  isSaving,
}: ReviewProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { consent_truth: false as unknown as true },
  });

  const a = allAnswers as Record<string, string | number | string[] | undefined>;
  const zarzutyIds = (a.zarzuty as string[]) ?? [];
  const zarzutyLabels = ZARZUTY_OPTIONS.filter((o) => zarzutyIds.includes(o.id))
    .map((o) => o.label);

  const total =
    Number(a.kwota_glowna ?? 0) +
    Number(a.kwota_odsetki ?? 0) +
    Number(a.kwota_koszty ?? 0);

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-6"
      noValidate
    >
      <section className="rounded-xl border border-iron-200 bg-white shadow-subtle dark:border-iron-800 dark:bg-iron-950">
        <header className="border-b border-iron-200 px-5 py-3 dark:border-iron-800">
          <h3 className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
            Podsumowanie sprawy
          </h3>
          <p className="text-fluid-xs text-iron-600 dark:text-iron-400">
            Sprawdź dane przed wygenerowaniem pisma — będzie można je później skorygować.
          </p>
        </header>
        <dl className="grid gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
          <ReviewRow label="Sygnatura" value={a.sygnatura as string} />
          <ReviewRow label="Sąd" value={a.sad as string} />
          <ReviewRow label="Data nakazu" value={a.data_nakazu as string} />
          <ReviewRow label="Data doręczenia" value={a.data_doreczenia as string} />
          <ReviewRow label="Powód" value={a.powod_nazwa as string} />
          <ReviewRow label="Pozwany" value={a.pozwany_nazwa as string} />
          <ReviewRow label="Kwota główna" value={formatPLN(Number(a.kwota_glowna ?? 0))} />
          <ReviewRow label="Razem (z odsetkami i kosztami)" value={formatPLN(total)} highlight />
        </dl>
        <div className="border-t border-iron-200 px-5 py-4 dark:border-iron-800">
          <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
            Zarzuty
          </p>
          {zarzutyLabels.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-fluid-sm text-iron-800 dark:text-iron-200">
              {zarzutyLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-fluid-sm text-iron-500">Brak — wróć do kroku 4.</p>
          )}
        </div>
      </section>

      <FormField
        label=""
        error={errors.consent_truth?.message as string | undefined}
        htmlFor="consent_truth"
      >
        <Controller
          control={control}
          name="consent_truth"
          render={({ field }) => (
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
                "hover:border-dlugomat-400 focus-within:ring-2 focus-within:ring-dlugomat-500/40",
                field.value
                  ? "border-dlugomat-500 bg-dlugomat-50/60 dark:border-dlugomat-400 dark:bg-dlugomat-950/40"
                  : "border-iron-200 dark:border-iron-800",
              )}
            >
              <input
                id="consent_truth"
                type="checkbox"
                className="mt-0.5 size-4 accent-dlugomat-600"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span className="text-fluid-sm text-iron-800 dark:text-iron-200">
                Oświadczam, że podane dane są zgodne z prawdą oraz że Długomat
                generuje pismo na ich podstawie. Pismo zostanie udostępnione do
                pobrania po opłacie i przed jego złożeniem ponoszę pełną odpowiedzialność za jego treść.
              </span>
            </label>
          )}
        />
      </FormField>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          Wstecz
        </Button>
        <Button type="submit" loading={isSubmitting || isSaving}>
          Wygeneruj pismo
        </Button>
      </div>
    </form>
  );
}

function ReviewRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-fluid-xs uppercase tracking-wide text-iron-500">
        {label}
      </dt>
      <dd
        className={cn(
          "text-fluid-sm",
          highlight
            ? "font-semibold text-iron-900 dark:text-iron-50"
            : "text-iron-800 dark:text-iron-200",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
