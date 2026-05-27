"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { komornikSchema, type KomornikValues } from "../schemas";

export function StepKomornikKancelaria({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<KomornikValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KomornikValues>({
    resolver: zodResolver(komornikSchema),
    defaultValues: {
      kancelaria_nazwa: defaultValues.kancelaria_nazwa ?? "",
      kancelaria_adres: defaultValues.kancelaria_adres ?? "",
      sygnatura_km: defaultValues.sygnatura_km ?? "",
      wierzyciel: defaultValues.wierzyciel ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <p className="text-fluid-sm text-ink-700">
        Skopiuj dane z otrzymanego pisma od komornika — najczęściej z nagłówka
        zawiadomienia o wszczęciu egzekucji albo postanowienia o zajęciu.
      </p>

      <FormField
        label="Komornik (kancelaria)"
        htmlFor="kancelaria_nazwa"
        hint='Np. "Komornik Sądowy przy SR w Warszawie Anna Nowak"'
        error={errors.kancelaria_nazwa?.message}
      >
        <Input
          id="kancelaria_nazwa"
          {...register("kancelaria_nazwa")}
          placeholder="Komornik Sądowy przy SR …"
        />
      </FormField>

      <FormField
        label="Adres kancelarii (opcjonalnie)"
        htmlFor="kancelaria_adres"
        error={errors.kancelaria_adres?.message}
      >
        <Input
          id="kancelaria_adres"
          {...register("kancelaria_adres")}
          placeholder="ul., kod, miasto"
        />
      </FormField>

      <FormField
        label="Sygnatura (Km / GKm / Kmp)"
        htmlFor="sygnatura_km"
        hint='Np. "Km 1234/24"'
        error={errors.sygnatura_km?.message}
      >
        <Input
          id="sygnatura_km"
          {...register("sygnatura_km")}
          placeholder="Km 1234/24"
        />
      </FormField>

      <FormField
        label="Wierzyciel"
        htmlFor="wierzyciel"
        hint="Firma windykacyjna, fundusz lub bank, który prowadzi egzekucję."
        error={errors.wierzyciel?.message}
      >
        <Input
          id="wierzyciel"
          {...register("wierzyciel")}
          placeholder="np. Easy Debt Collection sp. z o.o."
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

// BRAMA 4 alias — index.ts imports the short name (`StepKomornik`).
export { StepKomornikKancelaria as StepKomornik };
