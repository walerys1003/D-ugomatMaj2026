"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { dluznikSchema, type DluznikValues } from "../schemas";

export function StepDluznik({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<DluznikValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DluznikValues>({
    resolver: zodResolver(dluznikSchema),
    defaultValues: {
      dluznik_nazwa: defaultValues.dluznik_nazwa ?? "",
      dluznik_adres: defaultValues.dluznik_adres ?? "",
      dluznik_pesel: defaultValues.dluznik_pesel ?? "",
      dluznik_nip: defaultValues.dluznik_nip ?? "",
      dluznik_email: defaultValues.dluznik_email ?? "",
      dluznik_telefon: defaultValues.dluznik_telefon ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Dane wnioskodawcy. PESEL jest wymagany — to podstawowy identyfikator
        we wniosku o ogłoszenie upadłości konsumenckiej.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dluznik_nazwa">Imię i nazwisko</Label>
        <Input
          id="dluznik_nazwa"
          autoComplete="name"
          aria-invalid={Boolean(errors.dluznik_nazwa)}
          {...register("dluznik_nazwa")}
        />
        {errors.dluznik_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.dluznik_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dluznik_adres">Adres zamieszkania</Label>
        <Input
          id="dluznik_adres"
          placeholder="ul. Przykładowa 12/3, 00-000 Warszawa"
          autoComplete="street-address"
          aria-invalid={Boolean(errors.dluznik_adres)}
          {...register("dluznik_adres")}
        />
        {errors.dluznik_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.dluznik_adres.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dluznik_pesel">PESEL</Label>
          <Input
            id="dluznik_pesel"
            inputMode="numeric"
            maxLength={11}
            placeholder="11 cyfr"
            aria-invalid={Boolean(errors.dluznik_pesel)}
            {...register("dluznik_pesel")}
          />
          <p className="text-fluid-xs text-ink-600">
            PESEL pojawi się w piśmie zamaskowany (XXX*****1234).
          </p>
          {errors.dluznik_pesel?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.dluznik_pesel.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dluznik_nip">NIP (jeśli były przedsiębiorca)</Label>
          <Input
            id="dluznik_nip"
            inputMode="numeric"
            maxLength={10}
            placeholder="10 cyfr"
            aria-invalid={Boolean(errors.dluznik_nip)}
            {...register("dluznik_nip")}
          />
          {errors.dluznik_nip?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.dluznik_nip.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dluznik_email">E-mail (opcjonalnie)</Label>
          <Input
            id="dluznik_email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.dluznik_email)}
            {...register("dluznik_email")}
          />
          {errors.dluznik_email?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.dluznik_email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dluznik_telefon">Telefon (opcjonalnie)</Label>
          <Input
            id="dluznik_telefon"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.dluznik_telefon)}
            {...register("dluznik_telefon")}
          />
          {errors.dluznik_telefon?.message && (
            <p role="alert" className="text-fluid-sm text-temporal-red-600">
              {errors.dluznik_telefon.message}
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
