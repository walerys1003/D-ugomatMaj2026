/**
 * Tier 35 — Publiczna wyszukiwarka precedensów (orzecznictwa).
 *
 * Cel: SEO long-tail + lead-gen. Userzy wpisują "przedawnienie 3 lata",
 * dostają listę orzeczeń SN/SA/TSUE z tezami i podstawami prawnymi.
 * Source: GET /api/precedents/search.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  searchPrecedents,
  COURT_LABELS,
  PRECEDENT_CATEGORIES,
  type CourtKind,
} from "@/lib/precedents/client";

export const metadata: Metadata = {
  title: "Baza orzecznictwa — Długomat",
  description:
    "Aktualizowana baza orzeczeń Sądu Najwyższego, sądów apelacyjnych i TSUE. Wyszukaj precedens pod sprawę: przedawnienie, cesja, komornik, upadłość, klauzule abuzywne.",
  alternates: { canonical: "/precedensy" },
  openGraph: {
    title: "Baza orzecznictwa — Długomat",
    description: "Precedensy SN, SA i TSUE z tezami i podstawami prawnymi.",
  },
};

export const revalidate = 600;

export default async function PrecedentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    court?: CourtKind;
    category?: string;
    year?: string;
  }>;
}) {
  const params = await searchParams;
  const result = await searchPrecedents({
    q: params.q,
    court: params.court,
    category: params.category,
    year: params.year,
    limit: 30,
  });

  return (
    <div className="bg-white pb-20 dark:bg-dlugomat-950">
      {/* Hero z search */}
      <section className="bg-gradient-to-b from-dlugomat-50 to-white pb-12 pt-16 dark:from-dlugomat-900 dark:to-dlugomat-950">
        <div className="container">
          <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
            <span className="h-px w-8 bg-dlugomat-600" />
            Baza orzecznictwa
          </p>
          <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-iron-50">
            Znajdź precedens pod swoją sprawę
          </h1>
          <p className="mt-4 max-w-2xl text-fluid-lg leading-relaxed text-iron-700 dark:text-iron-200">
            Aktualizowana co tydzień baza orzeczeń Sądu Najwyższego, sądów apelacyjnych,
            okręgowych i TSUE. Tezy, podstawy prawne, mapowanie na moduły Długomata.
          </p>

          <form action="/precedensy" method="GET" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder='np. "przedawnienie roszczenia konsumenckiego"'
              className="flex-1 rounded-lg border border-iron-300 bg-white px-4 py-3 text-fluid-base shadow-subtle focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
              aria-label="Wyszukaj precedens"
            />
            <Button type="submit" size="lg" variant="primary">
              Szukaj
            </Button>
          </form>

          {/* Quick filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="self-center text-fluid-xs text-iron-500">Popularne:</span>
            {["Przedawnienie 3 lata", "Klauzule abuzywne kredyt", "Komornik kwota wolna", "Upadłość konsumencka plan spłaty"].map(
              (q) => (
                <Link
                  key={q}
                  href={`/precedensy?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-iron-200 bg-white px-3 py-1 text-fluid-xs text-iron-700 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-iron-200"
                >
                  {q}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filtry */}
          <aside aria-label="Filtry" className="space-y-6">
            <div>
              <h2 className="mb-3 font-display text-fluid-sm font-semibold uppercase tracking-wider text-iron-500">
                Sąd
              </h2>
              <ul className="space-y-1.5 text-fluid-sm">
                <li>
                  <Link
                    href={{ query: { ...params, court: undefined } }}
                    className={
                      !params.court
                        ? "font-semibold text-dlugomat-700"
                        : "text-iron-700 hover:text-dlugomat-700 dark:text-iron-200"
                    }
                  >
                    Wszystkie
                  </Link>
                </li>
                {result.facets.courts.map((c) => (
                  <li key={c.value}>
                    <Link
                      href={{ query: { ...params, court: c.value } }}
                      className={
                        params.court === c.value
                          ? "font-semibold text-dlugomat-700"
                          : "text-iron-700 hover:text-dlugomat-700 dark:text-iron-200"
                      }
                    >
                      {COURT_LABELS[c.value]}{" "}
                      <span className="text-iron-400">({c.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 font-display text-fluid-sm font-semibold uppercase tracking-wider text-iron-500">
                Kategoria
              </h2>
              <ul className="space-y-1.5 text-fluid-sm">
                <li>
                  <Link
                    href={{ query: { ...params, category: undefined } }}
                    className={
                      !params.category
                        ? "font-semibold text-dlugomat-700"
                        : "text-iron-700 hover:text-dlugomat-700 dark:text-iron-200"
                    }
                  >
                    Wszystkie
                  </Link>
                </li>
                {PRECEDENT_CATEGORIES.map((c) => (
                  <li key={c.key}>
                    <Link
                      href={{ query: { ...params, category: c.key } }}
                      className={
                        params.category === c.key
                          ? "font-semibold text-dlugomat-700"
                          : "text-iron-700 hover:text-dlugomat-700 dark:text-iron-200"
                      }
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {result.facets.years.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-fluid-sm font-semibold uppercase tracking-wider text-iron-500">
                  Rok
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {result.facets.years.slice(0, 8).map((y) => (
                    <Link
                      key={y.value}
                      href={{ query: { ...params, year: y.value } }}
                      className={`rounded border px-2 py-1 text-fluid-xs ${
                        params.year === y.value
                          ? "border-dlugomat-700 bg-dlugomat-700 text-white"
                          : "border-iron-200 text-iron-700 hover:border-dlugomat-300 dark:border-dlugomat-800 dark:text-iron-200"
                      }`}
                    >
                      {y.value}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Wyniki */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                {result.total > 0 ? (
                  <>
                    <span className="font-semibold text-dlugomat-900 dark:text-iron-50">
                      {result.total.toLocaleString("pl-PL")}
                    </span>{" "}
                    orzeczeń{params.q ? ` dla "${params.q}"` : ""}
                  </>
                ) : (
                  "Brak wyników"
                )}
              </p>
            </div>

            {result.items.length === 0 ? (
              <Card elevation="subtle" className="py-12 text-center">
                <CardContent>
                  <p className="font-display text-fluid-xl text-iron-700">
                    Nic nie znaleziono
                  </p>
                  <p className="mt-2 text-fluid-sm text-iron-500">
                    Spróbuj innych słów kluczowych albo zmień filtry.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-4">
                {result.items.map((p) => (
                  <li key={p.id}>
                    <Card elevation="subtle" className="transition-shadow hover:shadow-pop">
                      <Link
                        href={`/precedensy/${p.id}`}
                        className="block p-6 focus-visible:shadow-shield-focus"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {p.signature}
                          </Badge>
                          <Badge variant="outline" className="bg-dlugomat-50 text-dlugomat-700 dark:bg-dlugomat-900">
                            {COURT_LABELS[p.court]}
                          </Badge>
                          <span className="text-fluid-xs text-iron-500">
                            {new Date(p.date).toLocaleDateString("pl-PL")}
                          </span>
                          {p.related_modules.length > 0 && (
                            <span className="ml-auto flex gap-1">
                              {p.related_modules.slice(0, 3).map((m) => (
                                <Badge key={m} className="bg-accent-100 text-accent-700">
                                  {m}
                                </Badge>
                              ))}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-fluid-lg font-semibold leading-snug text-dlugomat-900 dark:text-iron-50">
                          {p.thesis}
                        </h3>

                        <p className="mt-2 text-fluid-xs text-iron-500">{p.court_name}</p>

                        {p.legal_basis.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {p.legal_basis.slice(0, 4).map((b) => (
                              <span
                                key={b}
                                className="rounded bg-iron-50 px-2 py-0.5 font-mono text-fluid-xs text-iron-700 dark:bg-dlugomat-900 dark:text-iron-200"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-12">
        <Card elevation="pop" className="border-dlugomat-700/30 bg-gradient-to-br from-dlugomat-900 to-dlugomat-700 text-iron-50">
          <CardContent className="grid gap-6 p-10 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-fluid-2xl font-bold leading-tight">
                Chcesz, żeby AI dobierało precedensy automatycznie?
              </h2>
              <p className="mt-3 text-fluid-base leading-relaxed text-iron-100/90">
                W panelu Długomata generator pism procesowych <strong>sam</strong> dobiera
                najtrafniejsze precedensy z naszej bazy do Twojej sprawy. Bez przeszukiwania,
                bez czytania 200 wyroków, bez błędów.
              </p>
            </div>
            <Button asChild size="lg" variant="success" className="w-full">
              <Link href="/auth/sign-up">Wypróbuj za darmo</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
