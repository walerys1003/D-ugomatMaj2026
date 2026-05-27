import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Historia skanów — Skaner nakazu",
  description: "Wszystkie analizy nakazów zapłaty i pism procesowych.",
};

interface ScanRecord {
  id: string;
  ts: string;
  doc_type: "nakaz zapłaty" | "pozew" | "tytuł wykonawczy" | "wezwanie";
  filename: string;
  pages: number;
  status: "done" | "in_progress" | "failed";
  risk_score: number;
  case_ref?: string;
  amount_pln?: number;
  creditor?: string;
  recommendation: string;
}

const SCANS: ScanRecord[] = [
  {
    id: "scan_018",
    ts: "2026-05-10T14:42:00Z",
    doc_type: "nakaz zapłaty",
    filename: "nakaz_SR_Warszawa_2026-05.pdf",
    pages: 3,
    status: "done",
    risk_score: 78,
    amount_pln: 14200,
    creditor: "BestCollect Sp. z o.o.",
    recommendation: "Złóż sprzeciw — wykryto cesję wierzytelności bez udokumentowania.",
  },
  {
    id: "scan_017",
    ts: "2026-05-08T11:14:00Z",
    doc_type: "wezwanie",
    filename: "wezwanie_mBank.pdf",
    pages: 2,
    status: "done",
    risk_score: 32,
    amount_pln: 4800,
    creditor: "mBank S.A.",
    recommendation: "Niskie ryzyko — sprawdź czy dług nie jest przedawniony (>6 lat).",
  },
  {
    id: "scan_016",
    ts: "2026-05-04T16:08:00Z",
    doc_type: "pozew",
    filename: "pozew_KrukSA.pdf",
    pages: 7,
    status: "done",
    risk_score: 64,
    amount_pln: 22400,
    creditor: "Kruk S.A.",
    case_ref: "case_011",
    recommendation: "Średnie ryzyko — odpowiedź na pozew wymagana w 14 dni.",
  },
  {
    id: "scan_015",
    ts: "2026-04-28T09:32:00Z",
    doc_type: "tytuł wykonawczy",
    filename: "tytul_KM_412.pdf",
    pages: 4,
    status: "done",
    risk_score: 91,
    amount_pln: 36800,
    creditor: "Komornik J. Nowak",
    case_ref: "case_007",
    recommendation: "Wysokie ryzyko — natychmiast skontaktuj się z prawnikiem.",
  },
  {
    id: "scan_014",
    ts: "2026-04-22T13:48:00Z",
    doc_type: "nakaz zapłaty",
    filename: "nakaz_PKO_BP.pdf",
    pages: 2,
    status: "done",
    risk_score: 41,
    amount_pln: 8200,
    creditor: "PKO BP S.A.",
    recommendation: "Średnio-niskie ryzyko — sprzeciw uzasadniony jeśli umowa zawiera klauzule abuzywne.",
  },
  {
    id: "scan_013",
    ts: "2026-04-18T10:24:00Z",
    doc_type: "wezwanie",
    filename: "wezwanie_TauronOdbiorca.pdf",
    pages: 1,
    status: "done",
    risk_score: 18,
    amount_pln: 1240,
    creditor: "Tauron Sprzedaż",
    recommendation: "Niskie ryzyko — najprawdopodobniej przedawnione (z 2018 r.).",
  },
];

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

export default function SkanerHistoriaPage() {
  const total = SCANS.length;
  const highRisk = SCANS.filter((s) => s.risk_score >= 70).length;
  const totalAmount = SCANS.reduce((s, sc) => s + (sc.amount_pln ?? 0), 0);

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
              {Math.round(SCANS.reduce((s, sc) => s + sc.risk_score, 0) / SCANS.length)}/100
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
                    <Badge tone={riskTone(s.risk_score)} withDot>
                      ryzyko: {riskLabel(s.risk_score)} ({s.risk_score}/100)
                    </Badge>
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
    </div>
  );
}
