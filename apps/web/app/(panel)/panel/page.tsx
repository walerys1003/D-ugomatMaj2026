import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  ScanLine,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow, Heading, Text, Stat } from "@/components/ui/typography";
import {
  listCasesForCurrentUser,
  listDeadlinesForCurrentUser,
} from "@/lib/cases/case-repository";
import { caseStatusLabel, caseTypeMeta } from "@/lib/cases/case-types";
import {
  daysUntil,
  formatDatePL,
  formatDateTimePL,
} from "@/lib/utils";
import type { CaseStatus } from "@/lib/db/types";

export const metadata: Metadata = { title: "Pulpit · Długomat" };

/**
 * Pulpit v3 — Tarcza "Stoic".
 *
 * Vs v2:
 *  - Wszystkie typography przez primitivy (Eyebrow/Heading/Text/Stat).
 *  - Container/max-w przeniesione do layout (panel/layout.tsx + app-shell main),
 *    page renderuje tylko treść — eliminuje ad-hoc max-w-[1120px].
 *  - Stat primitive zamiast lokalnego StatTile helper (codeshare z TrustBar).
 *  - Surface flat zamiast custom rounded-lg border iron-* — true ink.
 *  - Tighter gap-8 zamiast gap-10 (8pt grid), tighter list gap-1.5.
 *  - Hero strip — Eyebrow "Pulpit" + Heading level=1 (3xl/4xl) + Text base.
 *  - Reco cards w Surface interactive — same primitive co landing modules.
 */

export default async function PanelHomePage() {
  const [cases, deadlines] = await Promise.all([
    listCasesForCurrentUser(),
    listDeadlinesForCurrentUser(),
  ]);

  const activeCases = cases.filter(
    (c) => c.status !== "completed" && c.status !== "downloaded"
  );
  const upcomingDeadlines = deadlines.filter((d) => {
    const days = daysUntil(d.deadline_date);
    return days >= 0 && days <= 7;
  });
  const generatingCount = cases.filter((c) => c.status === "analysis" || c.status === "generated")
    .length;
  const savingsPln = cases.length * 2500;

  const heroCta = cases.length === 0
    ? { href: "/panel/skaner", label: "Zeskanuj nakaz", icon: ScanLine }
    : upcomingDeadlines.length > 0
      ? { href: `/panel/sprawa/${upcomingDeadlines[0].case_id}`, label: "Otwórz najpilniejszą", icon: ArrowRight }
      : { href: "/panel/sprawy/nowa", label: "Nowa sprawa", icon: Sparkles };

  return (
    <div className="flex flex-col gap-8">
      {/* --- HERO STRIP --- */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Eyebrow tone="brand">Pulpit</Eyebrow>
          <Heading level={1} as="h1">
            Witaj w&nbsp;Długomacie
          </Heading>
          <Text size="base" tone="muted" className="max-w-[60ch]">
            {cases.length === 0
              ? "Zacznij od skanu nakazu — sprawdzimy przedawnienie i podpowiemy następny krok."
              : `Masz ${activeCases.length} ${activeCases.length === 1 ? "aktywną sprawę" : "aktywne sprawy"}. ${upcomingDeadlines.length > 0 ? `${upcomingDeadlines.length} ${upcomingDeadlines.length === 1 ? "termin" : "terminy"} w najbliższych 7 dniach.` : "Brak pilnych terminów."}`}
          </Text>
        </div>

        <Button asChild size="lg" className="self-start lg:self-auto">
          <Link href={heroCta.href} className="flex items-center gap-2">
            <heroCta.icon className="size-4" aria-hidden />
            <span>{heroCta.label}</span>
          </Link>
        </Button>
      </header>

      {/* --- STAT TILES — używają Stat primitive --- */}
      <Surface
        elevation="raised"
        padded="none"
        className="grid divide-ink-200 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 dark:divide-ink-200"
      >
        <div className="p-5">
          <Stat
            size="md"
            icon={<FileText className="size-3.5" aria-hidden />}
            label="Sprawy aktywne"
            value={String(activeCases.length)}
            hint={cases.length === 0 ? "Brak — zacznij od skanu" : `z ${cases.length} łącznie`}
            tone="default"
          />
        </div>
        <div className="p-5">
          <Stat
            size="md"
            icon={<CalendarClock className="size-3.5" aria-hidden />}
            label="Terminy w 7 dniach"
            value={String(upcomingDeadlines.length)}
            hint={upcomingDeadlines.length > 0 ? "Otwórz w kalendarzu" : "Wszystko pod kontrolą"}
            tone={upcomingDeadlines.length > 2 ? "danger" : upcomingDeadlines.length > 0 ? "warning" : "success"}
          />
        </div>
        <div className="p-5">
          <Stat
            size="md"
            icon={<Sparkles className="size-3.5" aria-hidden />}
            label="Pisma w generowaniu"
            value={String(generatingCount)}
            hint="AI pracuje w tle"
            tone="brand"
          />
        </div>
        <div className="p-5">
          <Stat
            size="md"
            icon={<TrendingUp className="size-3.5" aria-hidden />}
            label="Oszczędność"
            value={`${(savingsPln / 1000).toFixed(1)} k`}
            hint="vs. kancelaria (2 500 PLN/pismo)"
            tone="success"
          />
        </div>
      </Surface>

      {/* --- DEADLINES + RECENT CASES (two columns) --- */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* Pilne terminy */}
        <section aria-labelledby="upcoming-deadlines" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Heading level={2} id="upcoming-deadlines" as="h2">
              Nadchodzące terminy
            </Heading>
            <Link
              href="/panel/kalendarz"
              className="inline-flex items-center gap-1 text-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
            >
              Kalendarz
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>

          {deadlines.length === 0 ? (
            <Surface elevation="flat" padded="lg">
              <EmptyState
                icon={<CalendarClock className="size-5" aria-hidden />}
                title="Brak terminów"
                description="Po utworzeniu sprawy automatycznie pojawią się tu terminy procesowe."
              />
            </Surface>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {deadlines.slice(0, 5).map((d) => {
                const days = daysUntil(d.deadline_date);
                const tone =
                  days <= 0 ? "danger" : days <= 3 ? "danger" : days <= 7 ? "warning" : "info";
                return (
                  <li key={d.id}>
                    <Link
                      href={`/panel/sprawa/${d.case_id}`}
                      className="group flex items-center justify-between gap-3 rounded-md border border-ink-200 bg-card p-3 transition-colors hover:border-ink-300 hover:bg-ink-50 dark:border-ink-200 dark:hover:bg-dlugomat-900/60"
                    >
                      <div className="min-w-0 flex-1">
                        <Text size="sm" tone="strong" weight="medium" as="div" className="truncate">
                          {d.description}
                        </Text>
                        <Text size="xs" tone="muted" as="div">
                          {formatDatePL(new Date(d.deadline_date))}
                        </Text>
                      </div>
                      <Badge tone={tone} className="shrink-0 tabular-nums">
                        {days <= 0 ? "po terminie" : days === 1 ? "1 dzień" : `${days} dni`}
                      </Badge>
                      <ArrowRight
                        className="size-3.5 shrink-0 text-ink-400 transition-colors group-hover:text-dlugomat-700"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Ostatnie sprawy */}
        <section aria-labelledby="recent-cases" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Heading level={2} id="recent-cases" as="h2">
              Twoje sprawy
            </Heading>
            <Link
              href="/panel/sprawy"
              className="inline-flex items-center gap-1 text-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
            >
              Wszystkie
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>

          {cases.length === 0 ? (
            <Surface elevation="flat" padded="lg">
              <EmptyState
                icon={<FileText className="size-5" aria-hidden />}
                title="Jeszcze nie masz spraw"
                description="Rozpocznij od skanu nakazu lub utwórz sprawę dla wybranego modułu."
                action={
                  <Button asChild>
                    <Link href="/panel/sprawy/nowa">Utwórz sprawę</Link>
                  </Button>
                }
              />
            </Surface>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {cases.slice(0, 5).map((c) => {
                const meta = caseTypeMeta[c.type];
                return (
                  <li key={c.id}>
                    <Link
                      href={`/panel/sprawa/${c.id}`}
                      className="group flex items-center justify-between gap-3 rounded-md border border-ink-200 bg-card p-3 transition-colors hover:border-ink-300 hover:bg-ink-50 dark:border-ink-200 dark:hover:bg-dlugomat-900/60"
                    >
                      <div className="min-w-0 flex-1">
                        <Text size="sm" tone="strong" weight="medium" as="div" className="truncate">
                          {c.title}
                        </Text>
                        <Text size="xs" tone="muted" as="div">
                          {meta.module} · {formatDateTimePL(new Date(c.updated_at))}
                        </Text>
                      </div>
                      <Badge tone={statusToTone(c.status)} className="shrink-0">
                        {caseStatusLabel[c.status]}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Divider />

      {/* --- AI RECOMMENDATIONS --- */}
      <section aria-labelledby="ai-recos" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow tone="brand" withDot>
            Rekomendacje AI
          </Eyebrow>
          <Heading level={2} id="ai-recos" as="h2">
            Co warto sprawdzić dalej
          </Heading>
          <Text size="sm" tone="muted">
            Sugestie na podstawie Twojej sytuacji. Każda akcja jest opcjonalna.
          </Text>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <RecoCard
            icon={ShieldCheck}
            href="/panel/skaner"
            title="Sprawdź najnowsze pismo"
            description="Każdy nowy nakaz lub list od komornika warto najpierw przeskanować."
            cta="Otwórz skaner"
          />
          <RecoCard
            icon={TrendingUp}
            href="/panel/moje-zadluzenie"
            title="Zbuduj plan spłaty"
            description="Konsolidacja długów pozwala obniżyć ratę o 30–50%."
            cta="Otwórz moduł"
          />
          <RecoCard
            icon={FileText}
            href="/panel/baza-orzecznicza"
            title="Baza wiedzy"
            description="14 najnowszych wyroków SN dotyczących przedawnienia roszczeń."
            cta="Czytaj"
          />
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// Helpers
// =========================================================================

function RecoCard({
  icon: Icon,
  href,
  title,
  description,
  cta,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-md focus-visible:shadow-shield-focus focus-visible:outline-none"
    >
      <Surface elevation="flat" padded="md" interactive className="flex h-full flex-col gap-3">
        <span className="grid size-8 place-items-center rounded bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <Heading level={3} as="h3">
            {title}
          </Heading>
          <Text size="sm" tone="muted">
            {description}
          </Text>
        </div>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-dlugomat-700 dark:text-dlugomat-300">
          {cta}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Surface>
    </Link>
  );
}

function statusToTone(status: CaseStatus): "info" | "warning" | "success" | "neutral" {
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
