import type { Metadata } from "next";
import { ArrowRight, Mail, ShieldCheck, Upload, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Masowe zaproszenia · Admin · Długomat",
};

export default function MasoweZaproszeniaPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Operacje masowe · Użytkownicy
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Masowe zaproszenia
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Wczytaj CSV z adresami e-mail, opcjonalnie z nazwą organizacji
          i rolą. Wysyłamy linki aktywacyjne ważne 7 dni.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card elevation="subtle">
          <CardHeader>
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
            >
              <Upload className="size-5" />
            </span>
            <CardTitle className="mt-2 text-fluid-xl">
              Wgraj plik CSV
            </CardTitle>
            <CardDescription>
              Kolumny:{" "}
              <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
                email
              </code>
              ,{" "}
              <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
                full_name
              </code>
              ,{" "}
              <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
                org_name
              </code>
              ,{" "}
              <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
                role
              </code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              role="button"
              tabIndex={0}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-iron-300 bg-iron-50/40 p-10 text-center hover:border-dlugomat-400 focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-dlugomat-800 dark:bg-dlugomat-900/30"
            >
              <span
                aria-hidden
                className="grid size-12 place-items-center rounded-xl bg-white text-dlugomat-700 shadow-card dark:bg-iron-950 dark:text-dlugomat-300"
              >
                <Users className="size-6" />
              </span>
              <span className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
                Wybierz plik CSV
              </span>
              <span className="text-fluid-xs text-iron-500">
                Maks. 25 MB · UTF-8 · pierwszy wiersz = nagłówki
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Domyślna rola" options={["user", "lawyer", "manager", "admin"]} />
              <Field label="Plan" options={["free", "solo", "pro", "enterprise"]} />
            </div>

            <label className="flex items-center gap-2 text-fluid-sm">
              <input type="checkbox" className="size-4 rounded" defaultChecked />
              Wyślij e-mail powitalny natychmiast po imporcie
            </label>
            <label className="flex items-center gap-2 text-fluid-sm">
              <input type="checkbox" className="size-4 rounded" />
              Wymuś zmianę hasła przy pierwszym logowaniu
            </label>

            <div className="flex items-center justify-between rounded-lg bg-iron-50/60 p-3 dark:bg-dlugomat-900/30">
              <span className="flex items-center gap-2 text-fluid-sm text-iron-700 dark:text-iron-200">
                <ShieldCheck className="size-4 text-accent-600" />
                Sprawdzimy duplikaty po e-mail
              </span>
              <Button>
                Uruchom import
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-fluid-base">Wzór CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded bg-iron-50 p-3 font-mono text-fluid-xs text-iron-700 dark:bg-dlugomat-900 dark:text-iron-200">
{`email,full_name,org_name,role
anna@kancelaria.pl,Anna Kowalska,Kowalska & Wspólnicy,lawyer
marek@firma.pl,Marek Nowak,Firma Sp. z o.o.,manager`}
              </pre>
              <Button variant="link" className="mt-2 px-0">
                Pobierz przykładowy CSV →
              </Button>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
              >
                <Mail className="size-5" />
              </span>
              <CardTitle className="mt-2 text-fluid-base">
                Szablon e-maila
              </CardTitle>
              <CardDescription>
                Możesz dostosować temat i body w sekcji{" "}
                <a href="/admin/notyfikacje" className="text-dlugomat-600 hover:underline">
                  Notyfikacje
                </a>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300">
        {label}
      </span>
      <select className="h-11 rounded-lg border border-iron-200 bg-white px-3 text-fluid-sm focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-iron-800 dark:bg-iron-950">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
