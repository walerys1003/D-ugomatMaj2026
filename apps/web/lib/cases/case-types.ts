/**
 * Domain types and per-module metadata schemas for cases.
 *
 * `caseTypeMeta` maps each case_type ENUM value to:
 *   - module      — D1..D8 grouping (used for navigation, theming, pricing)
 *   - title       — domyślny tytuł sprawy
 *   - description — krótki opis dla user'a (panel + landing)
 *   - priceGrosze — domyślna cena w groszach (Tier 4 podmieni za Stripe price IDs)
 *   - deadline    — kind + dni od start_date (np. sprzeciw_14dni)
 *   - status      — 'live' | 'beta' | 'planned'  (kontroluje widoczność w UI)
 */
import type { CaseType, DeadlineKind } from "@/lib/db/types";

export type ModuleId =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D5"
  | "D6"
  | "D7"
  | "D8"
  | "D9"
  | "D10"
  | "D11"
  | "D12"
  | "D13"
  | "D14"
  | "D15"
  | "D16";

export type ModuleStatus = "live" | "beta" | "planned";

export interface CaseTypeMeta {
  module: ModuleId;
  title: string;
  shortTitle: string;
  description: string;
  priceGrosze: number;          // 0 = darmowe (np. D1 skan)
  deadline: { kind: DeadlineKind; days: number } | null;
  status: ModuleStatus;
}

export const caseTypeMeta: Record<CaseType, CaseTypeMeta> = {
  // D2 — Sprzeciw EPU (flagowy, vertical slice w Tier 2)
  sprzeciw_epu: {
    module: "D2",
    title: "Sprzeciw od nakazu zapłaty (EPU)",
    shortTitle: "Sprzeciw EPU",
    description:
      "Generujemy sprzeciw od elektronicznego postępowania upominawczego — gotowy do złożenia w sądzie.",
    priceGrosze: 14_900,
    deadline: { kind: "sprzeciw_14dni", days: 14 },
    status: "live",
  },

  // D3 — KomornikShield
  komornik_zwolnienie_konta: {
    module: "D3",
    title: "Wniosek o zwolnienie rachunku spod egzekucji",
    shortTitle: "Zwolnienie rachunku",
    description: "Wniosek do komornika o zwolnienie rachunku bankowego spod zajęcia.",
    priceGrosze: 9_900,
    deadline: null,
    status: "live",
  },
  komornik_zwolnienie_swiadczen: {
    module: "D3",
    title: "Wniosek o zwolnienie świadczeń spod egzekucji",
    shortTitle: "Zwolnienie świadczeń",
    description: "Świadczenia rodzinne, alimentacyjne i pomoc społeczna nie podlegają egzekucji.",
    priceGrosze: 9_900,
    deadline: null,
    status: "live",
  },
  komornik_skarga: {
    module: "D3",
    title: "Skarga na czynność komornika",
    shortTitle: "Skarga",
    description: "Skarga w terminie 7 dni od czynności — zaskarżenie błędnej egzekucji.",
    priceGrosze: 12_900,
    deadline: { kind: "skarga_komornicza_7dni", days: 7 },
    status: "live",
  },
  komornik_ograniczenie: {
    module: "D3",
    title: "Wniosek o ograniczenie egzekucji",
    shortTitle: "Ograniczenie egzekucji",
    description: "Wniosek o ograniczenie zakresu prowadzonej egzekucji.",
    priceGrosze: 9_900,
    deadline: null,
    status: "live",
  },
  komornik_umorzenie: {
    module: "D3",
    title: "Wniosek o umorzenie egzekucji",
    shortTitle: "Umorzenie egzekucji",
    description: "Wniosek o całkowite umorzenie postępowania egzekucyjnego.",
    priceGrosze: 9_900,
    deadline: null,
    status: "live",
  },
  komornik_raty: {
    module: "D3",
    title: "Wniosek o rozłożenie zaległości na raty",
    shortTitle: "Raty",
    description: "Propozycja spłaty zadłużenia w ratach — z uzasadnieniem sytuacji życiowej.",
    priceGrosze: 9_900,
    deadline: { kind: "wniosek_raty", days: 30 },
    status: "live",
  },

  // D4 — PotrąceniaStop
  potracenia_wniosek_pracodawca: {
    module: "D4",
    title: "Wniosek do pracodawcy o ograniczenie potrąceń",
    shortTitle: "Pracodawca — ograniczenie potrąceń",
    description: "Wniosek do działu kadr o stosowanie kwot wolnych przy potrąceniach z wynagrodzenia.",
    priceGrosze: 7_900,
    deadline: null,
    status: "live",
  },
  potracenia_wniosek_komornik: {
    module: "D4",
    title: "Wniosek do komornika o ograniczenie potrąceń",
    shortTitle: "Komornik — ograniczenie potrąceń",
    description: "Wniosek do komornika o respektowanie kwot wolnych od egzekucji.",
    priceGrosze: 7_900,
    deadline: null,
    status: "live",
  },

  // D5 — BIK-Fix (live od Tier 3.6)
  bik_reklamacja_bank: {
    module: "D5",
    title: "Reklamacja do banku (BIK)",
    shortTitle: "Reklamacja w banku",
    description: "Reklamacja błędnego wpisu w BIK — pierwszy krok do usunięcia negatywnej historii.",
    priceGrosze: 9_900,
    deadline: { kind: "reklamacja_30dni", days: 30 },
    status: "live",
  },
  bik_reklamacja_bik: {
    module: "D5",
    title: "Reklamacja do BIK",
    shortTitle: "Reklamacja do BIK",
    description: "Bezpośrednia reklamacja do Biura Informacji Kredytowej.",
    priceGrosze: 9_900,
    deadline: { kind: "reklamacja_30dni", days: 30 },
    status: "live",
  },
  bik_skarga_uodo: {
    module: "D5",
    title: "Skarga do UODO (BIK)",
    shortTitle: "Skarga do UODO",
    description: "Skarga do Urzędu Ochrony Danych Osobowych w sprawie wpisu BIK.",
    priceGrosze: 12_900,
    deadline: { kind: "skarga_uodo_30dni", days: 30 },
    status: "live",
  },

  // D6 — CesjaCheck
  cesja_odpowiedz: {
    module: "D6",
    title: "Odpowiedź na wezwanie funduszu (cesja)",
    shortTitle: "Odpowiedź na cesję",
    description: "Pismo do funduszu sekurytyzacyjnego — żądanie udokumentowania cesji.",
    priceGrosze: 7_900,
    deadline: { kind: "odpowiedz_cesja_14dni", days: 14 },
    status: "live",
  },

  // D7 — UgodoMat
  ugoda_raty: {
    module: "D7",
    title: "Propozycja ugody — raty",
    shortTitle: "Ugoda — raty",
    description: "Propozycja spłaty w ratach na warunkach indywidualnych.",
    priceGrosze: 7_900,
    deadline: null,
    status: "live",
  },
  ugoda_umorzenie: {
    module: "D7",
    title: "Propozycja ugody — częściowe umorzenie",
    shortTitle: "Ugoda — umorzenie",
    description: "Propozycja częściowego umorzenia długu i spłaty pozostałej kwoty.",
    priceGrosze: 7_900,
    deadline: null,
    status: "live",
  },
  ugoda_propozycja: {
    module: "D7",
    title: "Propozycja ugody — indywidualna",
    shortTitle: "Ugoda indywidualna",
    description: "Indywidualnie negocjowana propozycja ugody.",
    priceGrosze: 7_900,
    deadline: null,
    status: "live",
  },

  // D8 — Upadłość-Lite
  upadlosc_wniosek: {
    module: "D8",
    title: "Wniosek o ogłoszenie upadłości konsumenckiej",
    shortTitle: "Upadłość konsumencka",
    description: "Pakiet startowy: wniosek + spis wierzycieli + uzasadnienie niewypłacalności.",
    priceGrosze: 19_900,
    deadline: { kind: "wniosek_upadlosc", days: 30 },
    status: "live",
  },

  // ---------------------------------------------------------------------
  // Tier 7 — D9..D16 expansion (zad. 301-308)
  // ---------------------------------------------------------------------

  // D9 — Pełny wniosek o upadłość konsumencką (KRS-FORM-UPK1)
  upadlosc_pelny_wniosek: {
    module: "D9",
    title: "Pełny wniosek o upadłość konsumencką (formularz urzędowy)",
    shortTitle: "Upadłość — pełny pakiet",
    description:
      "Kompletny wniosek na formularzu KRS-FORM-UPK1: spis majątku, wierzycieli, dochodów, uzasadnienie + plan spłaty.",
    priceGrosze: 39_900,
    deadline: { kind: "wniosek_upadlosc", days: 30 },
    status: "beta",
  },

  // D10 — Pozew o zwrot opłat windykacyjnych
  pozew_zwrot_oplat_windykacyjnych: {
    module: "D10",
    title: "Pozew o zwrot opłat windykacyjnych",
    shortTitle: "Zwrot opłat 30/40/100 zł",
    description:
      "Zwrot bezprawnie pobranych opłat za monity i wezwania (klauzula abuzywna, art. 385(1) k.c., art. 359 § 2(2) k.c.).",
    priceGrosze: 14_900,
    deadline: null,
    status: "beta",
  },

  // D11 — Reklamacja do banku + Rzecznik Finansowy
  reklamacja_bank_rf: {
    module: "D11",
    title: "Reklamacja do banku z eskalacją do Rzecznika Finansowego",
    shortTitle: "Reklamacja bank/RF",
    description:
      "Wzór reklamacji z 30-dniową klauzulą odpowiedzi + automatyczna eskalacja do Rzecznika Finansowego.",
    priceGrosze: 9_900,
    deadline: { kind: "reklamacja_bank_30dni", days: 30 },
    status: "beta",
  },

  // D12 — Skarga do PUODO
  skarga_puodo: {
    module: "D12",
    title: "Skarga do Prezesa UODO",
    shortTitle: "Skarga PUODO",
    description:
      "Wzór skargi ze wskazaniem naruszenia RODO + żądanie ograniczenia przetwarzania danych przez windykatora.",
    priceGrosze: 9_900,
    deadline: { kind: "puodo_30dni", days: 30 },
    status: "beta",
  },

  // D13 — Wniosek o rozłożenie należności sądowych na raty
  wniosek_raty_sadowe: {
    module: "D13",
    title: "Wniosek o rozłożenie należności sądowych na raty",
    shortTitle: "Raty sądowe (art. 320 k.p.c.)",
    description:
      "Wzór wniosku z uzasadnieniem stanu majątkowego — art. 320 k.p.c., dla osób w trudnej sytuacji życiowej.",
    priceGrosze: 7_900,
    deadline: { kind: "wniosek_raty", days: 14 },
    status: "beta",
  },

  // D14 — Wniosek o zwolnienie od kosztów sądowych
  wniosek_zwolnienie_kosztow_sadowych: {
    module: "D14",
    title: "Wniosek o zwolnienie od kosztów sądowych",
    shortTitle: "Zwolnienie z kosztów",
    description:
      "Formularz urzędowy + oświadczenie majątkowe — pełna ochrona przed opłatami sądowymi.",
    priceGrosze: 7_900,
    deadline: null,
    status: "beta",
  },

  // D15 — Zażalenie na klauzulę wykonalności
  zazalenie_klauzula_wykonalnosci: {
    module: "D15",
    title: "Zażalenie na nadanie klauzuli wykonalności",
    shortTitle: "Zażalenie na klauzulę",
    description:
      "Art. 795 k.p.c. — zaskarżenie błędnie nadanej klauzuli wykonalności (np. brak doręczenia nakazu EPU).",
    priceGrosze: 12_900,
    deadline: { kind: "zazalenie_7dni", days: 7 },
    status: "beta",
  },

  // D16 — Powództwo o pozbawienie tytułu wykonawczego wykonalności
  pozbawienie_tytulu_wykonalnosci: {
    module: "D16",
    title: "Powództwo o pozbawienie tytułu wykonawczego wykonalności",
    shortTitle: "Pozbawienie tytułu (art. 840 k.p.c.)",
    description:
      "Trzy podstawy z art. 840 k.p.c. — przedawnienie, spełnienie świadczenia, brak wymagalności.",
    priceGrosze: 19_900,
    deadline: { kind: "powodztwo_przeciwegzekucyjne", days: 30 },
    status: "beta",
  },
};

/** Static module index used by /panel and landing. */
export const moduleIndex: Record<ModuleId, { title: string; tagline: string; status: ModuleStatus }> = {
  D1:  { title: "Skaner Nakazu",     tagline: "Bezpłatna analiza pisma sądowego",       status: "planned" },
  D2:  { title: "Sprzeciw EPU",      tagline: "Sprzeciw od nakazu zapłaty",             status: "live"    },
  D3:  { title: "KomornikShield",    tagline: "Pakiet pism do komornika",               status: "live"    },
  D4:  { title: "PotrąceniaStop",    tagline: "Ochrona kwot wolnych",                   status: "live"    },
  D5:  { title: "BIK-Fix",           tagline: "Czyszczenie historii kredytowej",        status: "live"    },
  D6:  { title: "CesjaCheck",        tagline: "Obrona przed funduszami",                status: "live"    },
  D7:  { title: "UgodoMat",          tagline: "Propozycje ugody",                       status: "live"    },
  D8:  { title: "Upadłość-Lite",     tagline: "Wniosek o upadłość konsumencką",         status: "live"    },
  // Tier 7 expansion
  D9:  { title: "Upadłość-Pro",      tagline: "Pełny pakiet upadłościowy (KRS-FORM)",   status: "beta"    },
  D10: { title: "Zwrot opłat",       tagline: "Pozew o zwrot opłat windykacyjnych",     status: "beta"    },
  D11: { title: "Bank/Rzecznik",     tagline: "Reklamacja + RF",                        status: "beta"    },
  D12: { title: "Skarga PUODO",      tagline: "Ochrona danych przed windykatorem",      status: "beta"    },
  D13: { title: "Raty sądowe",       tagline: "Rozłożenie należności na raty",          status: "beta"    },
  D14: { title: "Bez kosztów",       tagline: "Zwolnienie od kosztów sądowych",         status: "beta"    },
  D15: { title: "Zażalenie",         tagline: "Zaskarżenie klauzuli wykonalności",      status: "beta"    },
  D16: { title: "Anty-egzekucja",    tagline: "Pozbawienie tytułu wykonalności",        status: "beta"    },
};

/** Helper — czytelne tytuły dla statusów sprawy w UI. */
export const caseStatusLabel: Record<import("@/lib/db/types").CaseStatus, string> = {
  draft: "Szkic",
  analysis: "Analiza",
  generated: "Gotowe do opłaty",
  paid: "Opłacone",
  downloaded: "Pobrane",
  completed: "Zakończone",
  archived: "Zarchiwizowane",
};
