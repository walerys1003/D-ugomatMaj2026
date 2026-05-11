import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Clock, Heart, FileText, Phone, AlertTriangle } from "lucide-react";
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
  title: "Dla osob fizycznych — Dlugomat",
  description:
    "Dostales nakaz zaplaty, list od komornika, wezwanie z BIK? Dlugomat pomoze Ci sie obronic. Skaner gratis, pismo od 79 zl.",
  alternates: { canonical: "/dla-osob-fizycznych" },
};

interface UseCase {
  icon: typeof FileText;
  title: string;
  whatToDo: string;
  timeLimit: string;
  cost: string;
  urgency: "critical" | "warning" | "normal";
}

const USE_CASES: readonly UseCase[] = [
  {
    icon: AlertTriangle,
    title: "Nakaz zaplaty z EPU",
    whatToDo: "Sprzeciw — masz tylko 14 dni od doreczenia.",
    timeLimit: "14 dni",
    cost: "Sprzeciw od 79 zl",
    urgency: "critical",
  },
  {
    icon: FileText,
    title: "Wezwanie z BIK lub windykatora",
    whatToDo: "Sprawdz przedawnienie, zarzadaj dokumentow.",
    timeLimit: "30 dni",
    cost: "Pismo od 79 zl",
    urgency: "warning",
  },
  {
    icon: Phone,
    title: "Telefon od komornika",
    whatToDo: "Pakiet komorniczy — wniosek o rozlozenie, ograniczenie zajec, ugoda.",
    timeLimit: "Im szybciej tym lepiej",
    cost: "Pakiet 199 zl",
    urgency: "warning",
  },
  {
    icon: Shield,
    title: "Bank straszy sadem",
    whatToDo: "Wezwanie do mediacji, ugoda pozasadowa, propozycja restrukturyzacji.",
    timeLimit: "Zanim wytocza pozew",
    cost: "Od 99 zl",
    urgency: "normal",
  },
];

const TRUST_FACTS = [
  { value: "1 240+", label: "Osob obronionych w 2025" },
  { value: "78%", label: "Wygranych w pierwszej instancji" },
  { value: "412", label: "Spraw przedawnionych odkrytych" },
  { value: "67%", label: "Sredni czas oszczedzony vs sam-sobie" },
];

const TESTIMONIALS = [
  {
    quote: "Mialem 12 dni do konca terminu sprzeciwu. W godzine zrobilem pismo, ktore prawnik wycenil na 800 zl.",
    author: "Tomasz K.",
    place: "Krakow, 39 lat",
  },
  {
    quote: "Komornik dzwonil 4 razy dziennie. Przez Dlugomat zlozylem skarge i wniosek o rozlozenie. Spokoj.",
    author: "Maria S.",
    place: "Wroclaw, 52 lata",
  },
  {
    quote: "Mysleli, ze ulegniemy. Dlugomat pokazal nam, ze roszczenie z 2017 jest przedawnione. Sprawa umorzona.",
    author: "Pawel W.",
    place: "Gdansk, 47 lat",
  },
];

const URGENCY_TONE = {
  critical: "danger" as const,
  warning: "warning" as const,
  normal: "info" as const,
};

export default function DlaOsobFizycznychPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Heart className="mr-1 h-3 w-3" />
            Dla osob fizycznych
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Otrzymales pismo? Nie panikuj. Nie zwlekaj.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Skaner nakazu DARMOWY. Pierwsze pismo od 79 zl. Bez umowy z kancelaria,
            bez zaliczek, bez tygodni czekania.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/skaner-nakazu">
                Skanuj swoje pismo (gratis)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/kontakt">Zadzwon do nas</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_FACTS.map((s) => (
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
        <h2 className="font-display text-2xl text-slate-900">Cztery sytuacje, w ktorych pomagamy</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {USE_CASES.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} elevation="subtle" urgency={c.urgency}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-6 w-6 ${
                        c.urgency === "critical"
                          ? "text-red-600"
                          : c.urgency === "warning"
                          ? "text-amber-600"
                          : "text-slate-700"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <CardDescription className="mt-1">{c.whatToDo}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <Badge tone={URGENCY_TONE[c.urgency]}>{c.timeLimit}</Badge>
                    </div>
                    <span className="font-display text-sm text-slate-900">{c.cost}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-slate-900">Co mowia osoby, ktorym pomoglismy</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.author} elevation="flat">
                <CardContent className="p-6">
                  <p className="text-sm italic leading-relaxed text-slate-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-sm font-medium text-slate-900">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.place}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Card elevation="pop" urgency="warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Wazne — nie zwlekaj
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-700">
              Sprzeciw od nakazu zaplaty masz tylko <strong>14 dni</strong> od doreczenia. Po tym terminie
              nakaz staje sie prawomocny i komornik moze zajac konto, wynagrodzenie, samochod. Im wczesniej
              zaczniesz, tym wiecej masz opcji.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href="/skaner-nakazu">
                  Sprawdz swoje pismo teraz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/faq">Zobacz FAQ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
