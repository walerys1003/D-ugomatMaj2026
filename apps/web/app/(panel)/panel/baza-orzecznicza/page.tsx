import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Baza orzecznicza | Długomat" };

interface JudgmentResult {
  id: string;
  signature: string;
  court: "sn" | "tk" | "nsa" | "sa" | "so" | "sr" | "tsue";
  date: string;
  thesis: string;
  legal_basis: string[];
  relevance: number;
  matched_terms: string[];
}

const COURT_LABELS: Record<JudgmentResult["court"], string> = {
  sn: "SN",
  tk: "TK",
  nsa: "NSA",
  sa: "SA",
  so: "SO",
  sr: "SR",
  tsue: "TSUE",
};

async function searchJudgments(query: string): Promise<JudgmentResult[]> {
  if (!query) return [];
  try {
    const res = await fetch(
      `/api/ai/rag/judgments?q=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export default async function BazaOrzecniczaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q ?? "";
  const results = await searchJudgments(query);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-iron-500 mb-2">Wiedza</p>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50">
          Baza orzecznicza
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Wyszukiwanie semantyczne (RAG) po tezach SN, TK, NSA, SA i TSUE.
        </p>
      </div>

      <Card elevation="pop">
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="np. odsetki ustawowe za opóźnienie w transakcjach handlowych..."
              className="flex-1 rounded-lg border border-iron-300 dark:border-iron-700 bg-white dark:bg-iron-900 px-3 py-2.5 focus:outline-none focus-visible:shadow-shield-focus"
            />
            <Button type="submit" variant="primary">
              Szukaj
            </Button>
          </form>
          <p className="text-xs text-iron-500 mt-2">
            Wyszukujemy semantycznie — możesz pisać pełnymi pytaniami, np.
            "kiedy biegnie termin przedawnienia roszczeń przedsiębiorcy".
          </p>
        </CardContent>
      </Card>

      {query && (
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>
              Wyniki dla "{query}" ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-iron-500">
                Brak orzeczeń pasujących do zapytania.
              </p>
            ) : (
              <ul className="space-y-4">
                {results.map((j) => (
                  <li
                    key={j.id}
                    className="rounded-lg border border-iron-200 dark:border-iron-800 p-4 hover:border-accent-400 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-iron-100 dark:bg-iron-800 font-medium">
                          {COURT_LABELS[j.court]}
                        </span>
                        <code className="font-mono text-sm text-iron-900 dark:text-iron-50">
                          {j.signature}
                        </code>
                        <span className="text-xs text-iron-500">
                          {new Date(j.date).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-iron-500">
                        <div className="w-16 h-1 rounded-full bg-iron-100 dark:bg-iron-800 overflow-hidden">
                          <div
                            className="h-full bg-accent-600"
                            style={{ width: `${Math.round(j.relevance * 100)}%` }}
                          />
                        </div>
                        <span>{Math.round(j.relevance * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-iron-700 dark:text-iron-300 mb-2">
                      {j.thesis}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {j.legal_basis.map((b) => (
                        <span
                          key={b}
                          className="text-xs px-2 py-0.5 rounded-full bg-iron-50 dark:bg-iron-900 border border-iron-200 dark:border-iron-800 text-iron-600 dark:text-iron-400"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/precedensy/${j.id}`}
                      className="inline-flex items-center gap-1 text-xs text-accent-700 hover:text-accent-800 mt-2"
                    >
                      Zobacz pełną treść →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {!query && (
        <Card elevation="subtle">
          <CardContent className="pt-6 text-sm text-iron-500">
            Wpisz zapytanie powyżej. Możesz też zacząć rozmowę z{" "}
            <Link
              href="/panel/ai-asystent"
              className="text-accent-700 hover:text-accent-800"
            >
              AI Asystentem
            </Link>{" "}
            — automatycznie wyszuka orzeczenia w tle.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
