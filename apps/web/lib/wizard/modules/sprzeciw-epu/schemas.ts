/**
 * D2 Sprzeciw EPU — Zod schemas dla każdego kroku kreatora.
 *
 * 5 kroków:
 *   1. nakaz       — sygnatura, sąd, data wydania, data doręczenia
 *   2. strony      — dane powoda (wierzyciela) i pozwanego (user)
 *   3. kwoty       — kwota główna, odsetki, koszty
 *   4. zarzuty     — wybór zarzutów + opis okoliczności
 *   5. review      — podsumowanie i wygenerowanie pisma
 *
 * Polskie komunikaty błędów — używamy kolokwializmów Calm Authority.
 */
import { z } from "zod";

const polishDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Wpisz datę w formacie RRRR-MM-DD")
  .refine(
    (s) => !Number.isNaN(new Date(s).getTime()),
    "Niepoprawna data",
  );

// 1) Nakaz ---------------------------------------------------------------
export const nakazSchema = z.object({
  sygnatura: z
    .string()
    .min(3, "Sygnatura jest wymagana")
    .max(80, "Sygnatura wygląda na zbyt długą — sprawdź dokument"),
  sad: z
    .string()
    .min(3, "Wpisz nazwę sądu")
    .max(160, "Nazwa sądu jest za długa"),
  data_nakazu: polishDate,
  data_doreczenia: polishDate,
});
export type NakazValues = z.infer<typeof nakazSchema>;

// 2) Strony --------------------------------------------------------------
export const stronySchema = z.object({
  powod_nazwa: z.string().min(2, "Wpisz nazwę powoda (wierzyciela)").max(160),
  powod_adres: z.string().min(5, "Wpisz adres powoda").max(240),
  pozwany_nazwa: z.string().min(2, "Wpisz swoje imię i nazwisko").max(160),
  pozwany_adres: z.string().min(5, "Wpisz swój adres").max(240),
  pozwany_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL składa się z 11 cyfr")
    .optional()
    .or(z.literal("")),
});
export type StronyValues = z.infer<typeof stronySchema>;

// 3) Kwoty ---------------------------------------------------------------
export const kwotySchema = z.object({
  kwota_glowna: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(10_000_000, "Kwota wygląda na zbyt wysoką"),
  kwota_odsetki: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .default(0),
  kwota_koszty: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .default(0),
});
export type KwotyValues = z.infer<typeof kwotySchema>;

// 4) Zarzuty -------------------------------------------------------------
export const ZARZUTY_OPTIONS = [
  {
    id: "przedawnienie",
    label: "Roszczenie jest przedawnione",
    helper: "Termin przedawnienia minął — np. 3 lata dla roszczeń konsumenckich.",
  },
  {
    id: "brak_umowy",
    label: "Nie zawierałem(-am) umowy z powodem",
    helper: "Powód nie wykazał istnienia umowy / dokumentu źródłowego.",
  },
  {
    id: "cesja_niewykazana",
    label: "Cesja wierzytelności nie została udokumentowana",
    helper: "Powód nie udowodnił, że nabył wierzytelność od pierwotnego wierzyciela.",
  },
  {
    id: "nieprawidlowa_wysokosc",
    label: "Kwota roszczenia jest nieprawidłowa",
    helper: "Doliczone odsetki / koszty są zawyżone albo niepoprawnie wyliczone.",
  },
  {
    id: "brak_doreczenia",
    label: "Wezwanie do zapłaty nie zostało doręczone",
    helper: "Powód nie wezwał skutecznie do zapłaty przed wytoczeniem powództwa.",
  },
  {
    id: "splata_calkowita",
    label: "Roszczenie zostało już spłacone",
    helper: "Należność uregulowano w całości lub częściowo — przedstaw dowód.",
  },
] as const;

export const ZARZUT_IDS = ZARZUTY_OPTIONS.map((z) => z.id) as readonly [
  string,
  ...string[],
];

export const zarzutyEnum = z.enum(ZARZUT_IDS as unknown as [string, ...string[]]);

export const zarzutySchema = z.object({
  zarzuty: z
    .array(zarzutyEnum)
    .min(1, "Zaznacz przynajmniej jeden zarzut — to fundament sprzeciwu")
    .max(ZARZUT_IDS.length),
  okolicznosci: z
    .string()
    .max(2000, "Opis maksymalnie 2000 znaków")
    .optional()
    .or(z.literal("")),
});
export type ZarzutyValues = z.infer<typeof zarzutySchema>;

// 5) Review (no fields — checkbox potwierdzający) -----------------------
export const reviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność z prawdą" }),
  }),
});
export type ReviewValues = z.infer<typeof reviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda. */
export interface SprzeciwEpuAnswers
  extends NakazValues,
    StronyValues,
    KwotyValues,
    ZarzutyValues,
    ReviewValues {}
