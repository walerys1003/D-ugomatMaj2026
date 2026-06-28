import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Handshake, Building2, Users, TrendingUp, Award } from "lucide-react";
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
  title: "Partnerzy — Dlugomat",
  description:
    "Hub partnerstw Dlugomat: program partnerski, program resellerski, program afiliacyjny, integracje technologiczne i partnerstwa instytucjonalne.",
  alternates: { canonical: "/partnerzy" },
};

interface PartnerProgram {
  slug: string;
  title: string;
  subtitle: string;
  icon: typeof Handshake;
  audience: string;
  commission: string;
  benefits: ReadonlyArray<string>;
  cta: string;
  href: string;
  highlight: boolean;
}

const PROGRAMS: readonly PartnerProgram[] = [
  {
    slug: "partnerski",
    title: "Program partnerski",
    subtitle: "Dla kancelarii i firm doradczych",
    icon: Building2,
    audience: "Kancelarie prawne, biura ksiegowe, firmy windykacyjne",
    commission: "20% MRR przez 24 m-ce",
    benefits: [
      "Dedykowany partner manager",
      "Whitelabel dla wybranych planow",
      "Co-marketing i case studies",
      "Material szkoleniowy dla zespolu",
    ],
    cta: "Zostan partnerem",
    href: "/program-partnerski",
    highlight: true,
  },
  {
    slug: "resellerski",
    title: "Program resellerski",
    subtitle: "Dla integratorow i konsultantow IT",
    icon: Users,
    audience: "Firmy IT, agencje, integratorzy systemow",
    commission: "30% od pierwszego roku",
    benefits: [
      "Discount 30% na licencje",
      "Wsparcie techniczne pre-sales",
      "Dostep do sandboxa demo",
      "Certyfikacja techniczna",
    ],
    cta: "Sprzedawaj Dlugomat",
    href: "/program-resellerski",
    highlight: false,
  },
  {
    slug: "afiliacyjny",
    title: "Program afiliacyjny",
    subtitle: "Dla blogerow, twoorcow i edukatorow",
    icon: TrendingUp,
    audience: "Blogi prawnicze, kanaly YouTube, podcasty",
    commission: "15% pierwszego pisma",
    benefits: [
      "Tracking cookie 60 dni",
      "Materialy graficzne do uzycia",
      "Linki UTM i kody promocyjne",
      "Wyplata tygodniowa od 100 zl",
    ],
    cta: "Dolacz do afiliacji",
    href: "/program-afiliacyjny",
    highlight: false,
  },
];

interface InstitutionalPartner {
  name: string;
  type: string;
  desc: string;
}

const INSTITUTIONAL: readonly InstitutionalPartner[] = [
  { name: "Fundacja Konsumencka Pro Bono", type: "NGO", desc: "Bezplatna pomoc 1 200+ dluznikom rocznie." },
  { name: "Rzecznik Praw Obywatelskich", type: "Instytucja publiczna", desc: "Wymiana wiedzy o nieuczciwych praktykach windykacji." },
  { name: "Uniwersytet Warszawski (WPiA)", type: "Akademicka", desc: "Wspolne badania nad legaltech i edukacja studentow." },
  { name: "Rada Naukowa Dlugomat", type: "Naukowa", desc: "5 profesorow prawa cywilnego rewizujacych nasze procedury." },
];

const STATS = [
  { value: "120+", label: "Partnerow rozliczanych" },
  { value: "22 mln zl", label: "Przychod partnerski 2025" },
  { value: "8 700", label: "Spraw obsluzonych przez partnerow" },
];

export default function PartnerzyPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Handshake className="mr-1 h-3 w-3" />
            Partnerzy
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Razem pomagamy wiekszej liczbie ludzi.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Trzy programy partnerskie, dziesiatki integracji i piec partnerstw instytucjonalnych.
            Wybierz model, ktory pasuje do Twojej firmy.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <Card key={s.label} elevation="subtle">
              <CardContent className="p-6">
                <p className="font-display text-3xl text-slate-900">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">Programy partnerskie</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {PROGRAMS.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.slug}
                elevation={p.highlight ? "pop" : "subtle"}
                urgency={p.highlight ? "success" : "none"}
              >
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" aria-hidden />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    {p.highlight && <Badge tone="success">Top</Badge>}
                  </div>
                  <CardDescription>{p.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Dla kogo</p>
                    <p className="mt-1 text-sm text-slate-700">{p.audience}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Prowizja</p>
                    <p className="mt-1 font-display text-xl text-slate-900">{p.commission}</p>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-slate-400" aria-hidden />
                        <span className="text-slate-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={p.highlight ? "primary" : "secondary"} block>
                    <Link href={p.href}>
                      {p.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex items-start gap-3">
            <Award className="mt-1 h-6 w-6 text-slate-700" aria-hidden />
            <div>
              <h2 className="font-display text-2xl text-slate-900">Partnerstwa instytucjonalne</h2>
              <p className="mt-2 text-sm text-slate-600">
                Wspolpracujemy z organizacjami, ktorych celem jest realna pomoc dluznikom.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {INSTITUTIONAL.map((i) => (
              <Card key={i.name} elevation="subtle">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{i.name}</CardTitle>
                    <Badge tone="neutral">{i.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{i.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">Nie pasuje zaden z programow?</h2>
          <p className="mt-2 text-slate-600">
            Napisz na partnerstwa@dlugomat.pl. Otwieramy sie na nietypowe wspolprace.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="mailto:partnerstwa@dlugomat.pl">
                Napisz do nas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
