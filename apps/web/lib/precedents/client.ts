/**
 * Tier 35 — Precedents (orzecznictwo) client helpers.
 *
 * Maps backend GET /api/precedents/search to frontend.
 * Zbiór: orzecznictwo SN, NSA, sądów apelacyjnych i okręgowych,
 * relevant for case generation w D1-D16.
 */

export type CourtKind =
  | "sn"           // Sąd Najwyższy
  | "tk"           // Trybunał Konstytucyjny
  | "nsa"          // Naczelny Sąd Administracyjny
  | "sa"           // Sąd Apelacyjny
  | "so"           // Sąd Okręgowy
  | "sr"           // Sąd Rejonowy
  | "tsue";        // Trybunał Sprawiedliwości UE

export interface Precedent {
  id: string;
  signature: string;          // np. "III CZP 25/22"
  court: CourtKind;
  court_name: string;         // pełna nazwa sądu/izby
  date: string;               // YYYY-MM-DD
  category: string;           // przedawnienie / cesja / komornik / upadłość / ...
  thesis: string;             // teza orzeczenia (max 280 znaków)
  thesis_full: string;        // pełna teza (do widoku szczegółu)
  legal_basis: string[];      // art. 118 KC, art. 505 KPC, ...
  related_modules: string[];  // D1, D2, D8, ...
  url_source: string | null;  // link do oficjalnego źródła
  relevance_score: number;    // 0..1
}

export interface PrecedentSearchResult {
  items: Precedent[];
  total: number;
  facets: {
    courts: { value: CourtKind; count: number }[];
    categories: { value: string; count: number }[];
    years: { value: string; count: number }[];
  };
}

export const COURT_LABELS: Record<CourtKind, string> = {
  sn: "Sąd Najwyższy",
  tk: "Trybunał Konstytucyjny",
  nsa: "Naczelny Sąd Administracyjny",
  sa: "Sąd Apelacyjny",
  so: "Sąd Okręgowy",
  sr: "Sąd Rejonowy",
  tsue: "TSUE",
};

export const PRECEDENT_CATEGORIES = [
  { key: "przedawnienie", label: "Przedawnienie roszczeń" },
  { key: "cesja", label: "Cesja wierzytelności" },
  { key: "komornik", label: "Postępowanie egzekucyjne" },
  { key: "upadlosc", label: "Upadłość konsumencka" },
  { key: "bik", label: "BIK i rejestry dłużników" },
  { key: "klauzule_abuzywne", label: "Klauzule abuzywne" },
  { key: "potracenia", label: "Potrącenia" },
  { key: "epu", label: "Elektroniczne postępowanie upominawcze" },
];

export interface SearchParams {
  q?: string;
  court?: CourtKind;
  category?: string;
  year?: string;
  module?: string;
  limit?: number;
}

export async function searchPrecedents(
  p: SearchParams = {},
): Promise<PrecedentSearchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  const url = new URL(`${baseUrl}/api/precedents/search`);
  for (const [k, v] of Object.entries(p)) {
    if (v != null && v !== "") url.searchParams.set(k, String(v));
  }
  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 600, tags: ["precedents"] },
    });
    if (!res.ok) {
      return { items: [], total: 0, facets: { courts: [], categories: [], years: [] } };
    }
    return (await res.json()) as PrecedentSearchResult;
  } catch {
    return { items: [], total: 0, facets: { courts: [], categories: [], years: [] } };
  }
}

export async function getPrecedentById(id: string): Promise<Precedent | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  try {
    const res = await fetch(`${baseUrl}/api/precedents/search?id=${encodeURIComponent(id)}`, {
      next: { revalidate: 3600, tags: [`precedent:${id}`] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as PrecedentSearchResult;
    return json.items[0] ?? null;
  } catch {
    return null;
  }
}
