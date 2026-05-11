import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
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
  title: "Blog Dlugomat — przewodniki, case studies, raporty",
  description:
    "Praktyczne przewodniki po sporach z bankami i windykatorami. Case studies, raporty rynkowe, zmiany w KPC.",
  alternates: { canonical: "/blog" },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Przewodnik" | "Case study" | "Raport" | "Zmiana w prawie" | "Opinia";
  reading_time: number;
  published_at: string;
  author: string;
  highlight: boolean;
}

const POSTS: readonly BlogPost[] = [
  {
    slug: "epu-2026-zmiany",
    title: "EPU w 2026 — co zmienilo sie w elektronicznym postepowaniu upominawczym",
    excerpt: "Nowe limity wartosci sprawy, zmiany w doreczeniach elektronicznych, terminy procesowe. Pelny przeglad zmian wprowadzonych 1 stycznia 2026.",
    category: "Zmiana w prawie",
    reading_time: 12,
    published_at: "2026-05-08",
    author: "Adw. Anna Nowak",
    highlight: true,
  },
  {
    slug: "case-study-malinowski",
    title: "Jak kancelaria Malinowski zaoszczedzila 1 200 godzin rocznie",
    excerpt: "Dwunastoosobowa kancelaria automatyzowala sprzeciwy EPU. Wynik: 90% krotszy czas na pismo, 34% wiecej wygranych spraw, zero pominietych terminow.",
    category: "Case study",
    reading_time: 8,
    published_at: "2026-05-04",
    author: "K. Lewandowska",
    highlight: true,
  },
  {
    slug: "raport-windykacja-2025",
    title: "Raport Dlugomat: rynek windykacji konsumenckiej w Polsce 2025",
    excerpt: "Liczby, ktore zmienily branze: 8,7 mln spraw EPU, 14% spraw przedawnionych, 22% wzrost ugod pozasadowych.",
    category: "Raport",
    reading_time: 18,
    published_at: "2026-04-22",
    author: "Zespol Dlugomat",
    highlight: false,
  },
  {
    slug: "przedawnienie-2-czesc",
    title: "Przedawnienie roszczen — czesc 2: jak liczyc terminy w praktyce",
    excerpt: "Najczestsze blledy w obliczaniu terminow przedawnienia. Pulapki uznania dlugu, wezwan do zaplaty i czynnosci komornika.",
    category: "Przewodnik",
    reading_time: 15,
    published_at: "2026-04-15",
    author: "Adw. P. Kowalski",
    highlight: false,
  },
  {
    slug: "sn-2025-bik",
    title: "Wyrok SN o BIK — co to oznacza dla dluznikow?",
    excerpt: "Sad Najwyzszy ograniczyl mozliwosc bezterminowego przechowywania danych w BIK. Praktyczne konsekwencje dla 3,2 mln Polakow.",
    category: "Opinia",
    reading_time: 6,
    published_at: "2026-04-09",
    author: "Adw. M. Lewandowski",
    highlight: false,
  },
  {
    slug: "komornik-skarga-2026",
    title: "Skarga na czynnosci komornika — krok po kroku",
    excerpt: "Kiedy mozesz zaskarzyc komornika, jakie pisma zlozyc, ile to kosztuje, jakie sa szanse na powodzenie.",
    category: "Przewodnik",
    reading_time: 10,
    published_at: "2026-03-28",
    author: "Adw. A. Nowak",
    highlight: false,
  },
];

const CATEGORY_TONE: Record<BlogPost["category"], "info" | "success" | "warning" | "neutral"> = {
  Przewodnik: "info",
  "Case study": "success",
  Raport: "warning",
  "Zmiana w prawie": "warning",
  Opinia: "neutral",
};

const CATEGORIES = ["Wszystkie", "Przewodnik", "Case study", "Raport", "Zmiana w prawie", "Opinia"];

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export default function BlogHubPage() {
  const highlights = POSTS.filter((p) => p.highlight);
  const rest = POSTS.filter((p) => !p.highlight);

  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <BookOpen className="mr-1 h-3 w-3" />
            Blog
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Wiedza, ktora wygrywa sprawy.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Przewodniki praktyczne, case studies klientow, raporty rynkowe i aktualne zmiany w prawie.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c, idx) => (
              <Button key={c} variant={idx === 0 ? "primary" : "secondary"} size="sm">
                {c}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">Polecane</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {highlights.map((p) => (
            <Card key={p.slug} elevation="pop" urgency="success">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge tone={CATEGORY_TONE[p.category]} withDot>
                    {p.category}
                  </Badge>
                  <Badge tone="neutral">
                    <Clock className="mr-1 h-3 w-3" />
                    {p.reading_time} min
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-xl">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </CardTitle>
                <CardDescription className="mt-2 text-sm">
                  {p.author} · {fmtDate(p.published_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{p.excerpt}</p>
                <Button asChild variant="secondary" size="sm" className="mt-4">
                  <Link href={`/blog/${p.slug}`}>
                    Czytaj
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="font-display text-2xl text-slate-900">Wszystkie artykuly</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Card key={p.slug} elevation="subtle">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge tone={CATEGORY_TONE[p.category]}>{p.category}</Badge>
                </div>
                <CardTitle className="mt-3 text-base">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-3">{p.excerpt}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{fmtDate(p.published_at)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.reading_time} min
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">Zapisz sie do newslettera</h2>
          <p className="mt-2 text-slate-600">
            Raz w miesiacu, bez spamu. Tylko najwazniejsze zmiany w prawie i nowe przewodniki.
          </p>
          <form className="mx-auto mt-6 flex max-w-md flex-wrap gap-2">
            <label className="sr-only" htmlFor="newsletter-email">
              Adres e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="twoj@email.pl"
              className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm"
            />
            <Button variant="primary">Zapisz mnie</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
