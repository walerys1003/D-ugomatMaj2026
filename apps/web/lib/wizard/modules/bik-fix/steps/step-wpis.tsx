"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { wpisSchema, type WpisValues } from "../schemas";

const STATUS_OPTIONS: Array<{
  id: WpisValues["status_wpisu"];
  label: string;
  helper: string;
}> = [
  {
    id: "aktywny",
    label: "Aktywny",
    helper: "Zobowiązanie wciąż obowiązuje, raty bieżące.",
  },
  {
    id: "zaległość",
    label: "Zaległość",
    helper: "Bank wykazuje opóźnienia / zadłużenie.",
  },
  {
    id: "zamknięty",
    label: "Zamknięty / spłacony",
    helper: "Zobowiązanie zostało spłacone lub wygasło.",
  },
];

export function StepWpis({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<WpisValues>) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WpisValues>({
    resolver: zodResolver(wpisSchema),
    defaultValues: {
      bank_nazwa: defaultValues.bank_nazwa ?? "",
      bank_adres: defaultValues.bank_adres ?? "",
      numer_umowy: defaultValues.numer_umowy ?? "",
      kwota_kredytu: defaultValues.kwota_kredytu ?? 0,
      data_wpisu: defaultValues.data_wpisu ?? "",
      status_wpisu: defaultValues.status_wpisu ?? undefined,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <FormField
        label="Bank, który dokonał wpisu"
        hint="Np. „PKO BP”, „Santander Bank Polska”."
        error={errors.bank_nazwa?.message}
        htmlFor="bank_nazwa"
        required
      >
        <Input id="bank_nazwa" autoFocus {...register("bank_nazwa")} />
      </FormField>

      <FormField
        label="Adres banku (opcjonalnie)"
        hint="Adres siedziby — pomocny przy wysyłce listem poleconym."
        error={errors.bank_adres?.message}
        htmlFor="bank_adres"
      >
        <Input
          id="bank_adres"
          placeholder="ul. Puławska 15, 02-515 Warszawa"
          {...register("bank_adres")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Numer umowy"
          hint="Z umowy kredytowej / pożyczkowej."
          error={errors.numer_umowy?.message}
          htmlFor="numer_umowy"
          required
        >
          <Input id="numer_umowy" {...register("numer_umowy")} />
        </FormField>

        <FormField
          label="Kwota kredytu / saldo"
          hint="W złotych — np. 8500.00"
          error={errors.kwota_kredytu?.message}
          htmlFor="kwota_kredytu"
          required
        >
          <Input
            id="kwota_kredytu"
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register("kwota_kredytu")}
          />
        </FormField>
      </div>

      <FormField
        label="Data wpisu w BIK"
        hint="Z raportu BIK lub potwierdzenia banku."
        error={errors.data_wpisu?.message}
        htmlFor="data_wpisu"
        required
      >
        <Input id="data_wpisu" type="date" {...register("data_wpisu")} />
      </FormField>

      <FormField
        label="Status wpisu (opcjonalnie)"
        error={errors.status_wpisu?.message}
        htmlFor="status_wpisu"
      >
        <Controller
          name="status_wpisu"
          control={control}
          render={({ field }) => (
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
              {STATUS_OPTIONS.map((opt) => {
                const active = field.value === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => field.onChange(active ? undefined : opt.id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
                      active
                        ? "border-shield-500 bg-shield-50/70"
                        : "border-ink-200 bg-white hover:border-shield-300",
                    )}
                  >
                    <span className="block text-fluid-sm font-medium text-ink-900">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-fluid-xs text-ink-600">
                      {opt.helper}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </FormField>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          Wstecz
        </Button>
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
