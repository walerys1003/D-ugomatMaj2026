/**
 * Tier 31 — Structured data (JSON-LD) helpers.
 * Generuje Schema.org markup dla:
 *   - Organization (główna)
 *   - WebSite z SearchAction
 *   - SoftwareApplication (cennik / moduły)
 *   - FAQPage (FAQ section)
 *   - BreadcrumbList (auto-generated)
 *
 * Użycie:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationLd()) }} />
 */

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

export function buildOrganizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Długomat",
    url: BASE,
    logo: `${BASE}/logo.png`,
    sameAs: [
      "https://www.linkedin.com/company/dlugomat",
      "https://twitter.com/dlugomat",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@dlugomat.pl",
      availableLanguage: ["Polish", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "PL",
    },
  };
}

export function buildWebSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: BASE,
    name: "Długomat",
    description:
      "Polski legal-tech do długów: kreatory pism procesowych, AI, terminy, integracje z EPU/PRS.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/baza-wiedzy?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "pl-PL",
  };
}

export function buildSoftwareApplicationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Długomat",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PLN",
      lowPrice: "0",
      highPrice: "299",
      offerCount: "4",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function buildFaqPageLd(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export interface BreadcrumbEntry {
  name: string;
  url: string; // relative or absolute
}

export function buildBreadcrumbListLd(items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE}${item.url}`,
    })),
  };
}

/**
 * Renderuje JSON-LD jako string nadający się do `dangerouslySetInnerHTML`.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data, null, 0).replace(/</g, "\\u003c");
}
