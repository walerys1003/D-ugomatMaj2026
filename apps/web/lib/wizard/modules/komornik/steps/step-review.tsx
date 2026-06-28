"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { cn, formatPLN } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  KOMORNIK_VARIANTS,
  SYTUACJA_ZYCIOWA,
  ZAJECIE_TYPY,
  komornikReviewSchema,
  type KomornikAnswers,
  type KomornikReviewValues,
} from "../schemas";

interface StepKomornikReviewProps extends WizardStepProps<KomornikReviewValues> {
  /** Pełny snapshot odpowiedzi z poprzednich kroków — do wyświetlenia. */
  allAnswers: Partial<KomornikAnswers>;
}

export function StepKomornikReview({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
  allAnswers,
}: StepKomornikReviewProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<KomornikReviewValues>({
    resolver: zodResolver(komornikReviewSchema),
    defaultValues: {
      consent_truth: (defaultValues.consent_truth ?? false) as unknown as true,
    },
  });

  const variant = allAnswers.variant ?? "zwolnienie_konta";
  const variantMeta = KOMORNIK_VARIANTS.find((v) => v.id === variant);
  const zajecieMeta = ZAJECIE_TYPY.find((t) => t.id === allAnswers.zajecie_typ);
  const sytuacjaLabels = (allAnswers.sytuacja ?? [])
    .map((s) => SYTUACJA_ZYCIOWA.find((x) => x.id === s)?.label ?? s)
    .filter(Boolean);

  const isSkarga = variant === "skarga";
  const isRaty = variant === "raty";

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <section className="rounded-2xl border border-ink-200 bg-white shadow-subtle dark:border-ink-800 dark:bg-ink-950">
        <header className="border-b border-ink-200 px-5 py-3 dark:border-ink-800">
          <h3 className="text-fluid-base font-semibold text-ink-900 dark:text-ink-50">
            {variantMeta?.label ?? variant}
          </h3>
          <p className="text-fluid-xs text-ink-600 dark:text-ink-400">
            Podstawa prawna: {variantMeta?.art ?? "—"}
          </p>
        </header>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
          <ReviewRow label="Dłużnik" value={allAnswers.dluznik_nazwa} />
          <ReviewRow label="Adres" value={allAnswers.dluznik_adres} />
          {allAnswers.dluznik_pesel && (
            <ReviewRow
              label="PESEL"
              value={maskPesel(allAnswers.dluznik_pesel)}
            />
          )}
          <ReviewRow label="Komornik" value={allAnswers.kancelaria_nazwa} />
          <ReviewRow label="Sygnatura" value={allAnswers.sygnatura_km} highlight />
          <ReviewRow label="Wierzyciel" value={allAnswers.wierzyciel} />
          <ReviewRow
            label="Zajęcie"
            value={zajecieMeta?.label ?? allAnswers.zajecie_typ}
          />
          <ReviewRow
            label="Kwota dochodzona"
            value={
              typeof allAnswers.kwota_dochodzona === "number" &&
              allAnswers.kwota_dochodzona > 0
                ? formatPLN(allAnswers.kwota_dochodzona)
                : "—"
            }
            highlight
          />
          {allAnswers.data_pisma && (
            <ReviewRow label="Data pisma" value={allAnswers.data_pisma} />
          )}
        </dl>

        {sytuacjaLabels.length > 0 && (
          <div className="border-t border-ink-200 px-5 py-4 dark:border-ink-800">
            <p className="text-fluid-xs uppercase tracking-wide text-ink-500">
              Sytuacja życiowa
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-fluid-sm text-ink-800 dark:text-ink-200">
              {sytuacjaLabels.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        )}

        {allAnswers.okolicznosci && (
          <div className="border-t border-ink-200 px-5 py-4 dark:border-ink-800">
            <p className="text-fluid-xs uppercase tracking-wide text-ink-500">
              Okoliczności
            </p>
            <p className="mt-1 whitespace-pre-line text-fluid-sm text-ink-800 dark:text-ink-200">
              {allAnswers.okolicznosci}
            </p>
          </div>
        )}

        {isSkarga && (allAnswers.czynnosc_komornika || allAnswers.data_doreczenia) && (
          <div className="border-t border-ink-200 px-5 py-4 dark:border-ink-800">
            <p className="text-fluid-xs uppercase tracking-wide text-ink-500">
              Skarga (art. 767 KPC)
            </p>
            <ul className="mt-1 space-y-1 text-fluid-sm text-ink-800 dark:text-ink-200">
              {allAnswers.czynnosc_komornika && (
                <li>
                  <strong>Zaskarżana czynność:</strong>{" "}
                  {allAnswers.czynnosc_komornika}
                </li>
              )}
              {allAnswers.data_doreczenia && (
                <li>
                  <strong>Data doręczenia:</strong> {allAnswers.data_doreczenia}{" "}
                  <span className="text-ink-500">
                    (termin 7 dni od tej daty)
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        {isRaty && (allAnswers.rata_miesieczna || allAnswers.liczba_rat) && (
          <div className="border-t border-ink-200 px-5 py-4 dark:border-ink-800">
            <p className="text-fluid-xs uppercase tracking-wide text-ink-500">
              Propozycja rat
            </p>
            <ul className="mt-1 space-y-1 text-fluid-sm text-ink-800 dark:text-ink-200">
              {allAnswers.rata_miesieczna != null && (
                <li>
                  <strong>Rata miesięczna:</strong>{" "}
                  {formatPLN(Number(allAnswers.rata_miesieczna))}
                </li>
              )}
              {allAnswers.liczba_rat != null && (
                <li>
                  <strong>Liczba rat:</strong> {allAnswers.liczba_rat}
                </li>
              )}
              {allAnswers.data_pierwszej_raty && (
                <li>
                  <strong>Pierwsza rata:</strong>{" "}
                  {allAnswers.data_pierwszej_raty}
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
                "hover:border-shield-400 focus-within:ring-2 focus-within:ring-shield-500/40",
                field.value
                  ? "border-shield-500 bg-shield-50/60 dark:border-shield-400 dark:bg-shield-950/40"
                  : "border-ink-200 dark:border-ink-800",
              )}
            >
              <input
                id="consent_truth"
                type="checkbox"
                className="mt-0.5 size-4 accent-shield-600"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span className="text-fluid-sm text-ink-800 dark:text-ink-200">
                Potwierdzam, że dane są zgodne z prawdą i mam podstawy faktyczne
                do złożenia powyższego pisma. Rozumiem, że pismo jest projektem
                przygotowanym przez Długomat — odpowiedzialność za jego złożenie
                spoczywa na mnie.
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
      <dt className="text-fluid-xs uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd
        className={cn(
          "text-fluid-sm",
          highlight
            ? "font-semibold text-ink-900 dark:text-ink-50"
            : "text-ink-800 dark:text-ink-200",
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
