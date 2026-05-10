"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  sprzeciwEpuZarzutySchema,
  sprzeciwEpuZarzutyOptions,
} from "@/lib/wizard/modules/sprzeciw-epu";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";
import { cn } from "@/lib/utils";

type Values = z.infer<typeof sprzeciwEpuZarzutySchema>;

export function StepZarzuty({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<Values>) {
  const form = useForm<Values>({
    resolver: zodResolver(sprzeciwEpuZarzutySchema),
    defaultValues: {
      zarzuty: (defaultValues.zarzuty as string[]) ?? [],
      zarzuty_custom: (defaultValues.zarzuty_custom as string) ?? "",
    },
    mode: "onChange",
  });

  const onValid = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={onValid} className="space-y-6" noValidate>
      <Controller
        name="zarzuty"
        control={form.control}
        render={({ field }) => {
          const selected = new Set<string>(field.value ?? []);
          const toggle = (id: string) => {
            const next = new Set(selected);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            field.onChange(Array.from(next));
          };
          return (
            <div className="space-y-2">
              <span className="text-fluid-sm font-medium text-foreground">
                Zaznacz zarzuty (możesz wybrać kilka)
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {sprzeciwEpuZarzutyOptions.map((opt) => {
                  const active = selected.has(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(opt.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dlugomat-500/50",
                        active
                          ? "border-dlugomat-500 bg-dlugomat-50 dark:bg-dlugomat-900/40"
                          : "border-iron-200 hover:border-iron-300 dark:border-dlugomat-800 dark:hover:border-dlugomat-700",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border",
                          active
                            ? "border-dlugomat-500 bg-dlugomat-500 text-white"
                            : "border-iron-300 dark:border-dlugomat-700",
                        )}
                        aria-hidden
                      >
                        {active && (
                          <svg viewBox="0 0 16 16" className="size-3" fill="currentColor">
                            <path d="M6.173 11.586L2.93 8.343l1.06-1.06 2.183 2.182 5.864-5.864 1.06 1.06z" />
                          </svg>
                        )}
                      </span>
                      <span className="text-fluid-sm text-foreground">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.zarzuty?.message && (
                <p className="text-fluid-xs text-danger-600">
                  {form.formState.errors.zarzuty.message as string}
                </p>
              )}
            </div>
          );
        }}
      />

      <FormField
        label="Dodatkowe uzasadnienie (opcjonalnie)"
        hint="Krótki tekst — to uzasadnienie pojawi się w treści sprzeciwu."
        error={form.formState.errors.zarzuty_custom?.message}
      >
        <textarea
          {...form.register("zarzuty_custom")}
          rows={4}
          maxLength={2000}
          placeholder="Np. roszczenie pochodzi z umowy z 2014 r., a powództwo wniesione w 2025 r."
          className="w-full rounded-md border border-iron-200 bg-background px-3 py-2 text-fluid-sm text-foreground shadow-subtle focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-800"
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSaving || form.formState.isSubmitting}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
