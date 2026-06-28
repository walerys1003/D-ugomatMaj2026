/**
 * D6 CesjaCheck — Zod schemas dla kreatora.
 *
 * 1 case_type: cesja_odpowiedz
 *   Pismo do funduszu sekurytyzacyjnego / firmy windykacyjnej, która
 *   dochodzi roszczenia rzekomo nabytego w drodze cesji wierzytelności
 *   (art. 509 KC). Żądanie udokumentowania przelewu wraz z badaniem
 *   przedawnienia (art. 117 KC).
 *
 * Kroki wizarda (linearny):
 *   1. dluznik       — Twoje dane (imię, adres, PESEL)
 *   2. fundusz       — fundusz sekurytyzacyjny (nazwa, adres, NIP/KRS)
 *   3. wezwanie      — data wezwania, kwota, sygnatura sprawy
 *   4. wierzytelnosc — pierwotny wierzyciel, numer umowy, data
 *   5. zarzuty       — multiselect: brak dokumentacji / przedawnienie /
 *                      brak zawiadomienia / błędna kwota
 *   6. review        — checkbox potwierdzenia + generate
 */
import { z } from "zod";

const polishDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Wpisz datę w formacie RRRR-MM-DD")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Niepoprawna data");

// 1) Dłużnik -------------------------------------------------------------
export const dluznikSchema = z.object({
  dluznik_nazwa: z
    .string()
    .min(2, "Wpisz imię i nazwisko")
    .max(160, "Imię i nazwisko jest za długie"),
  dluznik_adres: z
    .string()
    .min(5, "Wpisz adres (ulica, kod, miasto)")
    .max(240, "Adres jest za długi"),
  dluznik_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL składa się z 11 cyfr")
    .optional()
    .or(z.literal("")),
});
export type DluznikValues = z.infer<typeof dluznikSchema>;

// 2) Fundusz / windykator -------------------------------------------------
export const funduszSchema = z.object({
  fundusz_nazwa: z
    .string()
    .min(2, "Wpisz nazwę funduszu / firmy windykacyjnej")
    .max(200),
  fundusz_adres: z
    .string()
    .max(240, "Adres jest za długi")
    .optional()
    .or(z.literal("")),
  fundusz_nip: z
    .string()
    .max(20, "NIP/KRS wygląda na zbyt długi")
    .optional()
    .or(z.literal("")),
});
export type FunduszValues = z.infer<typeof funduszSchema>;

// 3) Wezwanie ------------------------------------------------------------
export const wezwanieSchema = z.object({
  data_wezwania: polishDate,
  sygnatura_funduszu: z
    .string()
    .max(80, "Sygnatura wygląda na zbyt długą")
    .optional()
    .or(z.literal("")),
  kwota_dochodzona: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(50_000_000),
});
export type WezwanieValues = z.infer<typeof wezwanieSchema>;

// 4) Pierwotna wierzytelność --------------------------------------------
export const wierzytelnoscSchema = z.object({
  pierwotny_wierzyciel: z
    .string()
    .min(2, "Wpisz nazwę pierwotnego wierzyciela (np. bank)")
    .max(200),
  numer_umowy: z
    .string()
    .max(120, "Numer umowy wygląda na zbyt długi")
    .optional()
    .or(z.literal("")),
  data_umowy: polishDate.optional().or(z.literal("")),
  data_wymagalnosci: polishDate.optional().or(z.literal("")),
});
export type WierzytelnoscValues = z.infer<typeof wierzytelnoscSchema>;

// 5) Zarzuty -------------------------------------------------------------
export const CESJA_ZARZUTY = [
  {
    id: "brak_dokumentacji",
    label: "Brak udokumentowania cesji",
    helper:
      "Żądam dowodu nabycia wierzytelności (kopia umowy cesji, art. 509 KC).",
  },
  {
    id: "przedawnienie",
    label: "Roszczenie jest przedawnione",
    helper:
      "Termin przedawnienia upłynął — art. 117 KC, w przypadku konsumenta art. 117¹ KC.",
  },
  {
    id: "brak_zawiadomienia",
    label: "Brak zawiadomienia o cesji",
    helper:
      "Pierwotny wierzyciel nigdy nie zawiadomił mnie o cesji (art. 512 KC).",
  },
  {
    id: "blad_kwoty",
    label: "Kwota wezwania jest nieprawidłowa",
    helper: "Kwota nie odpowiada saldu pierwotnej umowy lub spłatom.",
  },
  {
    id: "brak_wymagalnosci",
    label: "Brak wymagalności roszczenia",
    helper: "Wierzytelność nie była wymagalna w dacie cesji.",
  },
  {
    id: "kwestionuje_zaklad",
    label: "Kwestionuję istnienie zobowiązania",
    helper: "Negowane samo istnienie umowy / długu.",
  },
] as const;

const cesjaZarzutEnum = z.enum(
  CESJA_ZARZUTY.map((x) => x.id) as unknown as [string, ...string[]],
);

export const zarzutySchema = z.object({
  zarzuty: z
    .array(cesjaZarzutEnum)
    .min(1, "Zaznacz przynajmniej jeden zarzut — to fundament odpowiedzi")
    .max(CESJA_ZARZUTY.length),
  okolicznosci: z
    .string()
    .max(2000, "Opis maksymalnie 2000 znaków")
    .optional()
    .or(z.literal("")),
});
export type ZarzutyValues = z.infer<typeof zarzutySchema>;

// 6) Review --------------------------------------------------------------
export const cesjaReviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność danych z prawdą" }),
  }),
});
export type CesjaReviewValues = z.infer<typeof cesjaReviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda CesjaCheck. */
export interface CesjaAnswers
  extends DluznikValues,
    FunduszValues,
    WezwanieValues,
    WierzytelnoscValues,
    ZarzutyValues,
    CesjaReviewValues {}
