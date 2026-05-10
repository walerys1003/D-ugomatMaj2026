/**
 * Auto-generated evidence requests — zad. 329
 *
 * Based on case_type, generates a checklist of documents/evidence the user should
 * gather. Uses static rules (deterministic, no AI cost) plus optional Haiku-based
 * augmentation for unusual cases.
 */

import type { CaseType } from "@/lib/db/types";

export type EvidencePriority = "required" | "recommended" | "optional";

export interface EvidenceRequest {
  id: string;
  title: string;
  description: string;
  priority: EvidencePriority;
  category: "umowa" | "korespondencja" | "dowody_zaplaty" | "decyzja_urzedowa" | "inne";
  example?: string;
}

const SHARED_REQUESTS: EvidenceRequest[] = [
  {
    id: "doreczony_dokument",
    title: "Doręczony dokument (pismo / nakaz / pozew / wezwanie)",
    description: "Skan lub zdjęcie pisma, które otrzymałeś — koniecznie wraz z kopertą i datą doręczenia.",
    priority: "required",
    category: "korespondencja",
    example: "Nakaz zapłaty z e-Sądu, wezwanie do zapłaty, pozew z odpisem.",
  },
  {
    id: "umowa_zrodlowa",
    title: "Umowa źródłowa (jeśli istnieje)",
    description: "Umowa pożyczki, kredytu, zakupu, najmu — to z niej wynika roszczenie.",
    priority: "required",
    category: "umowa",
  },
  {
    id: "korespondencja_z_wierzycielem",
    title: "Cała korespondencja z wierzycielem / windykatorem",
    description: "E-maile, wezwania, SMS-y, listy. Pomocne do udowodnienia np. cesji, prób ugody, zarzutu przedawnienia.",
    priority: "recommended",
    category: "korespondencja",
  },
];

const PER_TYPE_REQUESTS: Record<string, EvidenceRequest[]> = {
  sprzeciw_epu: [
    {
      id: "nakaz_epu_pdf",
      title: "Nakaz zapłaty z e-Sądu (PDF z portalu e-Sąd lub papier)",
      description: "Z sygnaturą Nc-e/... — wymagany.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
    {
      id: "potwierdzenie_doreczenia",
      title: "Koperta lub potwierdzenie doręczenia",
      description: "Data doręczenia jest kluczowa — od niej liczy się 14-dniowy termin na sprzeciw.",
      priority: "required",
      category: "korespondencja",
    },
  ],
  pozew_zwrot_oplat_windykacyjnych: [
    {
      id: "tabela_oplat",
      title: "Tabela opłat / regulamin pożyczkodawcy",
      description: "Aby udowodnić, że opłaty były ukryte lub abuzywne.",
      priority: "required",
      category: "umowa",
    },
    {
      id: "harmonogram_splat",
      title: "Harmonogram spłat z rozbiciem na kapitał/odsetki/opłaty",
      description: "Kluczowy dowód kosztów pozaodsetkowych.",
      priority: "required",
      category: "dowody_zaplaty",
    },
    {
      id: "potwierdzenia_przelewow",
      title: "Wszystkie potwierdzenia przelewów / wpłat",
      description: "Suma faktycznie zapłacona vs. kwota wynikająca z przepisów (art. 36a uokik).",
      priority: "required",
      category: "dowody_zaplaty",
    },
  ],
  reklamacja_bank_rf: [
    {
      id: "korespondencja_z_bankiem",
      title: "Cała korespondencja z bankiem (skargi, odpowiedzi)",
      description: "Bank ma 30 dni na odpowiedź — brak odpowiedzi = uznanie reklamacji (ustawa o RF).",
      priority: "required",
      category: "korespondencja",
    },
    {
      id: "wyciagi_bankowe",
      title: "Wyciągi bankowe za sporny okres",
      description: "Dowód operacji, opłat, oprocentowania.",
      priority: "required",
      category: "dowody_zaplaty",
    },
  ],
  skarga_puodo: [
    {
      id: "dowod_naruszenia_rodo",
      title: "Dowód naruszenia (np. e-mail, screen, list, nagranie)",
      description: "Kluczowe — bez tego skarga zostanie pozostawiona bez rozpoznania.",
      priority: "required",
      category: "korespondencja",
    },
    {
      id: "wczesniejsze_zgloszenia",
      title: "Wcześniejsze zgłoszenia do administratora danych",
      description: "Dowód, że administrator nie zareagował.",
      priority: "recommended",
      category: "korespondencja",
    },
  ],
  wniosek_raty_sadowe: [
    {
      id: "zaswiadczenie_o_dochodach",
      title: "Zaświadczenie o dochodach (lub PIT) za 3-12 mies.",
      description: "Aby sąd ocenił sytuację majątkową.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
    {
      id: "wykaz_zobowiazan",
      title: "Wykaz innych zobowiązań i wydatków stałych",
      description: "Czynsz, alimenty, kredyty, leczenie.",
      priority: "required",
      category: "inne",
    },
  ],
  wniosek_zwolnienie_kosztow_sadowych: [
    {
      id: "oswiadczenie_majatkowe_stan",
      title: "Oświadczenie o stanie rodzinnym, majątku i dochodach (formularz)",
      description: "Formularz urzędowy — wymagany przy wniosku.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
    {
      id: "dokumenty_dochody",
      title: "Dokumenty potwierdzające dochody i wydatki",
      description: "Umowa o pracę / decyzje ZUS / zaświadczenia o świadczeniach.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
  ],
  zazalenie_klauzula_wykonalnosci: [
    {
      id: "postanowienie_klauzula",
      title: "Postanowienie sądu o nadaniu klauzuli wykonalności",
      description: "Termin na zażalenie to 7 dni od doręczenia.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
    {
      id: "tytul_egzekucyjny",
      title: "Tytuł egzekucyjny (nakaz / wyrok)",
      description: "Aby ocenić, czy klauzula została nadana prawidłowo.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
  ],
  pozbawienie_tytulu_wykonalnosci: [
    {
      id: "tytul_wykonawczy",
      title: "Tytuł wykonawczy (z klauzulą)",
      description: "Konieczny do określenia przedmiotu powództwa.",
      priority: "required",
      category: "decyzja_urzedowa",
    },
    {
      id: "dowod_zdarzenia_po_powstaniu_tytulu",
      title: "Dowód zdarzenia, które nastąpiło po powstaniu tytułu",
      description: "Spłata, przedawnienie, ugoda, zwolnienie z długu.",
      priority: "required",
      category: "dowody_zaplaty",
    },
  ],
  upadlosc_pelny_wniosek: [
    {
      id: "wykaz_majatku",
      title: "Pełny wykaz majątku (nieruchomości, ruchomości, środki na kontach)",
      description: "Załącznik do wniosku — podpisany pod rygorem odpowiedzialności karnej.",
      priority: "required",
      category: "inne",
    },
    {
      id: "wykaz_wierzycieli",
      title: "Wykaz wierzycieli z dokładnymi kwotami i adresami",
      description: "Wymagany — bez niego wniosek zostanie zwrócony.",
      priority: "required",
      category: "inne",
    },
    {
      id: "spis_wydatkow",
      title: "Spis wydatków bieżących (rodzina, mieszkanie, leki)",
      description: "Pomoże oszacować plan spłaty.",
      priority: "required",
      category: "inne",
    },
    {
      id: "dokumenty_dochody_3lata",
      title: "Dokumenty dochodowe za 3 lata wstecz",
      description: "PIT, umowy, decyzje ZUS.",
      priority: "recommended",
      category: "decyzja_urzedowa",
    },
  ],
};

export function getEvidenceRequests(caseType: CaseType): EvidenceRequest[] {
  const specific = PER_TYPE_REQUESTS[caseType] ?? [];
  return [...SHARED_REQUESTS, ...specific];
}

export function summarizeEvidenceProgress(
  caseType: CaseType,
  uploaded: { id: string }[],
): { required_total: number; required_uploaded: number; percent_complete: number; missing_required: EvidenceRequest[] } {
  const all = getEvidenceRequests(caseType);
  const uploadedIds = new Set(uploaded.map((u) => u.id));
  const required = all.filter((r) => r.priority === "required");
  const required_uploaded = required.filter((r) => uploadedIds.has(r.id)).length;
  const missing_required = required.filter((r) => !uploadedIds.has(r.id));
  const percent_complete = required.length === 0 ? 100 : Math.round((required_uploaded / required.length) * 100);
  return { required_total: required.length, required_uploaded, percent_complete, missing_required };
}
