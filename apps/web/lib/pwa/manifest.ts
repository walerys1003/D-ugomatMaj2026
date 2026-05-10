/**
 * Długomat — Tier 9 — PWA manifest builder (locale-aware).
 *
 * Generates `manifest.webmanifest` per locale. Different name/description
 * per market. Same icons/colors (brand consistent).
 */
import type { Locale } from "@/lib/i18n/locales";

export interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  background_color: string;
  theme_color: string;
  orientation: "portrait" | "landscape" | "any";
  lang: string;
  dir: "ltr" | "rtl";
  categories: string[];
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: "any" | "maskable" | "monochrome";
  }>;
  shortcuts?: Array<{
    name: string;
    short_name?: string;
    url: string;
    icons?: Array<{ src: string; sizes: string }>;
  }>;
  share_target?: {
    action: string;
    method: "GET" | "POST";
    enctype?: string;
    params: {
      title?: string;
      text?: string;
      url?: string;
      files?: Array<{ name: string; accept: string[] }>;
    };
  };
}

const NAMES: Record<Locale, { name: string; short: string; desc: string }> = {
  pl: {
    name: "Długomat — AI dla dłużników",
    short: "Długomat",
    desc: "Wygeneruj pismo prawne w 5 minut. AI pomoc dla osób z długami.",
  },
  cs: {
    name: "Długomat — AI pro dlužníky",
    short: "Długomat",
    desc: "Vygenerujte právní dopis za 5 minut. AI pomoc pro dlužníky.",
  },
  sk: {
    name: "Długomat — AI pre dlžníkov",
    short: "Długomat",
    desc: "Vygenerujte právny list za 5 minút. AI pomoc pre dlžníkov.",
  },
  hu: {
    name: "Długomat — AI adósoknak",
    short: "Długomat",
    desc: "Generálj jogi levelet 5 perc alatt. AI segítség adósoknak.",
  },
  ro: {
    name: "Długomat — AI pentru debitori",
    short: "Długomat",
    desc: "Generează scrisoare juridică în 5 minute. AI pentru debitori.",
  },
  en: {
    name: "Długomat — AI for debtors",
    short: "Długomat",
    desc: "Generate a legal letter in 5 minutes. AI for people in debt.",
  },
};

const SHORTCUT_LABELS: Record<Locale, Array<{ name: string; short: string; url: string }>> = {
  pl: [
    { name: "Nowa sprawa", short: "Sprawa", url: "/wizard" },
    { name: "Moje sprawy", short: "Sprawy", url: "/dashboard" },
    { name: "Skaner nakazu", short: "Skaner", url: "/skaner-nakazu" },
  ],
  cs: [
    { name: "Nový případ", short: "Případ", url: "/cs/wizard" },
    { name: "Moje případy", short: "Případy", url: "/cs/dashboard" },
  ],
  sk: [
    { name: "Nový prípad", short: "Prípad", url: "/sk/wizard" },
    { name: "Moje prípady", short: "Prípady", url: "/sk/dashboard" },
  ],
  hu: [
    { name: "Új ügy", short: "Ügy", url: "/hu/wizard" },
    { name: "Ügyeim", short: "Ügyek", url: "/hu/dashboard" },
  ],
  ro: [
    { name: "Caz nou", short: "Caz", url: "/ro/wizard" },
    { name: "Cazurile mele", short: "Cazuri", url: "/ro/dashboard" },
  ],
  en: [
    { name: "New case", short: "Case", url: "/en/wizard" },
    { name: "My cases", short: "Cases", url: "/en/dashboard" },
  ],
};

export function buildManifest(locale: Locale): WebAppManifest {
  const meta = NAMES[locale] ?? NAMES.pl;
  const prefix = locale === "pl" ? "" : `/${locale}`;
  return {
    name: meta.name,
    short_name: meta.short,
    description: meta.desc,
    start_url: prefix ? `${prefix}/dashboard` : "/dashboard",
    scope: prefix || "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait",
    lang: locale,
    dir: "ltr",
    categories: ["finance", "productivity", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-mono-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
    shortcuts: (SHORTCUT_LABELS[locale] ?? SHORTCUT_LABELS.pl).map((s) => ({
      name: s.name,
      short_name: s.short,
      url: s.url,
      icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
    })),
    share_target: {
      action: `${prefix}/skaner-nakazu`,
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        files: [
          {
            name: "document",
            accept: ["image/*", "application/pdf"],
          },
        ],
      },
    },
  };
}
