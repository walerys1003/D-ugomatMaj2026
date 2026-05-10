"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  BIK_NIEPRAWIDLOWOSCI,
  bikReviewSchema,
  type BikFixAnswers,
  type BikReviewValues,
} from "../schemas";

interface StepBikReviewProps extends WizardStepProps<BikReviewValues> {
  /** Pełen snapshot odpowiedzi z poprzednich kroków — do wyświetlenia. */
  allAnswers: Partial<BikFixAnswers>;
}

const VARIANT_LABELS: Record<string, string> = {
  reklamacja_bank: "Reklamacja do banku (krok 1/3)",
  reklamacja_bik: "Reklamacja do BIK S.A. (krok 2/3)",
  skarga_uodo: "Skarga do Prezesa UODO (krok 3/3)",
};

const VARIANT_ART: Record<string, string> = {
  reklamacja_bank: "art. 70a Pr. bank., art. 16 RODO",
  reklamacja_bik: "art. 16/17 RODO, regulamin BIK S.A.",
  skarga_uodo: "art. 77 RODO, ustawa o ochronie danych osobowych",
};

export function StepBikReview({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
  allAnswers,
}: StepBikReviewProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BikReviewValues>({
    resolver: zodResolver(bikReviewSchema),
    defaultValues: {
      consent_truth: (defaultValues.consent_truth ?? false) as unknown as true,
    },
  });

  const variant = allAnswers.variant ?? "reklamacja_bank";
  const zarzuty = allAnswers.zarzuty ?? [];
  const zarzutyLabels = zarzuty
    .map((z) => BIK_NIEPRAWIDLOWOSCI.find((b) => b.id === z)?.label ?? z)
    .filter(Boolean);

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <section className="rounded-2xl border border-iron-200 bg-white shadow-subtle dark:border-iron-800 dark:bg-iron-950">
        <header className="border-b border-iron-200 px-5 py-3 dark:border-iron-800">
          <h3 className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
            {VARIANT_LABELS[variant] ?? variant}
          </h3>
          <p className="text-fluid-xs text-iron-600 dark:text-iron-400">
            Podstawa prawna: {VARIANT_ART[variant] ?? "—"}
          </p>
        </header>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
          <ReviewRow label="Zgłaszający" value={allAnswers.powod_nazwa} />
          <ReviewRow label="Adres" value={allAnswers.powod_adres} />
          {allAnswers.pozwany_pesel && (
            <ReviewRow
              label="PESEL"
              value={maskPesel(allAnswers.pozwany_pesel)}
            />
          )}
          <ReviewRow label="Bank" value={allAnswers.bank_nazwa} />
          <ReviewRow label="Numer umowy" value={allAnswers.numer_umowy} />
          <ReviewRow
            label="Kwota"
            value={
              typeof allAnswers.kwota_kredytu === "number"
                ? formatPln(allAnswers.kwota_kredytu)
                : undefined
            }
            highlight
          />
          <ReviewRow label="Data wpisu" value={allAnswers.data_wpisu} />
          <ReviewRow
            label="Status"
            value={allAnswers.status_wpisu ?? undefined}
          />
        </dl>

        <div className="border-t border-iron-200 px-5 py-4 dark:border-iron-800">
          <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
            Zarzuty
          </p>
          {zarzutyLabels.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-fluid-sm text-iron-800 dark:text-iron-200">
              {zarzutyLabels.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-fluid-sm text-iron-500">
              Brak — wróć do kroku „Zarzuty".
            </p>
          )}
        </div>

        {allAnswers.okolicznosci && (
          <div className="border-t border-iron-200 px-5 py-4 dark:border-iron-800">
            <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
              Okoliczności
            </p>
            <p className="mt-1 whitespace-pre-line text-fluid-sm text-iron-800 dark:text-iron-200">
              {allAnswers.okolicznosci}
            </p>
          </div>
        )}

        {(variant === "reklamacja_bik" || variant === "skarga_uodo") &&
          (allAnswers.data_reklamacji_bank ||
            allAnswers.data_reklamacji_bik) && (
            <div className="border-t border-iron-200 px-5 py-4 dark:border-iron-800">
              <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
                Historia ścieżki reklamacyjnej
              </p>
              <ul className="mt-1 space-y-1 text-fluid-sm text-iron-800 dark:text-iron-200">
                {allAnswers.data_reklamacji_bank && (
                  <li>
                    Reklamacja w banku:{" "}
                    <strong>{allAnswers.data_reklamacji_bank}</strong>
                  </li>
                )}
                {variant === "skarga_uodo" && allAnswers.data_reklamacji_bik && (
                  <li>
                    Reklamacja w BIK:{" "}
                    <strong>{allAnswers.data_reklamacji_bik}</strong>
                  </li>
                )}
              </ul>
            </div>
          )}
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
                Potwierdzam, że dane są zgodne z prawdą i mam podstawy faktyczne
                do zgłoszenia powyższych zarzutów. Rozumiem, że pismo jest
                projektem przygotowanym przez Długomat — odpowiedzialność za
                jego złożenie spoczywa na mnie.
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

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function ReviewRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null | undefined;
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

function maskPesel(p: string): string {
  if (!/^\d{11}$/.test(p)) return p;
  return `${p.slice(0, 3)}*****${p.slice(8)}`;
}

function formatPln(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
