/**
 * V5-INFRA · JSON-LD helpers (Wave 5 · AGENT B4)
 * ----------------------------------------------------------------
 * Type-safe, SSR-friendly Schema.org JSON-LD components.
 *
 * Helpers:
 *   - <V5JsonLd>          generic <script type="application/ld+json">
 *   - <V5FaqJsonLd>       FAQPage from Q&A array
 *   - <V5ProductJsonLd>   Product/Service with offers
 *   - <V5BreadcrumbJsonLd>BreadcrumbList from path segments
 *   - <V5ArticleJsonLd>   Article (for /v5/baza-wiedzy)
 */
import * as React from "react";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

/* ──────────────────────────────────────────────────────────────────
 * Generic JSON-LD
 * ──────────────────────────────────────────────────────────────── */
export function V5JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────
 * FAQPage — for /v5/faq and any page with FAQ section
 * ──────────────────────────────────────────────────────────────── */
export function V5FaqJsonLd({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
  return <V5JsonLd data={data} />;
}

/* ──────────────────────────────────────────────────────────────────
 * Product/Service — for /v5/cennik tiers
 * ──────────────────────────────────────────────────────────────── */
export function V5ProductJsonLd({
  name,
  description,
  offers,
}: {
  name: string;
  description: string;
  offers: { name: string; price: string; priceCurrency?: string; url?: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: { "@type": "Brand", name: "Mandatomat" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PLN",
      lowPrice: "0",
      highPrice: offers[offers.length - 1]?.price ?? "0",
      offerCount: offers.length,
      offers: offers.map((o) => ({
        "@type": "Offer",
        name: o.name,
        price: o.price,
        priceCurrency: o.priceCurrency ?? "PLN",
        url: o.url ? `${BASE}${o.url}` : `${BASE}/v5/cennik`,
        availability: "https://schema.org/InStock",
      })),
    },
  };
  return <V5JsonLd data={data} />;
}

/* ──────────────────────────────────────────────────────────────────
 * BreadcrumbList — for any page with nav hierarchy
 * ──────────────────────────────────────────────────────────────── */
export function V5BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.href}`,
    })),
  };
  return <V5JsonLd data={data} />;
}

/* ──────────────────────────────────────────────────────────────────
 * Article — for /v5/baza-wiedzy entries
 * ──────────────────────────────────────────────────────────────── */
export function V5ArticleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  author = "Mandatomat",
  image,
}: {
  headline: string;
  description: string;
  datePublished: string; // ISO
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Organization", name: author },
    publisher: {
      "@type": "Organization",
      name: "Mandatomat",
      logo: { "@type": "ImageObject", url: `${BASE}/logo-512.png` },
    },
    image: image ?? `${BASE}/og/v5-default.png`,
  };
  return <V5JsonLd data={data} />;
}

/* ──────────────────────────────────────────────────────────────────
 * Service — for module pages (D1-D8)
 * ──────────────────────────────────────────────────────────────── */
export function V5ServiceJsonLd({
  name,
  description,
  serviceType,
  areaServed = "Polska",
}: {
  name: string;
  description: string;
  serviceType: string;
  areaServed?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    provider: {
      "@type": "Organization",
      name: "Mandatomat",
      url: BASE,
    },
    areaServed: { "@type": "Country", name: areaServed },
  };
  return <V5JsonLd data={data} />;
}
