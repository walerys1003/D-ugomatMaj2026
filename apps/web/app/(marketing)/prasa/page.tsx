import * as React from "react";
import Link from "next/link";
import { Newspaper, Download, Mail, ExternalLink, Calendar, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Prasa i media - Dlugomat",
  description: "Centrum prasowe Dlugomat - komunikaty, materialy do pobrania, kontakt dla mediow.",
};

type PressRelease = {
  id: string;
  date: string;
  category: "produkt" | "finansowe" | "partnerstwo" | "branzowe";
  title: string;
  excerpt: string;
  url: string;
};

type MediaCoverage = {
  id: string;
  date: string;
  outlet: string;
  title: string;
  url: string;
  type: "artykul" | "wywiad" | "raport" | "wzmianka";
};

const RELEASES: PressRelease[] = [
  {
    id: "pr-001",
    date: "2026-05-08",
    category: "produkt",
    title: "Dlugomat wprowadza generator pism procesowych nowej generacji",
    excerpt:
      "Polski legaltech udostepnia model AI specjalizowany w KC, KPC i KSCU. Pisma procesowe powstaja w 8 minut zamiast 3 godzin.",
    url: "/prasa/2026-05-08-generator-v3",
  },
  {
    id: "pr-002",
    date: "2026-04-22",
    category: "finansowe",
    title: "Dlugomat zamyka runde A o wartosci 32 mln PLN",
    excerpt:
      "Srodki posluza ekspansji na rynki CEE oraz rozwojowi modulu compliance dla bankow. Lead inwestor: SpeedUp Group.",
    url: "/prasa/2026-04-22-runda-a",
  },
  {
    id: "pr-003",
    date: "2026-03-15",
    category: "partnerstwo",
    title: "Dlugomat i KPMG Polska ogloszenie strategicznej wspolpracy",
    excerpt:
      "Wspolne wdrozenia w bankach i firmach windykacyjnych, audyty compliance i ekspansja na Czechy oraz Slowacje.",
    url: "/prasa/2026-03-15-kpmg",
  },
  {
    id: "pr-004",
    date: "2026-02-04",
    category: "branzowe",
    title: "Dlugomat publikuje raport o stanie legaltech w Polsce 2026",
    excerpt:
      "Badanie 340 kancelarii pokazuje wzrost adopcji AI o 240% rok do roku. Pelny raport dostepny do pobrania.",
    url: "/prasa/2026-02-04-raport-legaltech",
  },
  {
    id: "pr-005",
    date: "2026-01-12",
    category: "produkt",
    title: "Panel klienta white-label dla kancelarii - oficjalna premiera",
    excerpt:
      "Kancelarie moga oferowac klientom dedykowany panel pod wlasna marka. Pierwsze 340 podpisalo umowy w ciagu miesiaca.",
    url: "/prasa/2026-01-12-white-label",
  },
];

const COVERAGE: MediaCoverage[] = [
  {
    id: "mc-001",
    date: "2026-05-04",
    outlet: "Rzeczpospolita",
    title: "Sztuczna inteligencja zmienia polski rynek legaltech",
    url: "https://example.com",
    type: "artykul",
  },
  {
    id: "mc-002",
    date: "2026-04-25",
    outlet: "Business Insider Polska",
    title: "Dlugomat wsrod 10 najbardziej obiecujacych startupow 2026",
    url: "https://example.com",
    type: "raport",
  },
  {
    id: "mc-003",
    date: "2026-04-10",
    outlet: "Puls Biznesu",
    title: "Wywiad z CEO Dlugomat: Polska bedzie liderem legaltech w CEE",
    url: "https://example.com",
    type: "wywiad",
  },
  {
    id: "mc-004",
    date: "2026-03-22",
    outlet: "Forbes Polska",
    title: "Jak AI ratuje polskich konsumentow przed dlugami",
    url: "https://example.com",
    type: "artykul",
  },
  {
    id: "mc-005",
    date: "2026-03-08",
    outlet: "TVN24 BiS",
    title: "Wywiad telewizyjny - automatyzacja windykacji",
    url: "https://example.com",
    type: "wywiad",
  },
];

const ASSETS = [
  { name: "Logo Dlugomat - paczka SVG/PNG", size: "8.4 MB", format: "ZIP" },
  { name: "Wizerunki zarzadu - hi-res", size: "24.2 MB", format: "ZIP" },
  { name: "Brand guide - PDF 32 strony", size: "12.1 MB", format: "PDF" },
  { name: "Zrzuty produktowe - hi-res", size: "56.8 MB", format: "ZIP" },
];

const CATEGORY_LABEL = {
  produkt: "Produkt",
  finansowe: "Finansowe",
  partnerstwo: "Partnerstwo",
  branzowe: "Branzowe",
};

const CATEGORY_TONE = {
  produkt: "info" as const,
  finansowe: "success" as const,
  partnerstwo: "warning" as const,
  branzowe: "neutral" as const,
};

const TYPE_LABEL = {
  artykul: "Artykul",
  wywiad: "Wywiad",
  raport: "Raport",
  wzmianka: "Wzmianka",
};

export default function PrasaPage() {
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <section className="bg-white border-b border-iron-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge tone="info" className="mb-4">Centrum prasowe</Badge>
            <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-4">
              Prasa, media i komunikacja
            </h1>
            <p className="text-xl text-dlugomat-700">
              Aktualne komunikaty prasowe, materialy do pobrania i kontakt do zespolu komunikacji. Odpowiadamy
              dziennikarzom w ciagu 4 godzin roboczych.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" asChild>
                <Link href="mailto:media@dlugomat.pl">
                  <Mail className="h-4 w-4 mr-2" aria-hidden />
                  media@dlugomat.pl
                </Link>
              </Button>
              <Button variant="secondary">
                <Download className="h-4 w-4 mr-2" aria-hidden />
                Pelny press kit
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-dlugomat-950 mb-6">Najnowsze komunikaty prasowe</h2>
          <div className="space-y-4 mb-8">
            {RELEASES.map((r) => (
              <Card key={r.id} elevation="subtle">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={CATEGORY_TONE[r.category]}>{CATEGORY_LABEL[r.category]}</Badge>
                      <span className="text-xs text-dlugomat-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden />
                        {dateFmt.format(new Date(r.date))}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-dlugomat-950 mb-2">{r.title}</h3>
                  <p className="text-dlugomat-700 mb-4">{r.excerpt}</p>
                  <Link
                    href={r.url}
                    className="inline-flex items-center gap-1 text-sm text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                  >
                    Czytaj pelny komunikat
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-iron-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-dlugomat-950 mb-6">Dlugomat w mediach</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-dlugomat-600 border-b border-iron-200">
                      <th className="py-3 pr-3">Data</th>
                      <th className="py-3 pr-3">Medium</th>
                      <th className="py-3 pr-3">Tytul</th>
                      <th className="py-3 pr-3">Typ</th>
                      <th className="py-3">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COVERAGE.map((m) => (
                      <tr key={m.id} className="border-b border-iron-100 last:border-0 hover:bg-dlugomat-50">
                        <td className="py-3 pr-3 text-dlugomat-700 text-xs">{dateFmt.format(new Date(m.date))}</td>
                        <td className="py-3 pr-3 font-medium text-dlugomat-950">{m.outlet}</td>
                        <td className="py-3 pr-3 text-dlugomat-800">{m.title}</td>
                        <td className="py-3 pr-3">
                          <Badge tone="neutral">{TYPE_LABEL[m.type]}</Badge>
                        </td>
                        <td className="py-3">
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-accent-700 hover:text-accent-900 focus-visible:shadow-shield-focus rounded"
                            aria-label={`Otworz artykul: ${m.title}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            Otworz
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-dlugomat-950 mb-6">Materialy do pobrania</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ASSETS.map((a) => (
              <Card key={a.name}>
                <CardContent className="pt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-accent-50 text-accent-700">
                      <ImageIcon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <div className="font-medium text-dlugomat-950">{a.name}</div>
                      <div className="text-xs text-dlugomat-600">
                        {a.format} - {a.size}
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    Pobierz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card elevation="pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-accent-600" aria-hidden />
                Kontakt dla mediow
              </CardTitle>
              <CardDescription>Odpowiadamy w ciagu 4 godzin roboczych</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">PR Manager</div>
                  <div className="font-medium text-dlugomat-950">Anna Lewandowska</div>
                  <a
                    href="mailto:media@dlugomat.pl"
                    className="text-sm text-accent-700 hover:text-accent-900 focus-visible:shadow-shield-focus rounded"
                  >
                    media@dlugomat.pl
                  </a>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Telefon (24/7 dla mediow)</div>
                  <div className="font-medium text-dlugomat-950">+48 22 123 45 67</div>
                  <div className="text-xs text-dlugomat-600 mt-0.5">wew. 100</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
