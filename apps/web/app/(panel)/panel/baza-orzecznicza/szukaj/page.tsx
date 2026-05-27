import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Filter, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wyszukiwarka orzeczeń — Długomat",
  description:
    "Zaawansowane wyszukiwanie orzeczeń sądowych z filtrami sądu, daty i tematyki.",
};

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    court?: string;
    year_from?: string;
    year_to?: string;
    topic?: string;
  }>;
}

interface Ruling {
  id: string;
  signature: string;
  court: string;
  date: string;
  topic: string;
  thesis: string;
  relevance: number;
}

const RULINGS: Ruling[] = [
  {
    id: "r_001",
    signature: "III CZP 25/22",
    court: "Sąd Najwyższy",
    date: "2022-09-15",
    topic: "Klauzule abuzywne",
    thesis:
      "Klauzula umożliwiająca bankowi dowolne ustalanie kursu waluty obcej w umowie kredytu indeksowanego stanowi niedozwolone postanowienie umowne...",
    relevance: 98,
  },
  {
    id: "r_002",
    signature: "I CSK 425/21",
    court: "Sąd Najwyższy",
    date: "2022-04-08",
    topic: "Przedawnienie",
    thesis:
      "Termin przedawnienia roszczeń banku przeciwko konsumentowi z tytułu kredytu wynosi 3 lata od dnia wymagalności poszczególnych rat...",
    relevance: 94,
  },
  {
    id: "r_003",
    signature: "II Ca 188/23",
    court: "Sąd Okręgowy Warszawa",
    date: "2023-11-22",
    topic: "Egzekucja komornicza",
    thesis:
      "Kwota wolna od egzekucji z wynagrodzenia obejmuje 75% minimalnego wynagrodzenia także w przypadku zbiegu egzekucji administracyjnej i sądowej...",
    relevance: 91,
  },
  {
    id: "r_004",
    signature: "V CSK 88/22",
    court: "Sąd Najwyższy",
    date: "2022-07-19",
    topic: "Upadłość konsumencka",
    thesis:
      "Brak winy umyślnej dłużnika w doprowadzeniu do niewypłacalności nie wyklucza ogłoszenia upadłości w trybie konsumenckim...",
    relevance: 88,
  },
  {
    id: "r_005",
    signature: "I ACa 412/24",
    court: "Sąd Apelacyjny Kraków",
    date: "2024-02-14",
    topic: "BIK i raporty",
    thesis:
      "Bank zobowiązany jest do niezwłocznej korekty błędnego wpisu w BIK, w terminie nie dłuższym niż 14 dni od zgłoszenia...",
    relevance: 85,
  },
];

const COURTS = [
  "Sąd Najwyższy",
  "Sąd Apelacyjny Warszawa",
  "Sąd Apelacyjny Kraków",
  "Sąd Apelacyjny Gdańsk",
  "Sąd Okręgowy Warszawa",
] as const;

const TOPICS = [
  "Klauzule abuzywne",
  "Przedawnienie",
  "Egzekucja komornicza",
  "Upadłość konsumencka",
  "BIK i raporty",
  "Kredyt frankowy",
] as const;

export default async function BazaOrzeczniczaSzukajPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Baza orzecznicza · zaawansowane wyszukiwanie
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Znajdź orzeczenie
        </h1>
        <p className="max-w-2xl text-ink-600">
          Pełnotekstowe wyszukiwanie po tezach, sygnaturach i uzasadnieniach.
          Wyniki sortowane według trafności semantycznej.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <Filter className="mr-2 inline h-4 w-4" aria-hidden />
            Filtry zaawansowane
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 md:grid-cols-6">
            <label className="block md:col-span-3">
              <span className="block text-xs uppercase tracking-wide text-ink-500">
                Zapytanie
              </span>
              <input
                type="search"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="np. kwota wolna od egzekucji"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <label className="block md:col-span-3">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Sąd</span>
              <select
                name="court"
                defaultValue={sp.court ?? ""}
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <option value="">Wszystkie sądy</option>
                {COURTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="block text-xs uppercase tracking-wide text-ink-500">
                Tematyka
              </span>
              <select
                name="topic"
                defaultValue={sp.topic ?? ""}
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <option value="">Wszystkie tematy</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Rok od</span>
              <input
                type="number"
                name="year_from"
                defaultValue={sp.year_from ?? ""}
                min={1990}
                max={2026}
                placeholder="2018"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Rok do</span>
              <input
                type="number"
                name="year_to"
                defaultValue={sp.year_to ?? ""}
                min={1990}
                max={2026}
                placeholder="2026"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <div className="md:col-span-6 flex justify-end gap-2">
              <Button variant="ghost" type="reset">Wyczyść filtry</Button>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" aria-hidden />
                Szukaj
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-label="Wyniki wyszukiwania" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-fluid-h4 text-dlugomat-950">
            Wyniki ({RULINGS.length})
          </h2>
          <select
            className="rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
            defaultValue="relevance"
            aria-label="Sortowanie"
          >
            <option value="relevance">Trafność</option>
            <option value="date_desc">Data malejąco</option>
            <option value="date_asc">Data rosnąco</option>
            <option value="court">Sąd</option>
          </select>
        </div>

        <ul className="space-y-3">
          {RULINGS.map((r) => (
            <li key={r.id}>
              <Link
                href={`/panel/baza-orzecznicza/${r.id}`}
                className="group block rounded-lg border border-ink-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-dlugomat-950">
                        {r.signature}
                      </span>
                      <Badge tone="info">{r.court}</Badge>
                      <Badge tone="neutral">{r.topic}</Badge>
                      <Badge tone="success" withDot>
                        {r.relevance}% trafność
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink-700 leading-relaxed line-clamp-3">
                      {r.thesis}
                    </p>
                    <p className="mt-2 text-xs text-ink-500">
                      Data wydania:{" "}
                      {new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(
                        new Date(r.date),
                      )}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 flex-shrink-0 text-ink-400 group-hover:text-dlugomat-700"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
