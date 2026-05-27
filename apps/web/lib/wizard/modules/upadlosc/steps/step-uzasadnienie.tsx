"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Surface } from "@/components/ui/surface";
import { Divider } from "@/components/ui/divider";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { uzasadnienieSchema, type UzasadnienieValues } from "../schemas";

/**
 * D9 — Krok 11: Uzasadnienie szczegółowe.
 *
 * Trzy obowiązkowe akapity, każdy z minimalną długością. AI Długomata
 * skompiluje finalny tekst do nagłówka „Uzasadnienie" (sklejony + retorycznie
 * zoptymalizowany przez Claude Sonnet 4.6 z walidacją Haiku 4.5).
 *
 *  1. Okoliczności powstania zadłużenia — co spowodowało stratę zdolności
 *     do regulowania zobowiązań (utrata pracy, choroba, rozwód, etc.)
 *  2. Próby polubownych rozwiązań — co dłużnik już próbował
 *     (negocjacje z wierzycielem, plan spłaty z BIK, mediacja)
 *  3. Sytuacja rodzinna — kontekst społeczny (osoby na utrzymaniu, choroba w rodzinie)
 */
export function StepUzasadnienie({
  defaultValues,
  onSubmit,
  onBack,
  isSaving,
}: WizardStepProps<UzasadnienieValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UzasadnienieValues>({
    resolver: zodResolver(uzasadnienieSchema),
    defaultValues: {
      okolicznosci_powstania: defaultValues.okolicznosci_powstania ?? "",
      proba_polubownych_rozwiazan: defaultValues.proba_polubownych_rozwiazan ?? "",
      sytuacja_rodzinna: defaultValues.sytuacja_rodzinna ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <Surface elevation="flat" padded="md" className="bg-dlugomat-50/60 dark:bg-dlugomat-900/40">
        <p className="text-fluid-sm text-iron-700 dark:text-iron-200">
          Pełny wniosek wymaga rozszerzonego uzasadnienia (Pr.up. art. 491² ust. 4). Trzy bloki
          — każdy z min. liczbą znaków. AI Długomata skompiluje je w finalny tekst, ale samodzielne
          pisanie zwiększa szanse na pozytywne rozpatrzenie.
        </p>
      </Surface>

      <div className="space-y-1.5">
        <Label htmlFor="okolicznosci_powstania">
          1. Okoliczności powstania zadłużenia
        </Label>
        <Textarea
          id="okolicznosci_powstania"
          rows={6}
          placeholder="W 2022 r. utraciłem pracę w wyniku zwolnień grupowych. Przez kolejne 8 miesięcy nie znalazłem zatrudnienia o porównywalnym wynagrodzeniu. W tym czasie korzystałem z karty kredytowej i kredytu konsolidacyjnego…"
          aria-invalid={Boolean(errors.okolicznosci_powstania)}
          {...register("okolicznosci_powstania")}
        />
        {errors.okolicznosci_powstania?.message && (
          <p role="alert" className="text-fluid-sm text-danger-600">
            {errors.okolicznosci_powstania.message}
          </p>
        )}
      </div>

      <Divider />

      <div className="space-y-1.5">
        <Label htmlFor="proba_polubownych_rozwiazan">2. Próby polubownych rozwiązań</Label>
        <Textarea
          id="proba_polubownych_rozwiazan"
          rows={5}
          placeholder="W marcu 2024 r. zwróciłem się do banku z wnioskiem o restrukturyzację kredytu. Otrzymałem odmowę. Wnioskowałem także do trzech wierzycieli o rozłożenie na raty…"
          aria-invalid={Boolean(errors.proba_polubownych_rozwiazan)}
          {...register("proba_polubownych_rozwiazan")}
        />
        {errors.proba_polubownych_rozwiazan?.message && (
          <p role="alert" className="text-fluid-sm text-danger-600">
            {errors.proba_polubownych_rozwiazan.message}
          </p>
        )}
      </div>

      <Divider />

      <div className="space-y-1.5">
        <Label htmlFor="sytuacja_rodzinna">3. Sytuacja rodzinna</Label>
        <Textarea
          id="sytuacja_rodzinna"
          rows={5}
          placeholder="Mam na utrzymaniu dwoje dzieci w wieku 8 i 12 lat. Małżonka pracuje na ½ etatu (rehabilitacja po wypadku). Dochód rodziny netto 4 200 PLN/mc, koszty stałe 3 800 PLN…"
          aria-invalid={Boolean(errors.sytuacja_rodzinna)}
          {...register("sytuacja_rodzinna")}
        />
        {errors.sytuacja_rodzinna?.message && (
          <p role="alert" className="text-fluid-sm text-danger-600">
            {errors.sytuacja_rodzinna.message}
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
