import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle2,
  FileText,
  Calendar,
  Globe,
  Lock,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Bezpieczenstwo - certyfikat - Dlugomat",
  description: "Szczegoly certyfikatow bezpieczenstwa, audytow i standardow stosowanych w platformie Dlugomat.",
};

type Standard = {
  slug: string;
  name: string;
  category: "iso" | "soc" | "regulation" | "industry";
  tagline: string;
  description: string;
  scope: string[];
  validFrom: string;
  validTo: string;
  auditor: string;
  controls: { id: string; label: string; description: string }[];
  reports: { id: string; name: string; date: string; pages: number }[];
};

const STANDARDS: Record<string, Standard> = {
  "iso-27001": {
    slug: "iso-27001",
    name: "ISO/IEC 27001:2022",
    category: "iso",
    tagline: "System zarzadzania bezpieczenstwem informacji (ISMS)",
    description:
      "Dlugomat posiada certyfikat ISO/IEC 27001:2022 w wersji zaktualizowanej. Certyfikat potwierdza spelnienie 93 mechanizmow kontroli z zalacznika A i pelne wdrozenie procesow zarzadzania ryzykiem informacyjnym.",
    scope: [
      "Wszystkie systemy produkcyjne platformy Dlugomat",
      "Procesy przetwarzania danych osobowych klientow",
      "Infrastruktura chmurowa w regionie eu-central-1",
      "Procesy developmentu, deploymentu i wsparcia",
    ],
    validFrom: "2025-03-15",
    validTo: "2028-03-14",
    auditor: "Bureau Veritas Certification Poland",
    controls: [
      {
        id: "A.5",
        label: "Polityki bezpieczenstwa",
        description: "Polityka glowna i polityki specjalistyczne (krypto, dostep, ciaglosc dzialania).",
      },
      {
        id: "A.8",
        label: "Aktywa i klasyfikacja",
        description: "Inwentaryzacja aktywow, etykietowanie, klasyfikacja informacji wedlug poufnosci.",
      },
      {
        id: "A.9",
        label: "Kontrola dostepu",
        description: "Zasada najmniejszych uprawnien, MFA wymagane, segregacja obowiazkow.",
      },
      {
        id: "A.10",
        label: "Kryptografia",
        description: "TLS 1.3 w tranzycie, AES-256 w spoczynku, KMS z rotacja kluczy co 90 dni.",
      },
      {
        id: "A.12",
        label: "Operacje IT",
        description: "Procedury zmian, monitoring, kopie zapasowe, testy odtworzeniowe co kwartal.",
      },
      {
        id: "A.16",
        label: "Zarzadzanie incydentami",
        description: "Procedura reakcji 24/7, SLA reakcji na incydenty krytyczne ponizej 15 minut.",
      },
    ],
    reports: [
      { id: "iso-2025-03", name: "Certyfikat ISO 27001:2022 - oryginal.pdf", date: "2025-03-15", pages: 4 },
      { id: "iso-2025-09", name: "Audyt podtrzymujacy 2025 H2.pdf", date: "2025-09-22", pages: 18 },
      { id: "iso-2026-03", name: "Audyt podtrzymujacy 2026 H1.pdf", date: "2026-03-18", pages: 24 },
    ],
  },
};

const CATEGORY_LABEL = {
  iso: "Standard ISO",
  soc: "SOC",
  regulation: "Regulacja",
  industry: "Branzowy",
};

const CATEGORY_TONE = {
  iso: "success" as const,
  soc: "info" as const,
  regulation: "warning" as const,
  industry: "neutral" as const,
};

type Params = Promise<{ slug: string }>;

export default async function BezpieczenstwoSzczegolyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const std = STANDARDS[slug] ?? STANDARDS["iso-27001"];
  if (!std) notFound();

  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/bezpieczenstwo"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do bezpieczenstwa
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-6 w-6 text-accent-600" aria-hidden />
            <Badge tone={CATEGORY_TONE[std.category]}>{CATEGORY_LABEL[std.category]}</Badge>
            <Badge tone="success" withDot>
              Aktywny
            </Badge>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-3">{std.name}</h1>
          <p className="text-xl text-dlugomat-700 max-w-3xl">{std.tagline}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          <Card elevation="pop">
            <CardContent className="pt-6">
              <Calendar className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wazny od</div>
              <div className="font-display text-xl text-dlugomat-950">{dateFmt.format(new Date(std.validFrom))}</div>
            </CardContent>
          </Card>
          <Card elevation="pop">
            <CardContent className="pt-6">
              <Calendar className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wazny do</div>
              <div className="font-display text-xl text-dlugomat-950">{dateFmt.format(new Date(std.validTo))}</div>
            </CardContent>
          </Card>
          <Card elevation="pop">
            <CardContent className="pt-6">
              <Globe className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Audytor</div>
              <div className="text-sm font-medium text-dlugomat-950">{std.auditor}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>O standardzie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dlugomat-800 leading-relaxed">{std.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent-600" aria-hidden />
                  Kluczowe mechanizmy kontroli
                </CardTitle>
                <CardDescription>{std.controls.length} z {std.category === "iso" ? "93" : "wszystkich"} mechanizmow</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {std.controls.map((c) => (
                    <li key={c.id} className="flex items-start gap-3 p-3 rounded-md border border-iron-200 bg-white">
                      <Badge tone="neutral" className="shrink-0">
                        {c.id}
                      </Badge>
                      <div>
                        <div className="font-medium text-dlugomat-950 text-sm">{c.label}</div>
                        <div className="text-sm text-dlugomat-700 mt-0.5">{c.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent-600" aria-hidden />
                  Zakres certyfikatu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {std.scope.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-dlugomat-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent-600" aria-hidden />
                  Dokumenty
                </CardTitle>
                <CardDescription>Certyfikaty i raporty audytowe</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {std.reports.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-md border border-iron-200 bg-white"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-dlugomat-950 truncate">{r.name}</div>
                        <div className="text-xs text-dlugomat-600">
                          {dateFmt.format(new Date(r.date))} - {r.pages} stron
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        PDF
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation="pop">
              <CardContent className="pt-6">
                <p className="text-sm text-dlugomat-800 mb-4">
                  Potrzebujesz dodatkowych dokumentow lub odpowiedzi na pytania bezpieczenstwa? Nasz zespol security jest do dyspozycji.
                </p>
                <Button variant="primary" block asChild>
                  <Link href="/kontakt/security">
                    Kontakt do security
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
