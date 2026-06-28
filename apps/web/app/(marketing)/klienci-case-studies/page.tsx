import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote, TrendingUp, Clock, Users } from "lucide-react";
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
  title: "Klienci i case studies — Dlugomat",
  description:
    "Historie zespolow, ktore zaoszczedzily setki godzin i obronily klientow przed nakazami zaplaty. Twarde liczby, prawdziwe nazwiska.",
  alternates: { canonical: "/klienci-case-studies" },
};

interface CaseStudy {
  slug: string;
  company: string;
  industry: string;
  size: string;
  challenge: string;
  result_headline: string;
  metrics: ReadonlyArray<{ label: string; value: string; trend: "up" | "down" }>;
  quote: string;
  quote_author: string;
  quote_role: string;
  highlight: boolean;
}

const STUDIES: readonly CaseStudy[] = [
  {
    slug: "kancelaria-malinowski",
    company: "Kancelaria Malinowski i Wspolnicy",
    industry: "Kancelaria prawna",
    size: "12 prawnikow",
    challenge:
      "Manualne pisanie sprzeciwow do EPU zajmowalo 4 h. Mlodzi prawnicy mylili sie z terminami procesowymi.",
    result_headline: "Sprzeciwy w 25 minut, zero pominietych terminow.",
    metrics: [
      { label: "Czas na sprzeciw", value: "-90%", trend: "down" },
      { label: "Wygranych spraw", value: "+34%", trend: "up" },
      { label: "Pominietych terminow", value: "0", trend: "down" },
    ],
    quote:
      "Pierwszy raz mamy SLA na wewnetrzne deadliny i wszyscy je dotrzymujemy. To nie tylko narzedzie — to dyscyplina zespolu.",
    quote_author: "Adw. Tomasz Malinowski",
    quote_role: "Partner zarzadzajacy",
    highlight: true,
  },
  {
    slug: "windyk-pro",
    company: "Windyk-Pro Sp. z o.o.",
    industry: "Windykacja",
    size: "45 osob",
    challenge:
      "Skala 2 000 spraw miesiecznie. Brakowalo systemu sledzenia statusow i automatyzacji wezwan.",
    result_headline: "Workflow zamknal cykl od wezwania do egzekucji.",
    metrics: [
      { label: "Wskaznik odzysku", value: "+22%", trend: "up" },
      { label: "Koszt jednej sprawy", value: "-41%", trend: "down" },
      { label: "Spraw miesiecznie", value: "5 200", trend: "up" },
    ],
    quote:
      "Skalujemy bez zatrudniania. Dlugomat zrobil za nas mlodszego analityka — i nie chodzi na chorobowe.",
    quote_author: "Anna Kowalczyk",
    quote_role: "Dyrektor operacyjny",
    highlight: false,
  },
  {
    slug: "bank-spoldzielczy-rzeszow",
    company: "Bank Spoldzielczy w Rzeszowie",
    industry: "Bankowosc",
    size: "230 pracownikow",
    challenge:
      "Dzial windykacji prowadzil sprawy w arkuszach. Compliance nie mialo wgladu w status spraw przeterminowanych.",
    result_headline: "Pelna sciezka audytu na 7 lat, gotowa na KNF.",
    metrics: [
      { label: "Czas raportu KNF", value: "-78%", trend: "down" },
      { label: "Pokrycie audytu", value: "100%", trend: "up" },
      { label: "Sprawy w SLA", value: "98,4%", trend: "up" },
    ],
    quote:
      "Audytorzy KNF zapytali, jak generujemy raport w 3 minuty. Pokazalismy panel i zamilkli.",
    quote_author: "Krzysztof Nowak",
    quote_role: "Compliance Officer",
    highlight: false,
  },
  {
    slug: "fundacja-konsumencka",
    company: "Fundacja Konsumencka Pro Bono",
    industry: "Organizacja pozytku publicznego",
    size: "8 wolontariuszy",
    challenge:
      "Pomoc 400 dluznikom rocznie bez budzetu. Bralo to po 6 h na sprawe.",
    result_headline: "Trzykrotnie wiecej osob obronionych przy tych samych zasobach.",
    metrics: [
      { label: "Spraw rocznie", value: "1 280", trend: "up" },
      { label: "Czas na sprawe", value: "-65%", trend: "down" },
      { label: "Wygrane przedawnienia", value: "412", trend: "up" },
    ],
    quote:
      "Skaner nakazu to nasza superbron. Pokazujemy mlodemu dluznikowi w 2 minuty, ze sprawa jest przedawniona — i koniec.",
    quote_author: "dr Magdalena Wisniewska",
    quote_role: "Prezes Fundacji",
    highlight: false,
  },
];

const AGGREGATE_STATS = [
  { icon: Users, label: "Aktywnych klientow", value: "1 240+" },
  { icon: TrendingUp, label: "Wygranych spraw 2025", value: "8 700" },
  { icon: Clock, label: "Sredni czas oszczedzony", value: "67%" },
];

export default function CaseStudiesHubPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            Klienci i case studies
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Twarde liczby. Prawdziwe nazwiska.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Cztery zespoly z czterech roznych branz. Jedno wspolne: zaoszczedzily setki godzin
            i obronily klientow przed niepotrzebnymi nakazami zaplaty.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {AGGREGATE_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} elevation="subtle">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100">
                    <Icon className="h-6 w-6 text-slate-700" aria-hidden />
                  </div>
                  <div>
                    <p className="font-display text-3xl text-slate-900">{s.value}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="space-y-6">
          {STUDIES.map((cs) => (
            <Card
              key={cs.slug}
              elevation={cs.highlight ? "pop" : "subtle"}
              urgency={cs.highlight ? "success" : "none"}
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral" withDot>
                        {cs.industry}
                      </Badge>
                      <Badge tone="info">{cs.size}</Badge>
                      {cs.highlight && <Badge tone="success">Wyrozniony</Badge>}
                    </div>
                    <CardTitle className="mt-3 text-2xl">{cs.company}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {cs.result_headline}
                    </CardDescription>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/case-studies/${cs.slug}`}>
                      Pelny case study
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Wyzwanie</p>
                  <p className="mt-1 text-sm text-slate-700">{cs.challenge}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {cs.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-md border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-500">{m.label}</p>
                      <p
                        className={`mt-1 font-display text-2xl ${
                          m.trend === "up" ? "text-emerald-700" : "text-slate-900"
                        }`}
                      >
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                <figure className="border-l-4 border-slate-900 pl-4">
                  <Quote className="h-5 w-5 text-slate-400" aria-hidden />
                  <blockquote className="mt-2 text-base italic text-slate-700">
                    {cs.quote}
                  </blockquote>
                  <figcaption className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{cs.quote_author}</span>
                    {", "}
                    {cs.quote_role}
                  </figcaption>
                </figure>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">Twoja firma moze byc nastepna</h2>
          <p className="mt-2 text-slate-600">
            Pierwsze 14 dni gratis. Bez umowy. Bez karty.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/rejestracja">
                Zaczynam
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/kontakt?temat=demo">Umow demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
