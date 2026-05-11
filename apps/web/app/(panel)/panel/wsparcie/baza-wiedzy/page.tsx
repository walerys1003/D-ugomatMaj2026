import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, HelpCircle, Search } from "lucide-react";

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
  title: "Baza wiedzy — Wsparcie Długomat",
  description: "Odpowiedzi na najczęstsze pytania o korzystanie z platformy.",
};

interface KbCategory {
  id: string;
  name: string;
  description: string;
  articles_count: number;
  icon: typeof BookOpen;
}

interface KbArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  views: number;
  helpful_pct: number;
}

const CATEGORIES: KbCategory[] = [
  {
    id: "c_start",
    name: "Pierwsze kroki",
    description: "Zakładanie konta, weryfikacja, pierwsza sprawa",
    articles_count: 8,
    icon: BookOpen,
  },
  {
    id: "c_konto",
    name: "Konto i bezpieczeństwo",
    description: "MFA, hasło, dane osobowe, RODO",
    articles_count: 12,
    icon: BookOpen,
  },
  {
    id: "c_platnosci",
    name: "Płatności i faktury",
    description: "Plany, metody płatności, faktury VAT",
    articles_count: 9,
    icon: BookOpen,
  },
  {
    id: "c_sprawy",
    name: "Prowadzenie spraw",
    description: "Tworzenie, śledzenie, dokumenty, komunikacja",
    articles_count: 17,
    icon: BookOpen,
  },
  {
    id: "c_ai",
    name: "AI asystent",
    description: "Jak korzystać, granice odpowiedzialności, prompty",
    articles_count: 6,
    icon: BookOpen,
  },
  {
    id: "c_polecenia",
    name: "Program poleceń",
    description: "Zasady, prowizje, wypłaty, ranking",
    articles_count: 5,
    icon: BookOpen,
  },
];

const POPULAR: KbArticle[] = [
  {
    id: "a_001",
    slug: "jak-dodac-pierwsza-sprawe",
    title: "Jak dodać pierwszą sprawę?",
    category: "Pierwsze kroki",
    views: 4218,
    helpful_pct: 94,
  },
  {
    id: "a_002",
    slug: "zmiana-planu-platnosci",
    title: "Jak zmienić plan płatności?",
    category: "Płatności",
    views: 3142,
    helpful_pct: 91,
  },
  {
    id: "a_003",
    slug: "wlaczenie-mfa",
    title: "Jak włączyć uwierzytelnianie dwuskładnikowe (MFA)?",
    category: "Konto",
    views: 2867,
    helpful_pct: 96,
  },
  {
    id: "a_004",
    slug: "eksport-danych-rodo",
    title: "Jak wyeksportować swoje dane (RODO)?",
    category: "Konto",
    views: 2104,
    helpful_pct: 88,
  },
  {
    id: "a_005",
    slug: "wzory-pism-prawnych",
    title: "Gdzie znajdę wzory pism prawnych?",
    category: "Prowadzenie spraw",
    views: 1932,
    helpful_pct: 92,
  },
];

export default function WsparcieBazaWiedzyPage() {
  const totalArticles = CATEGORIES.reduce((s, c) => s + c.articles_count, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Wsparcie · baza wiedzy
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Jak możemy pomóc?
        </h1>
        <p className="max-w-2xl text-iron-600">
          {totalArticles} artykułów w {CATEGORIES.length} kategoriach. Jeśli nie
          znajdziesz odpowiedzi — założymy zgłoszenie.
        </p>
      </header>

      <nav aria-label="Widoki wsparcia" className="flex gap-1 rounded-md border border-iron-200 bg-iron-50 p-1 w-fit text-sm">
        <Link
          href="/panel/wsparcie"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Strona główna
        </Link>
        <Link
          href="/panel/wsparcie/zgloszenia"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Zgłoszenia
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Baza wiedzy
        </span>
      </nav>

      <Card>
        <CardContent className="p-5">
          <form className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-iron-400" aria-hidden />
              <input
                type="search"
                placeholder="Wpisz pytanie, np. jak zmienić hasło"
                className="w-full rounded-md border border-iron-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </div>
            <Button type="submit">Szukaj</Button>
          </form>
          <p className="mt-2 text-xs text-iron-500">
            Spróbuj: MFA, faktura, eksport RODO, wzór pisma
          </p>
        </CardContent>
      </Card>

      <section aria-label="Kategorie" className="space-y-3">
        <h2 className="font-display text-fluid-h4 text-dlugomat-950">Kategorie</h2>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.id}>
                <Link
                  href={`/panel/wsparcie/baza-wiedzy/${c.id}`}
                  className="group block h-full rounded-lg border border-iron-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-dlugomat-50 p-2">
                      <Icon className="h-5 w-5 text-dlugomat-700" aria-hidden />
                    </span>
                    <ChevronRight
                      className="h-5 w-5 text-iron-400 group-hover:text-dlugomat-700"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-3 font-semibold text-dlugomat-950">{c.name}</h3>
                  <p className="mt-1 text-sm text-iron-600">{c.description}</p>
                  <p className="mt-3 text-xs text-iron-500">
                    {c.articles_count} artykułów
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Popularne artykuły" className="space-y-3">
        <h2 className="font-display text-fluid-h4 text-dlugomat-950">
          Najczęściej czytane
        </h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-iron-100">
              {POPULAR.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/panel/wsparcie/baza-wiedzy/artykul/${a.slug}`}
                    className="group flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-iron-50 focus-visible:outline-none focus-visible:shadow-shield-focus"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-dlugomat-900 group-hover:text-dlugomat-700">
                        {a.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-iron-500">
                        <Badge tone="neutral">{a.category}</Badge>
                        <span>{a.views.toLocaleString("pl-PL")} wyświetleń</span>
                        <span aria-hidden>·</span>
                        <span className="text-accent-700">{a.helpful_pct}% pomocne</span>
                      </div>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-iron-400 group-hover:text-dlugomat-700"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card urgency="normal">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <HelpCircle className="h-8 w-8 text-dlugomat-700" aria-hidden />
          <div className="flex-1 min-w-[240px]">
            <p className="font-semibold text-dlugomat-950">
              Nie znalazłeś odpowiedzi?
            </p>
            <p className="text-sm text-iron-600">
              Załóż zgłoszenie — odpowiemy w ciągu 2 godzin w dni robocze.
            </p>
          </div>
          <Button asChild>
            <Link href="/panel/wsparcie/zgloszenia?new=1">Załóż zgłoszenie</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
