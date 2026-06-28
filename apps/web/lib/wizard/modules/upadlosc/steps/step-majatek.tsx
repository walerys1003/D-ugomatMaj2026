"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { majatekSchema, type MajatekValues } from "../schemas";

export function StepMajatek({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<MajatekValues>) {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MajatekValues>({
    resolver: zodResolver(majatekSchema),
    defaultValues: {
      posiada_nieruchomosc: defaultValues.posiada_nieruchomosc ?? false,
      nieruchomosc_opis: defaultValues.nieruchomosc_opis ?? "",
      posiada_pojazd: defaultValues.posiada_pojazd ?? false,
      pojazd_opis: defaultValues.pojazd_opis ?? "",
      srodki_na_koncie: defaultValues.srodki_na_koncie ?? 0,
      inne_skladniki: defaultValues.inne_skladniki ?? "",
    },
  });

  const posiadaNier = watch("posiada_nieruchomosc");
  const posiadaPoj = watch("posiada_pojazd");

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-temporal-amber-200 bg-temporal-amber-50/40 p-3 text-sm text-ink-800">
        <strong>Ważne:</strong> wykaz majątku musi być kompletny i prawdziwy.
        Ukrycie składników to przestępstwo (art. 522 Pr.up.) i prowadzi do
        umorzenia postępowania bez oddłużenia.
      </div>

      <Controller
        control={control}
        name="posiada_nieruchomosc"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-3 text-sm hover:border-shield-200">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-ink-800">
              Posiadam nieruchomość (mieszkanie, dom, działka, udział)
            </span>
          </label>
        )}
      />

      {posiadaNier && (
        <div className="space-y-1.5">
          <Label htmlFor="nieruchomosc_opis">Opis nieruchomości</Label>
          <Textarea
            id="nieruchomosc_opis"
            placeholder="np. mieszkanie własnościowe 45 m², ul. Przykładowa 12/3, Warszawa, KW WA1M/00012345/6, szacunkowa wartość 450 000 zł"
            rows={3}
            aria-invalid={Boolean(errors.nieruchomosc_opis)}
            {...register("nieruchomosc_opis")}
          />
          {errors.nieruchomosc_opis?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.nieruchomosc_opis.message}
            </p>
          )}
        </div>
      )}

      <Controller
        control={control}
        name="posiada_pojazd"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-3 text-sm hover:border-shield-200">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-ink-800">
              Posiadam pojazd mechaniczny (auto, motocykl, przyczepa)
            </span>
          </label>
        )}
      />

      {posiadaPoj && (
        <div className="space-y-1.5">
          <Label htmlFor="pojazd_opis">Opis pojazdu</Label>
          <Textarea
            id="pojazd_opis"
            placeholder="np. Skoda Octavia 2014, nr rej. WA12345, szacunkowa wartość 22 000 zł"
            rows={2}
            aria-invalid={Boolean(errors.pojazd_opis)}
            {...register("pojazd_opis")}
          />
          {errors.pojazd_opis?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.pojazd_opis.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="srodki_na_koncie">
          Środki na rachunkach bankowych (PLN)
        </Label>
        <Input
          id="srodki_na_koncie"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          aria-invalid={Boolean(errors.srodki_na_koncie)}
          {...register("srodki_na_koncie")}
        />
        {errors.srodki_na_koncie?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.srodki_na_koncie.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inne_skladniki">
          Inne składniki majątku (opcjonalnie)
        </Label>
        <Textarea
          id="inne_skladniki"
          placeholder="np. polisa ubezpieczeniowa z funduszem kapitałowym, akcje, jednostki funduszy, wierzytelności wobec osób trzecich, sprzęt o wartości > 5000 zł"
          rows={3}
          aria-invalid={Boolean(errors.inne_skladniki)}
          {...register("inne_skladniki")}
        />
        {errors.inne_skladniki?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.inne_skladniki.message}
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
