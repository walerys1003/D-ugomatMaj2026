import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus, X } from "lucide-react";
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
  title: "Porownanie z konkurencja — Dlugomat",
  description:
    "Dlugomat vs prawnik na godzine vs gotowy wzor z internetu vs nic nie robic. Cztery realne opcje, jeden uczciwy przeglad.",
  alternates: { canonical: "/porownanie-konkurencja" },
};

type OptionKey = "dlugomat" | "lawyer" | "template" | "nothing";

interface Option {
  key: OptionKey;
  name: string;
  tagline: string;
  cost: string;
  time: string;
  highlight: boolean;
}

const OPTIONS: readonly Option[] = [
  { key: "dlugomat", name: "Dlugomat", tagline: "Diagnoza + pisma + workflow", cost: "0–249 zl / pismo", time: "15–60 min", highlight: true },
  { key: "lawyer", name: "Prawnik na godzine", tagline: "Pelna obsluga przez kancelarie", cost: "300–800 zl / h", time: "2–7 dni" , highlight: false },
  { key: "template", name: "Wzor z internetu", tagline: "Plik DOC + samodzielna edycja", cost: "0–30 zl", time: "3–8 h", highlight: false },
  { key: "nothing", name: "Nic nie robic", tagline: "Czekanie i nadzieja", cost: "0 zl", time: "0 h", highlight: false },
];

type Cell = boolean | "partial" | string;

interface Row {
  group: string;
  rows: ReadonlyArray<{ name: string; cells: Record<OptionKey, Cell> }>;
}

const MATRIX: readonly Row[] = [
  {
    group: "Analiza Twojej sytuacji",
    rows: [
      {
        name: "OCR i odczytanie pisma sadowego",
        cells: { dlugomat: true, lawyer: true, template: false, nothing: false },
      },
      {
        name: "Detekcja przedawnienia roszczenia",
        cells: { dlugomat: true, lawyer: true, template: false, nothing: false },
      },
      {
        name: "Wyliczenie terminow procesowych",
        cells: { dlugomat: true, lawyer: true, template: "partial", nothing: false },
      },
    ],
  },
  {
    group: "Tworzenie pisma",
    rows: [
      {
        name: "Spersonalizowane pod Twoja sprawe",
        cells: { dlugomat: true, lawyer: true, template: false, nothing: false },
      },
      {
        name: "Aktualna baza orzecznictwa",
        cells: { dlugomat: true, lawyer: "partial", template: false, nothing: false },
      },
      {
        name: "Sprawdzone przez prawnika",
        cells: { dlugomat: "Senior review pisma", lawyer: true, template: false, nothing: false },
      },
    ],
  },
  {
    group: "Czas i dostepnosc",
    rows: [
      {
        name: "Dostepne 24/7",
        cells: { dlugomat: true, lawyer: false, template: true, nothing: true },
      },
      {
        name: "Pismo gotowe w 60 min",
        cells: { dlugomat: true, lawyer: false, template: "partial", nothing: false },
      },
      {
        name: "Bez umowy i zaliczki",
        cells: { dlugomat: true, lawyer: false, template: true, nothing: true },
      },
    ],
  },
  {
    group: "Bezpieczenstwo",
    rows: [
      {
        name: "Pelna odpowiedzialnosc za blad",
        cells: { dlugomat: "ubezpieczenie", lawyer: true, template: false, nothing: false },
      },
      {
        name: "Slad audytowy operacji",
        cells: { dlugomat: true, lawyer: "partial", template: false, nothing: false },
      },
      {
        name: "Mozliwe konsekwencje przegranej",
        cells: { dlugomat: "minimalne", lawyer: "minimalne", template: "wysokie", nothing: "krytyczne" },
      },
    ],
  },
];

function renderCell(value: Cell): React.ReactNode {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Tak" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-red-500" aria-label="Nie" />;
  if (value === "partial") return <Minus className="mx-auto h-5 w-5 text-amber-500" aria-label="Czesciowo" />;
  return <span className="text-xs text-slate-700">{value}</span>;
}

export default function PorownanieKonkurencjaPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            Porownanie z konkurencja
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Cztery uczciwe opcje. Wybierz wlasciwa.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Nie udajemy, ze jestesmy jedynym wyborem. Pokazujemy, kiedy warto wziac prawnika,
            kiedy wystarczy wzor, a kiedy potrzebujesz Dlugomatu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {OPTIONS.map((o) => (
            <Card
              key={o.key}
              elevation={o.highlight ? "pop" : "subtle"}
              urgency={o.highlight ? "success" : "none"}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{o.name}</CardTitle>
                  {o.highlight && <Badge tone="success" withDot>Polecane</Badge>}
                </div>
                <CardDescription>{o.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Koszt</dt>
                    <dd className="font-mono text-slate-900">{o.cost}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Czas</dt>
                    <dd className="font-mono text-slate-900">{o.time}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Funkcja</th>
                {OPTIONS.map((o) => (
                  <th key={o.key} className="px-4 py-3 text-center font-medium text-slate-700">
                    {o.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((group) => (
                <React.Fragment key={group.group}>
                  <tr className="bg-slate-100">
                    <td colSpan={5} className="px-4 py-2 font-display text-sm text-slate-700">
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((r) => (
                    <tr key={r.name} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-900">{r.name}</td>
                      {OPTIONS.map((o) => (
                        <td key={o.key} className="px-4 py-3 text-center align-middle">
                          {renderCell(r.cells[o.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">
            Kiedy warto wziac prawnika, a kiedy Dlugomat?
          </h2>
          <p className="mt-2 text-slate-600">
            Sprawy do 10 000 zl i typowe wzorce (EPU, BIK, komornik) — Dlugomat.
            Spory powyzej 50 000 zl, postepowania karne, skomplikowane sprawy gospodarcze — prawnik.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/skaner-nakazu">
                Skanuj swoje pismo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/kontakt">Porozmawiajmy</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
