import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, FileText, Filter, ShieldCheck } from "lucide-react";

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
  title: "Masowa generacja pism · Admin · Długomat",
};

export default function MasowaGeneracjaPismPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Operacje masowe · Pisma
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Masowa generacja pism
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Wygeneruj pisma procesowe dla wybranego segmentu spraw. Dry-run
          najpierw zwraca raport (PDF + CSV), dopiero po zatwierdzeniu
          uruchamiamy generację.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card elevation="subtle">
          <CardHeader>
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
            >
              <Filter className="size-5" />
            </span>
            <CardTitle className="mt-2 text-fluid-xl">
              1. Wybierz segment
            </CardTitle>
            <CardDescription>
              Wszystkie warunki łączone AND. Pusty filtr = wszystkie sprawy
              spełniające status.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Moduł" options={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]} />
            <Field label="Status sprawy" options={["draft", "analysis", "generated"]} />
            <Field label="Wierzyciel zawiera" placeholder="np. PKO" />
            <Field label="Termin do" type="date" />
            <Field label="Próg ufności AI ≥" placeholder="0.85" type="number" />
            <Field label="Język" options={["PL", "EN"]} />
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card elevation="subtle" urgency="warning">
            <CardHeader>
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-5 shrink-0 text-warn-600" />
                <CardTitle className="text-fluid-base">Zasada 4 oczu</CardTitle>
              </div>
              <CardDescription>
                Operacje powyżej 100 pism wymagają zatwierdzenia przez
                drugiego admina przed startem workerów.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-fluid-base">Szacowane SLA</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-fluid-sm text-iron-700 dark:text-iron-200">
              <Row k="Tempo" v="≈ 10 000 pism/h" />
              <Row k="Koszt LLM" v="0,032 PLN / pismo" />
              <Row k="Retry" v="3 × wykładniczo" />
              <Row k="DLQ" v="po 3 nieudanych próbach" />
            </CardContent>
          </Card>
        </aside>
      </div>

      <Card elevation="pop" urgency="success">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
          >
            <FileText className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">
            2. Podgląd wyniku (dry-run)
          </CardTitle>
          <CardDescription>
            Po kliknięciu wygenerujemy raport bez tworzenia żadnych pism.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card elevation="flat" className="border-dashed">
            <CardContent className="grid gap-3 p-5 sm:grid-cols-4">
              <Stat label="Pasujące sprawy" v="—" />
              <Stat label="Pisma do wygenerowania" v="—" />
              <Stat label="Szac. koszt LLM" v="—" />
              <Stat label="Szac. czas" v="—" />
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary">
              <Filter className="size-4" />
              Uruchom dry-run
            </Button>
            <Button>
              <ShieldCheck className="size-4" />
              Zatwierdź i uruchom
              <ArrowRight className="size-4" />
            </Button>
            <Badge tone="warning">Wymaga drugiego zatwierdzenia</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  options,
  placeholder,
  type = "text",
}: {
  label: string;
  options?: string[];
  placeholder?: string;
  type?: "text" | "number" | "date";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300">
        {label}
      </span>
      {options ? (
        <select className="h-11 rounded-lg border border-iron-200 bg-white px-3 text-fluid-sm focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-iron-800 dark:bg-iron-950">
          <option value="">— dowolny —</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="h-11 rounded-lg border border-iron-200 bg-white px-3 text-fluid-sm focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-iron-800 dark:bg-iron-950"
        />
      )}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-iron-100 py-1 last:border-0 dark:border-dlugomat-800">
      <span className="text-iron-500">{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
        {label}
      </span>
      <span className="text-fluid-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
        {v}
      </span>
    </div>
  );
}
