import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Serif, JetBrains_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { AppProviders } from "@/lib/providers";
import { themeBootstrapScript } from "@/lib/providers/theme-provider";
import {
  CookieConsentBanner,
  consentModeBootstrapScript,
} from "@/components/ui/cookie-consent";
import { WebVitalsReporter } from "./web-vitals";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/lib/seo/json-ld";
import "@/styles/globals.css";

// Brand spec §3.3.1: Inter for UI, IBM Plex Serif for legal long-form,
// JetBrains Mono for sygnatury / code-like content. Each gets a CSS var
// so styles/globals.css and Tailwind's font-* utilities can reference them.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Długomat — Tarcza dla osób zadłużonych",
    template: "%s · Długomat",
  },
  description:
    "Generuj profesjonalne pisma procesowe (sprzeciw EPU, skargi komornicze, " +
    "wnioski BIK) w kilkanaście minut. Sztuczna inteligencja oparta na Claude " +
    "Sonnet, zgodna z polskim prawem.",
  applicationName: "Długomat",
  authors: [{ name: "Długomat" }],
  generator: "Next.js",
  keywords: [
    "sprzeciw od nakazu zapłaty",
    "EPU",
    "e-Sąd",
    "komornik",
    "BIK",
    "fundusz sekurytyzacyjny",
    "przedawnienie długu",
    "upadłość konsumencka",
  ],
  openGraph: {
    title: "Długomat — Tarcza dla osób zadłużonych",
    description:
      "Pismo procesowe gotowe w 12 minut. AI, dane szyfrowane, zgodne z RODO.",
    siteName: "Długomat",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Długomat — Tarcza dla osób zadłużonych",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060E1F" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Tier 5.1 — CSP nonce z middleware (x-nonce request header).
  // Wymagane, żeby strict-dynamic CSP zezwolił na inline theme bootstrap.
  const nonce = headers().get("x-nonce") ?? undefined;

  // V5-INFRA toggle: enabled when cookie `v5=on` is set OR pathname starts with /v5
  // The cookie is set by the user-facing /v5 entry routes (server components)
  // and read here for global root-level activation of V5 design tokens.
  const v5Cookie = cookies().get("v5")?.value;
  const path = headers().get("x-pathname") ?? headers().get("referer") ?? "";
  const v5Active = v5Cookie === "on" || /\/v5(\/|$|\?)/.test(path);

  return (
    <html
      lang="pl"
      data-v5={v5Active ? "on" : undefined}
      className={`${inter.variable} ${ibmPlexSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Consent Mode v2 — MUST run before any GTM/Analytics tag.
            Sets all storage signals to 'denied' by default; user choice (or
            stored consent) is then applied via gtag('consent', 'update'). */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: consentModeBootstrapScript }}
        />
        {/* Apply persisted theme synchronously to avoid FOUC. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <AppProviders>{children}</AppProviders>
        <CookieConsentBanner />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
