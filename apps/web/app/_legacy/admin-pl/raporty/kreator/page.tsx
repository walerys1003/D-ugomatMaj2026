import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Calendar, Filter, Save, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Raporty — kreator",
  robots: { index: false, follow: false },
};

interface DataSource {
  key: string;
  label: string;
  description: string;
  rows: number;
}

const SOURCES: ReadonlyArray<DataSource> = [
  { key: "cases", label: "Sprawy", description: "Wszystkie sprawy klientow, statusy, SLA, kwoty.", rows: 12480 },
  { key: "users", label: "Uzytkownicy", description: "Aktywnosc, ostatnie logowanie, role.", rows: 18920 },
  { key: "payments", label: "Platnosci", description: "Transakcje, faktury, zwroty, MRR.", rows: 46210 },
  { key: "documents", label: "Dokumenty", description: "Pisma, skany, archiwum.", rows: 78400 },
];

interface Dimension {
  key: string;
  label: string;
  source: string;
}

const DIMENSIONS: ReadonlyArray<Dimension> = [
  { key: "date", label: "Data utworzenia", source: "cases" },
  { key: "status", label: "Status", source: "cases" },
  { key: "case_type", label: "Typ sprawy", source: "cases" },
  { key: "lawyer", label: "Prawnik", source: "cases" },
  { key: "plan", label: "Plan", source: "users" },
  { key: "country", label: "Kraj", source: "users" },
];

interface Measure {
  key: string;
  label: string;
  agg: "count" | "sum" | "avg" | "min" | "max";
}

const MEASURES: ReadonlyArray<Measure> = [
  { key: "case_count", label: "Liczba spraw", agg: "count" },
  { key: "amount_sum", label: "Suma kwot", agg: "sum" },
  { key: "amount_avg", label: "Srednia kwota", agg: "avg" },
  { key: "sla_hours_avg", label: "Sredni SLA (h)", agg: "avg" },
  { key: "mrr_sum", label: "MRR (suma)", agg: "sum" },
];

interface SavedReport {
  id: string;
  name: string;
  source: string;
  schedule: string;
  last_run: string;
}

const SAVED: ReadonlyArray<SavedReport> = [
  { id: "r1", name: "Sprawy zamkniete miesiecznie", source: "cases", schedule: "Miesiecznie", last_run: "2026-05-01 06:00" },
  { id: "r2", name: "MRR po planach", source: "payments", schedule: "Tygodniowo", last_run: "2026-05-08 06:00" },
  { id: "r3", name: "Aktywnosc prawnikow", source: "users", schedule: "Codziennie", last_run: "2026-05-11 06:00" },
];

export default function KreatorRaportowPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu admin
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin · Raporty</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <FileSpreadsheet className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Kreator raportow
        </h1>
        <p className="mt-1 text-sm text-iron-600">
          Wybierz zrodlo, wymiary i miary. Zaplanuj wysylke automatyczna.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dlugomat-900 text-xs text-white">1</span>
                Zrodlo danych
              </CardTitle>
              <CardDescription>Wybierz tabele bazowa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {SOURCES.map((s, idx) => (
                  <label
                    key={s.key}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-iron-200 p-3 has-[:checked]:border-dlugomat-700 has-[:checked]:bg-dlugomat-50/50"
                  >
                    <input
                      type="radio"
                      name="source"
                      defaultChecked={idx === 0}
                      className="mt-1 h-4 w-4 text-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                    />
                    <div>
                      <p className="text-sm font-medium text-dlugomat-900">{s.label}</p>
                      <p className="mt-0.5 text-xs text-iron-500">{s.description}</p>
                      <p className="mt-1 font-mono text-[10px] text-iron-400">{s.rows.toLocaleString("pl-PL")} wierszy</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dlugomat-900 text-xs text-white">2</span>
                Wymiary (group by)
              </CardTitle>
              <CardDescription>Zaznacz kolumny, po ktorych grupujesz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {DIMENSIONS.map((d, idx) => (
                  <label
                    key={d.key}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-iron-200 p-2 has-[:checked]:border-dlugomat-700 has-[:checked]:bg-dlugomat-50/50"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={idx < 2}
                      className="h-4 w-4 text-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm text-dlugomat-900">{d.label}</span>
                      <Badge tone="neutral">{d.source}</Badge>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dlugomat-900 text-xs text-white">3</span>
                Miary (aggregations)
              </CardTitle>
              <CardDescription>Co liczymy dla kazdej grupy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEASURES.map((m, idx) => (
                  <label
                    key={m.key}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-iron-200 p-2 has-[:checked]:border-dlugomat-700 has-[:checked]:bg-dlugomat-50/50"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={idx < 2}
                      className="h-4 w-4 text-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm text-dlugomat-900">{m.label}</span>
                      <Badge tone="info">{m.agg.toUpperCase()}</Badge>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dlugomat-900 text-xs text-white">4</span>
                Filtry i okres
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-iron-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden />
                  Od
                </span>
                <input
                  type="date"
                  defaultValue="2026-01-01"
                  className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-iron-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden />
                  Do
                </span>
                <input
                  type="date"
                  defaultValue="2026-05-11"
                  className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="text-iron-700 flex items-center gap-1">
                  <Filter className="h-3 w-3" aria-hidden />
                  Filtr SQL (opcjonalny)
                </span>
                <input
                  type="text"
                  placeholder="status = 'closed' AND amount > 1000"
                  className="h-10 rounded-md border border-iron-200 px-3 font-mono text-xs focus-visible:outline-none focus-visible:shadow-shield-focus"
                />
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="secondary">
              <Save className="mr-2 h-4 w-4" aria-hidden />
              Zapisz definicje
            </Button>
            <Button variant="primary">
              <Play className="mr-2 h-4 w-4" aria-hidden />
              Uruchom raport
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zapisane raporty</CardTitle>
            <CardDescription>{SAVED.length} szablonow</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-iron-100">
              {SAVED.map((r) => (
                <li key={r.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-dlugomat-900">{r.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone="neutral">{r.source}</Badge>
                    <Badge tone="info">{r.schedule}</Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-iron-500">Ostatni: {r.last_run}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
