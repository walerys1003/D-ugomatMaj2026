import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Reusable surface for artykułów bazy wiedzy.
 *
 * Brand spec §3.5.3 — knowledge base:
 *  - Tytuł + meta (kategoria / czas czytania / data aktualizacji)
 *  - Lead paragraph (TL;DR — najważniejsze w 3-4 zdaniach)
 *  - Spis treści (auto-generated z `sections`)
 *  - Sekcje merytoryczne z konkretnymi powołaniami do KPC/KC i orzeczeń SN
 *  - Sekcja "co możesz zrobić w Długomacie" — link do odpowiedniego modułu
 *  - JSON-LD Article schema (osobno renderowany w stronie)
 */

export interface KnowledgeSection {
  /** Stable id (kebab-case, używany w spisie treści i linkach kotwicowych). */
  id: string;
  /** Tytuł sekcji (H2). */
  title: string;
  /** Treść — paragrafy / listy / kotwice cytowań. ReactNode → strona renderuje JSX. */
  content: React.ReactNode;
}

export interface KnowledgeRelatedModule {
  code: string;
  title: string;
  href: string;
  description: string;
  price: string;
}

export interface KnowledgeArticleProps {
  title: string;
  category: string;
  readingMinutes: number;
  /** ISO date string — używana w meta + JSON-LD. */
  updatedAt: string;
  /** Streszczenie (TL;DR) — 3-5 zdań, kluczowe. */
  lead: string;
  sections: ReadonlyArray<KnowledgeSection>;
  /** Link do panelu / modułu, który rozwiązuje opisywany problem. */
  relatedModule?: KnowledgeRelatedModule;
  /** Cytowane akty prawne i orzeczenia. */
  legalSources: ReadonlyArray<string>;
}

export function KnowledgeArticle({
  title,
  category,
  readingMinutes,
  updatedAt,
  lead,
  sections,
  relatedModule,
  legalSources,
}: KnowledgeArticleProps) {
  return (
    <article className="bg-background">
      {/* HERO */}
      <header className="border-b border-ink-200 bg-ink-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-950/40">
        <div className="container py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/baza-wiedzy"
              className="inline-flex items-center gap-1.5 rounded-md text-fluid-sm font-medium text-dlugomat-600 transition-colors hover:text-dlugomat-700 focus-visible:shadow-shield-focus focus-visible:outline-none dark:text-dlugomat-300"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Baza wiedzy
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="info">{category}</Badge>
              <span className="inline-flex items-center gap-1 text-fluid-xs text-ink-500">
                <Clock className="size-3.5" aria-hidden />
                {readingMinutes} min czytania
              </span>
              <span className="inline-flex items-center gap-1 text-fluid-xs text-ink-500">
                <Calendar className="size-3.5" aria-hidden />
                Aktualizacja: {formatDatePL(updatedAt)}
              </span>
            </div>

            <h1 className="mt-4 text-balance text-fluid-5xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              {title}
            </h1>

            <p className="mt-6 text-fluid-lg leading-relaxed text-ink-700 dark:text-ink-200">
              {lead}
            </p>
          </div>
        </div>
      </header>

      {/* TOC + CONTENT */}
      <div className="container py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[260px_1fr]">
          {/* TOC — sticky on desktop */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
              Spis treści
            </p>
            <nav aria-label="Spis treści" className="mt-3">
              <ol className="flex flex-col gap-2">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-md px-2 py-1 text-fluid-sm text-ink-600 transition-colors hover:bg-ink-100 hover:text-dlugomat-700 dark:text-ink-300 dark:hover:bg-dlugomat-850"
                    >
                      <span className="font-mono text-fluid-xs text-dlugomat-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>{" "}
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* CONTENT — prose */}
          <div className="prose prose-iron max-w-none dark:prose-invert">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-fluid-3xl font-bold text-dlugomat-900 dark:text-white">
                  {section.title}
                </h2>
                <div className="mt-4 text-fluid-base leading-relaxed text-ink-700 dark:text-ink-200">
                  {section.content}
                </div>
              </section>
            ))}

            {/* LEGAL SOURCES */}
            {legalSources.length > 0 ? (
              <section className="mt-16 rounded-xl border border-ink-200 bg-ink-50/60 p-6 dark:border-dlugomat-800 dark:bg-dlugomat-950/40">
                <h2 className="!mt-0 text-fluid-lg font-semibold text-dlugomat-900 dark:text-ink-50">
                  Źródła prawne
                </h2>
                <ul className="mt-3 flex flex-col gap-1.5 text-fluid-sm text-ink-600 dark:text-ink-300">
                  {legalSources.map((src, i) => (
                    <li key={i} className="!my-0">
                      {src}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {/* RELATED MODULE */}
      {relatedModule ? (
        <section className="bg-ink-50/60 py-16 dark:bg-dlugomat-950/40">
          <div className="container max-w-4xl">
            <p className="text-center text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Co możesz zrobić w Długomacie
            </p>
            <h2 className="mt-2 text-center text-balance text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              {relatedModule.title} — gotowe pismo w 12 minut
            </h2>
            <div className="mt-8 rounded-xl border border-ink-200 bg-card p-6 sm:p-8 dark:border-dlugomat-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="rounded-md bg-dlugomat-100 px-2 py-0.5 font-mono text-fluid-xs font-bold uppercase tracking-wide text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
                    Moduł {relatedModule.code}
                  </span>
                  <h3 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-ink-50">
                    {relatedModule.title}
                  </h3>
                </div>
                <Badge tone="info" withDot>
                  {relatedModule.price}
                </Badge>
              </div>
              <p className="mt-3 text-fluid-base text-ink-600 dark:text-ink-300">
                {relatedModule.description}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href={relatedModule.href}>
                    Zobacz moduł {relatedModule.code}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* DISCLAIMER */}
      <section className="container py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-ink-200 bg-card p-5 text-fluid-sm leading-relaxed text-ink-600 dark:border-dlugomat-800 dark:text-ink-300">
          <p className="!my-0">
            <strong className="font-semibold text-dlugomat-900 dark:text-ink-50">
              Zastrzeżenie:
            </strong>{" "}
            artykuł ma charakter informacyjny i nie stanowi opinii prawnej w
            rozumieniu art. 4 ust. 1 ustawy o radcach prawnych ani porady prawnej
            w rozumieniu Prawa o adwokaturze. Stan prawny aktualny na dzień
            ostatniej aktualizacji ({formatDatePL(updatedAt)}). Indywidualne
            sprawy mogą wymagać konsultacji z radcą prawnym lub adwokatem.
          </p>
        </div>
      </section>
    </article>
  );
}

/**
 * Buduje obiekt JSON-LD Article — strona obejmująca artykuł osadza go
 * w `<script type="application/ld+json">`.
 */
export function buildArticleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  updatedAt: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/baza-wiedzy/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.updatedAt,
    dateModified: input.updatedAt,
    inLanguage: "pl-PL",
    author: { "@type": "Organization", name: "Długomat" },
    publisher: {
      "@type": "Organization",
      name: "Długomat",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/logo.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

/**
 * Tier 5 zad. 228 — BreadcrumbList JSON-LD dla podstron baza-wiedzy.
 * Google używa breadcrumbs jako rich snippet zamiast samego URL.
 */
export function buildBreadcrumbJsonLd(input: {
  articleTitle: string;
  articleSlug: string;
}) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: base,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Baza wiedzy",
        item: `${base}/baza-wiedzy`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: input.articleTitle,
        item: `${base}/baza-wiedzy/${input.articleSlug}`,
      },
    ],
  };
}

/**
 * Tier 5 zad. 228 — FAQPage JSON-LD dla artykułów które mają sekcję FAQ.
 * Powoduje, że Google pokazuje accordion z pytaniami w wynikach.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export function buildFaqJsonLd(items: ReadonlyArray<FaqEntry>) {
  return {
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
  };
}

function formatDatePL(iso: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
