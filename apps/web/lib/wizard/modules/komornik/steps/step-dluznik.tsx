"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { dluznikSchema, type DluznikValues } from "../schemas";

export function StepKomornikDluznik({
  defaultValues,
  onSubmit,
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
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <p className="text-fluid-sm text-ink-700">
        Podaj swoje dane — wpiszemy je w nagłówek pisma. PESEL jest opcjonalny,
        ale przy egzekucji znacząco przyspiesza identyfikację sprawy w
        kancelarii.
      </p>

      <FormField
        label="Imię i nazwisko"
        htmlFor="dluznik_nazwa"
        error={errors.dluznik_nazwa?.message}
      >
        <Input
          id="dluznik_nazwa"
          autoComplete="name"
          placeholder="Jan Kowalski"
          {...register("dluznik_nazwa")}
        />
      </FormField>

      <FormField
        label="Adres"
        htmlFor="dluznik_adres"
        hint="Ulica, kod pocztowy, miasto."
        error={errors.dluznik_adres?.message}
      >
        <Input
          id="dluznik_adres"
          autoComplete="street-address"
          placeholder="ul. Polna 1, 00-001 Warszawa"
          {...register("dluznik_adres")}
        />
      </FormField>

      <FormField
        label="PESEL (opcjonalnie)"
        htmlFor="dluznik_pesel"
        hint="11 cyfr — zostanie zamaskowany w piśmie."
        error={errors.dluznik_pesel?.message}
      >
        <Input
          id="dluznik_pesel"
          inputMode="numeric"
          maxLength={11}
          placeholder="—"
          {...register("dluznik_pesel")}
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}

// BRAMA 4 alias — index.ts imports the short name (`StepDluznik`).
export { StepKomornikDluznik as StepDluznik };
