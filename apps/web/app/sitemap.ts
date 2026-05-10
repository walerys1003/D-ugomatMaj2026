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
