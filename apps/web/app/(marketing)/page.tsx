import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { AIShowcase } from "@/components/landing/ai-showcase";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ModulesGrid } from "@/components/landing/modules";
import { TrustBar } from "@/components/landing/trust-bar";
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

      {/*
        Nowa kolejność landingu (Tarcza v2):
        1. Hero            — propozycja wartości + dwa CTA
        2. AIShowcase      — KONKRETNIE jak działa AI (dokument → analiza → pismo)
        3. HowItWorks      — proces w 3 krokach (ogólny)
        4. ModulesGrid     — 8 modułów D1–D8 z cenami
        5. TrustBar        — compliance + KPI + press (zaufanie przed cennikiem)
        6. PricingTeaser   — plany Stripe
        7. FAQ             — obiekcje
        8. CtaBand         — ostatni call-to-action
      */}
      <Hero />
      <AIShowcase />
      <HowItWorks />
      <ModulesGrid />
      <TrustBar />
      <PricingTeaser />
      <FAQ />
      <CtaBand />
    </>
  );
}
