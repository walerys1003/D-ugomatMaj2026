import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, FileText, ScanLine, Sparkles } from "lucide-react";

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
import {
  listCasesForCurrentUser,
  listDeadlinesForCurrentUser,
} from "@/lib/cases/case-repository";
import { caseStatusLabel, caseTypeMeta } from "@/lib/cases/case-types";
import {
  daysUntil,
  formatDatePL,
  formatDateTimePL,
  urgencyFromDays,
} from "@/lib/utils";
import type { CaseStatus } from "@/lib/db/types";

export const metadata: Metadata = { title: "Pulpit · Długomat" };

export default async function PanelHomePage() {
  const [cases, deadlines] = await Promise.all([
    listCasesForCurrentUser(),
    listDeadlinesForCurrentUser(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Pulpit
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Witaj w Długomacie.
        </h1>
        <p className="text-fluid-base text-iron-600 dark:text-iron-300">
          Zaczyna się tutaj. Wybierz, co zrobimy jako pierwsze.
        </p>
      </header>

      {/* Action cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card elevation="subtle" className="group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
                <ScanLine className="size-5" aria-hidden />
              </span>
              <Badge tone="success" withDot>
                DARMOWE
              </Badge>
            </div>
            <CardTitle className="mt-3">Zeskanuj nakaz</CardTitle>
            <CardDescription>OCR + ocena przedawnienia w 2 minuty.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild block variant="secondary">
              <Link href="/panel/skaner">
                Otwórz skaner
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <span className="grid size-10 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <CardTitle className="mt-3">Wygeneruj sprzeciw</CardTitle>
            <CardDescription>Sprzeciw od nakazu zapłaty EPU — 12 minut.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild block>
              <Link href="/panel/sprawy/nowa">
                Rozpocznij sprzeciw
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <span className="grid size-10 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
              <FileText className="size-5" aria-hidden />
            </span>
            <CardTitle className="mt-3">Wszystkie moduły</CardTitle>
            <CardDescription>D1–D8 — wybierz odpowiednie narzędzie.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild block variant="secondary">
              <Link href="/panel/sprawy/nowa">
                Przeglądaj moduły
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming deadlines */}
      {deadlines.length > 0 && (
        <section aria-labelledby="upcoming-deadlines" className="flex flex-col gap-3">
          <h2
            id="upcoming-deadlines"
            className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white"
          >
            Nadchodzące terminy
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {deadlines.slice(0, 4).map((d) => {
              const days = daysUntil(d.deadline_date);
              const urgency = urgencyFromDays(days);
              return (
                <Card key={d.id} urgency={urgency}>
                  <CardHeader>
                    <div className="flex items-baseline justify-between gap-3">
                      <CardTitle className="text-fluid-base">
                        {d.description}
                      </CardTitle>
                      <span
                        className="whitespace-nowrap text-fluid-sm font-semibold tabular-nums"
                        aria-label={`Pozostało ${days} dni`}
                      >
                        {days <= 0
                          ? "po terminie"
                          : days === 1
                            ? "1 dzień"
                            : `${days} dni`}
                      </span>
                    </div>
                    <CardDescription>
                      <CalendarClock className="mr-1 inline size-4 align-text-bottom" aria-hidden />
                      {formatDatePL(new Date(d.deadline_date))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/panel/sprawa/${d.case_id}`}>
                        Otwórz sprawę
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent cases */}
      <section aria-labelledby="recent-cases" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2
            id="recent-cases"
            className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white"
          >
            Twoje sprawy
          </h2>
          {cases.length > 0 && (
            <Link
              href="/panel/sprawy/nowa"
              className="text-fluid-sm font-semibold text-dlugomat-600 hover:underline dark:text-dlugomat-300"
            >
              Nowa sprawa
            </Link>
          )}
        </div>

        {cases.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" aria-hidden />}
            title="Jeszcze nie masz spraw"
            description="Rozpocznij od zeskanowania nakazu lub od razu utwórz sprawę dla wybranego modułu."
            action={
              <Button asChild>
                <Link href="/panel/sprawy/nowa">Utwórz sprawę</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {cases.map((c) => {
              const meta = caseTypeMeta[c.type];
              return (
                <li key={c.id}>
                  <Link
                    href={`/panel/sprawa/${c.id}`}
                    className="block rounded-xl border border-iron-200 bg-white p-4 transition hover:border-dlugomat-400 hover:shadow-card dark:border-iron-800 dark:bg-iron-950"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
                        {c.title}
                      </span>
                      <Badge tone={statusToTone(c.status)}>
                        {caseStatusLabel[c.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-fluid-xs text-iron-500">
                      {meta.module} · zaktualizowano {formatDateTimePL(new Date(c.updated_at))}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function statusToTone(
  status: CaseStatus,
): "info" | "warning" | "success" | "neutral" {
  switch (status) {
    case "draft":
      return "neutral";
    case "analysis":
      return "info";
    case "generated":
      return "warning";
    case "paid":
    case "downloaded":
    case "completed":
      return "success";
    default:
      return "neutral";
  }
}
