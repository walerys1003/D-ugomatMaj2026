import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Globe, Handshake, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Partner - Dlugomat",
  description: "Szczegoly partnerstwa - korzysci, model wspolpracy, case study.",
};

type Partner = {
  slug: string;
  name: string;
  category: "technology" | "law" | "banking" | "consulting";
  tagline: string;
  description: string;
  since: string;
  region: string;
  metrics: { label: string; value: string }[];
  integration: { title: string; items: string[] };
  benefits: string[];
  caseStudyExcerpt: string;
  website: string;
};

const PARTNERS: Record<string, Partner> = {
  "kpmg-polska": {
    slug: "kpmg-polska",
    name: "KPMG Polska",
    category: "consulting",
    tagline: "Strategiczny partner doradczy w obszarze compliance i risk",
    description:
      "KPMG Polska wspolpracuje z Dlugomat w zakresie audytu compliance, doradztwa regulacyjnego dla klientow bankowych oraz wdrozen na rynkach CEE. Wspolnie obslugujemy 12 instytucji finansowych.",
    since: "2024-09",
    region: "Polska, CEE",
    metrics: [
      { label: "Wspolnych klientow", value: "12" },
      { label: "Wdrozen rocznie", value: "8" },
      { label: "Rynki", value: "PL, CZ, SK" },
    ],
    integration: {
      title: "Wspolne uslugi",
      items: [
        "Audyt zgodnosci RODO/AML dla bankow korzystajacych z Dlugomat",
        "Risk assessment przed wdrozeniem platformy",
        "Doradztwo regulacyjne KNF i UOKiK",
        "Optymalizacja procesow windykacyjnych",
      ],
    },
    benefits: [
      "Dostep do sieci ekspertow w 8 krajach CEE",
      "Wspolne raporty branzowe i benchmarki",
      "Preferencyjne warunki dla wspolnych klientow",
    ],
    caseStudyExcerpt:
      "Wspolne wdrozenie w jednym z bankow regionalnych pozwolilo skrocic czas obslugi reklamacji konsumenckich o 74% przy zachowaniu pelnej zgodnosci regulacyjnej.",
    website: "https://kpmg.com/pl",
  },
};

const CATEGORY_LABEL = {
  technology: "Technologia",
  law: "Prawo",
  banking: "Bankowosc",
  consulting: "Doradztwo",
};

const CATEGORY_TONE = {
  technology: "info" as const,
  law: "success" as const,
  banking: "warning" as const,
  consulting: "neutral" as const,
};

type Params = Promise<{ slug: string }>;

export default async function PartnerSzczegolyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const partner = PARTNERS[slug] ?? PARTNERS["kpmg-polska"];
  if (!partner) notFound();

  const sinceDate = new Date(partner.since + "-01");
  const sinceFmt = new Intl.DateTimeFormat("pl-PL", { year: "numeric", month: "long" }).format(sinceDate);

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/partnerzy"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do partnerow
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge tone={CATEGORY_TONE[partner.category]}>{CATEGORY_LABEL[partner.category]}</Badge>
            <Badge tone="neutral">Partner od {sinceFmt}</Badge>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-3">{partner.name}</h1>
          <p className="text-xl text-dlugomat-700 max-w-3xl">{partner.tagline}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {partner.metrics.map((m) => (
            <Card key={m.label} elevation="pop">
              <CardContent className="pt-6">
                <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">{m.label}</div>
                <div className="font-display text-3xl text-accent-700">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>O partnerstwie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dlugomat-800 leading-relaxed">{partner.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-accent-600" aria-hidden />
                  {partner.integration.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {partner.integration.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-dlugomat-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation="subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent-600" aria-hidden />
                  Fragment case study
                </CardTitle>
                <CardDescription>Efekt wspolpracy w liczbach</CardDescription>
              </CardHeader>
              <CardContent>
                <blockquote className="text-dlugomat-800 leading-relaxed border-l-4 border-accent-500 pl-4 italic">
                  {partner.caseStudyExcerpt}
                </blockquote>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-accent-600" aria-hidden />
                  Podstawowe informacje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600">Region</div>
                  <div className="font-medium text-dlugomat-950">{partner.region}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600">Wspolpraca od</div>
                  <div className="font-medium text-dlugomat-950 capitalize">{sinceFmt}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600">Strona partnera</div>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-700 hover:text-accent-900 font-medium inline-flex items-center gap-1 focus-visible:shadow-shield-focus rounded"
                  >
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    {partner.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Korzysci dla klientow</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {partner.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-dlugomat-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation="pop">
              <CardContent className="pt-6">
                <p className="text-sm text-dlugomat-800 mb-4">
                  Zainteresowany wspolprac a w modelu podobnym do {partner.name}?
                </p>
                <Button variant="primary" block asChild>
                  <Link href="/kontakt/demo">
                    Porozmawiajmy
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
