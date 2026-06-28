"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { sprzeciwEpuOkolicznosciSchema } from "@/lib/wizard/modules/sprzeciw-epu";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

type Values = z.infer<typeof sprzeciwEpuOkolicznosciSchema>;

export function StepOkolicznosci({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<Values>) {
  const form = useForm<Values>({
    resolver: zodResolver(sprzeciwEpuOkolicznosciSchema),
    defaultValues: {
      okolicznosci: (defaultValues.okolicznosci as string) ?? "",
      cesja: (defaultValues.cesja as boolean) ?? false,
      cesja_data: (defaultValues.cesja_data as string) ?? "",
    },
    mode: "onBlur",
  });

  const cesja = form.watch("cesja");

  const onValid = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={onValid} className="space-y-6" noValidate>
      <FormField
        label="Opis okoliczności (opcjonalnie)"
        hint="Krótka historia: kiedy zaciągnięto zobowiązanie, czy próbowałeś/aś się dogadać, czy doszło do cesji itd."
        error={form.formState.errors.okolicznosci?.message}
      >
        <textarea
          {...form.register("okolicznosci")}
          rows={6}
          maxLength={4000}
          placeholder="Np. umowa z 2014 r. została scedowana na fundusz w 2024 r., wcześniej nikt się ze mną nie kontaktował…"
          className="w-full rounded-md border border-ink-200 bg-background px-3 py-2 text-fluid-sm text-foreground shadow-subtle focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-800"
        />
      </FormField>

      <fieldset className="rounded-xl border border-ink-200 dark:border-dlugomat-800 p-4">
        <legend className="px-2 text-fluid-xs uppercase tracking-wide text-ink-500">
          Cesja wierzytelności
        </legend>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...form.register("cesja")}
            className="mt-1 size-4 rounded border-ink-300 text-dlugomat-500 focus:ring-dlugomat-500"
          />
          <span className="text-fluid-sm text-foreground">
            Powodem jest fundusz / firma windykacyjna, która kupiła wierzytelność
            <span className="block text-fluid-xs text-ink-600 dark:text-ink-400">
              Często warto żądać przedłożenia umowy cesji.
            </span>
          </span>
        </label>

        {cesja && (
          <div className="mt-4">
            <FormField
              label="Data cesji (jeżeli znana)"
              error={form.formState.errors.cesja_data?.message}
            >
              <Input type="date" {...form.register("cesja_data")} />
            </FormField>
          </div>
        )}
      </fieldset>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSaving || form.formState.isSubmitting}>
          Dalej do podsumowania
        </Button>
      </div>
    </form>
  );
}
