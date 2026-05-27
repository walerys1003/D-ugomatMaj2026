"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { sadSchema, type SadValues } from "../schemas";

export function StepSad({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<SadValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SadValues>({
    resolver: zodResolver(sadSchema),
    defaultValues: {
      sad_nazwa: defaultValues.sad_nazwa ?? "",
      sad_adres: defaultValues.sad_adres ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/40 p-3 text-sm text-ink-700">
        Wniosek o upadłość konsumencką składasz do <strong>sądu rejonowego —
        wydziału gospodarczego (upadłościowego)</strong> właściwego dla Twojego
        miejsca zwykłego pobytu (art. 18 Pr.up.).
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sad_nazwa">Nazwa sądu</Label>
        <Input
          id="sad_nazwa"
          placeholder="Sąd Rejonowy dla m. st. Warszawy w Warszawie, X Wydział Gospodarczy ds. Upadłościowych i Restrukturyzacyjnych"
          aria-invalid={Boolean(errors.sad_nazwa)}
          {...register("sad_nazwa")}
        />
        {errors.sad_nazwa?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.sad_nazwa.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sad_adres">Adres sądu (opcjonalnie)</Label>
        <Input
          id="sad_adres"
          placeholder="ul. Czerniakowska 100A, 00-454 Warszawa"
          aria-invalid={Boolean(errors.sad_adres)}
          {...register("sad_adres")}
        />
        {errors.sad_adres?.message && (
          <p role="alert" className="text-fluid-sm text-temporal-red-600">
            {errors.sad_adres.message}
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
