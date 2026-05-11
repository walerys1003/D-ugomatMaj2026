import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileSignature,
  Mail,
  Send,
  Sparkles,
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
import { EmptyState } from "@/components/ui/empty-state";
import { listCasesForCurrentUser } from "@/lib/cases/case-repository";
import { caseTypeMeta } from "@/lib/cases/case-types";
import { formatDateTimePL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Moje pisma · Długomat",
  description:
    "Chronologiczny przebieg wszystkich pism: wygenerowane, podpisane, wysłane, doręczone.",
};

type LetterStage =
  | "drafted"
  | "generated"
  | "signed"
  | "sent"
  | "delivered"
  | "responded";

type LetterEvent = {
  id: string;
  case_id: string;
  case_title: string;
  letter_kind: string;
  module: string;
  stage: LetterStage;
  at: string;
  meta?: string;
};

const STAGE_META: Record<
  LetterStage,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: "info" | "success" | "neutral" | "warning" }
> = {
  drafted: { label: "Szkic", icon: FileSignature, tone: "neutral" },
  generated: { label: "Wygenerowane", icon: Sparkles, tone: "info" },
  signed: { label: "Podpisane", icon: CheckCircle2, tone: "info" },
  sent: { label: "Wysłane", icon: Send, tone: "warning" },
  delivered: { label: "Doręczone", icon: Mail, tone: "success" },
  responded: { label: "Odpowiedź", icon: CheckCircle2, tone: "success" },
};

export default async function MojePismaPage() {
  const cases = await listCasesForCurrentUser();

  // Build a synthetic letter event stream from cases. We keep it conservative:
  // each case yields a single "generated" event at updated_at. Real wiring will
  // replace this with the letters timeline repository.
  const events: LetterEvent[] = cases.flatMap((c) => {
    const meta = caseTypeMeta[c.type];
    return [
      {
        id: `${c.id}-gen`,
        case_id: c.id,
        case_title: c.title,
        letter_kind: meta?.module ?? "Pismo procesowe",
        module: meta?.module ?? "—",
        stage: c.status === "draft" ? "drafted" : "generated",
        at: c.updated_at,
        meta: meta?.module ? `Moduł ${meta.module}` : undefined,
      },
    ];
  });

  // Sort newest first.
  events.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Korespondencja
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Moje pisma
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Chronologiczna oś wszystkich pism procesowych: od szkicu, przez
          podpis, aż po doręczenie i odpowiedź drugiej strony.
        </p>
      </header>

      {/* Filter strip (visual; client filter w Tier 40) */}
      <nav
        aria-label="Filtry pism"
        className="flex flex-wrap items-center gap-2 rounded-xl border border-iron-200 bg-white p-2 dark:border-iron-800 dark:bg-iron-950"
      >
        <span className="px-2 text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
          Pokaż
        </span>
        {(["all", "generated", "sent", "delivered"] as const).map((k) => (
          <button
            key={k}
            type="button"
            className="rounded-md px-3 py-1.5 text-fluid-sm font-semibold text-iron-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none aria-pressed:bg-dlugomat-700 aria-pressed:text-white dark:text-iron-200 dark:hover:bg-dlugomat-900"
            aria-pressed={k === "all"}
          >
            {k === "all"
              ? "Wszystkie"
              : k === "generated"
                ? "Wygenerowane"
                : k === "sent"
                  ? "Wysłane"
                  : "Doręczone"}
          </button>
        ))}
        <div className="ml-auto">
          <Button asChild size="sm" variant="secondary">
            <Link href="/panel/sprawy/nowa">
              Nowe pismo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </nav>

      {events.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="size-5" aria-hidden />}
          title="Nie masz jeszcze żadnych pism"
          description="Wygeneruj sprzeciw, ugodę lub odpowiedź — pojawi się tutaj jako pierwszy wpis na osi czasu."
          action={
            <Button asChild>
              <Link href="/panel/sprawy/nowa">Wygeneruj pismo</Link>
            </Button>
          }
        />
      ) : (
        <ol
          aria-label="Oś czasu pism"
          className="relative flex flex-col gap-4 border-l-2 border-iron-200 pl-6 dark:border-dlugomat-800"
        >
          {events.map((e) => {
            const m = STAGE_META[e.stage];
            const Icon = m.icon;
            return (
              <li key={e.id} className="relative">
                {/* node */}
                <span
                  aria-hidden
                  className="absolute -left-[33px] top-3 grid size-6 place-items-center rounded-full border-2 border-iron-200 bg-white text-dlugomat-700 dark:border-dlugomat-800 dark:bg-iron-950 dark:text-dlugomat-300"
                >
                  <Icon className="size-3" />
                </span>
                <Card elevation="flat">
                  <CardHeader>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <CardTitle className="text-fluid-base">
                        {e.letter_kind} · {e.case_title}
                      </CardTitle>
                      <Badge tone={m.tone}>{m.label}</Badge>
                    </div>
                    <CardDescription>
                      <Clock className="mr-1 inline size-4 align-text-bottom" aria-hidden />
                      {formatDateTimePL(new Date(e.at))}
                      {e.meta ? (
                        <span className="ml-2 text-iron-500">· {e.meta}</span>
                      ) : null}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/panel/sprawa/${e.case_id}`}>
                          Otwórz sprawę
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="size-4" />
                        Pobierz PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
