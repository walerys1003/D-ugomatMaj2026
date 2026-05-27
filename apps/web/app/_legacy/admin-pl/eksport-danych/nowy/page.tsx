import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, ShieldCheck } from "lucide-react";

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
  title: "Nowy eksport · Admin · Długomat",
};

export default function NowyEksportPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin/eksport-danych"
          className="flex items-center gap-1 text-fluid-sm font-semibold text-dlugomat-600 hover:underline dark:text-dlugomat-300"
        >
          <ArrowLeft className="size-4" />
          Wróć do listy eksportów
        </Link>
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Kreator eksportu
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Nowy eksport danych
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Zlecasz asynchroniczną paczkę danych. Otrzymasz e-mail z linkiem
          po zakończeniu (zazwyczaj 1–10 minut).
        </p>
      </header>

      {/* Step indicator */}
      <ol className="flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider">
        {["Zakres", "Filtry", "Format", "Podsumowanie"].map((label, i) => (
          <li
            key={label}
            className="flex items-center gap-2"
            aria-current={i === 0 ? "step" : undefined}
          >
            <span
              className={
                i === 0
                  ? "grid size-7 place-items-center rounded-full bg-accent-600 text-white"
                  : "grid size-7 place-items-center rounded-full bg-iron-100 text-iron-500 dark:bg-dlugomat-900"
              }
            >
              {i + 1}
            </span>
            <span className={i === 0 ? "text-iron-900 dark:text-iron-50" : "text-iron-500"}>
              {label}
            </span>
            {i < 3 ? <ArrowRight className="size-3 text-iron-400" /> : null}
          </li>
        ))}
      </ol>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Database className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">Wybierz zakres</CardTitle>
          <CardDescription>
            Jedna paczka = jeden typ obiektu. Aby pobrać kilka typów,
            utwórz oddzielne zadania.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ScopeOption
            label="Sprawy"
            description="Pełne dane spraw z modułami D1–D8, statusami, terminami."
            count="≈ 124 580"
            recommended
          />
          <ScopeOption
            label="Pisma procesowe"
            description="PDF-y wygenerowanych pism + metadane (sygnatura, autor, status)."
            count="≈ 412 200"
          />
          <ScopeOption
            label="Użytkownicy"
            description="Konta z anonimizacją PESEL. Wymaga roli compliance."
            count="≈ 38 120"
          />
          <ScopeOption
            label="Płatności"
            description="Transakcje, faktury, refundy. Tylko admin finance."
            count="≈ 67 480"
          />
          <ScopeOption
            label="Logi audytu"
            description="Pełen log akcji administracyjnych — wymagane uzasadnienie."
            count="≈ 1 240 000"
          />
          <ScopeOption
            label="Komunikacja"
            description="E-maile, SMS, powiadomienia in-app. Z opt-in zgodami."
            count="≈ 824 100"
          />
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <span className="flex items-center gap-2 text-fluid-sm text-iron-700 dark:text-iron-200">
            <ShieldCheck className="size-4 text-accent-600" />
            Eksport zostanie automatycznie zalogowany w audycie RODO.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary">Anuluj</Button>
            <Button>
              Dalej: filtry
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScopeOption({
  label,
  description,
  count,
  recommended,
}: {
  label: string;
  description: string;
  count: string;
  recommended?: boolean;
}) {
  return (
    <label
      className={`group flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition hover:border-dlugomat-400 hover:shadow-card ${
        recommended
          ? "border-accent-300 bg-accent-50/30 dark:border-accent-700/40 dark:bg-accent-700/10"
          : "border-iron-200 bg-white dark:border-iron-800 dark:bg-iron-950"
      }`}
    >
      <div className="flex items-start justify-between">
        <input
          type="radio"
          name="scope"
          className="size-4"
          defaultChecked={recommended}
        />
        {recommended ? (
          <Badge tone="success" withDot>
            Polecane
          </Badge>
        ) : null}
      </div>
      <span className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
        {label}
      </span>
      <span className="text-fluid-xs text-iron-500">{description}</span>
      <span className="mt-1 text-fluid-xs font-semibold tabular-nums text-dlugomat-700 dark:text-dlugomat-300">
        {count} rekordów
      </span>
    </label>
  );
}
