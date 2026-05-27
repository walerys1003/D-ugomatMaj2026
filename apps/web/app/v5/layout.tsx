/**
 * V5-INFRA · /v5 layout (Wave 5 · AGENT B4 SEO + B5 telemetry)
 * ----------------------------------------------------------------
 * Per-namespace layout dla V5 surface:
 *   - JSON-LD Organization + WebSite (rich snippets)
 *   - OG/Twitter defaults
 *   - data-v5="on" marker dla A/B testów (compat with Wave 4)
 *   - robots: noindex dla preview deploymentu opcjonalnie
 */
import type { Metadata, Viewport } from "next";
import { V5TelemetryMount } from "@/components/v5/telemetry";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Mandatomat V5 · AI-native legal OS",
    template: "%s · Mandatomat V5",
  },
  description:
    "Mandatomat — pierwszy w Polsce AI-native legal OS. Skanuj nakaz, AI analizuje, generuje sprzeciw. 78% skuteczności, 49 zł, 8 minut.",
  applicationName: "Mandatomat V5",
  generator: "Next.js 14 · V5-INFRA Wave 5",
  keywords: [
    "nakaz EPU",
    "sprzeciw nakaz zapłaty",
    "przedawnienie długu",
    "windykacja",
    "Mandatomat",
    "AI prawo",
    "BIK",
    "cesja wierzytelności",
    "komornik",
  ],
  authors: [{ name: "Mandatomat sp. z o.o.", url: BASE }],
  creator: "Mandatomat",
  publisher: "Mandatomat sp. z o.o.",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: `${BASE}/v5`,
    siteName: "Mandatomat",
    title: "Mandatomat V5 · AI-native legal OS",
    description:
      "Skanuj nakaz, AI analizuje, generuje sprzeciw. 78% skuteczności, 49 zł, 8 minut.",
    images: [
      {
        url: `${BASE}/og/v5-default.png`,
        width: 1200,
        height: 630,
        alt: "Mandatomat V5 — AI-native legal OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mandatomat",
    creator: "@mandatomat",
    title: "Mandatomat V5 · AI-native legal OS",
    description: "Skanuj nakaz, AI generuje sprzeciw. 78% skuteczności.",
    images: [`${BASE}/og/v5-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: `${BASE}/v5`,
  },
  category: "legal technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a17" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mandatomat",
  legalName: "Mandatomat sp. z o.o.",
  url: BASE,
  logo: `${BASE}/logo-512.png`,
  foundingDate: "2023",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ul. Wspólna 47/15",
    addressLocality: "Warszawa",
    postalCode: "00-684",
    addressCountry: "PL",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@mandatomat.pl",
      availableLanguage: ["pl", "en"],
    },
    {
      "@type": "ContactPoint",
      contactType: "data protection",
      email: "iod@mandatomat.pl",
      availableLanguage: ["pl", "en"],
    },
  ],
  sameAs: [
    "https://twitter.com/mandatomat",
    "https://www.linkedin.com/company/mandatomat",
    "https://www.youtube.com/@mandatomat",
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mandatomat V5",
  url: BASE,
  inLanguage: "pl-PL",
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE}/v5/baza-wiedzy?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function V5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div data-v5="on" data-v5-namespace="v5">
      <script
        type="application/ld+json"
        // SSR-safe: stringified JSON, no XSS concerns since fully controlled
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteJsonLd),
        }}
      />
      <V5TelemetryMount />
      {children}
    </div>
  );
}
