import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Scale, FileText, Users, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dla kancelarii - Dlugomat",
  description: "Rozwiazania dla kancelarii prawnych - automatyzacja pism, baza orzecznicza, klient panel.",
};

type Feature = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: { icon: "scale" | "file" | "users" | "lock"; label: string; value: string }[];
  capabilities: string[];
  workflow: { step: number; title: string; description: string }[];
  cta: string;
};

const FEATURES: Record<string, Feature> = {
  "generator-pism": {
    slug: "generator-pism",
    name: "Generator pism procesowych AI",
    tagline: "Pisma procesowe w 8 minut zamiast 3 godzin",
    description:
      "Asystent AI specjalizowany w polskim prawie cywilnym, gospodarczym i upadlosciowym. Tworzy projekty pism z odwolaniami do KC, KPC i aktualnej linii orzeczniczej. Wszystko podlega przegladowi prawnika.",
    highlights: [
      { icon: "file", label: "Sredni czas pisma", value: "8 min" },
      { icon: "scale", label: "Trafnosc cytowan", value: "97%" },
      { icon: "users", label: "Aktywne kancelarie", value: "340+" },
      { icon: "lock", label: "Tajemnica zawodowa", value: "Pelna" },
    ],
    capabilities: [
      "Wzory: pozew, odpowiedz, sprzeciw, apelacja, kasacja, skarga konstytucyjna",
      "Automatyczne uzasadnienie z odwolaniami do orzeczen SN i TK",
      "Generowanie wnioskow dowodowych na podstawie akt sprawy",
      "Eksport DOCX z formatowaniem zgodnym z wymogami sadu",
      "Wersjonowanie i sledzenie zmian (Git-like diff)",
    ],
    workflow: [
      {
        step: 1,
        title: "Przekaz akta sprawy",
        description: "Przeciagnij PDF-y lub podlacz integracje z systemem kancelaryjnym (Mecenas, Lex, Legalis).",
      },
      {
        step: 2,
        title: "AI analizuje stan faktyczny",
        description: "System wyciaga fakty, identyfikuje strony, terminy i kluczowe okolicznosci sprawy.",
      },
      {
        step: 3,
        title: "Generowanie projektu pisma",
        description: "AI tworzy strukture (petitum, zarzuty, uzasadnienie, wnioski dowodowe) z cytowaniami.",
      },
      {
        step: 4,
        title: "Przeglad prawnika",
        description: "Edytujesz, akceptujesz lub odrzucasz fragmenty. Wszystkie zmiany sa wersjonowane.",
      },
      {
        step: 5,
        title: "Eksport i wyslanie",
        description: "DOCX, PDF z podpisem kwalifikowanym lub bezposrednie wyslanie przez EPU.",
      },
    ],
    cta: "Wyprobuj generator za darmo",
  },
  "panel-klienta": {
    slug: "panel-klienta",
    name: "Panel klienta kancelarii",
    tagline: "Twoi klienci widza postep sprawy 24/7 bez telefonow",
    description:
      "Dedykowany panel webowy pod marka kancelarii (white-label). Klient widzi status sprawy, harmonogram, dokumenty i moze zadawac pytania w bezpiecznym kanale. Zmniejsza liczbe telefonow o 64%.",
    highlights: [
      { icon: "users", label: "Mniej telefonow", value: "-64%" },
      { icon: "file", label: "Satysfakcja klienta", value: "94%" },
      { icon: "scale", label: "Spraw online", value: "100%" },
      { icon: "lock", label: "Bezpieczenstwo", value: "ISO 27001" },
    ],
    capabilities: [
      "White-label - logo i kolory kancelarii",
      "Status sprawy w czasie rzeczywistym",
      "Harmonogram rozpraw i terminow",
      "Bezpieczne dokumenty (E2E encryption)",
      "Czat z prawnikiem prowadzacym sprawe",
      "Faktury i platnosci online",
    ],
    workflow: [
      {
        step: 1,
        title: "Konfiguracja brandingu",
        description: "Wgrywasz logo, kolory, domene (np. panel.twojakancelaria.pl).",
      },
      {
        step: 2,
        title: "Zaproszenie klienta",
        description: "Klient otrzymuje link i loguje sie przez Profil Zaufany lub email + 2FA.",
      },
      {
        step: 3,
        title: "Synchronizacja sprawy",
        description: "Z systemu kancelaryjnego synchronizuja sie statusy, dokumenty i terminy.",
      },
      {
        step: 4,
        title: "Komunikacja na zadanie",
        description: "Klient pyta przez czat, prawnik odpowiada gdy chce. Wszystko zalogowane.",
      },
    ],
    cta: "Zamow demo white-label",
  },
};

const ICON_MAP = {
  scale: Scale,
  file: FileText,
  users: Users,
  lock: Lock,
};

type Params = Promise<{ slug: string }>;

export default async function FunkcjaKancelariiPage({ params }: { params: Params }) {
  const { slug } = await params;
  const feature = FEATURES[slug] ?? FEATURES["generator-pism"];
  if (!feature) notFound();

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dla-kancelarii"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do oferty dla kancelarii
          </Link>
        </div>

        <header className="mb-12">
          <Badge tone="info" className="mb-4">Dla kancelarii prawnych</Badge>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-3">{feature.name}</h1>
          <p className="text-xl text-dlugomat-700 max-w-3xl">{feature.tagline}</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {feature.highlights.map((h) => {
            const Icon = ICON_MAP[h.icon];
            return (
              <Card key={h.label} elevation="pop">
                <CardContent className="pt-6">
                  <Icon className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">{h.label}</div>
                  <div className="font-display text-2xl text-dlugomat-950">{h.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Czym jest {feature.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dlugomat-800 leading-relaxed">{feature.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Mozliwosci systemu</CardTitle>
              <CardDescription>Co dokladnie potrafi {feature.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feature.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-dlugomat-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jak wdrazamy</CardTitle>
              <CardDescription>Proces od pierwszej rozmowy do produkcji</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {feature.workflow.map((w) => (
                  <li key={w.step} className="flex gap-3">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-accent-100 text-accent-700 text-xs font-medium shrink-0">
                      {w.step}
                    </div>
                    <div>
                      <div className="font-medium text-dlugomat-950 text-sm">{w.title}</div>
                      <div className="text-sm text-dlugomat-700 mt-0.5">{w.description}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card elevation="pop">
          <CardContent className="pt-6 pb-6 text-center">
            <h2 className="font-display text-2xl text-dlugomat-950 mb-2">Sprawdz {feature.name} w Twojej kancelarii</h2>
            <p className="text-dlugomat-700 mb-6 max-w-2xl mx-auto">
              30 dni testowo za darmo. Bez karty, bez zobowiazan, z pelnym wsparciem wdrozeniowym.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" asChild>
                <Link href="/kontakt/demo">
                  {feature.cta}
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/cennik">Zobacz cennik</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
