"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  sprzeciwEpuReviewSchema,
  sprzeciwEpuZarzutyOptions,
} from "@/lib/wizard/modules/sprzeciw-epu";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";
import { formatPLN, formatDatePL } from "@/lib/utils";

type Values = z.infer<typeof sprzeciwEpuReviewSchema>;

export function StepReview({
  defaultValues,
  onSubmit,
  isSaving,
}: WizardStepProps<Values>) {
  const form = useForm<Values>({
    resolver: zodResolver(sprzeciwEpuReviewSchema),
    defaultValues: {
      zgoda_dane: (defaultValues.zgoda_dane as true) ?? false,
      zgoda_oswiadczenie:
        (defaultValues.zgoda_oswiadczenie as true) ?? false,
    },
    mode: "onChange",
  });

  // Pełen kontekst odpowiedzi z poprzednich kroków przekazany przez WizardShell.
  const a = defaultValues as Record<string, unknown>;
  const zarzutyIds = (a.zarzuty as string[]) ?? [];
  const zarzutyLabels = sprzeciwEpuZarzutyOptions
    .filter((o) => zarzutyIds.includes(o.id))
    .map((o) => o.label);

  const onValid = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={onValid} className="space-y-6" noValidate>
      <div className="rounded-xl border border-iron-200 dark:border-dlugomat-800 bg-iron-50/40 dark:bg-dlugomat-900/40 p-5 space-y-4">
        <h3 className="text-fluid-base font-semibold text-foreground">
          Podsumowanie sprawy
        </h3>

        <SummaryGrid
          rows={[
            ["Sygnatura", (a.sygnatura as string) || "—"],
            ["Sąd", (a.sad as string) || "—"],
            [
              "Data wydania",
              a.data_nakazu ? formatDatePL(a.data_nakazu as string) : "—",
            ],
            [
              "Data doręczenia",
              a.data_doreczenia ? formatDatePL(a.data_doreczenia as string) : "—",
            ],
            ["Powód", (a.powod_nazwa as string) || "—"],
            ["Pozwany", (a.pozwany_nazwa as string) || "—"],
            [
              "Łączna kwota",
              formatPLN(
                Number(a.kwota_glowna ?? 0) +
                  Number(a.kwota_odsetki ?? 0) +
                  Number(a.kwota_koszty ?? 0),
              ),
            ],
          ]}
        />

        {zarzutyLabels.length > 0 && (
          <div>
            <h4 className="text-fluid-sm font-semibold text-foreground mb-1">
              Zarzuty
            </h4>
            <ul className="list-disc pl-5 text-fluid-sm text-iron-700 dark:text-iron-300">
              {zarzutyLabels.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <fieldset className="space-y-3">
        <FormField error={form.formState.errors.zgoda_dane?.message}>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...form.register("zgoda_dane")}
              className="mt-1 size-4 rounded border-iron-300 text-dlugomat-500 focus:ring-dlugomat-500"
            />
            <span className="text-fluid-sm text-foreground">
              Wyrażam zgodę na przetwarzanie moich danych osobowych w celu
              wygenerowania pisma procesowego (RODO art. 6 ust. 1 lit. b).
            </span>
          </label>
        </FormField>

        <FormField error={form.formState.errors.zgoda_oswiadczenie?.message}>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...form.register("zgoda_oswiadczenie")}
              className="mt-1 size-4 rounded border-iron-300 text-dlugomat-500 focus:ring-dlugomat-500"
            />
            <span className="text-fluid-sm text-foreground">
              Oświadczam, że podane dane są zgodne z prawdą i posiadam
              dokumenty potwierdzające okoliczności sprawy.
            </span>
          </label>
        </FormField>
      </fieldset>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isSaving || form.formState.isSubmitting}
        >
          Wygeneruj sprzeciw
        </Button>
      </div>
    </form>
  );
}

function SummaryGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between sm:block">
          <dt className="text-fluid-xs uppercase tracking-wide text-iron-500">
            {k}
          </dt>
          <dd className="text-fluid-sm text-foreground sm:mt-0.5">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
