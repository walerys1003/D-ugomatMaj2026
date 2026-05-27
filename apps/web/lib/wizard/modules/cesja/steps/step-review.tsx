"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatPLN } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  CESJA_ZARZUTY,
  cesjaReviewSchema,
  type CesjaAnswers,
  type CesjaReviewValues,
} from "../schemas";

interface ReviewProps extends WizardStepProps<CesjaReviewValues> {
  allAnswers?: Partial<CesjaAnswers>;
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
  } = useForm<CesjaReviewValues>({
    resolver: zodResolver(cesjaReviewSchema),
    defaultValues: {
      consent_truth: defaultValues.consent_truth ?? false,
    },
  });

  const a = (allAnswers ?? {}) as Partial<CesjaAnswers>;
  const zarzutyLabels = CESJA_ZARZUTY.filter((z) =>
    (a.zarzuty ?? []).includes(z.id),
  ).map((z) => z.label);

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
            Odpowiedź na wezwanie funduszu (cesja)
          </span>
        </div>
        <p className="mt-1 text-fluid-xs text-ink-700">
          art. 509–512 KC, art. 117 KC
        </p>
      </div>

      <dl className="grid gap-3 rounded-xl border border-ink-200 bg-white p-4 text-fluid-sm sm:grid-cols-2">
        <Row label="Wnioskodawca" value={a.dluznik_nazwa} />
        <Row label="Adres" value={a.dluznik_adres} />
        <Row label="Fundusz / windykator" value={a.fundusz_nazwa} />
        <Row label="NIP / KRS" value={a.fundusz_nip} />
        <Row label="Sygnatura funduszu" value={a.sygnatura_funduszu} />
        <Row label="Data wezwania" value={a.data_wezwania} />
        <Row
          label="Kwota dochodzona"
          value={
            typeof a.kwota_dochodzona === "number"
              ? formatPLN(a.kwota_dochodzona)
              : "—"
          }
        />
        <Row label="Pierwotny wierzyciel" value={a.pierwotny_wierzyciel} />
        <Row label="Numer umowy" value={a.numer_umowy} />
        <Row label="Data umowy" value={a.data_umowy} />
        <Row label="Data wymagalności" value={a.data_wymagalnosci} />
      </dl>

      {zarzutyLabels.length > 0 && (
        <div className="rounded-xl border border-ink-200 bg-white p-4 text-fluid-sm">
          <h4 className="mb-2 font-semibold text-ink-900">Zarzuty</h4>
          <ul className="list-disc pl-5 text-ink-800">
            {zarzutyLabels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      {a.okolicznosci && (
        <div className="rounded-xl border border-ink-200 bg-white p-4 text-fluid-sm">
          <h4 className="mb-1 font-semibold text-ink-900">
            Dodatkowe okoliczności
          </h4>
          <p className="whitespace-pre-line text-ink-800">{a.okolicznosci}</p>
        </div>
      )}

      <label
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4 text-fluid-sm transition-all",
          errors.consent_truth
            ? "border-temporal-red-300 bg-temporal-red-50/40"
            : "border-ink-200 bg-white",
        )}
      >
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-shield-600"
          {...register("consent_truth")}
        />
        <span className="text-ink-800">
          Potwierdzam, że dane podane w formularzu są zgodne z prawdą,
          a załączniki — autentyczne. Rozumiem, że pismo zostanie wygenerowane
          na ich podstawie.
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
      <dt className="text-fluid-xs uppercase tracking-wide text-ink-600">
        {label}
      </dt>
      <dd className="text-ink-900">
        {value !== undefined && value !== "" ? value : "—"}
      </dd>
    </div>
  );
}
