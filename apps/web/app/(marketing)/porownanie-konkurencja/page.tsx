import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Porownanie z konkurencja — Dlugomat",
  description:
    "Czym rozni sie Dlugomat od KancApp, LexLink i innych narzedzi prawnych w Polsce. Twarde fakty, bez marketingu.",
  alternates: { canonical: "/porownanie-konkurencja" },
};

type CompKey = "dlugomat" | "kancapp" | "lexlink" | "diy";

interface Competitor {
  key: CompKey;
  name: string;
  tagline: string;
  highlight: boolean;
}

const COMPETITORS: ReadonlyArray<Competitor> = [
  { key: "dlugomat", name: "Dlugomat", tagline: "Polski legaltech 2025", highlight: true },
  { key: "kancapp", name: "KancApp", tagline: "Software dla kancelarii", highlight: false },
  { key: "lexlink", name: "LexLink", tagline: "Platforma prawna PL", highlight: false },
  { key: "diy", name: "Excel + Word", tagline: "Tradycyjna praca", highlight: false },
];

type Cell = "yes" | "no" | "limited" | string;

interface ComparisonRow {
  group: string;
  rows: ReadonlyArray<{ feature: string; cells: Record<CompKey, Cell> }>;
}

const MATRIX: ReadonlyArray<ComparisonRow> = [
  {
    group: "Analiza dokumentow",
    rows: [
      { feature: "Skaner nakazu zaplaty (OCR + AI)", cells: { dlugomat: "yes", kancapp: "limited", lexlink: "no", diy: "no" } },
      { feature: "Detekcja przedawnienia automatyczna", cells: { dlugomat: "yes", kancapp: "no", lexlink: "no", diy: "no" } },
      { feature: "Liczenie terminow procesowych", cells: { dlugomat: "yes", kancapp: "yes", lexlink: "limited", diy: "no" } },
    ],
  },
  {
    group: "Generowanie pism",
    rows: [
      { feature: "Wzory zgodne z aktualnym KPC", cells: { dlugomat: "yes", kancapp: "yes", lexlink: "yes", diy: "limited" } },
      { feature: "Personalizacja AI", cells: { dlugomat: "yes", kancapp: "no", lexlink: "limited", diy: "no" } },
      { feature: "Eksport do PDF/Word", cells: { dlugomat: "yes", kancapp: "yes", lexlink: "yes", diy: "yes" } },
    ],
  },
  {
    group: "Cennik",
    rows: [
      { feature: "Plan darmowy", cells: { dlugomat: "yes", kancapp: "no", lexlink: "no", diy: "yes" } },
      { feature: "Bez abonamentu (pay-per-use)", cells: { dlugomat: "yes", kancapp: "no", lexlink: "no", diy: "yes" } },
      { feature: "Plan B2B od (PLN/m-c)", cells: { dlugomat: "1290", kancapp: "2400", lexlink: "1890", diy: "0" } },
    ],
  },
  {
    group: "Bezpieczenstwo",
    rows: [
      { feature: "ISO 27001", cells: { dlugomat: "yes", kancapp: "no", lexlink: "yes", diy: "no" } },
      { feature: "Polskie centra danych", cells: { dlugomat: "yes", kancapp: "yes", lexlink: "no", diy: "limited" } },
      { feature: "SSO (Okta, Azure AD)", cells: { dlugomat: "yes", kancapp: "limited", lexlink: "yes", diy: "no" } },
    ],
  },
  {
    group: "Wsparcie",
    rows: [
      { feature: "Polskojezyczny support", cells: { dlugomat: "yes", kancapp: "yes", lexlink: "yes", diy: "no" } },
      { feature: "SLA 24h email", cells: { dlugomat: "yes", kancapp: "limited", lexlink: "yes", diy: "no" } },
      { feature: "Wsparcie prawne (prawnik dyzurny)", cells: { dlugomat: "yes", kancapp: "no", lexlink: "no", diy: "no" } },
    ],
  },
];

function renderCell(value: Cell, isFlagship: boolean): React.ReactNode {
  if (value === "yes") {
    return <Check className={`mx-auto h-5 w-5 ${isFlagship ? "text-accent-700" : "text-emerald-600"}`} aria-label="Tak" />;
  }
  if (value === "no") {
    return <X className="mx-auto h-5 w-5 text-iron-300" aria-label="Nie" />;
  }
  if (value === "limited") {
    return <Minus className="mx-auto h-5 w-5 text-warn" aria-label="Ograniczone" />;
  }
  return <span className={`text-sm font-mono ${isFlagship ? "text-accent-700" : "text-dlugomat-900"}`}>{value} zl</span>;
}

export default function PorownanieKonkurencjaPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">Porownanie z konkurencja</Badge>
          <h1 className="font-display text-4xl tracking-tight text-dlugomat-950 sm:text-5xl">
            Czym Dlugomat rozni sie od innych.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-iron-600">
            Bez gwiazdek i bez wybielania. Cztery rozwiazania zestawione w jednej tabeli.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {COMPETITORS.map((c) => (
            <Card key={c.key} elevation={c.highlight ? "pop" : "subtle"} urgency={c.highlight ? "success" : "none"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{c.name}</CardTitle>
                  {c.highlight && <Badge tone="success" withDot>To my</Badge>}
                </div>
                <CardDescription>{c.tagline}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-x-auto rounded-lg border border-iron-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-iron-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-iron-700">Funkcja</th>
                {COMPETITORS.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-center font-medium ${c.highlight ? "bg-dlugomat-50 text-dlugomat-950" : "text-iron-700"}`}
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((group) => (
                <React.Fragment key={group.group}>
                  <tr className="bg-iron-100">
                    <td colSpan={5} className="px-4 py-2 font-display text-sm text-iron-700">
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature} className="border-t border-iron-100">
                      <td className="px-4 py-3 text-dlugomat-900">{row.feature}</td>
                      {COMPETITORS.map((c) => (
                        <td
                          key={c.key}
                          className={`px-4 py-3 text-center align-middle ${c.highlight ? "bg-dlugomat-50/40" : ""}`}
                        >
                          {renderCell(row.cells[c.key], c.highlight)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded-lg border border-iron-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-dlugomat-950">
            Sprawdz Dlugomat na swojej pierwszej sprawie
          </h2>
          <p className="mt-2 text-iron-600">Pierwszy skan i jedno pismo gratis. Bez karty.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/rejestracja">
                Zaczynam
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/cennik/porownanie">Zobacz pelny cennik</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
