import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

// Tier 5.5 — sitemap.xml regenerowane raz dziennie (3600s × 24).
export const revalidate = 86400;

interface RouteEntry {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}

const ROUTES: RouteEntry[] = [
  // Top-level — najwyższy priorytet.
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/jak-to-dziala", changeFrequency: "weekly", priority: 0.9 },
  { path: "/moduly", changeFrequency: "weekly", priority: 0.9 },
  { path: "/cennik", changeFrequency: "weekly", priority: 0.9 },
  { path: "/skaner-nakazu", changeFrequency: "weekly", priority: 0.9 },
  { path: "/kalkulatory", changeFrequency: "monthly", priority: 0.85 },

  // Moduły D1-D8 — kluczowe landing pages dla SEO.
  { path: "/moduly/sprzeciw-epu", changeFrequency: "weekly", priority: 0.85 },
  { path: "/moduly/komornik", changeFrequency: "weekly", priority: 0.85 },
  { path: "/moduly/potracenia", changeFrequency: "weekly", priority: 0.8 },
  { path: "/moduly/bik", changeFrequency: "weekly", priority: 0.8 },
  { path: "/moduly/cesja", changeFrequency: "weekly", priority: 0.8 },
  { path: "/moduly/ugoda", changeFrequency: "weekly", priority: 0.8 },
  { path: "/moduly/upadlosc", changeFrequency: "weekly", priority: 0.8 },

  // Baza wiedzy + flagowe artykuły.
  { path: "/baza-wiedzy", changeFrequency: "weekly", priority: 0.8 },
  {
    path: "/baza-wiedzy/sprzeciw-od-nakazu-zaplaty-epu",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/baza-wiedzy/skarga-na-czynnosci-komornika",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/baza-wiedzy/wniosek-o-korekte-bik",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  { path: "/baza-wiedzy/przedawnienie-dlugu", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/kwota-wolna-od-egzekucji", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/cesja-wierzytelnosci-fundusze", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/upadlosc-konsumencka", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/klauzule-abuzywne-w-umowach-kredytowych", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/ugoda-z-wierzycielem", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/zajecie-wynagrodzenia-przez-komornika", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/big-infomonitor-krd-erif", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/odpowiedz-na-pozew", changeFrequency: "monthly", priority: 0.7 },

  // Strony firmowe.
  { path: "/o-nas", changeFrequency: "monthly", priority: 0.5 },
  { path: "/kontakt", changeFrequency: "monthly", priority: 0.5 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.5 },
  { path: "/status", changeFrequency: "hourly", priority: 0.4 },
  { path: "/program-partnerski", changeFrequency: "monthly", priority: 0.4 },

  // Dokumenty prawne — niska priority, rzadkie zmiany.
  { path: "/regulamin", changeFrequency: "yearly", priority: 0.3 },
  { path: "/polityka-prywatnosci", changeFrequency: "yearly", priority: 0.3 },
  { path: "/rodo", changeFrequency: "yearly", priority: 0.3 },

  // ────────────────────────────────────────────────────────────────────
  // V5-INFRA · USUNIĘTE z sitemap (audyt #1 — duplicate content).
  // Trasy /v5/* są równoległym, eksperymentalnym designem powielającym
  // treść z (marketing). Indeksowanie obu wersji powodowało kanibalizację
  // słów kluczowych i rozmycie PageRank. /v5 jest teraz noindex (layout v5)
  // + zablokowane w robots.ts. Gdy nastąpi cutover — promować do "/" i
  // przywrócić w sitemap pod kanonicznymi adresami.
  // ────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────
  // W10-4 · Wave 5/9 (marketing) namespace — extended marketing pages
  // Dodane podczas wave10 — rozszerzenie sitemap o nowe landingi.
  // ────────────────────────────────────────────────────────────────────

  // API publiczne + dokumentacja
  { path: "/api-publiczne", changeFrequency: "monthly", priority: 0.65 },
  { path: "/api-publiczne/dokumentacja", changeFrequency: "weekly", priority: 0.6 },

  // Baza wiedzy — dodatkowe artykuły z (marketing)
  { path: "/baza-wiedzy/d9-d16-przeglad-modulow", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/powodztwo-przeciwegzekucyjne", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/raty-sadowe-i-zwolnienie-z-kosztow", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/reklamacja-bank-rzecznik-finansowy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/skarga-do-puodo", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/upadlosc-konsumencka-pelny-wniosek", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/wniosek-zwolnienie-kosztow-sadowych", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/zazalenie-na-klauzule-wykonalnosci", changeFrequency: "monthly", priority: 0.7 },
  { path: "/baza-wiedzy/zwrot-oplat-windykacyjnych", changeFrequency: "monthly", priority: 0.7 },

  // Bezpieczeństwo + DPA + zaufanie
  { path: "/bezpieczenstwo", changeFrequency: "monthly", priority: 0.6 },
  { path: "/dpa", changeFrequency: "yearly", priority: 0.4 },

  // Case studies
  { path: "/case-studies", changeFrequency: "weekly", priority: 0.7 },
  { path: "/case-studies/tematyczne", changeFrequency: "weekly", priority: 0.65 },
  { path: "/klienci-case-studies", changeFrequency: "weekly", priority: 0.65 },

  // CEE + lokalizacja
  { path: "/cee", changeFrequency: "monthly", priority: 0.55 },

  // Cennik + porównania
  { path: "/cennik/porownanie", changeFrequency: "weekly", priority: 0.8 },
  { path: "/cennik/subskrypcje", changeFrequency: "weekly", priority: 0.8 },
  { path: "/porownanie-konkurencja", changeFrequency: "monthly", priority: 0.7 },
  { path: "/porownanie-planow", changeFrequency: "weekly", priority: 0.8 },

  // Dla firm / kancelarii / windykacji / klientów indywidualnych
  { path: "/dla-firm", changeFrequency: "monthly", priority: 0.7 },
  { path: "/dla-firm/kalkulator-roi", changeFrequency: "monthly", priority: 0.65 },
  { path: "/dla-kancelarii", changeFrequency: "monthly", priority: 0.7 },
  { path: "/dla-osob-fizycznych", changeFrequency: "monthly", priority: 0.7 },
  { path: "/dla-windykacji", changeFrequency: "monthly", priority: 0.65 },

  // Edukacja + blog + FAQ + prasa
  { path: "/blog", changeFrequency: "weekly", priority: 0.65 },
  { path: "/edukacja", changeFrequency: "weekly", priority: 0.65 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.7 },
  { path: "/prasa", changeFrequency: "monthly", priority: 0.5 },

  // Integracje + marketplace
  { path: "/integracje", changeFrequency: "weekly", priority: 0.6 },
  { path: "/marketplace", changeFrequency: "weekly", priority: 0.6 },
  { path: "/marketplace/partnerzy", changeFrequency: "weekly", priority: 0.55 },
  { path: "/marketplace/szablony", changeFrequency: "weekly", priority: 0.55 },

  // Kalkulatory (D-Calc — high-traffic)
  { path: "/kalkulatory/koszty-postepowania", changeFrequency: "monthly", priority: 0.75 },
  { path: "/kalkulatory/kwota-wolna", changeFrequency: "monthly", priority: 0.75 },
  { path: "/kalkulatory/odsetki", changeFrequency: "monthly", priority: 0.75 },
  { path: "/kalkulatory/przedawnienie", changeFrequency: "monthly", priority: 0.75 },
  { path: "/kalkulatory/raty-sadowe", changeFrequency: "monthly", priority: 0.7 },
  { path: "/kalkulatory/roi-dlugomat", changeFrequency: "monthly", priority: 0.7 },

  // Kariera
  { path: "/kariera", changeFrequency: "weekly", priority: 0.55 },

  // Kontakt
  { path: "/kontakt/demo", changeFrequency: "monthly", priority: 0.6 },
  { path: "/kontakt/firmy", changeFrequency: "monthly", priority: 0.6 },

  // Landing pages (LP) — paid traffic targets
  { path: "/lp/bik", changeFrequency: "monthly", priority: 0.6 },
  { path: "/lp/dluznik-prywatny", changeFrequency: "monthly", priority: 0.6 },
  { path: "/lp/epu", changeFrequency: "monthly", priority: 0.6 },
  { path: "/lp/firma", changeFrequency: "monthly", priority: 0.6 },
  { path: "/lp/komornik", changeFrequency: "monthly", priority: 0.6 },

  // O nas
  { path: "/o-nas/zespol", changeFrequency: "monthly", priority: 0.45 },

  // Partnerzy + afiliacja
  { path: "/partnerzy", changeFrequency: "weekly", priority: 0.5 },
  { path: "/program-afiliacyjny", changeFrequency: "monthly", priority: 0.55 },
  { path: "/program-afiliacyjny/zarejestruj", changeFrequency: "monthly", priority: 0.45 },
  { path: "/program-resellerski", changeFrequency: "monthly", priority: 0.5 },

  // Precedensy (high-traffic SEO target)
  { path: "/precedensy", changeFrequency: "daily", priority: 0.75 },

  // ROI B2B
  { path: "/roi-b2b", changeFrequency: "monthly", priority: 0.6 },

  // Showcase
  { path: "/showcase/ai-artifact", changeFrequency: "monthly", priority: 0.45 },

  // Status — history
  { path: "/status/history", changeFrequency: "daily", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((entry) => ({
    url: `${BASE}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
