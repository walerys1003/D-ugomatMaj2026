import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Calendar,
  ExternalLink,
  Gavel,
  Quote,
  Scale,
  Share2,
  Sparkles,
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
  title: "Orzeczenie — Dlugomat",
  description: "Szczegoly orzeczenia sadowego z teza, uzasadnieniem i odniesieniami.",
};

type Ruling = {
  id: string;
  signature: string;
  court: string;
  date: string;
  publishedAt: string;
  category: "kc" | "kpc" | "konsument" | "egzekucja" | "epu";
  thesis: string;
  facts: string;
  reasoning: string;
  legalBasis: string[];
  keywords: string[];
  citations: number;
  applicability: "high" | "medium" | "low";
  similarCases: number;
};

const RULINGS: Record<string, Ruling> = {
  "orz-001": {
    id: "orz-001",
    signature: "III CZP 35/16",
    court: "Sad Najwyzszy",
    date: "2016-09-29",
    publishedAt: "2016-10-12",
    category: "kpc",
    thesis:
      "Bieg terminu przedawnienia roszczenia stwierdzonego prawomocnym wyrokiem przerywa wylacznie czynnosc skutkujaca dochodzeniem roszczenia — wszczecie postepowania egzekucyjnego, a nie samo zlozenie wniosku o nadanie klauzuli wykonalnosci.",
    facts:
      "Powod dochodzil roszczenia stwierdzonego wyrokiem z 2008 roku. W 2014 roku zlozyl wniosek o nadanie klauzuli wykonalnosci, a w 2017 roku wszczal egzekucje. Pozwany podniosl zarzut przedawnienia.",
    reasoning:
      "Sad Najwyzszy uznal, ze samo zlozenie wniosku o nadanie klauzuli wykonalnosci nie jest czynnoscia skutkujaca dochodzeniem roszczenia. Klauzula wykonalnosci ma charakter techniczny i nie zmierza do egzekucji — sluzy jedynie nadaniu tytulu egzekucyjnego cech tytulu wykonawczego.",
    legalBasis: ["Art. 123 §1 pkt 1 KC", "Art. 124 §1 KC", "Art. 776 KPC"],
    keywords: ["przedawnienie", "klauzula wykonalnosci", "przerwanie biegu", "egzekucja"],
    citations: 247,
    applicability: "high",
    similarCases: 18,
  },
};

const CATEGORY_LABEL: Record<Ruling["category"], string> = {
  kc: "Kodeks cywilny",
  kpc: "Kodeks postepowania",
  konsument: "Ochrona konsumenta",
  egzekucja: "Egzekucja",
  epu: "EPU",
};

const APPLICABILITY_TONE: Record<
  Ruling["applicability"],
  "success" | "warning" | "neutral"
> = {
  high: "success",
  medium: "warning",
  low: "neutral",
};

const APPLICABILITY_LABEL: Record<Ruling["applicability"], string> = {
  high: "Wysoka",
  medium: "Sredna",
  low: "Niska",
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

async function loadRuling(id: string): Promise<Ruling | null> {
  return RULINGS[id] ?? RULINGS["orz-001"] ?? null;
}

export default async function RulingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ruling = await loadRuling(id);
  if (!ruling) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/baza-orzecznicza"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Baza orzecznicza
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{CATEGORY_LABEL[ruling.category]}</Badge>
              <Badge tone={APPLICABILITY_TONE[ruling.applicability]} withDot>
                Zastosowanie: {APPLICABILITY_LABEL[ruling.applicability]}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-2xl text-slate-900">
              <span className="font-mono">{ruling.signature}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {ruling.court} · {fmtDate(ruling.date)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="mr-1 h-4 w-4" />
              Zapisz
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              Udostepnij
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card urgency="success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Quote className="h-5 w-5 text-emerald-600" />
                Teza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-slate-700">
                {ruling.thesis}
              </p>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4 text-slate-500" />
                Stan faktyczny
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700">
                {ruling.facts}
              </p>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gavel className="h-4 w-4 text-slate-500" />
                Uzasadnienie
              </CardTitle>
              <CardDescription>Synteza Sadu Najwyzszego</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700">
                {ruling.reasoning}
              </p>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-slate-500" />
                Jak wykorzystac w swojej sprawie
              </CardTitle>
              <CardDescription>
                AI analiza zastosowania tezy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-slate-400">1.</span>
                  <span>
                    Powolaj sie na te uchwale w sprzeciwie od nakazu, jezeli
                    wierzyciel ma tytul egzekucyjny starszy niz 6 lat.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-slate-400">2.</span>
                  <span>
                    Argument szczegolnie mocny gdy wierzyciel zlozyl wniosek o
                    klauzule, ale nie wszczal egzekucji.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-slate-400">3.</span>
                  <span>
                    Polacz z zarzutem przedawnienia z art. 125 §1 KC (10 lat dla
                    roszczen stwierdzonych wyrokiem).
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Statystyki</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Cytowania</dt>
                  <dd className="font-display text-lg text-slate-900">
                    {ruling.citations}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Podobne sprawy</dt>
                  <dd className="font-display text-lg text-slate-900">
                    {ruling.similarCases}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Publikacja
                  </dt>
                  <dd className="text-xs text-slate-700">
                    {fmtDate(ruling.publishedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-slate-500" />
                Podstawa prawna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ruling.legalBasis.map((b) => (
                  <li key={b}>
                    <Badge tone="neutral">{b}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Slowa kluczowe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ruling.keywords.map((k) => (
                  <Badge key={k} tone="info">
                    {k}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardContent className="py-5">
              <p className="text-sm font-medium text-slate-900">
                Pelna tresc orzeczenia
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Otworz w bazie SN
              </p>
              <Button variant="ghost" size="sm" className="mt-3">
                Zobacz w SN
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          <Card elevation="pop">
            <CardContent className="py-5">
              <p className="text-sm font-medium text-slate-900">
                Wykorzystaj w pismie
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Wstaw teze do generatora sprzeciwu lub skargi
              </p>
              <Button variant="primary" size="sm" className="mt-3 w-full">
                Dodaj do pisma
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
