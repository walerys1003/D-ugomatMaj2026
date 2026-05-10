// PWA manifest config — produces a Web App Manifest payload conformant with
// https://www.w3.org/TR/appmanifest/. Served via app/manifest.ts (Next.js 14).
export interface PwaManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  orientation: "portrait" | "landscape" | "any";
  background_color: string;
  theme_color: string;
  lang: string;
  dir: "ltr" | "rtl";
  categories: string[];
  icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
  shortcuts: Array<{ name: string; short_name?: string; description?: string; url: string; icons?: Array<{ src: string; sizes: string }> }>;
  share_target?: {
    action: string;
    method: "POST" | "GET";
    enctype?: string;
    params: { title?: string; text?: string; url?: string; files?: Array<{ name: string; accept: string[] }> };
  };
}

export const DLUGOMAT_MANIFEST: PwaManifest = {
  name: "Długomat — AI dla dłużników",
  short_name: "Długomat",
  description:
    "Aplikacja AI do obrony przed nieuczciwymi długami. Generuje pisma procesowe, analizuje wezwania, pilnuje terminów.",
  start_url: "/dashboard",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#0a0a0a",
  theme_color: "#1d4ed8",
  lang: "pl-PL",
  dir: "ltr",
  categories: ["business", "productivity", "finance", "legal"],
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  shortcuts: [
    { name: "Nowa sprawa", short_name: "Sprawa", description: "Zacznij nową sprawę", url: "/cases/new" },
    { name: "Skan dokumentu", short_name: "Skan", description: "Zeskanuj wezwanie", url: "/scan" },
    { name: "Terminy", short_name: "Terminy", description: "Najbliższe terminy", url: "/deadlines" },
    { name: "Asystent AI", short_name: "AI", description: "Zapytaj asystenta", url: "/assistant" },
  ],
  share_target: {
    action: "/share-target",
    method: "POST",
    enctype: "multipart/form-data",
    params: {
      title: "title",
      text: "text",
      files: [{ name: "files", accept: ["image/*", "application/pdf"] }],
    },
  },
};

export function buildManifest(overrides: Partial<PwaManifest> = {}): PwaManifest {
  return { ...DLUGOMAT_MANIFEST, ...overrides };
}
