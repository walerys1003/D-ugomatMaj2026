/**
 * Programmatic SEO landing pages — /lp/[slug]
 *
 * Render dynamic landing per case_type × intent (z `growth/seo-landing.ts`).
 * SSR z metadata + JSON-LD structured data.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildLandingMeta, listLandingSlugs } from "@/lib/growth/seo-landing";
import { caseTypeMeta } from "@/lib/cases/case-types";

export const dynamic = "force-static";
export const revalidate = 86_400; // 24h

export function generateStaticParams() {
  return listLandingSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = buildLandingMeta(params.slug);
  if (!meta) return { title: "Długomat" };
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      locale: "pl_PL",
    },
    alternates: {
      canonical: `https://dlugomat.pl/lp/${meta.slug}`,
    },
  };
}

export default function LandingPage({ params }: { params: { slug: string } }) {
  const meta = buildLandingMeta(params.slug);
  if (!meta) notFound();
  const caseMeta = meta.caseType ? caseTypeMeta[meta.caseType] : null;
  const price = caseMeta?.priceGrosze ? (caseMeta.priceGrosze / 100).toFixed(2) : "29,00";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {meta.schemaJsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{meta.h1}</h1>
        <p className="mt-4 text-lg text-gray-600">{meta.description}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href={meta.caseType ? `/wizard/${meta.caseType}` : "/wizard"}
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
          >
            {meta.ctaPrimary}
          </Link>
          <Link
            href="/cennik"
            className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50"
          >
            {meta.ctaSecondary}
          </Link>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Cena: <strong>{price} zł brutto</strong> · Pierwsze pismo darmowe
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3 mb-12">
        {[
          { step: "1", title: "Wypełnij wizard", body: "5-10 pytań po polsku — bez prawniczego żargonu" },
          { step: "2", title: "AI generuje pismo", body: "Sonnet + Hallucination Guard 2.0 — bez wymyślania" },
          { step: "3", title: "Pobierz PDF", body: "Gotowy do druku + edytowalna wersja .docx" },
        ].map((s) => (
          <div key={s.step} className="rounded-lg border p-6">
            <div className="text-3xl font-bold text-blue-600">{s.step}</div>
            <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-gray-600">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Najczęstsze pytania</h2>
        <div className="space-y-4">
          {meta.faqs.map((faq, i) => (
            <details key={i} className="rounded-md border p-4">
              <summary className="font-semibold cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-blue-50 p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Gotowy/-a, by ruszyć?</h2>
        <p className="text-gray-700 mb-5">
          Tysiące osób już skorzystało — średni czas wygenerowania pisma: 5 minut.
        </p>
        <Link
          href={meta.caseType ? `/wizard/${meta.caseType}` : "/wizard"}
          className="inline-flex items-center rounded-md bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700"
        >
          {meta.ctaPrimary} →
        </Link>
      </section>
    </main>
  );
}
