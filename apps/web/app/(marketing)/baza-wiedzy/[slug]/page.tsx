import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ScrollText,
  Share2,
  User,
} from "lucide-react";
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
  title: "Artykul — Baza wiedzy Dlugomat",
  description: "Szczegolowy artykul z bazy wiedzy z odwolaniami do orzecznictwa.",
};

type Article = {
  slug: string;
  category: "procedura" | "egzekucja" | "kpc" | "ochrona" | "umowy";
  title: string;
  lead: string;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  author: { name: string; role: string };
  sections: Array<{ heading: string; body: string }>;
  references: Array<{ label: string; description: string }>;
  related: Array<{ slug: string; title: string }>;
};

const ARTICLES: Record<string, Article> = {
  "przedawnienie-roszczen": {
    slug: "przedawnienie-roszczen",
    category: "procedura",
    title: "Przedawnienie roszczeń — terminy i przerwanie biegu",
    lead:
      "Przedawnienie to instytucja, ktora chroni dluznika przed bezterminowym dochodzeniem roszczen. Wyjasniamy terminy, przerwanie biegu i sposoby skutecznego podniesienia zarzutu.",
    readingTime: 8,
    publishedAt: "2026-03-14",
    updatedAt: "2026-05-04",
    author: {
      name: "Mecenas Anna Kowalska",
      role: "Adwokat, partner kancelarii",
    },
    sections: [
      {
        heading: "Podstawowe terminy przedawnienia",
        body:
          "Kodeks cywilny przewiduje dwa podstawowe terminy: 6 lat dla roszczen ogolnych oraz 3 lata dla roszczen okresowych i zwiazanych z dzialalnoscia gospodarcza. Termin liczony jest od dnia wymagalnosci roszczenia.",
      },
      {
        heading: "Przerwanie biegu przedawnienia",
        body:
          "Bieg przedawnienia przerywa kazda czynnosc przed sadem, sad polubowny lub komornika podjeta w celu dochodzenia roszczenia. Wezwanie do zaplaty wystawiane przez wierzyciela samo w sobie nie przerywa biegu, ale moze wstrzymac jego rozpoczecie.",
      },
      {
        heading: "Skuteczny zarzut przedawnienia",
        body:
          "Zarzut przedawnienia podnosi sie wprost w sprzeciwie od nakazu zaplaty lub w odpowiedzi na pozew. Sad od 9 lipca 2018 r. bada przedawnienie z urzedu wzglagdem konsumenta — wierzyciel nie moze zatem liczyc na nieuwage strony.",
      },
      {
        heading: "Co jesli pozwany juz splacil przedawniony dlug?",
        body:
          "Splata przedawnionego dlugu nie podlega zwrotowi — instytucja nazywa sie naturalna obligatio. Dlatego tak istotne jest, by przed jakakolwiek wplata sprawdzic, czy roszczenie nie jest przedawnione.",
      },
    ],
    references: [
      {
        label: "Art. 117-125 KC",
        description: "Podstawowe regulacje przedawnienia",
      },
      {
        label: "Uchwala SN III CZP 35/16",
        description: "Przerwanie biegu w postepowaniu klauzulowym",
      },
      {
        label: "Wyrok SN II CSK 391/19",
        description: "Skutek splaty roszczenia przedawnionego",
      },
    ],
    related: [
      {
        slug: "sprzeciw-od-nakazu",
        title: "Jak prawidlowo zlozyc sprzeciw od nakazu zaplaty",
      },
      {
        slug: "epu-zasady",
        title: "Elektroniczne postepowanie upominawcze (EPU) — przewodnik",
      },
      {
        slug: "odsetki-maksymalne",
        title: "Odsetki maksymalne — kiedy wierzyciel przekracza limit",
      },
    ],
  },
};

const CATEGORY_LABEL: Record<Article["category"], string> = {
  procedura: "Procedura cywilna",
  egzekucja: "Egzekucja",
  kpc: "Kodeks postepowania",
  ochrona: "Ochrona konsumenta",
  umowy: "Umowy",
};

const CATEGORY_TONE: Record<
  Article["category"],
  "info" | "warning" | "neutral" | "success"
> = {
  procedura: "info",
  egzekucja: "warning",
  kpc: "neutral",
  ochrona: "success",
  umowy: "neutral",
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

async function loadArticle(slug: string): Promise<Article | null> {
  return ARTICLES[slug] ?? ARTICLES["przedawnienie-roszczen"] ?? null;
}

export default async function KnowledgeArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) return notFound();

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-8">
        <Link
          href="/baza-wiedzy"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Baza wiedzy
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <Badge tone={CATEGORY_TONE[article.category]}>
            {CATEGORY_LABEL[article.category]}
          </Badge>
          <Badge tone="neutral">
            <Clock className="mr-1 inline h-3 w-3" />
            {article.readingTime} min czytania
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-4xl text-slate-900">
          {article.title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{article.lead}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-200 py-4 text-sm">
          <span className="inline-flex items-center gap-2 text-slate-700">
            <User className="h-4 w-4 text-slate-400" />
            {article.author.name}
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-2 text-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
            {fmtDate(article.publishedAt)}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500">
            Aktualizacja {fmtDate(article.updatedAt)}
          </span>
          <span className="ml-auto">
            <Button variant="ghost" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              Udostepnij
            </Button>
          </span>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-6">
        {article.sections.map((s) => (
          <section key={s.heading} className="mb-8">
            <h2 className="font-display text-2xl text-slate-900">
              {s.heading}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              {s.body}
            </p>
          </section>
        ))}
      </article>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="h-5 w-5 text-slate-500" />
              Podstawa prawna i orzecznictwo
            </CardTitle>
            <CardDescription>
              Zrodla przywolane w tym artykule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {article.references.map((r) => (
                <li
                  key={r.label}
                  className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
                >
                  <Badge tone="neutral">{r.label}</Badge>
                  <span className="text-sm text-slate-700">{r.description}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="font-display text-xl text-slate-900">
          Powiazane artykuly
        </h2>
        <div className="mt-4 grid gap-3">
          {article.related.map((r) => (
            <Link
              key={r.slug}
              href={`/baza-wiedzy/${r.slug}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  {r.title}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <Card elevation="pop" className="bg-slate-900 text-white">
          <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl">Masz pismo procesowe?</p>
              <p className="mt-1 text-sm text-slate-300">
                Sprawdz je w Dlugomat — 3 minuty, bez zobowiazan.
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/skaner-nakazu">Zeskanuj pismo</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
