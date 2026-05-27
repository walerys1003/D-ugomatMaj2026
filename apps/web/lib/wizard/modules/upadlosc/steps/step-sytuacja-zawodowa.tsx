"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import {
  FORMA_DOCHODU,
  STATUS_ZAWODOWY,
  sytuacjaZawodowaSchema,
  type SytuacjaZawodowaValues,
} from "../schemas";

export function StepSytuacjaZawodowa({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<SytuacjaZawodowaValues>) {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SytuacjaZawodowaValues>({
    resolver: zodResolver(sytuacjaZawodowaSchema),
    defaultValues: {
      status_zawodowy: defaultValues.status_zawodowy ?? "konsument",
      data_zakonczenia_dzialalnosci:
        defaultValues.data_zakonczenia_dzialalnosci ?? "",
      forma_dochodu: defaultValues.forma_dochodu ?? "umowa_o_prace",
      dochod_miesieczny: defaultValues.dochod_miesieczny ?? 0,
      liczba_osob_na_utrzymaniu: defaultValues.liczba_osob_na_utrzymaniu ?? 0,
    },
  });

  const status = watch("status_zawodowy");
  const showDataZakonczenia =
    status === "byly_przedsiebiorca" || status === "wspolnik_spolki";

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Sąd ocenia, czy spełniasz definicję konsumenta (art. 491¹ Pr.up.).
        Były przedsiębiorca też może złożyć wniosek — pod warunkiem zamknięcia
        działalności.
      </div>

      <Controller
        control={control}
        name="status_zawodowy"
        render={({ field }) => (
          <div className="space-y-2" role="radiogroup">
            <Label>Status zawodowy</Label>
            <div className="grid gap-2">
              {STATUS_ZAWODOWY.map((s) => {
                const checked = field.value === s.id;
                return (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      checked
                        ? "border-shield-400 bg-shield-50/60"
                        : "border-ink-200 hover:border-shield-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_zawodowy"
                      value={s.id}
                      checked={checked}
                      onChange={() => field.onChange(s.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-ink-800">{s.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.status_zawodowy?.message && (
              <p role="alert" className="text-fluid-sm text-temporal-red-600">
                {errors.status_zawodowy.message}
              </p>
            )}
          </div>
        )}
      />

      {showDataZakonczenia && (
        <div className="space-y-1.5">
          <Label htmlFor="data_zakonczenia_dzialalnosci">
            Data zakończenia działalności
          </Label>
          <Input
            id="data_zakonczenia_dzialalnosci"
            type="date"
            aria-invalid={Boolean(errors.data_zakonczenia_dzialalnosci)}
            {...register("data_zakonczenia_dzialalnosci")}
          />
          {errors.data_zakonczenia_dzialalnosci?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.data_zakonczenia_dzialalnosci.message}
            </p>
          )}
        </div>
      )}

      <Controller
        control={control}
        name="forma_dochodu"
        render={({ field }) => (
          <div className="space-y-2" role="radiogroup">
            <Label>Główne źródło dochodu</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {FORMA_DOCHODU.map((f) => {
                const checked = field.value === f.id;
                return (
                  <label
                    key={f.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      checked
                        ? "border-shield-400 bg-shield-50/60"
                        : "border-ink-200 hover:border-shield-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="forma_dochodu"
                      value={f.id}
                      checked={checked}
                      onChange={() => field.onChange(f.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-ink-800">{f.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.forma_dochodu?.message && (
              <p role="alert" className="text-fluid-sm text-temporal-red-600">
                {errors.forma_dochodu.message}
              </p>
            )}
          </div>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dochod_miesieczny">Dochód miesięczny netto (PLN)</Label>
          <Input
            id="dochod_miesieczny"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            aria-invalid={Boolean(errors.dochod_miesieczny)}
            {...register("dochod_miesieczny")}
          />
          {errors.dochod_miesieczny?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.dochod_miesieczny.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="liczba_osob_na_utrzymaniu">
            Osób na utrzymaniu (dzieci, niesamodzielni)
          </Label>
          <Input
            id="liczba_osob_na_utrzymaniu"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            aria-invalid={Boolean(errors.liczba_osob_na_utrzymaniu)}
            {...register("liczba_osob_na_utrzymaniu")}
          />
          {errors.liczba_osob_na_utrzymaniu?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.liczba_osob_na_utrzymaniu.message}
            </p>
          )}
        </div>
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
