import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, TrendingUp, Shield, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dla windykacji - Dlugomat",
  description: "Rozwiazania dla firm windykacyjnych - skuteczna ugoda, zgodnosc, automatyzacja.",
};

type Feature = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  metrics: { label: string; value: string }[];
  benefits: string[];
  details: { heading: string; text: string }[];
  cta: string;
};

const FEATURES: Record<string, Feature> = {
  "automatyczne-ugody": {
    slug: "automatyczne-ugody",
    name: "Automatyczne ugody",
    tagline: "Negocjacje z dluznikiem bez angazowania zespolu",
    description:
      "System AI prowadzi rozmowy z dluznikiem w ramach zdefiniowanej polityki, proponuje plan splaty i finalizuje ugode elektronicznie. Skraca cykl windykacji z tygodni do godzin.",
    metrics: [
      { label: "Skutecznosc ugod", value: "68%" },
      { label: "Skrocenie cyklu", value: "12x" },
      { label: "Koszt jednostkowy", value: "-74%" },
    ],
    benefits: [
      "Negocjacja w ramach polityki firmy bez wymagajaca akceptacji recznej",
      "Automatyczne generowanie ugody i podpis kwalifikowany",
      "Integracja z systemem ksiegowym i raportowania",
      "Pelny audyt rozmowy z dluznikiem (RODO art. 30)",
    ],
    details: [
      {
        heading: "Jak to dziala",
        text: "Po przekazaniu sprawy do Dlugomat system AI kontaktuje sie z dluznikiem przez wybrany kanal. Prowadzi rozmowe na podstawie polityki firmy, weryfikuje sytuacje finansowa i proponuje plan splaty.",
      },
      {
        heading: "Bezpieczenstwo prawne",
        text: "Wszystkie rozmowy sa nagrywane i transkrybowane. Ugoda zawiera klauzule wymagane prawem (KC art. 917). Dane sa przetwarzane zgodnie z RODO i ustawa o ochronie konsumenta.",
      },
    ],
    cta: "Zobacz demo automatycznej ugody",
  },
  "raporty-zgodnosci": {
    slug: "raporty-zgodnosci",
    name: "Raporty zgodnosci",
    tagline: "Compliance dla UOKiK, KNF i RODO w jednym miejscu",
    description:
      "Generuj raporty na potrzeby kontroli regulatorow, audytow wewnetrznych i przegladow KNF. Wszystkie dane sa wersjonowane, podpisane cyfrowo i gotowe do eksportu.",
    metrics: [
      { label: "Czas raportu", value: "5 min" },
      { label: "Pokrycie regulacji", value: "100%" },
      { label: "Audyty zaliczone", value: "247" },
    ],
    benefits: [
      "Gotowe szablony dla UOKiK, KNF, GIODO",
      "Wersjonowanie i podpisy elektroniczne",
      "Eksport CSV, XLSX, PDF z hashami",
      "Automatyczne wykrywanie luk w dokumentacji",
    ],
    details: [
      {
        heading: "Zakres raportow",
        text: "System obsluguje raporty dla UOKiK (reklamacje, kary umowne), KNF (rekomendacje T, U), GIODO (RODO art. 30), MF (sprawozdania kwartalne) oraz audytow wewnetrznych ISO 27001.",
      },
      {
        heading: "Integralnosc danych",
        text: "Kazdy raport zawiera hash SHA-256, znacznik czasu i podpis kwalifikowany. Dane historyczne sa niezmienne (write-once storage). Mozna udowodnic integralnosc po latach.",
      },
    ],
    cta: "Pobierz przykladowy raport",
  },
};

type Params = Promise<{ slug: string }>;

export default async function FunkcjaWindykacjiPage({ params }: { params: Params }) {
  const { slug } = await params;
  const feature = FEATURES[slug] ?? FEATURES["automatyczne-ugody"];
  if (!feature) notFound();

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dla-windykacji"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do oferty dla windykacji
          </Link>
        </div>

        <header className="mb-12">
          <Badge tone="info" className="mb-4">Dla firm windykacyjnych</Badge>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-3">{feature.name}</h1>
          <p className="text-xl text-dlugomat-700 max-w-3xl">{feature.tagline}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {feature.metrics.map((m) => (
            <Card key={m.label} elevation="pop">
              <CardContent className="pt-6">
                <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">{m.label}</div>
                <div className="font-display text-4xl text-accent-700">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Czym jest {feature.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dlugomat-800 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>

            {feature.details.map((d) => (
              <Card key={d.heading}>
                <CardHeader>
                  <CardTitle className="text-lg">{d.heading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dlugomat-800 leading-relaxed">{d.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Najwazniejsze korzysci</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feature.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-dlugomat-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dlaczego Dlugomat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                  <span className="text-dlugomat-800">Zgodnosc z UOKiK, KNF, RODO</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                  <span className="text-dlugomat-800">SLA 99.95% dostepnosci</span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                  <span className="text-dlugomat-800">Wdrozenie w 4 tygodnie</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                  <span className="text-dlugomat-800">API i webhook do integracji</span>
                </div>
              </CardContent>
            </Card>

            <Card elevation="pop">
              <CardContent className="pt-6">
                <p className="text-sm text-dlugomat-800 mb-4">
                  Sprawdz na przykladzie Twojej bazy spraw, jakie wyniki uzyskasz z {feature.name}.
                </p>
                <Button variant="primary" block asChild>
                  <Link href="/kontakt/demo">
                    {feature.cta}
                    <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
