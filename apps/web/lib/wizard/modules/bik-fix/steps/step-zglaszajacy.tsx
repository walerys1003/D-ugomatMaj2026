"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { zglaszajacySchema, type ZglaszajacyValues } from "../schemas";

export function StepZglaszajacy({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<ZglaszajacyValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ZglaszajacyValues>({
    resolver: zodResolver(zglaszajacySchema),
    defaultValues: {
      powod_nazwa: defaultValues.powod_nazwa ?? "",
      powod_adres: defaultValues.powod_adres ?? "",
      pozwany_pesel: defaultValues.pozwany_pesel ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <div className="rounded-lg border border-shield-100 bg-shield-50/30 p-3 text-fluid-sm text-iron-700">
        Te dane trafią na początek pisma — dlatego wpisz je dokładnie tak, jak
        figurują w dokumentach bankowych (imię, nazwisko, adres zameldowania).
      </div>

      <FormField
        label="Imię i nazwisko"
        hint="Np. „Anna Nowak”."
        error={errors.powod_nazwa?.message}
        htmlFor="powod_nazwa"
        required
      >
        <Input id="powod_nazwa" autoFocus {...register("powod_nazwa")} />
      </FormField>

      <FormField
        label="Adres (ulica, kod, miasto)"
        error={errors.powod_adres?.message}
        htmlFor="powod_adres"
        required
      >
        <Input
          id="powod_adres"
          placeholder="ul. Lipowa 5, 00-001 Warszawa"
          {...register("powod_adres")}
        />
      </FormField>

      <FormField
        label="PESEL (opcjonalnie)"
        hint="Bank zazwyczaj wymaga PESEL-u w korespondencji reklamacyjnej. Pole jest szyfrowane i niewidoczne dla nikogo poza Tobą."
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
