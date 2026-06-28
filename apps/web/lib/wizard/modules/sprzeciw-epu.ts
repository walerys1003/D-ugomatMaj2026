/**
 * D2 — Sprzeciw EPU wizard definition.
 *
 * 5 kroków:
 *   1. nakaz       — sygnatura, sąd, daty, kwoty
 *   2. strony      — powód (wierzyciel) + pozwany (user)
 *   3. zarzuty     — wybór z listy + custom
 *   4. okolicznosci — wolny tekst (opcjonalny)
 *   5. review      — podsumowanie + zgody
 *
 * Komponenty kroków rezydują w `apps/web/components/wizard/sprzeciw-epu/`.
 * Schemy Zod są źródłem prawdy zarówno dla klienta (RHF) jak i serwera
 * (przed renderem template'a).
 */
import { z } from "zod";

import type { WizardDefinition } from "@/lib/wizard/wizard-types";
import { StepNakaz } from "@/components/wizard/sprzeciw-epu/step-nakaz";
import { StepStrony } from "@/components/wizard/sprzeciw-epu/step-strony";
import { StepZarzuty } from "@/components/wizard/sprzeciw-epu/step-zarzuty";
import { StepOkolicznosci } from "@/components/wizard/sprzeciw-epu/step-okolicznosci";
import { StepReview } from "@/components/wizard/sprzeciw-epu/step-review";

// -----------------------------------------------------------------------------
// Step schemas (eksportowane też do builder'a + render template'a)
// -----------------------------------------------------------------------------
export const sprzeciwEpuNakazSchema = z.object({
  sygnatura: z
    .string()
    .min(3, "Wpisz sygnaturę nakazu.")
    .max(60, "Sygnatura jest za długa.")
    .regex(/Nc-?e?\s*\d/i, "Sygnatura EPU zawiera 'Nc-e' i numer."),
  sad: z.string().min(5, "Wpisz nazwę sądu.").max(120),
  data_nakazu: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format daty: RRRR-MM-DD."),
  data_doreczenia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format daty: RRRR-MM-DD."),
  kwota_glowna: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę." })
    .nonnegative("Kwota nie może być ujemna.")
    .max(10_000_000, "Kwota wygląda na błędną."),
  kwota_odsetki: z.coerce.number().nonnegative().max(10_000_000).default(0),
  kwota_koszty: z.coerce.number().nonnegative().max(1_000_000).default(0),
});

export const sprzeciwEpuStronySchema = z.object({
  powod_nazwa: z.string().min(2, "Wpisz nazwę powoda (wierzyciela)."),
  powod_adres: z.string().min(5, "Wpisz adres powoda.").max(300),
  pozwany_nazwa: z.string().min(2, "Wpisz swoje imię i nazwisko."),
  pozwany_adres: z.string().min(5, "Wpisz swój adres.").max(300),
  pozwany_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL ma 11 cyfr.")
    .optional()
    .or(z.literal("")),
});

/** Lista typowych zarzutów z odnośnikami do KPC. */
export const sprzeciwEpuZarzutyOptions = [
  { id: "przedawnienie", label: "Przedawnienie roszczenia (art. 117 KC)" },
  { id: "brak_dowodow", label: "Brak dokumentów potwierdzających roszczenie" },
  { id: "cesja_niewykazana", label: "Niewykazana cesja wierzytelności" },
  { id: "spelnienie_swiadczenia", label: "Roszczenie spełnione (zapłata)" },
  { id: "kwestionuje_kwote", label: "Kwestionuję wysokość roszczenia" },
  { id: "brak_legitymacji", label: "Brak legitymacji procesowej powoda" },
  { id: "abuzywne_klauzule", label: "Klauzule abuzywne w umowie" },
  { id: "wadliwa_doręczenie", label: "Wadliwe doręczenie nakazu" },
] as const;

export const sprzeciwEpuZarzutySchema = z.object({
  zarzuty: z
    .array(z.string())
    .min(1, "Wybierz co najmniej jeden zarzut."),
  zarzuty_custom: z.string().max(2000).optional().default(""),
});

export const sprzeciwEpuOkolicznosciSchema = z.object({
  okolicznosci: z.string().max(4000).optional().default(""),
  cesja: z.boolean().default(false),
  cesja_data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format daty: RRRR-MM-DD.")
    .optional()
    .or(z.literal("")),
});

export const sprzeciwEpuReviewSchema = z.object({
  zgoda_dane: z
    .literal(true, {
      errorMap: () => ({ message: "Wymagana zgoda na przetwarzanie danych." }),
    }),
  zgoda_oswiadczenie: z.literal(true, {
    errorMap: () => ({
      message: "Potwierdź, że dane są zgodne z prawdą.",
    }),
  }),
});

/** Pełen typ odpowiedzi po zakończeniu kreatora — używany przez generator. */
export const sprzeciwEpuFullSchema = sprzeciwEpuNakazSchema
  .merge(sprzeciwEpuStronySchema)
  .merge(sprzeciwEpuZarzutySchema)
  .merge(sprzeciwEpuOkolicznosciSchema);

export type SprzeciwEpuAnswers = z.infer<typeof sprzeciwEpuFullSchema>;

// -----------------------------------------------------------------------------
// Wizard definition
// -----------------------------------------------------------------------------
export const sprzeciwEpuWizard: WizardDefinition = {
  caseType: "sprzeciw_epu",
  startStepId: "nakaz",
  steps: [
    {
      id: "nakaz",
      title: "Nakaz zapłaty",
      description:
        "Sygnatura, sąd i daty z nakazu zapłaty. To pozwala obliczyć termin sprzeciwu (14 dni od doręczenia).",
      schema: sprzeciwEpuNakazSchema,
      Component: StepNakaz,
      next: () => "strony",
    },
    {
      id: "strony",
      title: "Strony postępowania",
      description: "Powód (wierzyciel) i Pozwany (Ty).",
      schema: sprzeciwEpuStronySchema,
      Component: StepStrony,
      next: () => "zarzuty",
    },
    {
      id: "zarzuty",
      title: "Zarzuty",
      description:
        "Wybierz zarzuty, które chcesz podnieść. Możesz dodać własne uzasadnienie.",
      schema: sprzeciwEpuZarzutySchema,
      Component: StepZarzuty,
      next: () => "okolicznosci",
    },
    {
      id: "okolicznosci",
      title: "Okoliczności sprawy",
      description: "Krótki opis sytuacji — pomoże wzmocnić uzasadnienie.",
      schema: sprzeciwEpuOkolicznosciSchema,
      Component: StepOkolicznosci,
      next: () => "review",
    },
    {
      id: "review",
      title: "Podsumowanie",
      description:
        "Sprawdź dane, zaakceptuj oświadczenia i wygeneruj sprzeciw.",
      schema: sprzeciwEpuReviewSchema,
      Component: StepReview,
      next: () => null,
    },
  ],
};
