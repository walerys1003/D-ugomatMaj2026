import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Display, Text, Eyebrow } from "@/components/ui/typography";
import { MarketingCtaBanner } from "@/components/marketing/page-hero";

/**
 * Reusable landing-page surface for każdy moduł D1-D8.
 *
 * Brand spec §3.5.2 — moduły:
 *  - hero z kodem modułu (D2, D3…) + tytuł + obietnica + CTA
 *  - sekcja problemu ("kiedy to się przydaje") z konkretnymi sygnałami
 *  - 3-4 kroki rozwiązania
 *  - 4-6 features w kafelkach (co dostajesz)
 *  - mini-FAQ 4-6 pytań (z JSON-LD)
 *  - finalny CTA band
 *
 * NIE wprowadza paniki — mówimy o tym co MOŻESZ zrobić, nie czego się bać.
 */

export interface ModuleLandingProps {
  code: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  title: string;
  tagline: string;
  description: string;
  price: string;
  ctaHref: string;
  ctaLabel?: string;
  /** Sygnały, że ta osoba potrzebuje tego modułu. */
  whenSignals: ReadonlyArray<string>;
  /** 3-4 kroki rozwiązania. */
  steps: ReadonlyArray<{ title: string; desc: string }>;
  /** 4-6 cech / co dokładnie dostajesz. */
  features: ReadonlyArray<{ title: string; desc: string }>;
  /** Mini-FAQ — 4-6 pytań specyficznych dla modułu. */
  faq: ReadonlyArray<{ q: string; a: string }>;
  /** Optional disclaimer / legal note above CTA. */
  legalNote?: string;
}

export function ModuleLanding({
  code,
  title,
  tagline,
  description,
  price,
  ctaHref,
  ctaLabel = "Rozpocznij sprawę",
  whenSignals,
  steps,
  features,
  faq,
  legalNote,
}: ModuleLandingProps) {
  return (
    <>
      {/* JSON-LD: FAQPage — Google rich result eligibility. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faq)) }}
      />

      {/* HERO — V4-β/ι unified light hero (zastępuje tarcza-hero-gradient).
          Layout: 2-col od xl: (≥1280px), wcześniej 1-col stack — chroni
          przed clippingiem po skali root font-size 1.2× (V4-ι.2). */}
      <section
        aria-labelledby={`module-${code}-headline`}
        className="relative overflow-hidden border-b border-ink-150/60 bg-gradient-to-b from-ink-50 via-background to-background"
      >
        {/* Subtle dot-grid mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--ink-300)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
          }}
        />
        <div className="container relative grid gap-10 py-20 sm:py-24 xl:grid-cols-[1.1fr_0.9fr] xl:items-center xl:gap-14 xl:py-28">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow tone="brand" withDot>
                Moduł {code}
              </Eyebrow>
              <Badge tone="info" withDot>
                {price}
              </Badge>
            </div>

            <Display
              level={1}
              id={`module-${code}-headline`}
              className="max-w-[16ch] text-balance"
            >
              {title}
            </Display>

            <Text size="lg" tone="default" className="max-w-[46ch] text-balance">
              {tagline}
            </Text>

            <Text size="base" tone="muted" className="max-w-[52ch]">
              {description}
            </Text>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" variant="primary">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/jak-to-dziala">Jak to działa</Link>
              </Button>
            </div>

            {legalNote ? (
              <Text size="xs" tone="muted" className="max-w-[52ch]">
                {legalNote}
              </Text>
            ) : null}
          </div>

          {/* Trust column — jasne kafelki (zastępują dark white/5 tile'y) */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <TrustTile
              icon={<Clock className="size-5 text-accent-600" aria-hidden />}
              title="12 minut"
              desc="Średni czas obsługi sprawy w tym module."
            />
            <TrustTile
              icon={<ShieldCheck className="size-5 text-accent-600" aria-hidden />}
              title="Zgodność z KPC"
              desc="Wzory aktualizowane przy zmianach przepisów."
            />
            <TrustTile
              icon={<FileText className="size-5 text-accent-600" aria-hidden />}
              title="Pismo w PDF"
              desc="Z miejscem na podpis i listą załączników."
            />
            <TrustTile
              icon={<Sparkles className="size-5 text-accent-600" aria-hidden />}
              title="AI z walidacją"
              desc="Claude Sonnet 4.5 + walidator Haiku 4.5."
            />
          </div>
        </div>
      </section>

      {/* WHEN — sygnały */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Kiedy to się przydaje
          </p>
          <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Wybierz {title.toLowerCase()}, jeżeli:
          </h2>
        </div>
        <ul
          role="list"
          className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2"
        >
          {whenSignals.map((signal, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-ink-200 bg-card p-4 dark:border-dlugomat-800"
            >
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-accent-600 dark:text-accent-400"
                aria-hidden
              />
              <span className="text-fluid-sm text-ink-700 dark:text-ink-200">
                {signal}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* STEPS */}
      <section className="bg-ink-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Jak to działa
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              {steps.length} kroki — bez prawnika, bez stresu.
            </h2>
          </div>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={i} className="flex flex-col gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-dlugomat-600 font-mono text-fluid-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-ink-50">
                  {step.title}
                </h3>
                <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Co dostajesz
          </p>
          <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Konkrety, nie obietnice.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card key={i} elevation="subtle">
              <CardHeader>
                <CardTitle className="text-fluid-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby={`faq-${code}`}
        className="bg-ink-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40"
      >
        <div className="container max-w-3xl">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Najczęstsze pytania
            </p>
            <h2
              id={`faq-${code}`}
              className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white"
            >
              {title} — to, o co najczęściej pytacie.
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA — V4-β unified MarketingCtaBanner (ink-900 dark surface) */}
      <MarketingCtaBanner
        title={`Gotów rozpocząć? ${title} czeka.`}
        subtitle={tagline}
        primaryCta={{ href: ctaHref, label: ctaLabel }}
        secondaryCta={{ href: "/cennik", label: "Cennik" }}
      />
    </>
  );
}

/* ---------- helpers ---------- */

function TrustTile({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-ink-100 p-2">{icon}</div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[15px] font-semibold text-ink-900">{title}</p>
          <p className="text-[13px] text-ink-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function buildFaqJsonLd(faq: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
