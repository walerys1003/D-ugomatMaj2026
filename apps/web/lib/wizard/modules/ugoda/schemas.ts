/**
 * D7 UgodoMat — Zod schemas dla kreatora.
 *
 * 3 warianty pism (osobne case_type):
 *   - propozycja_raty       → ugoda_raty
 *       Propozycja spłaty w ratach na warunkach indywidualnych.
 *   - propozycja_umorzenie  → ugoda_umorzenie
 *       Propozycja częściowego umorzenia długu i spłaty pozostałej kwoty.
 *   - propozycja_indywidualna → ugoda_propozycja
 *       Indywidualnie negocjowana propozycja ugody (mieszana — np.
 *       umorzenie odsetek + raty na kapitał).
 *
 * Wszystkie warianty bazują na art. 917 KC (ugoda jako czynność prawna).
 * Pismo nie stanowi uznania długu (art. 123 §1 pkt 2 KC) do czasu
 * akceptacji warunków przez wierzyciela.
 *
 * Wspólne kroki:
 *   1. wariant       — który typ propozycji
 *   2. dluznik       — Twoje dane (imię, adres, PESEL)
 *   3. wierzyciel    — bank / fundusz / windykator
 *   4. zobowiazanie  — numer umowy, kwota, sygnatura sprawy
 *   5. propozycja    — szczegóły (warunkowo per wariant)
 *   6. sytuacja      — okoliczności + uzasadnienie propozycji
 *   7. review        — checkbox potwierdzenia + generate
 */
import { z } from "zod";

const polishDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Wpisz datę w formacie RRRR-MM-DD")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Niepoprawna data");

// 1) Wariant -------------------------------------------------------------
export const UGODA_VARIANTS = [
  {
    id: "propozycja_raty",
    label: "Propozycja spłaty w ratach",
    helper:
      "Klasyczna ścieżka — proponujesz miesięczne raty zamiast jednorazowej spłaty.",
    art: "art. 917 KC",
  },
  {
    id: "propozycja_umorzenie",
    label: "Propozycja częściowego umorzenia",
    helper:
      "Wskazujesz kwotę do zapłaty + żądasz umorzenia części długu (odsetki, koszty).",
    art: "art. 917 KC, art. 508 KC",
  },
  {
    id: "propozycja_indywidualna",
    label: "Propozycja indywidualna (mieszana)",
    helper:
      "Połączenie rat i częściowego umorzenia — najbardziej elastyczna ścieżka.",
    art: "art. 917 KC",
  },
] as const;

export type UgodaVariantId = (typeof UGODA_VARIANTS)[number]["id"];

export const wariantSchema = z.object({
  variant: z.enum(
    UGODA_VARIANTS.map((v) => v.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz wariant pisma" }) },
  ),
});
export type WariantValues = z.infer<typeof wariantSchema>;

// 2) Dłużnik -------------------------------------------------------------
export const dluznikSchema = z.object({
  dluznik_nazwa: z
    .string()
    .min(2, "Wpisz imię i nazwisko")
    .max(160),
  dluznik_adres: z
    .string()
    .min(5, "Wpisz adres (ulica, kod, miasto)")
    .max(240),
  dluznik_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL składa się z 11 cyfr")
    .optional()
    .or(z.literal("")),
});
export type DluznikValues = z.infer<typeof dluznikSchema>;

// 3) Wierzyciel ----------------------------------------------------------
export const wierzycielSchema = z.object({
  wierzyciel_nazwa: z
    .string()
    .min(2, "Wpisz nazwę wierzyciela (bank / fundusz / windykator)")
    .max(200),
  wierzyciel_adres: z
    .string()
    .max(240, "Adres jest za długi")
    .optional()
    .or(z.literal("")),
});
export type WierzycielValues = z.infer<typeof wierzycielSchema>;

// 4) Zobowiązanie --------------------------------------------------------
export const zobowiazanieSchema = z.object({
  numer_umowy: z
    .string()
    .max(120, "Numer umowy wygląda na zbyt długi")
    .optional()
    .or(z.literal("")),
  sygnatura: z
    .string()
    .max(80, "Sygnatura wygląda na zbyt długą")
    .optional()
    .or(z.literal("")),
  kwota_zadluzenia: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(50_000_000),
  data_wymagalnosci: polishDate.optional().or(z.literal("")),
});
export type ZobowiazanieValues = z.infer<typeof zobowiazanieSchema>;

// 5) Propozycja (warunkowa per wariant) ----------------------------------
export const propozycjaSchema = z.object({
  // raty
  rata_miesieczna: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0)
    .max(50_000_000)
    .optional(),
  liczba_rat: z.coerce
    .number({ invalid_type_error: "Wpisz liczbę miesięcy" })
    .min(0)
    .max(120)
    .optional(),
  data_pierwszej_raty: polishDate.optional().or(z.literal("")),
  // umorzenie
  kwota_proponowana: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0)
    .max(50_000_000)
    .optional(),
  procent_umorzenia: z.coerce
    .number({ invalid_type_error: "Wpisz wartość liczbą" })
    .min(0)
    .max(100, "Maksymalnie 100%")
    .optional(),
  termin_zaplaty: polishDate.optional().or(z.literal("")),
});
export type PropozycjaValues = z.infer<typeof propozycjaSchema>;

// 6) Sytuacja życiowa ----------------------------------------------------
export const SYTUACJA_ZYCIOWA = [
  { id: "minimum_egzystencji", label: "Egzystencja na granicy minimum socjalnego" },
  { id: "dzieci_na_utrzymaniu", label: "Mam dzieci na utrzymaniu" },
  { id: "swiadczenia_rodzinne", label: "Otrzymuję świadczenia rodzinne / 500+" },
  { id: "alimenty", label: "Pobieram / płacę alimenty" },
  { id: "choroba", label: "Choroba przewlekła / niepełnosprawność" },
  { id: "bezrobocie", label: "Bezrobocie / niska pensja" },
  { id: "kredyt_mieszkaniowy", label: "Spłacam kredyt mieszkaniowy" },
  { id: "wola_porozumienia", label: "Wola porozumienia bez sądu" },
] as const;

export const sytuacjaSchema = z.object({
  sytuacja: z
    .array(
      z.enum(
        SYTUACJA_ZYCIOWA.map((s) => s.id) as unknown as [string, ...string[]],
      ),
    )
    .max(SYTUACJA_ZYCIOWA.length)
    .default([]),
  okolicznosci: z
    .string()
    .max(2000, "Opis maksymalnie 2000 znaków")
    .optional()
    .or(z.literal("")),
});
export type SytuacjaValues = z.infer<typeof sytuacjaSchema>;

// 7) Review --------------------------------------------------------------
export const ugodaReviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność danych z prawdą" }),
  }),
});
export type UgodaReviewValues = z.infer<typeof ugodaReviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda UgodoMat. */
export interface UgodaAnswers
  extends WariantValues,
    DluznikValues,
    WierzycielValues,
    ZobowiazanieValues,
    PropozycjaValues,
    SytuacjaValues,
    UgodaReviewValues {}
