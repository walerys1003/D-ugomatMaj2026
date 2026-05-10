/**
 * D8 Upadłość-Lite — Zod schemas dla kreatora.
 *
 * 1 case_type: upadlosc_wniosek
 *   Pakiet startowy do upadłości konsumenckiej:
 *     - wniosek o ogłoszenie upadłości (art. 491¹–491²² Pr.up.)
 *     - spis wierzycieli (art. 22a Pr.up.)
 *     - uzasadnienie niewypłacalności (art. 11 Pr.up.)
 *
 * UWAGA: Pismo NIE jest substytutem porady prawnej — w sekcji review
 * dodajemy wyraźne ostrzeżenie + zachętę do konsultacji z adwokatem
 * przed złożeniem do sądu.
 *
 * Kroki wizarda (linearny graf, 8 kroków):
 *   1. dluznik          — Twoje dane (imię, adres, PESEL, NIP)
 *   2. sad              — sąd właściwy (sąd rejonowy wg miejsca zwykłego pobytu)
 *   3. sytuacja_zawodowa — działalność (B2C czy były przedsiębiorca), zatrudnienie
 *   4. majatek          — nieruchomości, ruchomości, środki na koncie, dochody
 *   5. wierzyciele      — lista wierzycieli (kwota, tytuł, data wymagalności)
 *   6. niewyplacalnosc  — przyczyny niewypłacalności (multiselect + opis)
 *   7. zalaczniki       — checklist załączników (info-only, ale zapisujemy)
 *   8. review           — podwójny consent (dane prawdziwe + brak ukrywania)
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
    .max(240),
  dluznik_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL składa się z 11 cyfr"),
  dluznik_nip: z
    .string()
    .regex(/^\d{10}$/, "NIP składa się z 10 cyfr (wymagany jeśli były przedsiębiorca)")
    .optional()
    .or(z.literal("")),
  dluznik_email: z
    .string()
    .email("Wpisz poprawny adres e-mail")
    .max(180)
    .optional()
    .or(z.literal("")),
  dluznik_telefon: z
    .string()
    .max(40, "Numer telefonu wygląda na zbyt długi")
    .optional()
    .or(z.literal("")),
});
export type DluznikValues = z.infer<typeof dluznikSchema>;

// 2) Sąd właściwy --------------------------------------------------------
export const sadSchema = z.object({
  sad_nazwa: z
    .string()
    .min(5, "Wpisz pełną nazwę sądu rejonowego (wydział upadłościowy)")
    .max(220),
  sad_adres: z
    .string()
    .max(240, "Adres sądu jest za długi")
    .optional()
    .or(z.literal("")),
});
export type SadValues = z.infer<typeof sadSchema>;

// 3) Sytuacja zawodowa ---------------------------------------------------
export const STATUS_ZAWODOWY = [
  { id: "konsument", label: "Konsument (nigdy nie prowadziłem firmy)" },
  { id: "byly_przedsiebiorca", label: "Były przedsiębiorca (zamknięta JDG/spółka)" },
  { id: "rolnik", label: "Rolnik / domownik rolnika" },
  { id: "wspolnik_spolki", label: "Były wspólnik spółki osobowej" },
] as const;

export const FORMA_DOCHODU = [
  { id: "umowa_o_prace", label: "Umowa o pracę" },
  { id: "umowa_zlecenie", label: "Umowa zlecenie / o dzieło" },
  { id: "emerytura_renta", label: "Emerytura / renta" },
  { id: "swiadczenia", label: "Świadczenia rodzinne / 500+" },
  { id: "bezrobocie", label: "Bez stałych dochodów" },
  { id: "inne", label: "Inne źródło" },
] as const;

export const sytuacjaZawodowaSchema = z.object({
  status_zawodowy: z.enum(
    STATUS_ZAWODOWY.map((s) => s.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz status zawodowy" }) },
  ),
  data_zakonczenia_dzialalnosci: polishDate.optional().or(z.literal("")),
  forma_dochodu: z.enum(
    FORMA_DOCHODU.map((f) => f.id) as unknown as [string, ...string[]],
    { errorMap: () => ({ message: "Wybierz źródło dochodu" }) },
  ),
  dochod_miesieczny: z.coerce
    .number({ invalid_type_error: "Wpisz dochód liczbą" })
    .min(0, "Dochód nie może być ujemny")
    .max(1_000_000),
  liczba_osob_na_utrzymaniu: z.coerce
    .number({ invalid_type_error: "Wpisz liczbę osób" })
    .int()
    .min(0)
    .max(20)
    .default(0),
});
export type SytuacjaZawodowaValues = z.infer<typeof sytuacjaZawodowaSchema>;

// 4) Majątek -------------------------------------------------------------
export const majatekSchema = z.object({
  posiada_nieruchomosc: z.boolean().default(false),
  nieruchomosc_opis: z
    .string()
    .max(500, "Opis nieruchomości maksymalnie 500 znaków")
    .optional()
    .or(z.literal("")),
  posiada_pojazd: z.boolean().default(false),
  pojazd_opis: z
    .string()
    .max(300, "Opis pojazdu maksymalnie 300 znaków")
    .optional()
    .or(z.literal("")),
  srodki_na_koncie: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0)
    .max(50_000_000)
    .default(0),
  inne_skladniki: z
    .string()
    .max(1000, "Opis maksymalnie 1000 znaków")
    .optional()
    .or(z.literal("")),
});
export type MajatekValues = z.infer<typeof majatekSchema>;

// 5) Wierzyciele ---------------------------------------------------------
export const wierzycielItemSchema = z.object({
  nazwa: z.string().min(2, "Wpisz nazwę wierzyciela").max(200),
  tytul: z.string().min(2, "Wpisz tytuł zobowiązania (np. kredyt gotówkowy, pożyczka)").max(200),
  kwota: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0)
    .max(50_000_000),
  data_wymagalnosci: polishDate.optional().or(z.literal("")),
});
export type WierzycielItem = z.infer<typeof wierzycielItemSchema>;

export const wierzycieleSchema = z.object({
  wierzyciele: z
    .array(wierzycielItemSchema)
    .min(1, "Dodaj co najmniej jednego wierzyciela")
    .max(50, "Maksymalnie 50 wierzycieli (kontaktuj się z adwokatem przy większej liczbie)"),
});
export type WierzycieleValues = z.infer<typeof wierzycieleSchema>;

// 6) Przyczyny niewypłacalności ------------------------------------------
export const PRZYCZYNY_NIEWYPLACALNOSCI = [
  { id: "utrata_pracy", label: "Utrata pracy / spadek dochodów" },
  { id: "choroba", label: "Choroba przewlekła / niepełnosprawność" },
  { id: "rozwod", label: "Rozwód / separacja" },
  { id: "smierc_bliskiej", label: "Śmierć bliskiej osoby" },
  { id: "kredyt_walutowy", label: "Wzrost rat kredytu (np. waluta obca)" },
  { id: "porece", label: "Spłata cudzych zobowiązań (poręczenie)" },
  { id: "upadek_firmy", label: "Upadek prowadzonej działalności" },
  { id: "nieprzewidziane_wydatki", label: "Nieprzewidziane wydatki nadzwyczajne" },
  { id: "spirala_zadluzenia", label: "Spirala zadłużenia (kolejne pożyczki)" },
] as const;

export const niewyplacalnoscSchema = z.object({
  przyczyny: z
    .array(
      z.enum(
        PRZYCZYNY_NIEWYPLACALNOSCI.map((p) => p.id) as unknown as [string, ...string[]],
      ),
    )
    .min(1, "Wybierz co najmniej jedną przyczynę")
    .max(PRZYCZYNY_NIEWYPLACALNOSCI.length),
  data_powstania_niewyplacalnosci: polishDate.optional().or(z.literal("")),
  uzasadnienie: z
    .string()
    .min(50, "Opisz przyczyny niewypłacalności (min. 50 znaków)")
    .max(3000, "Opis maksymalnie 3000 znaków"),
});
export type NiewyplacalnoscValues = z.infer<typeof niewyplacalnoscSchema>;

// 7) Załączniki ----------------------------------------------------------
export const ZALACZNIKI = [
  { id: "wykaz_majatku", label: "Wykaz majątku z szacunkową wyceną (art. 22a ust. 1 pkt 2 Pr.up.)" },
  { id: "spis_wierzycieli", label: "Spis wierzycieli (art. 22a ust. 1 pkt 1 Pr.up.)" },
  { id: "potwierdzenia_dochodow", label: "Potwierdzenia dochodów z ostatnich 6 miesięcy" },
  { id: "umowy_kredytowe", label: "Kopie umów kredytowych / pożyczkowych" },
  { id: "wezwania_komornicze", label: "Wezwania komornicze i pisma sądowe" },
  { id: "akt_urodzenia_dzieci", label: "Akty urodzenia dzieci na utrzymaniu" },
  { id: "zaswiadczenia_lekarskie", label: "Zaświadczenia lekarskie (jeśli choroba)" },
  { id: "potwierdzenie_oplaty", label: "Potwierdzenie opłaty sądowej (30 zł)" },
] as const;

export const zalacznikiSchema = z.object({
  zalaczniki: z
    .array(
      z.enum(
        ZALACZNIKI.map((z) => z.id) as unknown as [string, ...string[]],
      ),
    )
    .default([]),
});
export type ZalacznikiValues = z.infer<typeof zalacznikiSchema>;

// 8) Review --------------------------------------------------------------
export const upadloscReviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność danych z prawdą" }),
  }),
  consent_full_disclosure: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź, że nie ukrywasz majątku ani wierzycieli" }),
  }),
});
export type UpadloscReviewValues = z.infer<typeof upadloscReviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda Upadłość-Lite. */
export interface UpadloscAnswers
  extends DluznikValues,
    SadValues,
    SytuacjaZawodowaValues,
    MajatekValues,
    WierzycieleValues,
    NiewyplacalnoscValues,
    ZalacznikiValues,
    UpadloscReviewValues {}
