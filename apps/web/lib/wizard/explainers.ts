/**
 * In-wizard explainers — zad. 310
 *
 * For each wizard step / answer key, provide a short tooltip + optional link
 * to a baza-wiedzy article. Editable centrally without re-deploying the wizard.
 */

import type { CaseType } from "@/lib/db/types";

export interface Explainer {
  /** Short tooltip (max ~140 chars) */
  short: string;
  /** Optional longer hint shown on click (~400 chars) */
  long?: string;
  /** Link slug to /baza-wiedzy/{slug} */
  article_slug?: string;
  /** Severity: info (default) | warning | tip */
  variant?: "info" | "warning" | "tip";
}

/**
 * Indexed by [case_type:answer_key] OR ["*":answer_key] for cross-cutting keys.
 * Lookup: try specific case_type first, fallback to "*".
 */
const REGISTRY: Record<string, Explainer> = {
  // Cross-cutting (apply to many wizards)
  "*:data_doreczenia": {
    short: "Data doręczenia to data, kiedy faktycznie odebrałeś pismo (lub była awizowana 2. próba).",
    long: "Data doręczenia rozpoczyna bieg terminów procesowych. Jeśli list był awizowany dwukrotnie i nie odebrałeś go, traktuje się go jako doręczony 14. dnia po pierwszym awizo (art. 139 KPC).",
    article_slug: "data-doreczenia-i-terminy",
    variant: "warning",
  },
  "*:sygnatura_akt": {
    short: "Sygnatura sprawy — np. „Nc-e 12345/24” (e-Sąd) lub „I C 567/24”.",
    article_slug: "sygnatura-akt-jak-czytac",
  },
  "*:wartosc_przedmiotu_sporu": {
    short: "Wartość przedmiotu sporu (WPS) = kwota, której domaga się wierzyciel (bez kosztów i odsetek na dzień pozwu).",
    long: "WPS określa właściwość rzeczową sądu (rejonowy do 75 tys. zł, okręgowy powyżej) oraz wysokość opłaty sądowej. Pomyłka może skutkować zwrotem pisma.",
    article_slug: "wartosc-przedmiotu-sporu-jak-obliczyc",
  },
  "*:ma_pelnomocnika": {
    short: "Czy masz radcę prawnego/adwokata, który Cię reprezentuje w tej sprawie?",
  },
  "*:dochody_miesieczne_netto": {
    short: "Dochody netto „na rękę” za ostatnie 3-12 miesięcy, łącznie z 500+, alimentami, dodatkami.",
    article_slug: "dochody-do-wniosku-o-zwolnienie-z-kosztow",
    variant: "tip",
  },

  // sprzeciw_epu specific
  "sprzeciw_epu:zarzut_przedawnienia": {
    short: "Czy roszczenie jest przedawnione (zwykle 3 lata dla działalności gospodarczej, 6 lat ogólnie)?",
    long: "Termin przedawnienia rozpoczyna się od dnia, w którym roszczenie stało się wymagalne. Sąd nie bierze przedawnienia z urzędu w sporach przedsiębiorca↔przedsiębiorca — musisz powołać zarzut.",
    article_slug: "przedawnienie-w-sprzeciwie-od-nakazu",
    variant: "tip",
  },
  "sprzeciw_epu:cesja_sprzeciw": {
    short: "Roszczenie zostało sprzedane firmie windykacyjnej? To częsty zarzut do podniesienia.",
    article_slug: "cesja-wierzytelnosci-jak-podwazyc",
  },

  // pozew_zwrot_oplat_windykacyjnych
  "pozew_zwrot_oplat_windykacyjnych:kwota_oplat_pozaodsetkowych": {
    short: "Suma wszystkich opłat poza odsetkami: prowizja, ubezpieczenie, koszty windykacji.",
    long: "Limit kosztów pozaodsetkowych wynika z art. 36a ustawy o kredycie konsumenckim — zwykle 25% kwoty pożyczki + 30% rocznie maks. 100% kapitału. Wszystko ponad to można odzyskać.",
    article_slug: "art-36a-ukk-zwrot-oplat",
    variant: "tip",
  },

  // skarga_puodo
  "skarga_puodo:rodzaj_naruszenia": {
    short: "Wybierz najtrafniejszą kategorię — pomoże Urzędowi szybciej zająć się sprawą.",
    article_slug: "skarga-do-puodo-jak-napisac",
  },

  // wniosek_zwolnienie_kosztow_sadowych
  "wniosek_zwolnienie_kosztow_sadowych:has_dependents": {
    short: "Czy masz osoby na utrzymaniu (dzieci, niepracujący małżonek, rodzice)?",
    long: "Liczba osób na utrzymaniu zwiększa szanse na zwolnienie z kosztów. Sąd liczy „dochód na członka rodziny” i porównuje z kosztami utrzymania.",
  },

  // upadlosc_pelny_wniosek
  "upadlosc_pelny_wniosek:przyczyna_niewyplacalnosci": {
    short: "Krótki opis: utrata pracy, choroba, rozwód, pandemia, etc. Sąd ocenia „brak rażącej winy”.",
    article_slug: "upadlosc-konsumencka-przeslanki",
    variant: "warning",
  },
  "upadlosc_pelny_wniosek:major_assets": {
    short: "Wymień nieruchomości, samochody, papiery wartościowe, środki na kontach > 5000 zł.",
    long: "Pełny i prawdziwy wykaz majątku jest obowiązkowy. Zatajenie majątku to przestępstwo z art. 522 ustawy Prawo upadłościowe (do 5 lat pozbawienia wolności).",
    variant: "warning",
  },
};

export function getExplainer(caseType: CaseType, answerKey: string): Explainer | null {
  return REGISTRY[`${caseType}:${answerKey}`] ?? REGISTRY[`*:${answerKey}`] ?? null;
}

export function listExplainersForCase(caseType: CaseType): Record<string, Explainer> {
  const out: Record<string, Explainer> = {};
  for (const [key, ex] of Object.entries(REGISTRY)) {
    const [prefix, answerKey] = key.split(":");
    if (prefix === "*" || prefix === caseType) {
      out[answerKey] = ex; // case-specific overrides cross-cutting if same key
    }
  }
  return out;
}
