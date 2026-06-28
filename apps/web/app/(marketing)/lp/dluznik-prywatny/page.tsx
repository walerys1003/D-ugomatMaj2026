import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Heart, Clock, Lock, Users, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pomoc dla osob zadluzonych - Dlugomat",
  description: "Bezpieczne i dyskretne wyjscie z dlugow. AI pomaga zaplanowac splate, negocjowac z wierzycielami.",
};

const STEPS = [
  {
    n: 1,
    title: "Zaloguj sie i opisz sytuacje",
    description: "Bezpieczne logowanie przez Profil Zaufany. Wypelnij krotki kwestionariusz - 8 minut.",
  },
  {
    n: 2,
    title: "AI analizuje Twoje finanse",
    description: "Na podstawie dochodow, wydatkow i wierzycieli system proponuje 3 sciezki wyjscia z zadluzenia.",
  },
  {
    n: 3,
    title: "Wybierz plan i my zalatwiamy reszte",
    description: "Negocjacje z wierzycielami, generowanie pism, kontakt z sadem - wszystko po Twojej stronie.",
  },
  {
    n: 4,
    title: "Splacaj zgodnie z planem",
    description: "Comiesieczne raty zgodnie z Twoim budzetem. Powiadomienia i wsparcie 24/7.",
  },
];

const BENEFITS = [
  { icon: Shield, label: "Pelna dyskrecja", text: "Twoja sytuacja jest poufna. Tylko Ty i Twoj doradca." },
  { icon: Heart, label: "Bez oceniania", text: "Zadluzenie nie definiuje Ciebie. Pomagamy bez moralizowania." },
  { icon: Clock, label: "Pierwsze efekty w 14 dni", text: "Wiekszosc spraw konczy ugoda w 2-6 tygodni." },
  { icon: Lock, label: "Twoje dane bezpieczne", text: "ISO 27001, szyfrowanie E2E, serwery w Polsce." },
];

const FAQ = [
  {
    q: "Czy to jest legalne?",
    a: "Tak. Dlugomat jest zarejestrowanym posrednikiem finansowym, prawnicy wspolpracujacy z nami sa wpisani na liste OIRP/NRA. Wszystkie pisma generowane przez AI sa weryfikowane przez prawnika.",
  },
  {
    q: "Ile to kosztuje?",
    a: "Podstawowy plan jest darmowy do diagnozy. Realna pomoc kosztuje od 49 zl/m-c, ale wielu klientow miesci sie w nieodplatnej pomocy panstwowej (PCK, NPP).",
  },
  {
    q: "Czy moje dlugi znikna?",
    a: "Nie obiecujemy magii. Dlugi nie znikna same, ale plan splaty oraz negocjacje moga znaczaco obnizyc miesieczne raty (czasem o 60-80%) i zatrzymac kary umowne.",
  },
  {
    q: "Czy komornik moze zabrac moje wynagrodzenie?",
    a: "Tak, ale tylko czesc - jest kwota wolna od zajec. Dzieki Dlugomat mozna zlozyc skarge na czynnosci komornika lub wniosek o ograniczenie zajec.",
  },
];

export default function LpDluznikPrywatnyPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <section className="bg-white border-b border-ink-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge tone="success" className="mb-4" withDot>
                Pomoc bez oceniania
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-4">
                Wyjdz z dlugow spokojnie i z planem
              </h1>
              <p className="text-xl text-dlugomat-700 mb-8">
                Dlugomat to bezpieczna platforma, ktora pomaga osobom prywatnym uporzadkowac zadluzenie - negocjuje
                z wierzycielami, przygotowuje pisma, prowadzi przez proces.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/rejestracja">
                    Zacznij - 8 minut
                    <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/kontakt/demo">Najpierw rozmowa</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-dlugomat-600">
                Bez karty kredytowej, bez ukrytych oplat, w pelni anonimowo do momentu Twojej decyzji.
              </p>
            </div>
            <Card elevation="pop">
              <CardHeader>
                <CardTitle>Twoje koszty, Twoje tempo</CardTitle>
                <CardDescription>Plan splaty dopasowany do realnego budzetu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-dlugomat-700">Sredni czas pierwszej ugody</span>
                  <span className="font-medium text-dlugomat-950">14 dni</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-dlugomat-700">Obnizenie raty miesiecznej (srednio)</span>
                  <span className="font-medium text-emerald-700">-58%</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-dlugomat-700">Spraw zakonczonych ugoda</span>
                  <span className="font-medium text-dlugomat-950">12 470</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-dlugomat-700">Satysfakcja klientow</span>
                  <span className="font-medium text-dlugomat-950">4.7 / 5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-dlugomat-950 mb-3 text-center">Jak to dziala</h2>
          <p className="text-dlugomat-700 text-center mb-10 max-w-2xl mx-auto">
            4 proste kroki. Wiekszosc dziejesz online, bez wychodzenia z domu.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <Card key={step.n}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-accent-100 text-accent-700 font-display text-lg mb-3">
                    {step.n}
                  </div>
                  <h3 className="font-medium text-dlugomat-950 mb-2">{step.title}</h3>
                  <p className="text-sm text-dlugomat-700">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-ink-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-dlugomat-950 mb-10 text-center">Dlaczego osoby prywatne wybieraja Dlugomat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent-50 text-accent-700 mb-3">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="font-medium text-dlugomat-950 mb-1">{b.label}</h3>
                  <p className="text-sm text-dlugomat-700">{b.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-dlugomat-950 mb-10 text-center">Najczestsze pytania</h2>
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dlugomat-800 text-sm">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-dlugomat-950 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">Nie czekaj az dlugi sie nawarstwia</h2>
          <p className="text-dlugomat-200 text-lg mb-8 max-w-2xl mx-auto">
            Im wczesniej dzialasz, tym lepsze warunki ugody. Pierwsza diagnoza zajmuje 8 minut i jest bezplatna.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/rejestracja">
                Rozpocznij diagnoze
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild className="text-white hover:text-white">
              <Link href="tel:+48800123456">
                <Phone className="h-4 w-4 mr-2" aria-hidden />
                800 123 456
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-dlugomat-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              ISO 27001
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              RODO compliant
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden />
              KNF nadzor
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
