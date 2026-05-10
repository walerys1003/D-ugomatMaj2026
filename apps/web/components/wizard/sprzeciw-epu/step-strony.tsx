"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { sprzeciwEpuStronySchema } from "@/lib/wizard/modules/sprzeciw-epu";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

type Values = z.infer<typeof sprzeciwEpuStronySchema>;

export function StepStrony({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<Values>) {
  const form = useForm<Values>({
    resolver: zodResolver(sprzeciwEpuStronySchema),
    defaultValues: {
      powod_nazwa: (defaultValues.powod_nazwa as string) ?? "",
      powod_adres: (defaultValues.powod_adres as string) ?? "",
      pozwany_nazwa: (defaultValues.pozwany_nazwa as string) ?? "",
      pozwany_adres: (defaultValues.pozwany_adres as string) ?? "",
      pozwany_pesel: (defaultValues.pozwany_pesel as string) ?? "",
    },
    mode: "onBlur",
  });

  const onValid = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={onValid} className="space-y-6" noValidate>
      <fieldset className="rounded-xl border border-iron-200 dark:border-dlugomat-800 p-4">
        <legend className="px-2 text-fluid-xs uppercase tracking-wide text-iron-500">
          Powód (wierzyciel)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Nazwa powoda"
            error={form.formState.errors.powod_nazwa?.message}
          >
            <Input
              {...form.register("powod_nazwa")}
              placeholder="Fundusz Sekurytyzacyjny XYZ"
            />
          </FormField>
          <FormField
            label="Adres powoda"
            error={form.formState.errors.powod_adres?.message}
          >
            <Input
              {...form.register("powod_adres")}
              placeholder="ul. Przykładowa 1, 00-000 Warszawa"
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-iron-200 dark:border-dlugomat-800 p-4">
        <legend className="px-2 text-fluid-xs uppercase tracking-wide text-iron-500">
          Pozwany (Ty)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Imię i nazwisko"
            error={form.formState.errors.pozwany_nazwa?.message}
          >
            <Input
              {...form.register("pozwany_nazwa")}
              placeholder="Jan Kowalski"
              autoComplete="name"
            />
          </FormField>
          <FormField
            label="Adres"
            error={form.formState.errors.pozwany_adres?.message}
          >
            <Input
              {...form.register("pozwany_adres")}
              placeholder="ul. Twoja 5, 00-000 Miasto"
              autoComplete="street-address"
            />
          </FormField>
          <FormField
            label="PESEL (opcjonalnie)"
            hint="Sąd zwykle wymaga PESEL pozwanego. Dane szyfrujemy."
            error={form.formState.errors.pozwany_pesel?.message}
          >
            <Input
              {...form.register("pozwany_pesel")}
              placeholder="00000000000"
              inputMode="numeric"
              maxLength={11}
              autoComplete="off"
            />
          </FormField>
        </div>
      </fieldset>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSaving || form.formState.isSubmitting}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
