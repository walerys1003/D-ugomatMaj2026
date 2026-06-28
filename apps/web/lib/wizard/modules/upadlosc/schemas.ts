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

// =========================================================================
// D9 — Pełny wniosek o upadłość konsumencką (formularz urzędowy KRS-FORM-UPK1)
// =========================================================================
// D9 reusuje 8 schematów D8 i dodaje 3 schematy szczegółowe wymagane przez
// formularz urzędowy. Patrz: art. 491² Pr.up. — wymaganie dokumentowania
// dochodów z 12 miesięcy + propozycja planu spłaty.

// 9) Dochody historyczne (12 miesięcy) -----------------------------------
const incomeRowSchema = z.object({
  miesiac: polishDate, // YYYY-MM-01 jako konwencja
  zrodlo: z.string().min(2, "Min. 2 znaki").max(120),
  brutto_pln: z.number().min(0).max(99999999),
  netto_pln: z.number().min(0).max(99999999),
  uwagi: z.string().max(280).optional().default(""),
});
export type IncomeRow = z.infer<typeof incomeRowSchema>;

export const dochodyHistoryczneSchema = z.object({
  dochody: z
    .array(incomeRowSchema)
    .min(1, "Dodaj co najmniej jeden miesiąc dochodu (najlepiej 12)")
    .max(36, "Maksymalnie 36 wierszy"),
  /** Średni miesięczny dochód netto z deklarowanych miesięcy (auto-compute UI). */
  srednia_netto_pln: z.number().min(0).optional(),
  /** Czy w okresie były miesiące bez dochodu? */
  miesiace_bez_dochodu: z.number().int().min(0).max(36).default(0),
});
export type DochodyHistoryczneValues = z.infer<typeof dochodyHistoryczneSchema>;

// 10) Plan spłaty (proponowany przez wnioskodawcę) -----------------------
export const planSplatySchema = z.object({
  /** Miesięczna rata, którą wnioskodawca jest w stanie spłacać. */
  rata_miesieczna_pln: z
    .number()
    .min(0, "Wartość nie może być ujemna")
    .max(99999999),
  /** Czas trwania planu (miesiące). Standard 36 (krótszy = lepiej dla dłużnika). */
  liczba_miesiecy: z.number().int().min(0).max(84),
  /** Uzasadnienie kwoty raty (dlaczego dłużnik proponuje akurat tę kwotę). */
  uzasadnienie_kwoty: z
    .string()
    .min(40, "Min. 40 znaków — sąd oczekuje konkretnego uzasadnienia")
    .max(2000),
  /** Czy wnioskodawca prosi o umorzenie pozostałej części po planie spłaty? */
  wnioskuje_umorzenie_reszty: z.boolean().default(true),
});
export type PlanSplatyValues = z.infer<typeof planSplatySchema>;

// 11) Uzasadnienie szczegółowe -------------------------------------------
// Pełny wniosek wymaga rozszerzonej narracji (KPC art. 187 § 1 pkt 2,
// Pr.up. art. 491² ust. 4). Min. 200 znaków, max 6000.
export const uzasadnienieSchema = z.object({
  okolicznosci_powstania: z
    .string()
    .min(80, "Opisz okoliczności w min. 80 znakach")
    .max(2000),
  proba_polubownych_rozwiazan: z
    .string()
    .min(40, "Opisz próby polubowne (min. 40 znaków)")
    .max(2000),
  sytuacja_rodzinna: z
    .string()
    .min(40, "Opisz sytuację rodzinną (min. 40 znaków)")
    .max(2000),
  /** Łączny tekst po sklejeniu — opcjonalne pole computed. */
  full_text: z.string().optional(),
});
export type UzasadnienieValues = z.infer<typeof uzasadnienieSchema>;

/**
 * Pełny zestaw odpowiedzi D9 (8 D8 + 3 D9-only).
 *
 * Uwaga: D8 ma już pole `uzasadnienie: string` (z `niewyplacalnoscSchema`).
 * D9 wymaga rozszerzonej struktury — udostępniamy ją pod nazwą
 * `uzasadnienie_full`, aby uniknąć kolizji nazw przy `extends`.
 */
export interface UpadloscPelnyAnswers extends UpadloscAnswers {
  dochody_historyczne: DochodyHistoryczneValues;
  plan_splaty: PlanSplatyValues;
  uzasadnienie_full: UzasadnienieValues;
}
