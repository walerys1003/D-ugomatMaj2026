import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  ShieldCheck,
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
  title: "Wpis w BIK - jak go usunac? | Dlugomat",
  description:
    "Negatywny wpis w BIK utrudnia kredyt? Sprawdz w 2 minuty czy mozna go usunac i ile to potrwa.",
};

const REASONS = [
  {
    title: "Splacony dlug nadal widoczny",
    description:
      "Po splaceniu wierzytelnosci dane powinny zostac usuniete w ciagu 14 dni. Wierzyciel ma obowiazek zaktualizowac BIK.",
    timeline: "Usuniecie: do 30 dni",
  },
  {
    title: "Niezgodnosc danych",
    description:
      "Nieprawidlowa kwota, bledna data, niewlasciwy status. Mozesz zlozyc reklamacje bezposrednio w BIK.",
    timeline: "Usuniecie: 14-30 dni",
  },
  {
    title: "Przedawnione zobowiazanie",
    description:
      "Wierzytelnosc przedawniona nie powinna byc przedmiotem windykacji ani widniec w rejestrze.",
    timeline: "Usuniecie: po orzeczeniu",
  },
  {
    title: "Naruszenie RODO",
    description:
      "Brak podstawy prawnej przetwarzania danych po wygasnieciu umowy. Mozliwe zadanie usuniecia.",
    timeline: "Usuniecie: 30 dni",
  },
];

const STEPS = [
  {
    title: "Pobierz raport BIK",
    description: "Dlugomat poprowadzi Cie przez bezplatny dostep do pelnego raportu.",
  },
  {
    title: "Identyfikacja wpisow",
    description: "AI analizuje raport i wskazuje wpisy, ktore mozna zakwestionowac.",
  },
  {
    title: "Generowanie reklamacji",
    description: "Pisma do BIK, wierzyciela i ewentualnie UODO sa gotowe do podpisu.",
  },
  {
    title: "Monitoring statusu",
    description: "Sledzimy odpowiedz wierzyciela i status w BIK az do usuniecia wpisu.",
  },
];

export default function BikLandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <Badge tone="info">Biuro Informacji Kredytowej</Badge>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-slate-900 sm:text-5xl">
          Negatywny wpis w BIK blokuje Twoj kredyt?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Sprawdz w 2 minuty czy wpis mozna usunac. Generujemy reklamacje do BIK,
          wierzyciela i w razie potrzeby do UODO.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/rejestracja">
              Sprawdz swoj BIK
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/baza-wiedzy">Dowiedz sie wiecej</Link>
          </Button>
        </div>
        <div className="mt-4 inline-flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zgodne z RODO
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            Bez ujawniania danych osobom trzecim
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          Kiedy wpis w BIK mozna usunac?
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Cztery najczestsze sytuacje, w ktorych pomagamy klientom.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {REASONS.map((r) => (
            <Card key={r.title} elevation="subtle">
              <CardHeader>
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription>{r.timeline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{r.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          Jak to dziala — 4 kroki
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} elevation="subtle">
              <CardContent className="py-6">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 font-display text-sm text-white">
                  {i + 1}
                </span>
                <p className="font-medium text-slate-900">{s.title}</p>
                <p className="mt-2 text-sm text-slate-600">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card elevation="subtle">
            <CardContent className="py-6">
              <CreditCard className="mb-3 h-5 w-5 text-slate-500" />
              <p className="font-display text-2xl text-slate-900">87%</p>
              <p className="mt-1 text-sm text-slate-600">
                Wpisow usunietych w pierwszej iteracji
              </p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="py-6">
              <FileText className="mb-3 h-5 w-5 text-slate-500" />
              <p className="font-display text-2xl text-slate-900">23 dni</p>
              <p className="mt-1 text-sm text-slate-600">
                Sredni czas usuniecia wpisu
              </p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="py-6">
              <CheckCircle2 className="mb-3 h-5 w-5 text-slate-500" />
              <p className="font-display text-2xl text-slate-900">4 821</p>
              <p className="mt-1 text-sm text-slate-600">
                Wpisow usunietych z BIK w 2025 roku
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card elevation="pop" className="bg-slate-900 text-white">
          <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl">Czysty BIK to czysta historia</p>
              <p className="mt-1 text-sm text-slate-300">
                Bezplatna analiza Twojego raportu. Wynik w 2 minuty.
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/rejestracja">Sprawdz BIK teraz</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
