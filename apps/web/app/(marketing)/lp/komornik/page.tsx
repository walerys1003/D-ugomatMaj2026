import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Gavel, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Komornik zajal konto — co teraz? | Dlugomat",
  description:
    "Komornik zajal Twoje wynagrodzenie lub konto bankowe? Sprawdz w 3 minuty czy zajecie jest zgodne z prawem i jakie masz mozliwosci obrony.",
};

const STEPS = [
  {
    title: "Zeskanuj pismo komornika",
    description:
      "OCR rozpozna sygnature, kwote i tytul wykonawczy w 30 sekund.",
    time: "30 s",
  },
  {
    title: "Analiza zgodnosci z prawem",
    description:
      "Sprawdzamy czy zachowano kwote wolna od zajecia i czy postepowanie nie jest przedawnione.",
    time: "1 min",
  },
  {
    title: "Generowanie skargi",
    description:
      "Skarga na czynnosci komornika gotowa do podpisu i wyslania w sadzie.",
    time: "2 min",
  },
];

const RIGHTS = [
  {
    title: "Kwota wolna od zajecia",
    description:
      "Komornik nie moze zajac calego wynagrodzenia. Minimum to 75% pensji minimalnej (3 489,75 PLN w 2026).",
  },
  {
    title: "Skarga na czynnosci",
    description:
      "Masz 7 dni od doreczenia na zlozenie skargi do sadu rejonowego. Termin nie podlega przywroceniu.",
  },
  {
    title: "Wstrzymanie egzekucji",
    description:
      "W okreslonych przypadkach (przedawnienie, brak doreczenia) sad moze wstrzymac postepowanie.",
  },
  {
    title: "Umorzenie postepowania",
    description:
      "Jesli wierzyciel nie wykazuje aktywnosci przez 6 miesiecy, postepowanie ulega umorzeniu z mocy prawa.",
  },
];

const FAQ = [
  {
    q: "Czy komornik moze zajac cale wynagrodzenie?",
    a: "Nie. Z wynagrodzenia za prace komornik moze potracic maksymalnie 50% (przy alimentach do 60%), zawsze pozostawiajac kwote wolna od zajecia.",
  },
  {
    q: "Co jesli komornik egzekwuje dlug, ktory nie istnieje?",
    a: "Mozna zlozyc powodztwo przeciwegzekucyjne (art. 840 k.p.c.) lub skarge na czynnosci komornika. Dlugomat generuje oba pisma.",
  },
  {
    q: "Ile kosztuje egzekucja komornicza?",
    a: "Oplata stosunkowa to 10% wartosci egzekwowanego roszczenia, ale nie mniej niz 150 PLN i nie wiecej niz 50 000 PLN.",
  },
];

export default function KomornikLandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <Badge tone="warning" withDot>
          Pilna pomoc
        </Badge>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-slate-900 sm:text-5xl">
          Komornik zajal Twoje konto lub wynagrodzenie?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Nie panikuj. W 3 minuty sprawdzimy czy zajecie jest zgodne z prawem,
          jakie masz prawa i wygenerujemy gotowe pismo procesowe.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/skaner-nakazu">
              Zeskanuj pismo komornika
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/kontakt/demo">Konsultacja prawnika</Link>
          </Button>
        </div>
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          Bezplatna analiza pisma. Bez zobowiazan.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          3 kroki do odzyskania kontroli
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title} elevation="subtle">
              <CardContent className="py-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 font-display text-sm text-white">
                    {i + 1}
                  </span>
                  <Badge tone="neutral">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {step.time}
                  </Badge>
                </div>
                <p className="font-medium text-slate-900">{step.title}</p>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          Co mowi prawo — Twoje uprawnienia
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Egzekucja komornicza nie oznacza, ze jestes bezbronny. Polskie prawo
          daje konkretne mechanizmy obrony.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {RIGHTS.map((right) => (
            <Card key={right.title} elevation="subtle">
              <CardContent className="flex gap-4 py-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium text-slate-900">{right.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {right.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Card urgency="warning">
          <CardContent className="flex items-start gap-4 py-6">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-display text-lg text-slate-900">
                Termin na skarge to tylko 7 dni
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Skarga na czynnosci komornika musi wplynac do sadu w ciagu 7 dni
                od doreczenia pisma. Brak skargi oznacza utrate mozliwosci
                kwestionowania zajecia.
              </p>
              <div className="mt-4">
                <Button asChild variant="primary" size="sm">
                  <Link href="/skaner-nakazu">
                    Sprawdz swoje pismo teraz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          Najczestsze pytania
        </h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-slate-200 bg-white p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-900">
                {item.q}
                <Gavel className="h-4 w-4 text-slate-400 transition group-open:rotate-12" />
              </summary>
              <p className="mt-3 text-sm text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card elevation="pop" className="bg-slate-900 text-white">
          <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl">Czas dziala przeciwko Tobie</p>
              <p className="mt-1 text-sm text-slate-300">
                Im wczesniej zareagujesz, tym wiecej masz opcji. Sprawdz pismo
                teraz.
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/skaner-nakazu">Zeskanuj pismo komornika</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
