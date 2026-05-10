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
        ],
      },
      {
        // Bot specific — Google. Pozwalamy na ten sam zakres, ale można
        // tutaj zawęzić jak będzie potrzeba.
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/panel/", "/auth/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
