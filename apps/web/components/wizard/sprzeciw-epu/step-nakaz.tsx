"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import {
  sprzeciwEpuNakazSchema,
} from "@/lib/wizard/modules/sprzeciw-epu";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";
import type { z } from "zod";

type Values = z.infer<typeof sprzeciwEpuNakazSchema>;

export function StepNakaz({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<Values>) {
  const form = useForm<Values>({
    resolver: zodResolver(sprzeciwEpuNakazSchema),
    defaultValues: {
      sygnatura: (defaultValues.sygnatura as string) ?? "",
      sad: (defaultValues.sad as string) ?? "",
      data_nakazu: (defaultValues.data_nakazu as string) ?? "",
      data_doreczenia: (defaultValues.data_doreczenia as string) ?? "",
      kwota_glowna: (defaultValues.kwota_glowna as number) ?? 0,
      kwota_odsetki: (defaultValues.kwota_odsetki as number) ?? 0,
      kwota_koszty: (defaultValues.kwota_koszty as number) ?? 0,
    },
    mode: "onBlur",
  });

  const onValid = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={onValid} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Sygnatura nakazu"
          hint="Format: VI Nc-e 1234567/25"
          error={form.formState.errors.sygnatura?.message}
        >
          <Input
            {...form.register("sygnatura")}
            placeholder="VI Nc-e 1234567/25"
            autoComplete="off"
            inputMode="text"
          />
        </FormField>

        <FormField
          label="Sąd, który wydał nakaz"
          error={form.formState.errors.sad?.message}
        >
          <Input
            {...form.register("sad")}
            placeholder="Sąd Rejonowy Lublin-Zachód w Lublinie"
            autoComplete="off"
          />
        </FormField>

        <FormField
          label="Data wydania nakazu"
          error={form.formState.errors.data_nakazu?.message}
        >
          <Input type="date" {...form.register("data_nakazu")} />
        </FormField>

        <FormField
          label="Data doręczenia"
          hint="Od tej daty biegnie 14-dniowy termin sprzeciwu."
          error={form.formState.errors.data_doreczenia?.message}
        >
          <Input type="date" {...form.register("data_doreczenia")} />
        </FormField>
      </div>

      <fieldset className="rounded-xl border border-iron-200 dark:border-dlugomat-800 p-4">
        <legend className="px-2 text-fluid-xs uppercase tracking-wide text-iron-500">
          Kwoty z nakazu
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Kwota główna (PLN)"
            error={form.formState.errors.kwota_glowna?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              {...form.register("kwota_glowna")}
            />
          </FormField>
          <FormField
            label="Odsetki (PLN)"
            error={form.formState.errors.kwota_odsetki?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              {...form.register("kwota_odsetki")}
            />
          </FormField>
          <FormField
            label="Koszty (PLN)"
            error={form.formState.errors.kwota_koszty?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              {...form.register("kwota_koszty")}
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
