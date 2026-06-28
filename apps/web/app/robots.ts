import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

// Tier 5.5 — robots.txt cached at the edge for 1 day; revalidated daily.
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/panel/",
          "/auth/",
          "/api/",
          "/admin/",
          "/panel/ustawienia/rodo",
          // Audyt #1 — /v5 to eksperymentalny duplikat marketingu (noindex).
          "/v5/",
          "/_legacy/",
        ],
      },
      {
        // Bot specific — Google. Pozwalamy na ten sam zakres, ale można
        // tutaj zawęzić jak będzie potrzeba.
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/panel/", "/auth/", "/api/", "/admin/", "/v5/", "/_legacy/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
