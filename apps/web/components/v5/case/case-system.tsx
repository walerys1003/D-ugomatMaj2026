"use client";

/**
 * V5 Case Management — Agent 07: Case Management System
 * --------------------------------------------------------------------------
 * Evidence timelines, procedural case maps, litigation dashboards,
 * win-probability systems. Binds to /api/cases/[id]/timeline,
 * /evidence, /virtual-judge, /win-probability.
 */
import * as React from "react";

import { V5Surface, V5Pill, V5Eyebrow } from "@/components/v5/primitives";
import { V5LivePulse, V5Reveal } from "@/components/v5/motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * Case Timeline — Procedural events
 * ─────────────────────────────────────────────────────────────────── */
type TimelineEvent = {
  date: string;
  type: "letter" | "court" | "ai" | "audit" | "sign";
  title: string;
  detail: string;
  status?: "ok" | "warn" | "err";
};

export function V5CaseTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <V5Surface variant="raised" className="p-7" topology="dots">
      <div className="flex items-center justify-between mb-6">
        <V5Eyebrow>Case timeline · procedural events</V5Eyebrow>
        <V5Pill tone="audit">/api/cases/[id]/timeline</V5Pill>
      </div>
      <ol className="relative">
        <span aria-hidden className="absolute left-[14px] top-3 bottom-3 w-px bg-[hsl(var(--v5-infra-200))]" />
        {events.map((e, i) => (
          <li key={i} className="relative pl-10 pb-5 last:pb-0">
            <span
              className={cn(
                "absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[0.5625rem] font-bold ring-4 ring-white",
                e.type === "letter" && "bg-[hsl(var(--v5-ink-700))] text-white",
                e.type === "court" && "bg-[hsl(var(--v5-audit-500))] text-white",
                e.type === "ai" && "bg-[hsl(var(--v5-violet-500))] text-white",
                e.type === "audit" && "bg-[hsl(var(--v5-ok))] text-white",
                e.type === "sign" && "bg-[hsl(var(--v5-ok))] text-white",
              )}
            >
              {e.type === "letter" ? "L" : e.type === "court" ? "C" : e.type === "ai" ? "AI" : e.type === "sign" ? "✓" : "◇"}
            </span>
            <div className="rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[0.6875rem] text-[hsl(var(--v5-ink-500))]">
                  {e.date}
                </span>
                {e.status && (
                  <V5Pill tone={e.status === "ok" ? "ok" : e.status === "warn" ? "warn" : "err"}>
                    {e.status}
                  </V5Pill>
                )}
              </div>
              <div className="text-[0.9375rem] font-medium text-[hsl(var(--v5-ink-900))]">{e.title}</div>
              <div className="text-[0.8125rem] text-[hsl(var(--v5-ink-500))] mt-1">{e.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Win Probability — Litigation analytics
 * ─────────────────────────────────────────────────────────────────── */
export function V5WinProbability({
  probability = 0.78,
  factors = defaultFactors,
}: {
  probability?: number;
  factors?: { label: string; weight: number; impact: "positive" | "negative" }[];
}) {
  const pct = Math.round(probability * 100);
  return (
    <V5Surface variant="elevated" className="p-7">
      <div className="flex items-center justify-between mb-6">
        <V5Eyebrow icon={<span className="text-[hsl(var(--v5-violet-500))]">◈</span>}>
          Win-probability engine
        </V5Eyebrow>
        <V5Pill tone="ai">/api/cases/[id]/win-probability</V5Pill>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] min-w-0">
        {/* Gauge */}
        <div className="flex flex-col items-center justify-center min-w-0">
          <div className="relative h-44 w-44">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="hsl(var(--v5-infra-150))"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="hsl(var(--v5-ok))"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${pct * 2.64} 264`}
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[2.75rem] font-semibold tracking-tight text-[hsl(var(--v5-ok))] leading-none">
                {pct}%
              </span>
              <span className="text-[0.6875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mt-1">
                win probability
              </span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-[0.8125rem] text-[hsl(var(--v5-ink-500))]">na podstawie</div>
            <div className="text-[0.875rem] font-semibold text-[hsl(var(--v5-ink-900))]">
              847 podobnych spraw
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="min-w-0">
          <div className="text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] font-semibold text-[hsl(var(--v5-ink-500))] mb-3">
            Czynniki decyzyjne
          </div>
          <ul className="space-y-2">
            {factors.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-[0.8125rem] min-w-0">
                <span
                  className={cn(
                    "font-mono w-8 shrink-0",
                    f.impact === "positive" ? "text-[hsl(var(--v5-ok))]" : "text-[hsl(var(--v5-err))]",
                  )}
                >
                  {f.impact === "positive" ? "+" : "−"}
                  {Math.round(f.weight * 100)}
                </span>
                <span className="flex-1 min-w-0 truncate text-[hsl(var(--v5-ink-900))]">{f.label}</span>
                <div className="w-20 sm:w-32 shrink-0 h-1 bg-[hsl(var(--v5-infra-150))] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full",
                      f.impact === "positive" ? "bg-[hsl(var(--v5-ok))]" : "bg-[hsl(var(--v5-err))]",
                    )}
                    style={{ width: `${Math.abs(f.weight) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </V5Surface>
  );
}

const defaultFactors = [
  { label: "Przedawnienie 3-letnie udokumentowane", weight: 0.32, impact: "positive" as const },
  { label: "Cesja wierzytelności — brak legitymacji", weight: 0.24, impact: "positive" as const },
  { label: "Wzorzec sądu rejonowego — pro-konsument", weight: 0.18, impact: "positive" as const },
  { label: "Brak dowodu doręczenia wezwania", weight: 0.12, impact: "positive" as const },
  { label: "Możliwy zarzut spóźnienia sprzeciwu", weight: 0.08, impact: "negative" as const },
];

/* ─────────────────────────────────────────────────────────────────────
 * Evidence Grid — Document evidence map
 * ─────────────────────────────────────────────────────────────────── */
export function V5EvidenceGrid() {
  const evidence = [
    { id: "EV-001", title: "Nakaz zapłaty III Nc 845/25", kind: "PDF", verified: true, hash: "0x9f3a..." },
    { id: "EV-002", title: "Umowa cesji wierzytelności", kind: "PDF", verified: true, hash: "0x4b2c..." },
    { id: "EV-003", title: "Wezwanie do zapłaty 2024-03", kind: "PDF", verified: true, hash: "0x812e..." },
    { id: "EV-004", title: "Wyciąg BIK — historia", kind: "PDF", verified: false, hash: "0x612a..." },
  ];

  return (
    <V5Surface variant="raised" className="p-7">
      <div className="flex items-center justify-between mb-5">
        <V5Eyebrow icon={<span>◆</span>}>Evidence chain</V5Eyebrow>
        <V5Pill tone="audit">/api/cases/[id]/evidence</V5Pill>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 min-w-0">
        {evidence.map((e) => (
          <div key={e.id} className="flex min-w-0 items-start gap-3 rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-4 hover:border-[hsl(var(--v5-violet-500)/0.4)] transition-colors">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--v5-radius-sm)] bg-[hsl(var(--v5-infra-50))] font-mono text-[0.625rem] font-semibold text-[hsl(var(--v5-ink-700))]">
              {e.kind}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.875rem] font-medium text-[hsl(var(--v5-ink-900))] truncate">{e.title}</div>
              <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))] mt-0.5 truncate">
                {e.id} · {e.hash}
              </div>
              <div className="mt-2">
                {e.verified ? (
                  <V5Pill tone="ok">✓ signed</V5Pill>
                ) : (
                  <V5Pill tone="warn">unverified</V5Pill>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </V5Surface>
  );
}
