import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ModulesGrid } from "@/components/landing/modules";
import { PricingTeaser } from "@/components/landing/pricing-teaser";
import { FAQ, faqJsonLd } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";

export const metadata: Metadata = {
  title: "Tarcza dla osób zadłużonych — pisma procesowe w 12 minut",
  description:
    "Sprzeciw EPU, skargi komornicze, korekta BIK, propozycja ugody — pisma " +
    "procesowe generowane przez AI w 12 minut. Zgodne z polskim prawem.",
  alternates: { canonical: "/" },
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Długomat",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl",
  description:
    "Platforma legal-tech generująca pisma procesowe dla osób zadłużonych.",
  areaServed: "PL",
  sameAs: [],
};

const WEBAPP_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Długomat",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", priceCurrency: "PLN", price: "0" },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      <Hero />
      <SocialProof />
      <HowItWorks />
      <ModulesGrid />
      <PricingTeaser />
      <FAQ />
      <CtaBand />
    </>
  );
}
