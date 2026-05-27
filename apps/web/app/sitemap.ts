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
  // V5-INFRA · namespace (Wave 5 marketing + module pages)
  // Niższy priority niż V4 dopóki nie zostanie zrobiony pełny cutover.
  // ────────────────────────────────────────────────────────────────────
  { path: "/v5", changeFrequency: "weekly", priority: 0.7 },
  { path: "/v5/jak-to-dziala", changeFrequency: "weekly", priority: 0.65 },
  { path: "/v5/skaner-nakazu", changeFrequency: "weekly", priority: 0.65 },
  { path: "/v5/cennik", changeFrequency: "weekly", priority: 0.65 },
  { path: "/v5/dla-firm", changeFrequency: "monthly", priority: 0.6 },
  { path: "/v5/dla-kancelarii", changeFrequency: "monthly", priority: 0.6 },
  { path: "/v5/baza-wiedzy", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/precedensy", changeFrequency: "daily", priority: 0.6 },
  { path: "/v5/case-studies", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/bezpieczenstwo", changeFrequency: "monthly", priority: 0.55 },
  { path: "/v5/rodo", changeFrequency: "yearly", priority: 0.3 },
  { path: "/v5/changelog", changeFrequency: "weekly", priority: 0.5 },
  { path: "/v5/status", changeFrequency: "hourly", priority: 0.4 },
  { path: "/v5/porownanie-konkurencja", changeFrequency: "monthly", priority: 0.55 },
  { path: "/v5/roi-b2b", changeFrequency: "monthly", priority: 0.55 },
  { path: "/v5/o-nas", changeFrequency: "monthly", priority: 0.5 },
  { path: "/v5/kontakt", changeFrequency: "monthly", priority: 0.5 },
  { path: "/v5/faq", changeFrequency: "weekly", priority: 0.55 },
  // V5 module pages (D1-D8) — kluczowe landing pages dla SEO V5
  { path: "/v5/moduly/sprzeciw-epu", changeFrequency: "weekly", priority: 0.65 },
  { path: "/v5/moduly/komornik", changeFrequency: "weekly", priority: 0.65 },
  { path: "/v5/moduly/cesja", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/moduly/bik", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/moduly/ugoda", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/moduly/potracenia", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/moduly/upadlosc", changeFrequency: "weekly", priority: 0.6 },
  { path: "/v5/moduly/wezwania", changeFrequency: "weekly", priority: 0.6 },
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
