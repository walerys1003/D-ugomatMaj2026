import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  TrendingDown,
  ShieldCheck,
  Workflow,
  FileSpreadsheet,
  Users,
  PhoneCall,
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
  title: "Dla firm — Dlugomat B2B",
  description:
    "Dlugomat dla zespolow ksiegowych, biur rachunkowych i dzialow prawnych. Zarzadzanie windykacja klientow, automatyzacja wezwan, raporty dla zarzadu.",
  alternates: { canonical: "/dla-firm" },
};

const PAIN_POINTS = [
  {
    icon: TrendingDown,
    title: "Zalegle naleznosci rosna z miesiaca na miesiac",
    desc: "Twoj zespol pisze wezwania w Wordzie, kopiuje dane recznie, gubi terminy przedawnienia.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel zamiast systemu",
    desc: "Lista dluznikow w arkuszu. Zero audit logu. Pracownik odchodzi — wiedza znika.",
  },
  {
    icon: PhoneCall,
    title: "Telefony od klientow w sprawie statusu",
    desc: "Brak portalu klienta = telefon do biura = strata 15 min na kazdej sprawie.",
  },
];

const SOLUTIONS = [
  {
    icon: Workflow,
    title: "Workflow windykacyjny",
    desc: "Wezwanie → przedsadowe → sad → komornik. Kazdy krok z deadlinem i automatami.",
    badge: "Automatyka",
  },
  {
    icon: Users,
    title: "Portal klienta-dluznika",
    desc: "Twoj dluznik widzi swoja sprawe, harmonogram splat, dokumenty. Bez telefonu.",
    badge: "Self-service",
  },
  {
    icon: ShieldCheck,
    title: "Raporty dla zarzadu",
    desc: "DSO, wskaznik odzysku, koszt sprawy, prognoza cash-flow. Eksport do PDF.",
    badge: "BI",
  },
  {
    icon: Building2,
    title: "Multi-tenant dla biur rachunkowych",
    desc: "Jedna instancja, wielu klientow. Pelna izolacja danych. Whitelabel opcjonalnie.",
    badge: "B2B2C",
  },
];

const ROI_EXAMPLE = [
  { label: "Liczba spraw miesiecznie", value: "200" },
  { label: "Czas oszczedzony na sprawie", value: "2,5 h" },
  { label: "Stawka godzinowa juniora", value: "85 zl" },
  { label: "Oszczednosc miesieczna", value: "42 500 zl" },
  { label: "Koszt Dlugomat (Kancelaria)", value: "1 290 zl" },
  { label: "ROI miesieczny", value: "32x" },
];

const TESTIMONIAL = {
  quote:
    "Dziewieciu pracownikow ksiegowosci zajmowalo sie windykacja w niepelnym wymiarze. Teraz robi to dwoch — i nie sa zmeczeni.",
  author: "Maria Pietrzak",
  role: "Dyrektor finansowy, Grupa Polmet",
};

export default function ForCompaniesPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Building2 className="mr-1 h-3 w-3" />
            Dla firm
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Twoi klienci nie placa. <br className="hidden sm:block" />
            My zajmiemy sie reszta.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Dlugomat dla biur rachunkowych, dzialow ksiegowosci i zespolow prawnych. Zarzadzaj
            windykacja jak Salesforce zarzadza sprzedaza.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/kontakt?temat=b2b">
                Umow demo dla firmy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/cennik/porownanie">Zobacz cennik</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-slate-900">Czy to brzmi znajomo?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PAIN_POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} elevation="subtle" urgency="warning">
                <CardHeader>
                  <Icon className="h-6 w-6 text-amber-600" aria-hidden />
                  <CardTitle className="mt-3 text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{p.desc}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-slate-900">
            Cztery rzeczy, ktore robia roznice
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {SOLUTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} elevation="subtle">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                        <Icon className="h-5 w-5 text-slate-700" aria-hidden />
                      </div>
                      <Badge tone="info">{s.badge}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{s.desc}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-slate-900">
          Liczby dla srednio-duzej firmy (200 spraw/m-c)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Wyliczenie modelowe — dokladne ROI policzymy dla Twojej firmy po krotkiej rozmowie.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <tbody>
              {ROI_EXAMPLE.map((row, idx) => (
                <tr
                  key={row.label}
                  className={
                    idx === ROI_EXAMPLE.length - 1
                      ? "border-t-2 border-slate-900 bg-emerald-50"
                      : "border-t border-slate-100"
                  }
                >
                  <td className="px-4 py-3 text-slate-700">{row.label}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      idx === ROI_EXAMPLE.length - 1
                        ? "font-display text-xl text-emerald-700"
                        : "text-slate-900"
                    }`}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <figure>
            <blockquote className="font-display text-2xl italic leading-relaxed">
              "{TESTIMONIAL.quote}"
            </blockquote>
            <figcaption className="mt-6 text-slate-300">
              <span className="font-medium text-white">{TESTIMONIAL.author}</span>
              {", "}
              {TESTIMONIAL.role}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">14 dni na test, bez karty</h2>
          <p className="mt-2 text-slate-600">
            Wgraj 10 spraw z Excela, zobacz, jak dzialaja workflow. Zadnego sprzedawcy w mailu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/rejestracja?plan=kancelaria">
                Zaczynam test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/kontakt?temat=b2b">Umow rozmowe</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
