import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Archive, Download, FileText, Search } from "lucide-react";

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
  title: "Archiwum pism — Długomat",
  description: "Wszystkie wygenerowane pisma w jednym miejscu, z możliwością wyszukiwania.",
};

interface ArchivedLetter {
  id: string;
  title: string;
  type: "wniosek" | "reklamacja" | "sprzeciw" | "wezwanie" | "ugoda" | "inne";
  generated_at: string;
  case_ref?: string;
  recipient: string;
  pages: number;
  size_kb: number;
  status: "sent" | "draft" | "archived";
}

const LETTERS: ArchivedLetter[] = [
  {
    id: "p_018",
    title: "Wniosek o korektę BIK — mBank",
    type: "wniosek",
    generated_at: "2026-05-10T15:38:00Z",
    case_ref: "case_004",
    recipient: "mBank S.A. (reklamacje@mbank.pl)",
    pages: 3,
    size_kb: 142,
    status: "sent",
  },
  {
    id: "p_017",
    title: "Sprzeciw od nakazu zapłaty — BestCollect",
    type: "sprzeciw",
    generated_at: "2026-05-08T11:42:00Z",
    case_ref: "case_011",
    recipient: "Sąd Rejonowy Warszawa-Mokotów",
    pages: 7,
    size_kb: 384,
    status: "sent",
  },
  {
    id: "p_016",
    title: "Reklamacja błędnej raty — PKO BP",
    type: "reklamacja",
    generated_at: "2026-05-04T09:18:00Z",
    case_ref: "case_009",
    recipient: "PKO BP S.A.",
    pages: 2,
    size_kb: 98,
    status: "sent",
  },
  {
    id: "p_015",
    title: "Propozycja ugody — Kruk S.A.",
    type: "ugoda",
    generated_at: "2026-04-28T16:14:00Z",
    case_ref: "case_007",
    recipient: "Kruk S.A. (negocjacje@kruksa.pl)",
    pages: 4,
    size_kb: 218,
    status: "sent",
  },
  {
    id: "p_014",
    title: "Wezwanie do zwrotu nadpłaty — Santander",
    type: "wezwanie",
    generated_at: "2026-04-22T13:08:00Z",
    recipient: "Santander Bank Polska S.A.",
    pages: 2,
    size_kb: 84,
    status: "sent",
  },
  {
    id: "p_013",
    title: "Wniosek o ograniczenie egzekucji — KM 412/25",
    type: "wniosek",
    generated_at: "2026-04-18T10:42:00Z",
    case_ref: "case_007",
    recipient: "Komornik J. Nowak",
    pages: 3,
    size_kb: 156,
    status: "sent",
  },
  {
    id: "p_012",
    title: "Reklamacja błędnego wpisu KRD",
    type: "reklamacja",
    generated_at: "2026-04-12T09:24:00Z",
    recipient: "KRD BIG S.A.",
    pages: 2,
    size_kb: 102,
    status: "archived",
  },
  {
    id: "p_011",
    title: "Pismo do Rzecznika Finansowego",
    type: "inne",
    generated_at: "2026-04-08T14:48:00Z",
    case_ref: "case_002",
    recipient: "Rzecznik Finansowy",
    pages: 5,
    size_kb: 264,
    status: "sent",
  },
  {
    id: "p_010",
    title: "Sprzeciw od nakazu — szkic (niedokończony)",
    type: "sprzeciw",
    generated_at: "2026-04-02T11:14:00Z",
    recipient: "—",
    pages: 4,
    size_kb: 198,
    status: "draft",
  },
];

const TYPE_TONE: Record<ArchivedLetter["type"], "info" | "warning" | "danger" | "success" | "neutral"> = {
  wniosek: "info",
  reklamacja: "warning",
  sprzeciw: "danger",
  wezwanie: "warning",
  ugoda: "success",
  inne: "neutral",
};

const STATUS_TONE: Record<ArchivedLetter["status"], "success" | "info" | "neutral"> = {
  sent: "success",
  draft: "info",
  archived: "neutral",
};

const STATUS_LABEL: Record<ArchivedLetter["status"], string> = {
  sent: "wysłane",
  draft: "szkic",
  archived: "zarchiwizowane",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function ArchiwumPage() {
  const total = LETTERS.length;
  const sent = LETTERS.filter((l) => l.status === "sent").length;
  const drafts = LETTERS.filter((l) => l.status === "draft").length;
  const totalPages = LETTERS.reduce((s, l) => s + l.pages, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/panel/moje-pisma"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do moich pism
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Moje pisma · archiwum
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Wszystkie wygenerowane pisma
          </h1>
          <p className="max-w-2xl text-iron-600">
            Pełna historia pism procesowych i administracyjnych — przechowywane
            bezterminowo, gotowe do pobrania w PDF.
          </p>
        </div>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Eksportuj całe archiwum (ZIP)
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-4" aria-label="Statystyki archiwum">
        <Card>
          <CardHeader>
            <CardDescription>Pisma łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Wysłane</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-accent-700">{sent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Szkice</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-warn">{drafts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Stron łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {totalPages}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardContent className="p-5">
          <form className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-iron-400" aria-hidden />
              <input
                type="search"
                placeholder="Szukaj po tytule, adresacie lub typie pisma"
                className="w-full rounded-md border border-iron-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </div>
            <Button type="submit">Szukaj</Button>
          </form>
        </CardContent>
      </Card>

      <ul className="space-y-3" aria-label="Lista pism">
        {LETTERS.map((l) => (
          <li key={l.id}>
            <article className="rounded-lg border border-iron-200 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="rounded-md bg-dlugomat-50 p-2 flex-shrink-0">
                    <FileText className="h-5 w-5 text-dlugomat-700" aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={TYPE_TONE[l.type]}>{l.type}</Badge>
                      <Badge tone={STATUS_TONE[l.status]} withDot>
                        {STATUS_LABEL[l.status]}
                      </Badge>
                      {l.case_ref ? (
                        <Badge tone="neutral">sprawa: {l.case_ref}</Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-semibold text-dlugomat-950">{l.title}</h3>
                    <p className="mt-1 text-sm text-iron-600">
                      Adresat: <span className="text-dlugomat-900">{l.recipient}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-iron-500">
                      <span>{fmtDate(l.generated_at)}</span>
                      <span aria-hidden>·</span>
                      <span>{l.pages} {l.pages === 1 ? "strona" : "stron"}</span>
                      <span aria-hidden>·</span>
                      <span>{l.size_kb} KB</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/panel/moje-pisma/${l.id}`}>Otwórz</Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    PDF
                  </Button>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <Card urgency="normal">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Archive className="h-8 w-8 text-dlugomat-700" aria-hidden />
          <div className="flex-1 min-w-[240px]">
            <p className="font-semibold text-dlugomat-950">
              Pisma starsze niż 24 miesiące
            </p>
            <p className="text-sm text-iron-600">
              Aby zachować wydajność, pisma starsze niż 24 mies. są dostępne tylko
              po wybraniu „Pokaż wszystkie".
            </p>
          </div>
          <Button variant="ghost">Pokaż wszystkie (47)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
