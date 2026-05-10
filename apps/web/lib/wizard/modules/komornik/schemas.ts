/**
 * D3 KomornikShield — Zod schemas dla kreatora.
 *
 * Wariant zależy od wybranego pisma:
 *   - zwolnienie_konta       — art. 8901 §1 KPC, kwoty wolne (alimenty/zasiłki)
 *   - zwolnienie_swiadczen   — art. 833 §6 KPC (świadczenia rodzinne, 500+, alimenty)
 *   - skarga                 — art. 767 KPC, 7 dni od czynności
 *   - ograniczenie           — wniosek o ograniczenie egzekucji (art. 822 KPC)
 *   - umorzenie              — wniosek o umorzenie (art. 825 KPC)
 *   - raty                   — propozycja spłaty w ratach
 *
 * Wspólne kroki:
 *   1. wariant       — który dokument generujemy
 *   2. dluznik       — Twoje dane (imię, adres, PESEL)
 *   3. komornik      — kancelaria, sygnatura Km, wierzyciel
 *   4. zajecie       — co zostało zajęte i w jakiej kwocie
 *   5. uzasadnienie  — sytuacja życiowa / podstawa prawna
 *   6. (skarga only) — czynnosc + data_doreczenia (7 dni!)
 *   7. (raty only)   — propozycja_rat + miesiace
 *   8. review        — checkbox potwierdzenia + generate
 */
import { z } from "zod";

const polishDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Wpisz datę w formacie RRRR-MM-DD")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Niepoprawna data");

// 1) Wariant -------------------------------------------------------------
export const KOMORNIK_VARIANTS = [
  {
    id: "zwolnienie_konta",
    label: "Zwolnienie rachunku bankowego",
    helper: "Wniosek o zwolnienie konta spod zajęcia (kwoty wolne, świadczenia).",
    art: "art. 8901 §1 KPC",
  },
  {
    id: "zwolnienie_swiadczen",
    label: "Zwolnienie świadczeń",
    helper: "Świadczenia rodzinne, 500+, alimenty — nie podlegają egzekucji.",
    art: "art. 833 §6 KPC",
  },
  {
    id: "skarga",
    label: "Skarga na czynność komornika",
    helper: "Termin 7 dni od czynności! Zaskarżamy konkretne działanie komornika.",
    art: "art. 767 KPC",
  },
  {
    id: "ograniczenie",
    label: "Ograniczenie egzekucji",
    helper: "Wniosek o zawężenie zakresu prowadzonej egzekucji.",
    art: "art. 822 KPC",
  },
  {
    id: "umorzenie",
    label: "Umorzenie postępowania",
    helper: "Wniosek o całkowite umorzenie egzekucji (np. z powodu spłaty).",
    art: "art. 825 KPC",
  },
  {
    id: "raty",
    label: "Rozłożenie na raty",
    helper: "Propozycja dobrowolnej spłaty zaległości w ratach.",
    art: "art. 320 KPC (analogicznie)",
  },
] as const;

export type KomornikVariantId = (typeof KOMORNIK_VARIANTS)[number]["id"];

export const wariantSchema = z.object({
  variant: z.enum(
    KOMORNIK_VARIANTS.map((v) => v.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz wariant pisma" }) },
  ),
});
export type WariantValues = z.infer<typeof wariantSchema>;

// 2) Dłużnik (zgłaszający) -----------------------------------------------
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

// 3) Komornik / kancelaria ------------------------------------------------
export const komornikSchema = z.object({
  kancelaria_nazwa: z
    .string()
    .min(3, "Wpisz nazwisko komornika i sąd, przy którym działa")
    .max(200),
  kancelaria_adres: z
    .string()
    .max(240, "Adres jest za długi")
    .optional()
    .or(z.literal("")),
  sygnatura_km: z
    .string()
    .min(2, "Wpisz sygnaturę (np. Km 1234/24)")
    .max(60, "Sygnatura wygląda na zbyt długą"),
  wierzyciel: z
    .string()
    .min(2, "Wpisz nazwę wierzyciela (firma windykacyjna / bank / fundusz)")
    .max(200),
});
export type KomornikValues = z.infer<typeof komornikSchema>;

// 4) Zajęcie ---------------------------------------------------------------
export const ZAJECIE_TYPY = [
  { id: "rachunek_bankowy", label: "Rachunek bankowy" },
  { id: "wynagrodzenie", label: "Wynagrodzenie z pracy" },
  { id: "swiadczenia", label: "Świadczenia (500+, alimenty, renta, zasiłek)" },
  { id: "ruchomosci", label: "Ruchomości (samochód, sprzęt)" },
  { id: "nieruchomosc", label: "Nieruchomość" },
  { id: "inne", label: "Inne / nie jestem pewien(-a)" },
] as const;

export const zajecieSchema = z.object({
  zajecie_typ: z.enum(
    ZAJECIE_TYPY.map((t) => t.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz typ zajęcia" }) },
  ),
  kwota_dochodzona: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(50_000_000, "Kwota wygląda na zbyt wysoką")
    .default(0),
  data_pisma: polishDate.optional().or(z.literal("")),
});
export type ZajecieValues = z.infer<typeof zajecieSchema>;

// 5) Uzasadnienie / okoliczności życiowe ---------------------------------
export const SYTUACJA_ZYCIOWA = [
  { id: "minimum_egzystencji", label: "Egzystencja na granicy minimum socjalnego" },
  { id: "dzieci_na_utrzymaniu", label: "Mam dzieci na utrzymaniu" },
  { id: "swiadczenia_rodzinne", label: "Otrzymuję świadczenia rodzinne / 500+" },
  { id: "alimenty", label: "Pobieram / płacę alimenty" },
  { id: "choroba", label: "Choroba przewlekła / niepełnosprawność" },
  { id: "bezrobocie", label: "Bezrobocie / niska pensja" },
  { id: "kredyt_mieszkaniowy", label: "Spłacam kredyt mieszkaniowy" },
] as const;

export const uzasadnienieSchema = z.object({
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
export type UzasadnienieValues = z.infer<typeof uzasadnienieSchema>;

// 6) Skarga — czynność komornika (tylko wariant 'skarga') ----------------
export const skargaSchema = z.object({
  czynnosc_komornika: z
    .string()
    .min(5, "Opisz krótko czynność, którą zaskarżasz")
    .max(500, "Maksymalnie 500 znaków"),
  data_doreczenia: polishDate, // KRYTYCZNE — od niej liczy się termin 7-dniowy!
});
export type SkargaValues = z.infer<typeof skargaSchema>;

// 7) Raty — propozycja spłaty (tylko wariant 'raty') ---------------------
export const ratySchema = z.object({
  rata_miesieczna: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(50, "Minimalna proponowana rata to 50 zł")
    .max(50_000_000),
  liczba_rat: z.coerce
    .number({ invalid_type_error: "Wpisz liczbę miesięcy" })
    .min(1, "Minimum 1 miesiąc")
    .max(120, "Maksymalnie 120 miesięcy"),
  data_pierwszej_raty: polishDate.optional().or(z.literal("")),
});
export type RatyValues = z.infer<typeof ratySchema>;

// 8) Review --------------------------------------------------------------
export const komornikReviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność danych z prawdą" }),
  }),
});
export type KomornikReviewValues = z.infer<typeof komornikReviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda KomornikShield. */
export interface KomornikAnswers
  extends WariantValues,
    DluznikValues,
    KomornikValues,
    ZajecieValues,
    UzasadnienieValues,
    Partial<SkargaValues>,
    Partial<RatyValues>,
    KomornikReviewValues {}
