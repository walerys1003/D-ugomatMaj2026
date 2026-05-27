import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";

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
  title: "Oś czasu sprawy — Długomat",
  description: "Wizualna oś czasu kamieni milowych z prognozą terminów.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Milestone {
  id: string;
  title: string;
  status: "done" | "current" | "upcoming";
  date: string | null;
  description: string;
  duration_days?: number;
}

const MILESTONES: Milestone[] = [
  {
    id: "m_01",
    title: "Utworzenie sprawy",
    status: "done",
    date: "2026-05-04",
    description: "Klient zarejestrował sprawę i dokonał płatności.",
  },
  {
    id: "m_02",
    title: "Przypisanie prawnika",
    status: "done",
    date: "2026-05-04",
    description: "System auto-przypisał Annę Sieradzką (specjalizacja BIK/KRD).",
  },
  {
    id: "m_03",
    title: "Analiza dokumentów",
    status: "done",
    date: "2026-05-07",
    description: "Prawnik przeanalizował raport BIK i ustalił strategię.",
    duration_days: 3,
  },
  {
    id: "m_04",
    title: "Wysłanie wniosku do banku",
    status: "done",
    date: "2026-05-10",
    description: "Wniosek o korektę wpisu w BIK wysłany do mBank.",
    duration_days: 3,
  },
  {
    id: "m_05",
    title: "Oczekiwanie na odpowiedź banku",
    status: "current",
    date: null,
    description: "Bank ma 30 dni na ustosunkowanie się. Aktualnie: dzień 1/30.",
    duration_days: 30,
  },
  {
    id: "m_06",
    title: "Analiza odpowiedzi banku",
    status: "upcoming",
    date: "2026-06-10",
    description: "Po otrzymaniu odpowiedzi: analiza i rekomendacja kolejnych kroków.",
    duration_days: 3,
  },
  {
    id: "m_07",
    title: "Eskalacja do Rzecznika Finansowego (opcjonalnie)",
    status: "upcoming",
    date: "2026-06-13",
    description: "Jeśli bank odmówi — kierujemy sprawę do Rzecznika Finansowego.",
    duration_days: 60,
  },
  {
    id: "m_08",
    title: "Zamknięcie sprawy",
    status: "upcoming",
    date: "2026-08-15",
    description: "Korekta BIK potwierdzona, raport zaktualizowany.",
  },
];

const STATUS_ICON = {
  done: CheckCircle2,
  current: Clock,
  upcoming: Circle,
} as const;

function progressPct(): number {
  const done = MILESTONES.filter((m) => m.status === "done").length;
  return Math.round((done / MILESTONES.length) * 100);
}

export default async function SprawaTimelinePage({ params }: PageProps) {
  const { id } = await params;
  const pct = progressPct();
  const current = MILESTONES.find((m) => m.status === "current");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/panel/sprawa/${id}`}
          className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do sprawy
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Sprawa · {id} · oś czasu
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Kamienie milowe
        </h1>
        <p className="max-w-2xl text-ink-600">
          Wizualizacja postępu sprawy z prognozą terminów. Czas realizacji
          szacujemy na podstawie podobnych spraw z naszej bazy (ostatnie 24 miesiące).
        </p>
      </header>

      <Card urgency="normal">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-500">Postęp sprawy</p>
              <p className="font-display text-fluid-h2 text-dlugomat-950">{pct}%</p>
            </div>
            {current ? (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-ink-500">Aktualny etap</p>
                <p className="font-medium text-dlugomat-900">{current.title}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-ink-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-dlugomat-700 to-dlugomat-500"
              style={{ width: `${pct}%` }}
              aria-hidden
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kamienie milowe</CardTitle>
          <CardDescription>Ukończone, w toku oraz prognozowane terminy</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-6 border-l-2 border-ink-200 pl-8">
            {MILESTONES.map((m) => {
              const Icon = STATUS_ICON[m.status];
              const iconColor =
                m.status === "done"
                  ? "text-accent-600 bg-accent-50 border-accent-200"
                  : m.status === "current"
                  ? "text-dlugomat-700 bg-dlugomat-50 border-dlugomat-300"
                  : "text-ink-400 bg-white border-ink-200";
              return (
                <li key={m.id} className="relative">
                  <span
                    className={`absolute -left-[44px] inline-flex h-8 w-8 items-center justify-center rounded-full border-2 ${iconColor}`}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-dlugomat-950">{m.title}</h3>
                      <Badge
                        tone={
                          m.status === "done"
                            ? "success"
                            : m.status === "current"
                            ? "warning"
                            : "neutral"
                        }
                        withDot
                      >
                        {m.status === "done"
                          ? "Ukończone"
                          : m.status === "current"
                          ? "W toku"
                          : "Planowane"}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink-600">{m.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
                      {m.date ? (
                        <span>
                          {m.status === "upcoming" ? "Prognoza: " : ""}
                          {new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(
                            new Date(m.date),
                          )}
                        </span>
                      ) : (
                        <span>Bez daty</span>
                      )}
                      {m.duration_days ? (
                        <>
                          <span aria-hidden>·</span>
                          <span>{m.duration_days} dni</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <Card urgency="success">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <CheckCircle2 className="h-8 w-8 text-accent-700" aria-hidden />
          <div className="flex-1 min-w-[240px]">
            <p className="font-semibold text-dlugomat-950">Prognoza zamknięcia</p>
            <p className="text-sm text-ink-600">
              Szacujemy zamknięcie sprawy na 2026-08-15 (103 dni od rozpoczęcia).
              Mediana podobnych spraw: 87 dni.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link href={`/panel/sprawa/${id}/historia`}>Zobacz historię</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
