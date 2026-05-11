import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

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
  title: "Import komorniczy · Admin · Długomat",
};

type ImportRun = {
  id: string;
  filename: string;
  source: "komornik" | "wierzyciel" | "epu";
  rows_total: number;
  rows_ok: number;
  rows_skipped: number;
  rows_error: number;
  started_at: string;
  duration_s: number;
  status: "done" | "running" | "failed";
  operator: string;
};

const RUNS: ImportRun[] = [
  {
    id: "imp_001",
    filename: "kancelaria_kowalska_maj_2026.csv",
    source: "komornik",
    rows_total: 1248,
    rows_ok: 1241,
    rows_skipped: 5,
    rows_error: 2,
    started_at: "2026-05-11T07:12:00Z",
    duration_s: 38,
    status: "done",
    operator: "anna.k@dlugomat.pl",
  },
  {
    id: "imp_002",
    filename: "best_recovery_apr_2026.xlsx",
    source: "wierzyciel",
    rows_total: 8420,
    rows_ok: 7980,
    rows_skipped: 320,
    rows_error: 120,
    started_at: "2026-05-10T15:42:00Z",
    duration_s: 174,
    status: "done",
    operator: "marek.w@dlugomat.pl",
  },
  {
    id: "imp_003",
    filename: "epu_partia_2026-q1.csv",
    source: "epu",
    rows_total: 12_440,
    rows_ok: 3_120,
    rows_skipped: 0,
    rows_error: 0,
    started_at: "2026-05-11T08:51:00Z",
    duration_s: 0,
    status: "running",
    operator: "jan.p@dlugomat.pl",
  },
];

const STATUS_TONE: Record<ImportRun["status"], "success" | "info" | "danger"> = {
  done: "success",
  running: "info",
  failed: "danger",
};

const STATUS_LABEL: Record<ImportRun["status"], string> = {
  done: "Zakończono",
  running: "Trwa",
  failed: "Błąd",
};

const SOURCE_LABEL: Record<ImportRun["source"], string> = {
  komornik: "Kancelaria komornicza",
  wierzyciel: "Wierzyciel masowy",
  epu: "E-sąd (EPU)",
};

export default function ImportKomorniczyPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Operacje masowe
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Import komorniczy
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Wczytywanie partii spraw z kancelarii komorniczych, wierzycieli
          masowych i E-sądu. Walidacja PESEL/NIP, deduplikacja, retry per
          wiersz.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Upload zone */}
        <Card elevation="subtle">
          <CardHeader>
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
            >
              <Upload className="size-5" />
            </span>
            <CardTitle className="mt-2 text-fluid-xl">
              Wgraj plik CSV / Excel
            </CardTitle>
            <CardDescription>
              Maks. 50 MB · UTF-8 · separator średnik lub przecinek · pierwszy
              wiersz z nagłówkami.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              role="button"
              tabIndex={0}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-iron-300 bg-iron-50/40 p-10 text-center hover:border-dlugomat-400 hover:bg-dlugomat-50/40 focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-dlugomat-800 dark:bg-dlugomat-900/30"
            >
              <span
                aria-hidden
                className="grid size-12 place-items-center rounded-xl bg-white text-dlugomat-700 shadow-card dark:bg-iron-950 dark:text-dlugomat-300"
              >
                <FileSpreadsheet className="size-6" />
              </span>
              <span className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
                Przeciągnij plik lub kliknij, aby wybrać
              </span>
              <span className="text-fluid-xs text-iron-500">
                .csv, .xlsx, .xls · do 50 MB
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Źródło importu"
                helper="Z którego systemu pochodzi plik"
                kind="select"
              />
              <Field
                label="Domyślny moduł"
                helper="Jeśli plik nie zawiera kolumny module"
                kind="select"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-iron-50/60 p-3 dark:bg-dlugomat-900/30">
              <span className="flex items-center gap-2 text-fluid-sm text-iron-700 dark:text-iron-200">
                <ShieldCheck className="size-4 text-accent-600" />
                Walidacja PESEL/NIP + dedup po sygnaturze
              </span>
              <Button>
                Rozpocznij import
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schema reference */}
        <aside>
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-fluid-base">
                Wymagane kolumny
              </CardTitle>
              <CardDescription>Nazwy nagłówków (case-insensitive)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 font-mono text-fluid-xs text-iron-700 dark:text-iron-200">
              {[
                "case_signature *",
                "debtor_pesel_or_nip *",
                "creditor_name *",
                "principal_pln *",
                "interest_pln",
                "costs_pln",
                "deadline_date",
                "module",
                "notes",
              ].map((col) => (
                <span
                  key={col}
                  className="rounded bg-iron-100 px-2 py-1 dark:bg-dlugomat-900"
                >
                  {col}
                </span>
              ))}
              <span className="mt-2 text-fluid-xs text-iron-500">
                * pola obowiązkowe
              </span>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* History */}
      <section className="flex flex-col gap-3">
        <h2 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white">
          Ostatnie importy
        </h2>
        <Card elevation="subtle" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                <tr className="text-left text-iron-600 dark:text-iron-300">
                  <th className="px-5 py-3 font-semibold">Plik</th>
                  <th className="px-5 py-3 font-semibold">Źródło</th>
                  <th className="px-5 py-3 text-right font-semibold">Wiersze</th>
                  <th className="px-5 py-3 text-right font-semibold">OK / Pomiń / Błąd</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                {RUNS.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3">
                      <span className="font-mono text-fluid-xs text-iron-700 dark:text-iron-200">
                        {r.filename}
                      </span>
                    </td>
                    <td className="px-5 py-3">{SOURCE_LABEL[r.source]}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {r.rows_total.toLocaleString("pl-PL")}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className="text-accent-700">
                        <CheckCircle2 className="mr-1 inline size-3.5 align-text-bottom" />
                        {r.rows_ok}
                      </span>
                      {" / "}
                      <span className="text-iron-500">{r.rows_skipped}</span>
                      {" / "}
                      <span className="text-danger-600">
                        <XCircle className="mr-1 inline size-3.5 align-text-bottom" />
                        {r.rows_error}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[r.status]} withDot>
                        {r.status === "running" ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            {STATUS_LABEL[r.status]}
                          </>
                        ) : (
                          STATUS_LABEL[r.status]
                        )}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-iron-500">{r.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Field({
  label,
  helper,
  kind,
}: {
  label: string;
  helper: string;
  kind: "select";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300">
        {label}
      </span>
      <select className="h-11 rounded-lg border border-iron-200 bg-white px-3 text-fluid-sm focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-iron-800 dark:bg-iron-950">
        <option>— wybierz —</option>
      </select>
      <span className="text-fluid-xs text-iron-500">{helper}</span>
    </label>
  );
}
