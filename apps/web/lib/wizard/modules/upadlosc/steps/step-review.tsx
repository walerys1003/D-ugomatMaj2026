"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { PRZYCZYNY_NIEWYPLACALNOSCI, STATUS_ZAWODOWY, ZALACZNIKI, upadloscReviewSchema, type UpadloscAnswers, type UpadloscReviewValues } from "../schemas";

interface StepReviewProps extends WizardStepProps<UpadloscReviewValues> {
  allAnswers?: Partial<UpadloscAnswers>;
}

const formatPLN = (n: number | undefined) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));

const labelFromList = (list: ReadonlyArray<{ id: string; label: string }>, id?: string) =>
  list.find((x) => x.id === id)?.label ?? id ?? "";

export function StepReview({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
  allAnswers,
}: StepReviewProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpadloscReviewValues>({
    resolver: zodResolver(upadloscReviewSchema),
    defaultValues: {
      consent_truth: (defaultValues.consent_truth ?? false) as true,
      consent_full_disclosure: (defaultValues.consent_full_disclosure ?? false) as true,
    },
  });

  const a = (allAnswers ?? {}) as Partial<UpadloscAnswers>;
  const wierzyciele = a.wierzyciele ?? [];
  const sumaZobowiazan = wierzyciele.reduce(
    (acc, w) => acc + (Number(w.kwota) || 0),
    0,
  );
  const przyczyny = (a.przyczyny ?? []) as string[];
  const zalaczniki = (a.zalaczniki ?? []) as string[];

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-temporal-amber-200 bg-temporal-amber-50/40 p-4 text-sm text-ink-800">
        <strong>Ostrzeżenie:</strong> wniosek o upadłość konsumencką to
        decyzja na 5 lat (plan spłaty) lub więcej. Przed złożeniem do sądu
        zalecamy konsultację z adwokatem lub radcą prawnym. Długomat dostarcza
        gotowe pismo — nie zastępuje porady prawnej w skomplikowanych
        przypadkach (firma w toku, współwłasność majątkowa, alimenty).
      </div>

      <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
        <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
          Wnioskodawca
        </h3>
        <dl className="grid gap-1">
          <div className="flex gap-2">
            <dt className="text-ink-600">Imię i nazwisko:</dt>
            <dd>{a.dluznik_nazwa ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">Adres:</dt>
            <dd>{a.dluznik_adres ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">PESEL:</dt>
            <dd>
              {a.dluznik_pesel
                ? `${a.dluznik_pesel.slice(0, 3)}*****${a.dluznik_pesel.slice(-4)}`
                : "—"}
            </dd>
          </div>
          {a.dluznik_nip && (
            <div className="flex gap-2">
              <dt className="text-ink-600">NIP:</dt>
              <dd>{a.dluznik_nip}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
        <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
          Sąd właściwy
        </h3>
        <p>{a.sad_nazwa ?? "—"}</p>
        {a.sad_adres && <p className="text-ink-600">{a.sad_adres}</p>}
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
        <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
          Sytuacja zawodowa
        </h3>
        <dl className="grid gap-1">
          <div className="flex gap-2">
            <dt className="text-ink-600">Status:</dt>
            <dd>{labelFromList(STATUS_ZAWODOWY, a.status_zawodowy)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">Dochód miesięczny:</dt>
            <dd>{formatPLN(a.dochod_miesieczny)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">Osób na utrzymaniu:</dt>
            <dd>{a.liczba_osob_na_utrzymaniu ?? 0}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
        <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
          Majątek
        </h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Nieruchomości:{" "}
            {a.posiada_nieruchomosc ? a.nieruchomosc_opis || "tak" : "brak"}
          </li>
          <li>
            Pojazdy: {a.posiada_pojazd ? a.pojazd_opis || "tak" : "brak"}
          </li>
          <li>Środki na rachunkach: {formatPLN(a.srodki_na_koncie)}</li>
          {a.inne_skladniki && <li>Inne: {a.inne_skladniki}</li>}
        </ul>
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
        <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
          Wierzyciele ({wierzyciele.length})
        </h3>
        <ul className="list-decimal space-y-1 pl-5">
          {wierzyciele.map((w, i) => (
            <li key={i}>
              <strong>{w.nazwa}</strong> — {w.tytul} — {formatPLN(w.kwota)}
            </li>
          ))}
        </ul>
        <p className="mt-2 border-t border-ink-100 pt-2 font-medium">
          Łączna kwota: {formatPLN(sumaZobowiazan)}
        </p>
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
        <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
          Przyczyny niewypłacalności
        </h3>
        <ul className="list-disc space-y-1 pl-5">
          {przyczyny.map((id) => (
            <li key={id}>{labelFromList(PRZYCZYNY_NIEWYPLACALNOSCI, id)}</li>
          ))}
        </ul>
        {a.uzasadnienie && (
          <p className="mt-2 whitespace-pre-line border-t border-ink-100 pt-2 text-ink-700">
            {a.uzasadnienie}
          </p>
        )}
      </section>

      {zalaczniki.length > 0 && (
        <section className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-800 shadow-sm">
          <h3 className="mb-2 text-fluid-sm font-semibold text-ink-900">
            Załączniki ({zalaczniki.length})
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {zalaczniki.map((id) => (
              <li key={id}>{labelFromList(ZALACZNIKI, id)}</li>
            ))}
          </ul>
        </section>
      )}

      <Controller
        control={control}
        name="consent_truth"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-3 text-sm hover:border-shield-200">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked || (false as unknown as true))}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-ink-800">
              Oświadczam, że dane podane w piśmie są zgodne z prawdą i odpowiadają
              mojej rzeczywistej sytuacji finansowej i majątkowej.
            </span>
          </label>
        )}
      />
      {errors.consent_truth?.message && (
        <p role="alert" className="text-fluid-sm text-temporal-red-600">
          {errors.consent_truth.message}
        </p>
      )}

      <Controller
        control={control}
        name="consent_full_disclosure"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-3 text-sm hover:border-shield-200">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked || (false as unknown as true))}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-ink-800">
              Oświadczam, że nie ukrywam żadnego składnika majątku ani
              wierzyciela. Rozumiem, że ukrycie majątku jest przestępstwem
              (art. 522 Pr.up.) i może prowadzić do umorzenia postępowania bez
              oddłużenia.
            </span>
          </label>
        )}
      />
      {errors.consent_full_disclosure?.message && (
        <p role="alert" className="text-fluid-sm text-temporal-red-600">
          {errors.consent_full_disclosure.message}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            Wstecz
          </Button>
        )}
        <Button type="submit" loading={isSubmitting || isSaving}>
          Wygeneruj pismo
        </Button>
      </div>
    </form>
  );
}
