import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitCommit, Plus, Minus, FileText, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Diff wersji promptu - Dlugomat Admin",
  description: "Porownanie dwoch wersji promptu AI z analiza zmian.",
};

type DiffLine = {
  type: "context" | "added" | "removed";
  text: string;
};

type PromptDiff = {
  id: string;
  promptName: string;
  versionFrom: string;
  versionTo: string;
  authorFrom: string;
  authorTo: string;
  dateFrom: string;
  dateTo: string;
  changeReason: string;
  diff: DiffLine[];
  metrics: {
    additions: number;
    deletions: number;
    avgLatencyChange: number;
    qualityScoreChange: number;
  };
};

const DIFFS: Record<string, PromptDiff> = {
  "diff-001": {
    id: "diff-001",
    promptName: "Generator pisma procesowego v2 -> v3",
    versionFrom: "v2.4.1",
    versionTo: "v3.0.0",
    authorFrom: "Anna Kowalska",
    authorTo: "Marek Nowak",
    dateFrom: "2026-04-12",
    dateTo: "2026-05-08",
    changeReason: "Aktualizacja pod nowe wytyczne dot. RODO i wzorow KPC obowiazujace od maja 2026.",
    diff: [
      { type: "context", text: "Jestes asystentem prawnym specjalizujacym sie w prawie cywilnym." },
      { type: "context", text: "Twoim zadaniem jest przygotowanie pisma procesowego." },
      { type: "removed", text: "Uzyj formalnego jezyka prawniczego z odwolaniami do KC." },
      { type: "added", text: "Uzyj formalnego jezyka prawniczego z odwolaniami do KC oraz KPC w aktualnym brzmieniu." },
      { type: "added", text: "Wszelkie dane osobowe traktuj zgodnie z RODO art. 6 ust. 1 lit. f." },
      { type: "context", text: "" },
      { type: "context", text: "Struktura pisma:" },
      { type: "context", text: "1. Petitum" },
      { type: "context", text: "2. Zarzuty" },
      { type: "removed", text: "3. Uzasadnienie (max 1000 slow)" },
      { type: "added", text: "3. Uzasadnienie (max 1500 slow, z podzialem na punkty)" },
      { type: "context", text: "4. Wnioski dowodowe" },
      { type: "context", text: "" },
      { type: "removed", text: "Format daty: DD.MM.YYYY" },
      { type: "added", text: "Format daty: DD.MM.YYYY (zgodnie z ISO 8601 w metadanych JSON)" },
      { type: "added", text: "Zawsze dodaj sekcje 'Pouczenie' z informacja o terminie zaskarzenia." },
    ],
    metrics: {
      additions: 5,
      deletions: 3,
      avgLatencyChange: 12,
      qualityScoreChange: 8,
    },
  },
};

type Params = Promise<{ id: string }>;

export default async function DiffWersjiPromptuPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = DIFFS[id] ?? DIFFS["diff-001"];
  if (!data) notFound();

  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/wersje-promptow"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do wersji promptow
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GitCommit className="h-6 w-6 text-accent-600" aria-hidden />
            <h1 className="font-display text-3xl text-dlugomat-950">Diff wersji promptu</h1>
          </div>
          <p className="text-dlugomat-700">{data.promptName}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Linie dodane</div>
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" aria-hidden />
                <div className="font-display text-3xl text-dlugomat-950">+{data.metrics.additions}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Linie usuniete</div>
              <div className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-rose-600" aria-hidden />
                <div className="font-display text-3xl text-dlugomat-950">-{data.metrics.deletions}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Zmiana latencji</div>
              <div className="font-display text-3xl text-dlugomat-950">+{data.metrics.avgLatencyChange}ms</div>
              <div className="text-xs text-dlugomat-600 mt-1">Wzrost p95</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Jakosc odpowiedzi</div>
              <div className="font-display text-3xl text-emerald-700">+{data.metrics.qualityScoreChange}%</div>
              <div className="text-xs text-dlugomat-600 mt-1">Wzrost wzgledem v2</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Porownanie tresci</CardTitle>
                <CardDescription>
                  Zmiany pomiedzy {data.versionFrom} a {data.versionTo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm rounded-md border border-iron-300 overflow-hidden">
                  {data.diff.map((line, idx) => {
                    const base = "px-3 py-1.5 flex gap-3 items-start";
                    if (line.type === "added") {
                      return (
                        <div key={idx} className={`${base} bg-emerald-50 text-emerald-900 border-l-2 border-emerald-500`}>
                          <span className="text-emerald-600 shrink-0 w-4" aria-hidden>+</span>
                          <span className="break-all">{line.text || " "}</span>
                        </div>
                      );
                    }
                    if (line.type === "removed") {
                      return (
                        <div key={idx} className={`${base} bg-rose-50 text-rose-900 border-l-2 border-rose-500`}>
                          <span className="text-rose-600 shrink-0 w-4" aria-hidden>-</span>
                          <span className="break-all line-through">{line.text || " "}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className={`${base} bg-white text-dlugomat-800 border-l-2 border-transparent`}>
                        <span className="text-dlugomat-400 shrink-0 w-4" aria-hidden> </span>
                        <span className="break-all">{line.text || " "}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wersja zrodlowa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{data.versionFrom}</Badge>
                </div>
                <div className="flex items-center gap-2 text-dlugomat-700">
                  <User className="h-3.5 w-3.5" aria-hidden />
                  <span>{data.authorFrom}</span>
                </div>
                <div className="flex items-center gap-2 text-dlugomat-700">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  <span>{dateFmt.format(new Date(data.dateFrom))}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wersja docelowa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge tone="success">{data.versionTo}</Badge>
                </div>
                <div className="flex items-center gap-2 text-dlugomat-700">
                  <User className="h-3.5 w-3.5" aria-hidden />
                  <span>{data.authorTo}</span>
                </div>
                <div className="flex items-center gap-2 text-dlugomat-700">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  <span>{dateFmt.format(new Date(data.dateTo))}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent-600" aria-hidden />
                  Powod zmiany
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-dlugomat-800">{data.changeReason}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="primary" block>
                  Aktywuj wersje docelowa
                </Button>
                <Button variant="secondary" block>
                  Cofnij do zrodlowej
                </Button>
                <Button variant="ghost" block>
                  Eksportuj diff
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
