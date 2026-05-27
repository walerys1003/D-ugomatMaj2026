/**
 * D5 BIK-Fix — Zod schemas dla kreatora.
 *
 * Wariant zależy od kroku ścieżki BIK-Fix (3-stopniowa procedura):
 *   - reklamacja_bank   (krok 1: bezpośrednio do banku, art. 70a Pr. bank., 30 dni)
 *   - reklamacja_bik    (krok 2: do BIK S.A., po negatywnej odp. banku, 30 dni)
 *   - skarga_uodo       (krok 3: skarga do Prezesa UODO, art. 77 RODO, 30 dni od BIK)
 *
 * Wspólne kroki:
 *   1. wariant       — który dokument generujemy (bank / bik / uodo)
 *   2. zglaszajacy   — dane reklamującego (imię, adres, PESEL)
 *   3. wpis          — bank, numer umowy, kwota, data wpisu, status
 *   4. zarzuty       — charakter nieprawidłowości (multiselect + opis)
 *   5. historia      — (warianty 2 i 3) data/treść poprzedniej reklamacji
 *   6. review        — checkbox potwierdzenia + generate
 */
import { z } from "zod";

const polishDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Wpisz datę w formacie RRRR-MM-DD")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Niepoprawna data");

// 1) Wariant -------------------------------------------------------------
export const wariantSchema = z.object({
  variant: z.enum(["reklamacja_bank", "reklamacja_bik", "skarga_uodo"], {
    errorMap: () => ({ message: "Wybierz wariant pisma" }),
  }),
});
export type WariantValues = z.infer<typeof wariantSchema>;

// 2) Zgłaszający ---------------------------------------------------------
export const zglaszajacySchema = z.object({
  powod_nazwa: z
    .string()
    .min(2, "Wpisz imię i nazwisko")
    .max(160, "Imię i nazwisko jest za długie"),
  powod_adres: z
    .string()
    .min(5, "Wpisz adres (ulica, kod, miasto)")
    .max(240, "Adres jest za długi"),
  pozwany_pesel: z
    .string()
    .regex(/^\d{11}$/, "PESEL składa się z 11 cyfr")
    .optional()
    .or(z.literal("")),
});
export type ZglaszajacyValues = z.infer<typeof zglaszajacySchema>;

// 3) Wpis ----------------------------------------------------------------
export const wpisSchema = z.object({
  bank_nazwa: z.string().min(2, "Wpisz nazwę banku").max(120),
  bank_adres: z
    .string()
    .max(240, "Adres jest za długi")
    .optional()
    .or(z.literal("")),
  numer_umowy: z
    .string()
    .min(2, "Wpisz numer umowy")
    .max(80, "Numer umowy wygląda na zbyt długi"),
  kwota_kredytu: z.coerce
    .number({ invalid_type_error: "Wpisz kwotę liczbą" })
    .min(0, "Kwota nie może być ujemna")
    .max(50_000_000, "Kwota wygląda na zbyt wysoką"),
  data_wpisu: polishDate,
  status_wpisu: z
    .enum(["aktywny", "zamknięty", "zaległość"])
    .optional(),
});
export type WpisValues = z.infer<typeof wpisSchema>;

// 4) Zarzuty / charakter nieprawidłowości --------------------------------
export const BIK_NIEPRAWIDLOWOSCI = [
  {
    id: "splata_calkowita",
    label: "Zobowiązanie zostało spłacone w całości",
    helper: "Mam dowód spłaty (potwierdzenie przelewu, zaświadczenie banku).",
  },
  {
    id: "cesja",
    label: "Wierzytelność została scedowana — wpis nieaktualny",
    helper: "Bank sprzedał wierzytelność innemu podmiotowi.",
  },
  {
    id: "przedawnienie",
    label: "Roszczenie jest przedawnione",
    helper: "Termin przedawnienia minął — wpis nie powinien już istnieć.",
  },
  {
    id: "blad_kwoty",
    label: "Kwota wpisu jest nieprawidłowa",
    helper: "Bank wykazuje wyższą kwotę niż faktyczna.",
  },
  {
    id: "podwojny_wpis",
    label: "Podwójny wpis (duplikat)",
    helper: "To samo zobowiązanie figuruje w BIK więcej niż raz.",
  },
  {
    id: "brak_zgody",
    label: "Brak podstawy prawnej / zgody na przetwarzanie",
    helper: "Bank nie ma podstawy do dalszego utrzymywania wpisu (art. 6 RODO).",
  },
  {
    id: "blad_danych",
    label: "Błędne dane osobowe lub identyfikujące",
    helper: "Wpis dotyczy innej osoby albo zawiera błędy w danych.",
  },
] as const;

export const BIK_NIEPRAWIDLOWOSCI_IDS = BIK_NIEPRAWIDLOWOSCI.map((x) => x.id) as unknown as readonly [
  string,
  ...string[],
];

const bikZarzutEnum = z.enum(
  BIK_NIEPRAWIDLOWOSCI_IDS as unknown as [string, ...string[]],
);

export const bikZarzutySchema = z.object({
  zarzuty: z
    .array(bikZarzutEnum)
    .min(1, "Zaznacz przynajmniej jeden zarzut — to fundament reklamacji")
    .max(BIK_NIEPRAWIDLOWOSCI_IDS.length),
  rodzaj_nieprawidlowosci: z
    .string()
    .max(400, "Maksymalnie 400 znaków")
    .optional()
    .or(z.literal("")),
  okolicznosci: z
    .string()
    .max(2000, "Opis maksymalnie 2000 znaków")
    .optional()
    .or(z.literal("")),
});
export type BikZarzutyValues = z.infer<typeof bikZarzutySchema>;

// 5) Historia (warianty bik / uodo) --------------------------------------
export const historiaSchema = z.object({
  data_reklamacji_bank: polishDate.optional().or(z.literal("")),
  odpowiedz_banku: z
    .string()
    .max(1000, "Maksymalnie 1000 znaków")
    .optional()
    .or(z.literal("")),
  data_reklamacji_bik: polishDate.optional().or(z.literal("")),
  odpowiedz_bik: z
    .string()
    .max(1000, "Maksymalnie 1000 znaków")
    .optional()
    .or(z.literal("")),
});
export type HistoriaValues = z.infer<typeof historiaSchema>;

// 6) Review --------------------------------------------------------------
export const bikReviewSchema = z.object({
  consent_truth: z.literal(true, {
    errorMap: () => ({ message: "Potwierdź zgodność danych z prawdą" }),
  }),
});
export type BikReviewValues = z.infer<typeof bikReviewSchema>;

/** Pełny zestaw odpowiedzi po ukończeniu wizarda BIK-Fix. */
export interface BikFixAnswers
  extends WariantValues,
    ZglaszajacyValues,
    WpisValues,
    BikZarzutyValues,
    Partial<HistoriaValues>,
    BikReviewValues {}
