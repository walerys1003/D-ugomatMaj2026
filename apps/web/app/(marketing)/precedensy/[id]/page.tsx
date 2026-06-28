/**
 * Tier 35 — Szczegół orzeczenia (precedent detail).
 *
 * Pełna teza, podstawy prawne, mapowanie na moduły Długomata, link do źródła.
 * Source: GET /api/precedents/search?id=...
 */
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPrecedentById, COURT_LABELS } from "@/lib/precedents/client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getPrecedentById(id);
  if (!p) return { title: "Orzeczenie nie znalezione — Długomat" };
  return {
    title: `${p.signature} — ${COURT_LABELS[p.court]} — Długomat`,
    description: p.thesis.slice(0, 155),
    alternates: { canonical: `/precedensy/${id}` },
  };
}

export const revalidate = 3600;

export default async function PrecedentDetailPage({ params }: Props) {
  const { id } = await params;
  const p = await getPrecedentById(id);
  if (!p) notFound();

  return (
    <article className="bg-white pb-20 dark:bg-dlugomat-950">
      <header className="container py-10">
        <nav aria-label="Okruszki" className="mb-6 text-fluid-xs text-ink-500">
          <Link href="/precedensy" className="hover:text-dlugomat-700">
            Orzecznictwo
          </Link>
          <span className="mx-2 text-ink-300">/</span>
          <span className="font-mono text-ink-700 dark:text-ink-200">{p.signature}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-16">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-fluid-sm">
                {p.signature}
              </Badge>
              <Badge variant="outline" className="bg-dlugomat-50 text-dlugomat-700 dark:bg-dlugomat-900">
                {COURT_LABELS[p.court]}
              </Badge>
              <span className="text-fluid-sm text-ink-500">
                {new Date(p.date).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="font-display text-fluid-4xl font-bold leading-tight text-dlugomat-900 dark:text-ink-50">
              {p.thesis}
            </h1>

            <p className="mt-3 text-fluid-sm text-ink-500">{p.court_name}</p>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card elevation="pop">
              <CardContent className="space-y-4 p-6">
                <h2 className="font-display text-fluid-sm font-semibold uppercase tracking-wider text-ink-500">
                  Powiązane moduły Długomata
                </h2>
                {p.related_modules.length === 0 ? (
                  <p className="text-fluid-sm text-ink-500">Brak bezpośredniego mapowania.</p>
                ) : (
                  <ul className="space-y-2">
                    {p.related_modules.map((m) => (
                      <li key={m}>
                        <Link
                          href={`/moduly/${m.toLowerCase()}`}
                          className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2 text-fluid-sm font-medium text-ink-800 transition-colors hover:border-dlugomat-300 hover:bg-dlugomat-50 dark:border-dlugomat-800 dark:text-ink-200 dark:hover:bg-dlugomat-900"
                        >
                          <span>Moduł {m}</span>
                          <span aria-hidden className="text-dlugomat-500">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-ink-200 pt-4 dark:border-dlugomat-800">
                  <Button asChild variant="success" size="lg" className="w-full">
                    <Link href="/sign-up">Wykorzystaj w sprawie</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </header>

      <section className="container mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2 className="font-display text-fluid-2xl font-semibold">Pełna teza</h2>
          <div className="rounded-lg border-l-4 border-dlugomat-700 bg-dlugomat-50 p-6 not-prose dark:bg-dlugomat-900">
            <p className="text-fluid-base leading-relaxed text-ink-800 dark:text-ink-100">
              {p.thesis_full}
            </p>
          </div>

          {p.legal_basis.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-fluid-2xl font-semibold">Podstawy prawne</h2>
              <ul className="not-prose space-y-2">
                {p.legal_basis.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 rounded-md bg-ink-50 px-4 py-2 font-mono text-fluid-sm text-ink-800 dark:bg-dlugomat-900 dark:text-ink-200"
                  >
                    <span aria-hidden className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-dlugomat-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </>
          )}

          {p.url_source && (
            <>
              <h2 className="mt-10 font-display text-fluid-2xl font-semibold">Źródło</h2>
              <p className="not-prose">
                <Button asChild variant="ghost" size="sm">
                  <a href={p.url_source} target="_blank" rel="noopener noreferrer">
                    Otwórz oficjalne źródło ↗
                  </a>
                </Button>
              </p>
            </>
          )}

          <div className="not-prose mt-12 rounded-lg border border-ink-200 bg-ink-50 p-5 text-fluid-sm text-ink-600 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-ink-300">
            <strong className="text-ink-800 dark:text-ink-100">Disclaimer:</strong> Teza
            i podstawy prawne mają charakter informacyjny. Konkretne stosowanie do Twojej
            sprawy wymaga indywidualnej analizy — generator Długomata robi to automatycznie,
            uwzględniając stan faktyczny i daty.
          </div>
        </div>

        <aside className="space-y-6">
          <Card elevation="subtle">
            <CardContent className="space-y-3 p-6">
              <h3 className="font-display text-fluid-sm font-semibold uppercase tracking-wider text-ink-500">
                Kategoria
              </h3>
              <Badge variant="outline" className="bg-dlugomat-50 dark:bg-dlugomat-900">
                {p.category}
              </Badge>

              <h3 className="mt-4 font-display text-fluid-sm font-semibold uppercase tracking-wider text-ink-500">
                Trafność w wyszukiwaniu
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-dlugomat-900">
                  <div
                    className="h-full bg-accent-500"
                    style={{ width: `${Math.round(p.relevance_score * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-fluid-sm text-ink-700 dark:text-ink-200">
                  {Math.round(p.relevance_score * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </article>
  );
}
