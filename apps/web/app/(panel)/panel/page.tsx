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
 * Pulpit użytkownika v2 (Tarcza Premium).
 *
 * Stary dashboard miał 3 quick-actions które dublowały sidebar i jeden CTA
 * prowadzący w to samo miejsce ("/panel/sprawy/nowa") z trzech kart. Nowy
 * dashboard skupia się na CO TERAZ:
 *
 *   1. Hero strip — przywitanie + 1 dominujący CTA bazujący na stanie
 *      (jeśli 0 spraw → "Zeskanuj nakaz"; jeśli >0 → "Otwórz najpilniejszą")
 *   2. Stat tiles — 4 liczby pokazujące postępy (sprawy aktywne, terminy w 7 dni,
 *      pisma w generowaniu, oszczędność vs prawnik)
 *   3. Najpilniejsze terminy — z urgency, tabular-nums, link wprost do sprawy
 *   4. Ostatnie sprawy — z modułem i timestampem
 *   5. Rekomendacje AI — co warto sprawdzić (BIK, plan spłaty)
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
  // Oszczędność = liczba spraw × 2500 PLN (mediana ceny sprzeciwu w kancelarii)
  const savingsPln = cases.length * 2500;

  const heroCta = cases.length === 0
    ? { href: "/panel/skaner", label: "Zeskanuj nakaz", icon: ScanLine, note: "darmowe, 2 minuty" }
    : upcomingDeadlines.length > 0
      ? { href: `/panel/sprawa/${upcomingDeadlines[0].case_id}`, label: "Otwórz najpilniejszą sprawę", icon: ArrowRight, note: `${upcomingDeadlines[0].description} · ${daysUntil(upcomingDeadlines[0].deadline_date)} dni` }
      : { href: "/panel/sprawy/nowa", label: "Nowa sprawa", icon: Sparkles, note: "wybierz moduł i rozpocznij" };

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-10">
      {/* --- HERO STRIP --- */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-fluid-xs font-semibold uppercase tracking-[0.18em] text-dlugomat-600 dark:text-dlugomat-300">
            Pulpit
          </p>
          <h1 className="font-display text-fluid-4xl font-semibold tracking-tight text-iron-900 dark:text-white">
            Witaj w Długomacie
          </h1>
          <p className="text-fluid-base text-iron-600 dark:text-iron-300">
            {cases.length === 0
              ? "Zacznij od skanu nakazu — sprawdzimy przedawnienie i podpowiemy następny krok."
              : `Masz ${activeCases.length} ${activeCases.length === 1 ? "aktywną sprawę" : "aktywne sprawy"}. ${upcomingDeadlines.length > 0 ? `${upcomingDeadlines.length} ${upcomingDeadlines.length === 1 ? "termin" : "terminy"} w najbliższych 7 dniach.` : "Brak pilnych terminów."}`}
          </p>
        </div>

        <Button asChild size="lg" className="self-start lg:self-auto">
          <Link href={heroCta.href} className="flex items-center gap-2">
            <heroCta.icon className="size-4" aria-hidden />
            <span>{heroCta.label}</span>
          </Link>
        </Button>
      </header>

      {/* --- STAT TILES --- */}
      <dl className="grid divide-iron-200 rounded-lg border border-iron-200/80 bg-card sm:grid-cols-2 sm:divide-x lg:grid-cols-4 dark:divide-iron-800 dark:border-iron-800/60">
        <StatTile
          icon={FileText}
          label="Sprawy aktywne"
          value={String(activeCases.length)}
          note={cases.length === 0 ? "Brak — zacznij od skanu" : `z ${cases.length} łącznie`}
          tone="info"
        />
        <StatTile
          icon={CalendarClock}
          label="Terminy w 7 dniach"
          value={String(upcomingDeadlines.length)}
          note={upcomingDeadlines.length > 0 ? "Otwórz w kalendarzu" : "Wszystko pod kontrolą"}
          tone={upcomingDeadlines.length > 2 ? "danger" : upcomingDeadlines.length > 0 ? "warning" : "success"}
        />
        <StatTile
          icon={Sparkles}
          label="Pisma w generowaniu"
          value={String(generatingCount)}
          note="AI pracuje w tle"
          tone="info"
        />
        <StatTile
          icon={TrendingUp}
          label="Oszczędność"
          value={`${(savingsPln / 1000).toFixed(1)} k PLN`}
          note="vs. kancelaria (mediana 2 500 PLN/pismo)"
          tone="success"
        />
      </dl>

      {/* --- DEADLINES + RECENT CASES (two columns) --- */}
      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* Pilne terminy */}
        <section aria-labelledby="upcoming-deadlines" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2
              id="upcoming-deadlines"
              className="font-display text-fluid-xl font-semibold text-iron-900 dark:text-white"
            >
              Nadchodzące terminy
            </h2>
            <Link
              href="/panel/kalendarz"
              className="text-fluid-sm font-medium text-dlugomat-700 hover:underline dark:text-dlugomat-300"
            >
              Kalendarz →
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
            <ul className="flex flex-col gap-2">
              {deadlines.slice(0, 5).map((d) => {
                const days = daysUntil(d.deadline_date);
                const tone =
                  days <= 0 ? "danger" : days <= 3 ? "danger" : days <= 7 ? "warning" : "info";
                return (
                  <li key={d.id}>
                    <Link
                      href={`/panel/sprawa/${d.case_id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-iron-200/80 bg-card p-3.5 transition-colors hover:border-dlugomat-300 hover:bg-iron-50/60 dark:border-iron-800/60 dark:hover:border-dlugomat-700 dark:hover:bg-dlugomat-900/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-fluid-sm font-medium text-iron-900 dark:text-iron-50">
                          {d.description}
                        </p>
                        <p className="text-fluid-xs text-iron-500">
                          {formatDatePL(new Date(d.deadline_date))}
                        </p>
                      </div>
                      <Badge tone={tone} withDot className="shrink-0 tabular-nums">
                        {days <= 0 ? "po terminie" : days === 1 ? "1 dzień" : `${days} dni`}
                      </Badge>
                      <ArrowRight
                        className="size-4 shrink-0 text-iron-400 transition-colors group-hover:text-dlugomat-600"
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
            <h2
              id="recent-cases"
              className="font-display text-fluid-xl font-semibold text-iron-900 dark:text-white"
            >
              Twoje sprawy
            </h2>
            <Link
              href="/panel/sprawy"
              className="text-fluid-sm font-medium text-dlugomat-700 hover:underline dark:text-dlugomat-300"
            >
              Wszystkie →
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
            <ul className="flex flex-col gap-2">
              {cases.slice(0, 5).map((c) => {
                const meta = caseTypeMeta[c.type];
                return (
                  <li key={c.id}>
                    <Link
                      href={`/panel/sprawa/${c.id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-iron-200/80 bg-card p-3.5 transition-colors hover:border-dlugomat-300 hover:bg-iron-50/60 dark:border-iron-800/60 dark:hover:border-dlugomat-700 dark:hover:bg-dlugomat-900/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-fluid-sm font-medium text-iron-900 dark:text-iron-50">
                          {c.title}
                        </p>
                        <p className="text-fluid-xs text-iron-500">
                          {meta.module} · {formatDateTimePL(new Date(c.updated_at))}
                        </p>
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
      <section aria-labelledby="ai-recos" className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-dlugomat-600 dark:text-dlugomat-300" aria-hidden />
          <h2
            id="ai-recos"
            className="font-display text-fluid-xl font-semibold text-iron-900 dark:text-white"
          >
            Rekomendacje AI
          </h2>
        </div>
        <p className="text-fluid-sm text-iron-500">
          Sugestie na podstawie Twojej sytuacji. Każda akcja jest opcjonalna.
        </p>
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
            description="14 najnowszych wyroków SN dotyczących przedawnienia roszczeń konsumenckich."
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

interface StatTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  tone: "info" | "success" | "warning" | "danger";
}

function StatTile({ icon: Icon, label, value, note, tone }: StatTileProps) {
  const toneClasses: Record<StatTileProps["tone"], string> = {
    info: "text-dlugomat-700 dark:text-dlugomat-300",
    success: "text-accent-700 dark:text-accent-300",
    warning: "text-warn-600 dark:text-warn-500",
    danger: "text-danger-600 dark:text-danger-500",
  };
  return (
    <div className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${toneClasses[tone]}`} aria-hidden />
        <dt className="text-fluid-xs font-medium uppercase tracking-wider text-iron-500">
          {label}
        </dt>
      </div>
      <dd>
        <p className="font-display text-fluid-3xl font-semibold tabular-nums text-iron-900 dark:text-white">
          {value}
        </p>
        <p className="mt-0.5 text-fluid-xs text-iron-500 dark:text-iron-400">{note}</p>
      </dd>
    </div>
  );
}

function RecoCard({
  icon: Icon,
  href,
  title,
  description,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Surface elevation="flat" padded="md" interactive className="flex h-full flex-col gap-3">
      <span className="grid size-9 place-items-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="flex flex-1 flex-col">
        <h3 className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">{title}</h3>
        <p className="mt-1 text-fluid-sm text-iron-600 dark:text-iron-300">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-fluid-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
      >
        {cta}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </Surface>
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
