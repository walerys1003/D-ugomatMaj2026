import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Scale,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "O nas — kim jest Długomat i dlaczego to robimy",
  description:
    "Długomat to legal-tech, który automatyzuje pisma procesowe dla osób zadłużonych. Misja: dostęp do narzędzi prawnych nie powinien zależeć od majątku.",
  alternates: { canonical: "/o-nas" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Tarcza, nie miecz",
    desc: "Nie jesteśmy firmą windykacyjną. Nie ścigamy nikogo. Nasza rola to ochrona Twoich praw — w terminie, w odpowiedniej formie, z odpowiednią argumentacją.",
  },
  {
    icon: Scale,
    title: "Bez paniki, z konkretami",
    desc: "Termin 14 dni? Pokażemy datę i instrukcję. Komornik zajął rachunek? Powiemy, na jaki przepis się powołać. Brak alarmistycznej narracji — same fakty i działania.",
  },
  {
    icon: Sparkles,
    title: "AI z odpowiedzialnością",
    desc: "Każde pismo przechodzi walidację (drugi model AI) i ma fallback na szablon ekspercki. Nigdy nie dostarczymy pustej ani niekompletnej odpowiedzi.",
  },
  {
    icon: Heart,
    title: "Dostępność, nie ekskluzywność",
    desc: "Skaner pism — DARMOWY. Pojedyncze pismo — od 79 zł. Bo dostęp do narzędzi prawnych nie powinien zależeć od tego, ile zarabiasz.",
  },
] as const;

export default function ONasPage() {
  return (
    <>
      {/* HERO */}
      <section className="tarcza-hero-gradient relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-dlugomat-500/20 blur-3xl"
        />
        <div className="container relative py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="info" withDot className="bg-white/10 text-white border-white/20">
              O nas
            </Badge>
            <h1 className="mt-4 text-balance text-fluid-5xl font-bold tracking-tight text-white">
              Tarcza dla osób zadłużonych — bo każdy zasługuje na obronę.
            </h1>
            <p className="mt-4 text-fluid-lg text-iron-200">
              Długomat to projekt legal-tech, który automatyzuje pisma procesowe
              przy użyciu AI zgodnej z polskim prawem. Robimy to dlatego, że
              dostęp do narzędzi prawnych nie powinien zależeć od portfela.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-fluid-base leading-relaxed text-iron-700 dark:text-iron-200">
          <h2 className="text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Dlaczego to robimy
          </h2>
          <p>
            Co roku w Polsce wydawanych jest ponad{" "}
            <strong>1,5 miliona nakazów zapłaty</strong> w trybie elektronicznym
            (EPU). Większość trafia do osób, które nigdy wcześniej nie miały
            sprawy w sądzie i nie wiedzą, że mają tylko 14 dni na reakcję. Bez
            sprzeciwu — nakaz uprawomocnia się i staje się tytułem wykonawczym
            dla komornika.
          </p>
          <p>
            Adwokat za sprzeciw bierze 1500-3000 zł. To więcej, niż osoba
            zadłużona ma w portfelu. Wzory z internetu są często nieaktualne i
            pomijają kluczowe zarzuty. Sąd nie pomaga w sformułowaniu pisma —
            bo to nie jego rola. Powstaje luka, którą fundusze sekurytyzacyjne
            wykorzystują od lat: kupują wierzytelności za 5-15% nominału i
            otrzymują tytuły wykonawcze przeciwko osobom, które nie mają jak
            się bronić.
          </p>
          <p>
            <strong>Długomat zamyka tę lukę.</strong> Generator pisma w 12
            minut, z aktualnym orzecznictwem Sądu Najwyższego, walidacją
            jakości i dostępną ceną. Skaner pism — darmowy. Sprzeciw — 159 zł.
            Skarga komornicza — od 79 zł. To nie cena prawnika, to cena
            podpiętego API i kilku zamortyzowanych wzorów.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Wartości
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Cztery zasady, których się trzymamy.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card key={i} elevation="subtle">
                  <CardHeader>
                    <span className="inline-flex size-10 items-center justify-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="mt-3 text-fluid-lg">
                      {v.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                      {v.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TECH STACK / TRANSPARENCY */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Pod maską
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Z czego zbudowaliśmy Długomat.
            </h2>
          </div>

          <div className="mt-10 space-y-5 text-fluid-base leading-relaxed text-iron-700 dark:text-iron-200">
            <p>
              <strong>Modele AI:</strong> Claude Sonnet 4.5 (generowanie pism),
              Haiku 4.5 (walidacja), Opus 4.5 (analiza skomplikowanych
              przypadków). Wszystkie od Anthropic — modele wybrane za jakość
              argumentacji prawnej w językach europejskich.
            </p>
            <p>
              <strong>Infrastruktura:</strong> Next.js 14 (App Router) i
              Supabase (Auth + Postgres z Row-Level Security). Storage w UE
              (region eu-central-1). TLS 1.3 in-transit, AES-256 at-rest.
              Pełna zgodność z RODO.
            </p>
            <p>
              <strong>Baza prawna:</strong> aktualizowana co kwartał na
              podstawie monitoringu zmian KPC, KC, Prawa bankowego i orzecznictwa
              Sądu Najwyższego. Każdy wzór ma datę ostatniej rewizji i
              odniesienia do konkretnych sygnatur.
            </p>
            <p>
              <strong>Wsparcie merytoryczne:</strong> przy szczególnie
              skomplikowanych sprawach kierujemy do współpracujących kancelarii.
              Długomat nie udaje, że jest substytutem dobrej obsługi prawnej w
              sprawach precedensowych.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 sm:py-24">
        <div className="tarcza-hero-gradient relative overflow-hidden rounded-2xl px-6 py-12 sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-2xl text-center text-white">
            <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-white sm:text-fluid-4xl">
              Masz pytanie? Sugestię? Krytykę?
            </h2>
            <p className="mt-3 text-fluid-base text-iron-200">
              Słuchamy. Każdy email czytamy w 24h. Każdy feedback od
              użytkowników wraca jako poprawka w produkcie.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="success">
                <Link href="/kontakt">
                  Skontaktuj się
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Link href="/skaner-nakazu">Wypróbuj skaner</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
