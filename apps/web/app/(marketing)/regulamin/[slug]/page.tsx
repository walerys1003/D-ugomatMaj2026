import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Calendar, ChevronRight, Download, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Regulamin - szczegoly - Dlugomat",
  description: "Pelna tresc poszczegolnych sekcji regulaminu platformy Dlugomat.",
};

type RegulationSection = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: { number: string; title: string; text: string }[];
  relatedSlugs: { slug: string; title: string }[];
  effectiveFrom: string;
  history: { version: string; date: string; change: string }[];
};

const SECTIONS: Record<string, RegulationSection> = {
  "uslugi-platnosci": {
    slug: "uslugi-platnosci",
    number: "Rozdzial V",
    title: "Uslugi platnosci i rozliczenia",
    summary:
      "Sekcja okresla zasady rozliczen pomiedzy uzytkownikiem a platforma Dlugomat, metody platnosci, terminy oraz polityke zwrotow.",
    paragraphs: [
      {
        number: "Par. 21",
        title: "Akceptowane metody platnosci",
        text:
          "Platforma akceptuje platnosci karta (Visa, Mastercard), BLIK, przelewy ekspresowe oraz autoryzacje SEPA. Wszystkie transakcje sa szyfrowane zgodnie ze standardem PCI DSS 4.0 i wymagaja autoryzacji 3D-Secure dla kart platniczych.",
      },
      {
        number: "Par. 22",
        title: "Terminy platnosci",
        text:
          "Faktury za uslugi subskrypcyjne sa wystawiane na poczatku okresu rozliczeniowego z terminem platnosci 14 dni. W przypadku ugod miedzy stronami terminy wynikaja z indywidualnego harmonogramu zatwierdzonego elektronicznie.",
      },
      {
        number: "Par. 23",
        title: "Polityka zwrotow",
        text:
          "Konsumentowi przysluguje prawo odstapienia od umowy w terminie 14 dni od jej zawarcia bez podawania przyczyny, z wyjatkiem uslug w pelni zrealizowanych po wyraznej zgodzie uzytkownika. Zwrot kwoty nastepuje w terminie 14 dni od otrzymania oswiadczenia.",
      },
      {
        number: "Par. 24",
        title: "Wystawianie faktur",
        text:
          "Dlugomat wystawia faktury VAT zgodnie z obowiazujacymi przepisami. Faktury sa udostepniane elektronicznie w panelu uzytkownika oraz wysylane na zweryfikowany adres email w formacie PDF z podpisem kwalifikowanym.",
      },
      {
        number: "Par. 25",
        title: "Opoznienia w platnosci",
        text:
          "W przypadku opoznienia w platnosci powyzej 14 dni, Dlugomat zastrzega sobie prawo do zawieszenia uslug po uprzednim wezwaniu uzytkownika. Odsetki ustawowe za opoznienie naliczane sa zgodnie z art. 481 KC.",
      },
    ],
    relatedSlugs: [
      { slug: "uslugi-podstawowe", title: "Rozdzial IV - Uslugi podstawowe" },
      { slug: "ochrona-danych", title: "Rozdzial VII - Ochrona danych osobowych" },
      { slug: "odpowiedzialnosc", title: "Rozdzial IX - Odpowiedzialnosc stron" },
    ],
    effectiveFrom: "2026-03-01",
    history: [
      { version: "2026.1", date: "2026-03-01", change: "Aktualizacja par. 22 - skrocenie terminu z 21 do 14 dni" },
      { version: "2025.4", date: "2025-09-15", change: "Dodanie par. 25 o opoznieniach w platnosci" },
      { version: "2025.2", date: "2025-05-20", change: "Rozszerzenie akceptowanych metod o BLIK i SEPA" },
    ],
  },
};

type Params = Promise<{ slug: string }>;

export default async function RegulaminSekcjaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const section = SECTIONS[slug] ?? SECTIONS["uslugi-platnosci"];
  if (!section) notFound();

  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/regulamin"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do regulaminu
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-6 w-6 text-accent-600" aria-hidden />
            <Badge tone="neutral">{section.number}</Badge>
            <Badge tone="success" withDot>
              Aktualny
            </Badge>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-dlugomat-950 mb-3">{section.title}</h1>
          <p className="text-lg text-dlugomat-700 max-w-3xl">{section.summary}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-dlugomat-600">
            <Calendar className="h-4 w-4" aria-hidden />
            <span>Obowiazuje od {dateFmt.format(new Date(section.effectiveFrom))}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <nav aria-label="Spis paragrafow" className="lg:col-span-1 order-2 lg:order-1">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-base">Spis paragrafow</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {section.paragraphs.map((p) => (
                    <li key={p.number}>
                      <a
                        href={`#${p.number.replace(/\s+/g, "-").toLowerCase()}`}
                        className="block py-1 text-dlugomat-700 hover:text-dlugomat-950 focus-visible:shadow-shield-focus rounded"
                      >
                        <span className="font-medium">{p.number}</span> - {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </nav>

          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {section.paragraphs.map((p) => (
              <Card key={p.number} id={p.number.replace(/\s+/g, "-").toLowerCase()}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-accent-600 font-mono text-sm">{p.number}</span>
                    {p.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dlugomat-800 leading-relaxed">{p.text}</p>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4 text-accent-600" aria-hidden />
                  Historia zmian
                </CardTitle>
                <CardDescription>{section.history.length} wersji</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {section.history.map((h) => (
                    <li key={h.version} className="flex items-start gap-3 text-sm">
                      <Badge tone="neutral" className="shrink-0">
                        {h.version}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-dlugomat-900">{h.change}</div>
                        <div className="text-xs text-dlugomat-600 mt-0.5">{dateFmt.format(new Date(h.date))}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Powiazane sekcje</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {section.relatedSlugs.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/regulamin/${r.slug}`}
                        className="flex items-center justify-between p-3 rounded-md border border-iron-200 bg-white hover:bg-dlugomat-50 focus-visible:shadow-shield-focus"
                      >
                        <span className="text-sm text-dlugomat-900">{r.title}</span>
                        <ChevronRight className="h-4 w-4 text-dlugomat-500" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation="pop">
              <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-dlugomat-950">Pelny regulamin PDF</p>
                  <p className="text-sm text-dlugomat-700">Pobierz cala tresc w jednym dokumencie</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary">
                    <Download className="h-4 w-4 mr-2" aria-hidden />
                    Pobierz PDF
                  </Button>
                  <Button variant="primary" asChild>
                    <Link href="/kontakt">
                      Pytania prawne
                      <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
