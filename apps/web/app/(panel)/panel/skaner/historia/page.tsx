import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, FileSearch, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Historia skanów — Skaner nakazu",
  description: "Wszystkie analizy nakazów zapłaty i pism procesowych.",
};

export const dynamic = "force-dynamic";

interface ScanRecord {
  id: string;
  ts: string;
  doc_type: string;
  filename: string;
  pages: number;
  status: "done" | "in_progress" | "failed";
  risk_score: number | null;
  case_ref?: string;
  amount_pln?: number;
  creditor?: string;
  recommendation: string;
}

/** Bezpieczne odczytanie pola z JSON-a extracted_data. */
function ed(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

function edStr(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function edNum(data: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  }
  return undefined;
}

function mapStatus(s: string): ScanRecord["status"] {
  if (s === "completed") return "done";
  if (s === "failed") return "failed";
  return "in_progress"; // pending | processing
}

const STATUS_TONE: Record<ScanRecord["status"], "success" | "warning" | "danger"> = {
  done: "success",
  in_progress: "warning",
  failed: "danger",
};

function riskTone(score: number): "success" | "warning" | "danger" {
  if (score < 40) return "success";
  if (score < 70) return "warning";
  return "danger";
}

function riskLabel(score: number): string {
  if (score < 40) return "niskie";
  if (score < 70) return "średnie";
  return "wysokie";
}

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function SkanerHistoriaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/skaner/historia");

  const { data: rows } = await supabase
    .from("ocr_results")
    .select(
      "id, original_filename, case_id, status, created_at, extracted_data",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const SCANS: ScanRecord[] = (rows ?? []).map((r) => {
    const data = ed(r.extracted_data);
    const risk = edNum(data, "risk_score", "ryzyko");
    return {
      id: r.id,
      ts: r.created_at,
      doc_type: edStr(data, "doc_type", "typ", "document_type") ?? "dokument",
      filename: r.original_filename,
      pages: edNum(data, "pages", "strony") ?? 0,
      status: mapStatus(r.status),
      risk_score: risk ?? null,
      case_ref: r.case_id ?? undefined,
      amount_pln: edNum(data, "amount_pln", "kwota", "amount"),
      creditor: edStr(data, "creditor", "wierzyciel"),
      recommendation:
        edStr(data, "recommendation", "rekomendacja", "summary") ??
        "Analiza dokumentu zakończona.",
    };
  });

  const total = SCANS.length;
  const withRisk = SCANS.filter((s) => s.risk_score != null);
  const highRisk = withRisk.filter((s) => (s.risk_score ?? 0) >= 70).length;
  const totalAmount = SCANS.reduce((s, sc) => s + (sc.amount_pln ?? 0), 0);
  const avgRisk =
    withRisk.length > 0
      ? Math.round(
          withRisk.reduce((s, sc) => s + (sc.risk_score ?? 0), 0) / withRisk.length,
        )
      : null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/panel/skaner"
          className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do skanera
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Skaner nakazu · historia
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Twoje analizy
          </h1>
          <p className="max-w-2xl text-ink-600">
            Wszystkie skany są szyfrowane i przechowywane w EU przez 7 lat
            (zgodnie z wymogiem zachowania dokumentów księgowych).
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/skaner">
            <FileSearch className="mr-2 h-4 w-4" aria-hidden />
            Nowy skan
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-4" aria-label="Statystyki">
        <Card>
          <CardHeader>
            <CardDescription>Skany łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={highRisk > 0 ? "warning" : "normal"}>
          <CardHeader>
            <CardDescription>Wysokie ryzyko</CardDescription>
            <CardTitle className={`font-display text-fluid-h2 ${highRisk > 0 ? "text-danger" : "text-accent-700"}`}>
              {highRisk}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Suma kwot</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {fmtPLN(totalAmount)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Średnie ryzyko</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-warn">
              {avgRisk != null ? `${avgRisk}/100` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            <Filter className="mr-2 inline h-4 w-4" aria-hidden />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Typ dokumentu</span>
              <select className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus">
                <option value="">Wszystkie</option>
                <option>nakaz zapłaty</option>
                <option>pozew</option>
                <option>tytuł wykonawczy</option>
                <option>wezwanie</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Ryzyko</span>
              <select className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus">
                <option value="">Każde</option>
                <option>niskie (0–39)</option>
                <option>średnie (40–69)</option>
                <option>wysokie (70–100)</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Od daty</span>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-ink-500">Do daty</span>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
          </form>
        </CardContent>
      </Card>

      {SCANS.length === 0 ? (
        <EmptyState
          title="Brak skanów"
          description="Nie masz jeszcze żadnych analiz dokumentów. Wgraj nakaz zapłaty lub pismo procesowe, aby rozpocząć."
        />
      ) : (
      <ul className="space-y-3" aria-label="Lista skanów">
        {SCANS.map((s) => (
          <li key={s.id}>
            <Link
              href={`/panel/skaner/${s.id}`}
              className="group block rounded-lg border border-ink-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink-500">{s.id}</span>
                    <Badge tone="info">{s.doc_type}</Badge>
                    <Badge tone={STATUS_TONE[s.status]} withDot>
                      {s.status === "done" ? "ukończony" : s.status === "in_progress" ? "w trakcie" : "błąd"}
                    </Badge>
                    {s.risk_score != null ? (
                      <Badge tone={riskTone(s.risk_score)} withDot>
                        ryzyko: {riskLabel(s.risk_score)} ({s.risk_score}/100)
                      </Badge>
                    ) : null}
                    {s.case_ref ? (
                      <Badge tone="neutral">sprawa: {s.case_ref}</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-medium text-dlugomat-950 group-hover:text-dlugomat-700">
                    {s.filename}
                  </h3>
                  <p className="mt-1 text-sm text-ink-600">{s.recommendation}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                    <span>{fmtDate(s.ts)}</span>
                    <span aria-hidden>·</span>
                    <span>{s.pages} {s.pages === 1 ? "strona" : "stron"}</span>
                    {s.creditor ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>Wierzyciel: {s.creditor}</span>
                      </>
                    ) : null}
                    {s.amount_pln ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-semibold text-dlugomat-900">
                          {fmtPLN(s.amount_pln)}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <ArrowRight
                  className="h-5 w-5 flex-shrink-0 text-ink-400 group-hover:text-dlugomat-700"
                  aria-hidden
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
