"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatPLN } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  SYTUACJA_ZYCIOWA,
  UGODA_VARIANTS,
  ugodaReviewSchema,
  type UgodaAnswers,
  type UgodaReviewValues,
} from "../schemas";

interface ReviewProps extends WizardStepProps<UgodaReviewValues> {
  allAnswers?: Partial<UgodaAnswers>;
}

export function StepReview({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
  allAnswers,
}: ReviewProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UgodaReviewValues>({
    resolver: zodResolver(ugodaReviewSchema),
    defaultValues: {
      consent_truth: defaultValues.consent_truth ?? false,
    },
  });

  const a = (allAnswers ?? {}) as Partial<UgodaAnswers>;
  const variant =
    UGODA_VARIANTS.find((v) => v.id === a.variant) ?? UGODA_VARIANTS[0];
  const sytuacjaLabels = SYTUACJA_ZYCIOWA.filter((s) =>
    (a.sytuacja ?? []).includes(s.id),
  ).map((s) => s.label);

  const showRaty =
    a.variant === "propozycja_raty" || a.variant === "propozycja_indywidualna";
  const showUmorzenie =
    a.variant === "propozycja_umorzenie" ||
    a.variant === "propozycja_indywidualna";

  const sumaRat =
    typeof a.rata_miesieczna === "number" && typeof a.liczba_rat === "number"
      ? a.rata_miesieczna * a.liczba_rat
      : null;

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-2xl border border-shield-200 bg-shield-50/50 p-4">
        <div className="flex items-center gap-2 text-shield-700">
          <ShieldCheck className="size-5" aria-hidden />
          <span className="text-fluid-sm font-semibold uppercase tracking-wide">
            {variant.label}
          </span>
        </div>
        <p className="mt-1 text-fluid-xs text-iron-700">{variant.art}</p>
      </div>

      <dl className="grid gap-3 rounded-xl border border-iron-200 bg-white p-4 text-fluid-sm sm:grid-cols-2">
        <Row label="Wnioskodawca" value={a.dluznik_nazwa} />
        <Row label="Adres" value={a.dluznik_adres} />
        <Row label="Wierzyciel" value={a.wierzyciel_nazwa} />
        <Row label="Numer umowy" value={a.numer_umowy} />
        <Row label="Sygnatura sprawy" value={a.sygnatura} />
        <Row
          label="Kwota zadłużenia"
          value={
            typeof a.kwota_zadluzenia === "number"
              ? formatPLN(a.kwota_zadluzenia)
              : "—"
          }
        />
        <Row label="Data wymagalności" value={a.data_wymagalnosci} />
      </dl>

      {showRaty && (
        <dl className="grid gap-3 rounded-xl border border-iron-200 bg-white p-4 text-fluid-sm sm:grid-cols-2">
          <Row
            label="Rata miesięczna"
            value={
              typeof a.rata_miesieczna === "number"
                ? formatPLN(a.rata_miesieczna)
                : "—"
            }
          />
          <Row
            label="Liczba rat"
            value={
              typeof a.liczba_rat === "number" ? String(a.liczba_rat) : "—"
            }
          />
          <Row label="Data pierwszej raty" value={a.data_pierwszej_raty} />
          {sumaRat !== null && sumaRat > 0 && (
            <Row label="Suma rat" value={formatPLN(sumaRat)} />
          )}
        </dl>
      )}

      {showUmorzenie && (
        <dl className="grid gap-3 rounded-xl border border-iron-200 bg-white p-4 text-fluid-sm sm:grid-cols-2">
          <Row
            label="Kwota do zapłaty"
            value={
              typeof a.kwota_proponowana === "number"
                ? formatPLN(a.kwota_proponowana)
                : "—"
            }
          />
          {typeof a.procent_umorzenia === "number" && (
            <Row label="% umorzenia" value={`${a.procent_umorzenia}%`} />
          )}
          {a.variant === "propozycja_umorzenie" && (
            <Row label="Termin zapłaty" value={a.termin_zaplaty} />
          )}
        </dl>
      )}

      {sytuacjaLabels.length > 0 && (
        <div className="rounded-xl border border-iron-200 bg-white p-4 text-fluid-sm">
          <h4 className="mb-2 font-semibold text-iron-900">Sytuacja życiowa</h4>
          <ul className="list-disc pl-5 text-iron-800">
            {sytuacjaLabels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      {a.okolicznosci && (
        <div className="rounded-xl border border-iron-200 bg-white p-4 text-fluid-sm">
          <h4 className="mb-1 font-semibold text-iron-900">
            Dodatkowe uzasadnienie
          </h4>
          <p className="whitespace-pre-line text-iron-800">{a.okolicznosci}</p>
        </div>
      )}

      <label
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4 text-fluid-sm transition-all",
          errors.consent_truth
            ? "border-temporal-red-300 bg-temporal-red-50/40"
            : "border-iron-200 bg-white",
        )}
      >
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-shield-600"
          {...register("consent_truth")}
        />
        <span className="text-iron-800">
          Potwierdzam, że dane są zgodne z prawdą. Rozumiem, że pismo jest
          jedynie propozycją ugody — nie stanowi uznania długu (art. 123 §1 pkt 2 KC)
          do czasu akceptacji warunków przez wierzyciela.
        </span>
      </label>
      {errors.consent_truth?.message && (
        <p role="alert" className="text-fluid-sm text-temporal-red-600">
          {errors.consent_truth.message}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            Wstecz
          </Button>
        )}
        <Button type="submit" loading={isSubmitting || isSaving}>
          Generuj pismo
        </Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-fluid-xs uppercase tracking-wide text-iron-600">
        {label}
      </dt>
      <dd className="text-iron-900">
        {value !== undefined && value !== "" ? value : "—"}
      </dd>
    </div>
  );
}
