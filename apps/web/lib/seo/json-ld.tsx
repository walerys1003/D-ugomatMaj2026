import * as React from "react";

/**
 * Tier 5.5 — JSON-LD structured data helpers.
 *
 * Komponenty renderują `<script type="application/ld+json">` z bezpiecznym
 * stringify. Używane w `app/layout.tsx` (Organization + WebSite) oraz
 * w stronach modułów / artykułach bazy wiedzy (BreadcrumbList, Article,
 * FAQPage, Service).
 *
 * Wszystkie dane są zgodne ze schema.org v15+ i wytycznymi Google
 * Rich Results.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // JSON.stringify domyślnie eskejpuje </script> tylko w skomplikowanych
      // przypadkach — używamy replace dla pewności.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Organization — globalna wizytówka serwisu, w root layoucie.
   ───────────────────────────────────────────────────────────────────── */

export function OrganizationJsonLd() {
  return (
    <JsonLd
      id="ld-organization"
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${BASE_URL}#organization`,
        name: "Długomat",
        url: BASE_URL,
        logo: `${BASE_URL}/static/og-logo.png`,
        description:
          "Długomat — Tarcza dla osób zadłużonych. Generuje pisma procesowe " +
          "(sprzeciw EPU, skargi komornicze, wnioski BIK, ugody, wnioski " +
          "o upadłość konsumencką) z wykorzystaniem AI.",
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "kontakt@dlugomat.pl",
            availableLanguage: ["Polish"],
          },
          {
            "@type": "ContactPoint",
            contactType: "data protection officer",
            email: "rodo@dlugomat.pl",
            availableLanguage: ["Polish"],
          },
        ],
        areaServed: { "@type": "Country", name: "Poland" },
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   WebSite — wsparcie SearchAction (sitelinks searchbox w Google).
   ───────────────────────────────────────────────────────────────────── */

export function WebSiteJsonLd() {
  return (
    <JsonLd
      id="ld-website"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${BASE_URL}#website`,
        url: BASE_URL,
        name: "Długomat",
        inLanguage: "pl-PL",
        publisher: { "@id": `${BASE_URL}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/baza-wiedzy?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   BreadcrumbList — używany na podstronach modułów / artykułów.
   ───────────────────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  name: string;
  url: string; // absolute or path; resolved against BASE_URL
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http")
            ? item.url
            : `${BASE_URL}${item.url}`,
        })),
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Article — strony bazy wiedzy.
   ───────────────────────────────────────────────────────────────────── */

export interface ArticleJsonLdInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
}

export function ArticleJsonLd({ data }: { data: ArticleJsonLdInput }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.headline,
        description: data.description,
        url: data.url.startsWith("http") ? data.url : `${BASE_URL}${data.url}`,
        datePublished: data.datePublished,
        dateModified: data.dateModified ?? data.datePublished,
        inLanguage: "pl-PL",
        image: data.imageUrl
          ? data.imageUrl.startsWith("http")
            ? data.imageUrl
            : `${BASE_URL}${data.imageUrl}`
          : undefined,
        author: {
          "@type": "Organization",
          name: data.authorName ?? "Redakcja Długomat",
        },
        publisher: { "@id": `${BASE_URL}#organization` },
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FAQPage — strony modułów ze szczegółowym FAQ.
   ───────────────────────────────────────────────────────────────────── */

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Service — strony /moduly/* opisujące pojedynczą usługę.
   ───────────────────────────────────────────────────────────────────── */

export interface ServiceJsonLdInput {
  name: string;
  description: string;
  url: string;
  priceGrosze?: number;
  category?: string;
}

export function ServiceJsonLd({ data }: { data: ServiceJsonLdInput }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: data.name,
        description: data.description,
        url: data.url.startsWith("http") ? data.url : `${BASE_URL}${data.url}`,
        provider: { "@id": `${BASE_URL}#organization` },
        areaServed: { "@type": "Country", name: "Poland" },
        category: data.category,
        offers:
          typeof data.priceGrosze === "number" && data.priceGrosze > 0
            ? {
                "@type": "Offer",
                price: (data.priceGrosze / 100).toFixed(2),
                priceCurrency: "PLN",
                availability: "https://schema.org/InStock",
              }
            : undefined,
      }}
    />
  );
}
