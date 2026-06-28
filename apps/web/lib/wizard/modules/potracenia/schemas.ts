/**
 * D4 PotrąceniaStop — Zod schemas dla kreatora.
 *
 * 2 warianty pism (osobne case_type):
 *   - wniosek_pracodawca → potracenia_wniosek_pracodawca
 *       Wniosek do działu kadr o stosowanie kwot wolnych przy potrąceniach
 *       z wynagrodzenia (art. 87, 871, 91 KP).
 *   - wniosek_komornik   → potracenia_wniosek_komornik
 *       Wniosek do komornika o respektowanie kwot wolnych od egzekucji
 *       (art. 833 KPC, art. 871 KP, art. 8741 KPC).
 *
 * Wspólne kroki:
 *   1. wariant       — pracodawca vs komornik
 *   2. wnioskodawca  — Twoje dane (imię, adres, PESEL)
 *   3. zatrudnienie  — pracodawca / stanowisko / wynagrodzenie / forma umowy
 *   4. potracenie    — typ potrącenia, kwota, % wynagrodzenia
 *   5. sytuacja      — okoliczności (multiselect + opis)
 *   6. (komornik only) — sygnatura Km + kancelaria
 *   7. review        — checkbox potwierdzenia + generate
 */
import { z } from "zod";

const polishDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Wpisz datę w formacie RRRR-MM-DD")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Niepoprawna data");

// 1) Wariant -------------------------------------------------------------
export const POTRACENIA_VARIANTS = [
  {
    id: "wniosek_pracodawca",
    label: "Wniosek do pracodawcy",
    helper:
      "Pismo do działu kadr o stosowanie kwot wolnych — szybka ścieżka, bez sądu.",
    art: "art. 87, 871, 91 Kodeksu pracy",
  },
  {
    id: "wniosek_komornik",
    label: "Wniosek do komornika",
    helper:
      "Pismo egzekucyjne — żądanie respektowania kwot wolnych od egzekucji.",
    art: "art. 833 KPC, art. 871 KP",
  },
] as const;

export type PotraceniaVariantId =
  (typeof POTRACENIA_VARIANTS)[number]["id"];

export const wariantSchema = z.object({
  variant: z.enum(
    POTRACENIA_VARIANTS.map((v) => v.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz wariant pisma" }) },
  ),
});
export type WariantValues = z.infer<typeof wariantSchema>;

// 2) Wnioskodawca --------------------------------------------------------
export const wnioskodawcaSchema = z.object({
  wnioskodawca_nazwa: z
    .string()
    .min(2, "Wpisz imię i nazwisko")
    .max(160, "Imię i nazwisko jest za długie"),
  wnioskodawca_adres: z
    .string()
    .min(5, "Wpisz adres (ulica, kod, miasto)")
    .max(240, "Adres jest za długi"),
  wnioskodawca_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL składa się z 11 cyfr")
    .optional()
    .or(z.literal("")),
});
export type WnioskodawcaValues = z.infer<typeof wnioskodawcaSchema>;

// 3) Zatrudnienie --------------------------------------------------------
export const FORMA_ZATRUDNIENIA = [
  { id: "umowa_o_prace", label: "Umowa o pracę" },
  { id: "umowa_zlecenie", label: "Umowa zlecenie" },
  { id: "umowa_o_dzielo", label: "Umowa o dzieło" },
  { id: "b2b", label: "B2B / samozatrudnienie" },
  { id: "renta_emerytura", label: "Renta / emerytura / zasiłek" },
  { id: "inne", label: "Inne źródło dochodu" },
] as const;

export const zatrudnienieSchema = z.object({
  pracodawca_nazwa: z
    .string()
    .min(2, "Wpisz nazwę pracodawcy / płatnika")
    .max(200),
  pracodawca_adres: z
    .string()
    .max(240, "Adres jest za długi")
    .optional()
    .or(z.literal("")),
  stanowisko: z
    .string()
    .max(120, "Nazwa stanowiska jest za długa")
    .optional()
    .or(z.literal("")),
  forma_zatrudnienia: z.enum(
    FORMA_ZATRUDNIENIA.map((f) => f.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz formę zatrudnienia" }) },
  ),
  wynagrodzenie_netto: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(10_000_000, "Kwota wygląda na zbyt wysoką"),
});
export type ZatrudnienieValues = z.infer<typeof zatrudnienieSchema>;

// 4) Potrącenie ---------------------------------------------------------
export const POTRACENIE_TYPY = [
  { id: "alimentacyjne", label: "Świadczenia alimentacyjne (do 3/5 wynagrodzenia)" },
  { id: "niealimentacyjne", label: "Niealimentacyjne (do 1/2 wynagrodzenia)" },
  { id: "zaliczki_pieniezne", label: "Zaliczki pieniężne udzielone przez pracodawcę" },
  { id: "kary_pieniezne", label: "Kary pieniężne (art. 108 KP)" },
  { id: "kilka_tytulow", label: "Kilka tytułów wykonawczych jednocześnie" },
  { id: "inne", label: "Inne / nie jestem pewien(-a)" },
] as const;

export const potracenieSchema = z.object({
  potracenie_typ: z.enum(
    POTRACENIE_TYPY.map((t) => t.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz typ potrącenia" }) },
  ),
  kwota_potracenia: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(10_000_000),
  procent_wynagrodzenia: z.coerce
    .number({ invalid_type_error: "Wpisz wartość liczbą" })
    .min(0, "Wartość nie może być ujemna")
    .max(100, "Maksymalnie 100%")
    .optional(),
  data_pierwszego_potracenia: polishDate.optional().or(z.literal("")),
});
export type PotracenieValues = z.infer<typeof potracenieSchema>;

// 5) Sytuacja życiowa ----------------------------------------------------
export const SYTUACJA_ZYCIOWA = [
  { id: "minimum_egzystencji", label: "Egzystencja na granicy minimum socjalnego" },
  { id: "dzieci_na_utrzymaniu", label: "Mam dzieci na utrzymaniu" },
  { id: "swiadczenia_rodzinne", label: "Otrzymuję świadczenia rodzinne / 500+" },
  { id: "alimenty", label: "Pobieram / płacę alimenty" },
  { id: "choroba", label: "Choroba przewlekła / niepełnosprawność" },
  { id: "kredyt_mieszkaniowy", label: "Spłacam kredyt mieszkaniowy" },
  { id: "samotny_rodzic", label: "Samotnie wychowuję dziecko" },
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

// 6) Komornik (tylko wariant 'wniosek_komornik') -------------------------
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
    .max(60),
  wierzyciel: z
    .string()
    .min(2, "Wpisz nazwę wierzyciela")
    .max(200),
});
export type KomornikValues = z.infer<typeof komornikSchema>;

// 7) Review --------------------------------------------------------------
export const potraceniaReviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność danych z prawdą" }),
  }),
});
export type PotraceniaReviewValues = z.infer<typeof potraceniaReviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda PotrąceniaStop. */
export interface PotraceniaAnswers
  extends WariantValues,
    WnioskodawcaValues,
    ZatrudnienieValues,
    PotracenieValues,
    SytuacjaValues,
    Partial<KomornikValues>,
    PotraceniaReviewValues {}
