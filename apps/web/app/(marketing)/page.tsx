import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { AudienceSwitch } from "@/components/landing/audience-switch";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AIEdge } from "@/components/landing/ai-edge";
import { AIShowcase } from "@/components/landing/ai-showcase";
import { ModulesGrid } from "@/components/landing/modules";
import { SocialProof } from "@/components/landing/social-proof";
import { ComplianceBand } from "@/components/landing/compliance-band";
import { PricingTeaser } from "@/components/landing/pricing-teaser";
import { FAQ, faqJsonLd } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";

export const metadata: Metadata = {
  title: "Tarcza dla osób zadłużonych — pisma procesowe w 12 minut",
  description:
    "Sprzeciw EPU, skargi komornicze, korekta BIK, propozycja ugody — pisma " +
    "procesowe generowane przez AI w 12 minut. Zgodne z polskim prawem.",
  alternates: { canonical: "/" },
  // W10-6 — dynamic OG via /api/og/[slug] (next/og ImageResponse on edge)
  openGraph: {
    title: "Długomat — Tarcza dla osób zadłużonych",
    description:
      "Sprzeciw EPU, skargi komornicze, korekta BIK, ugody — pisma procesowe w 12 minut.",
    type: "website",
    url: "/",
    images: [
      {
        url: `/api/og/home?title=${encodeURIComponent(
          "Tarcza dla osób zadłużonych",
        )}&subtitle=${encodeURIComponent(
          "Pisma procesowe AI w 12 minut",
        )}&kind=marketing`,
        width: 1200,
        height: 630,
        alt: "Długomat — Tarcza dla osób zadłużonych",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Długomat — Tarcza dla osób zadłużonych",
    description:
      "Sprzeciw EPU, skargi komornicze, korekta BIK, ugody — pisma w 12 minut.",
    images: [
      `/api/og/home?title=${encodeURIComponent(
        "Tarcza dla osób zadłużonych",
      )}&subtitle=${encodeURIComponent(
        "Pisma procesowe AI w 12 minut",
      )}&kind=marketing`,
    ],
  },
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
        Nowa kolejność landingu (Tarcza v4 Stoic+, docs/redesign/03 §1):
         1. Hero           — propozycja wartości + żywy artefakt + dwa CTA
         2. TrustBar       — pasek zaufania (compliance + KPI + press) tuż pod foldem
         3. AudienceSwitch — segmentacja B2C/B2B (dłużnik / firma / kancelaria / windykacja)
         4. HowItWorks     — proces w 3 krokach (ogólny mental model)
         5. AIEdge         — DLACZEGO my: przewagi AI + żywy ślad rozumowania IRAC
         6. AIShowcase     — KONKRETNIE jak działa AI (dokument → analiza → pismo)
         7. ModulesGrid    — 8 modułów D1–D8 z cenami
         8. SocialProof    — dowód społeczny (opinie / liczby)
         9. ComplianceBand — redukcja obiekcji bezpieczeństwa (navy band)
        10. PricingTeaser  — plany Stripe
        11. FAQ            — obiekcje
        12. CtaBand        — ostatni call-to-action

        Wszystkie sekcje używają wyłącznie tokenów kanonicznych (02 §8):
        ink-* / dlugomat-* / accent-* / warn-* / danger-*. Zero iron-*, zero importu v5.
      */}
      <Hero />
      <TrustBar />
      <AudienceSwitch />
      <HowItWorks />
      <AIEdge />
      <AIShowcase />
      <ModulesGrid />
      <SocialProof />
      <ComplianceBand />
      <PricingTeaser />
      <FAQ />
      <CtaBand />
    </>
  );
}
