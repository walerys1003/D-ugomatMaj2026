"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { stronySchema, type StronyValues } from "../schemas";

export function StepStrony({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<StronyValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StronyValues>({
    resolver: zodResolver(stronySchema),
    defaultValues: {
      powod_nazwa: defaultValues.powod_nazwa ?? "",
      powod_adres: defaultValues.powod_adres ?? "",
      pozwany_nazwa: defaultValues.pozwany_nazwa ?? "",
      pozwany_adres: defaultValues.pozwany_adres ?? "",
      pozwany_pesel: defaultValues.pozwany_pesel ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-6"
      noValidate
    >
      <section className="space-y-4">
        <h3 className="text-fluid-base font-semibold text-ink-900 dark:text-ink-50">
          Powód (wierzyciel)
        </h3>
        <FormField
          label="Nazwa powoda"
          hint="Z nakazu — np. „Fundusz Sekurytyzacyjny XYZ”."
          error={errors.powod_nazwa?.message}
          htmlFor="powod_nazwa"
          required
        >
          <Input
            id="powod_nazwa"
            autoFocus
            {...register("powod_nazwa")}
          />
        </FormField>
        <FormField
          label="Adres powoda"
          error={errors.powod_adres?.message}
          htmlFor="powod_adres"
          required
        >
          <Input id="powod_adres" {...register("powod_adres")} />
        </FormField>
      </section>

      <section className="space-y-4">
        <h3 className="text-fluid-base font-semibold text-ink-900 dark:text-ink-50">
          Pozwany (Ty)
        </h3>
        <FormField
          label="Imię i nazwisko"
          error={errors.pozwany_nazwa?.message}
          htmlFor="pozwany_nazwa"
          required
        >
          <Input id="pozwany_nazwa" {...register("pozwany_nazwa")} />
        </FormField>
        <FormField
          label="Adres"
          error={errors.pozwany_adres?.message}
          htmlFor="pozwany_adres"
          required
        >
          <Input id="pozwany_adres" {...register("pozwany_adres")} />
        </FormField>
        <FormField
          label="PESEL (opcjonalnie)"
          hint="Sąd wymaga go w sprzeciwie. Możesz uzupełnić teraz lub w PDF-ie."
          error={errors.pozwany_pesel?.message}
          htmlFor="pozwany_pesel"
        >
          <Input
            id="pozwany_pesel"
            inputMode="numeric"
            maxLength={11}
            placeholder="00000000000"
            {...register("pozwany_pesel")}
          />
        </FormField>
      </section>

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
