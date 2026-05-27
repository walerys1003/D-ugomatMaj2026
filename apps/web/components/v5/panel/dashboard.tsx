"use client";

/**
 * V5 Panel Dashboard — Agent 04
 * --------------------------------------------------------------------------
 * Operating-system feeling. Procedural KPI overview + active workflows +
 * AI orchestration status. Binds to /api/dashboard (orphaned endpoint).
 */
import * as React from "react";

import {
  V5Eyebrow,
  V5Pill,
  V5Surface,
  V5Hairline,
  V5Stat,
} from "@/components/v5/primitives";
import { V5DataFlow, V5LivePulse, V5Reveal } from "@/components/v5/motion";

export function V5PanelDashboard() {
  return (
    <div className="px-8 py-8 space-y-8">
      {/* ─── KPI strip ─── */}
      <V5Reveal>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { label: "Sprawy aktywne", value: "12", delta: { value: "+2", direction: "up" as const } },
            { label: "Pisma w tym tygodniu", value: "7", delta: { value: "+3", direction: "up" as const }, tone: "ai" as const },
            { label: "Terminy 7 dni", value: "3", delta: { value: "0", direction: "flat" as const } },
            { label: "Win-prob średnie", value: "78%", delta: { value: "+4", direction: "up" as const }, tone: "ok" as const },
          ].map((k, i) => (
            <V5Surface key={i} variant="raised" className="p-6">
              <V5Stat
                label={k.label}
                value={k.value}
                delta={k.delta}
                tone={k.tone ?? "neutral"}
              />
            </V5Surface>
          ))}
        </div>
      </V5Reveal>

      {/* ─── Two-column workflow ─── */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Active workflows */}
        <V5Reveal delay={80}>
          <V5Surface variant="raised" className="p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <V5Eyebrow icon={<span>◆</span>}>Active workflows</V5Eyebrow>
                <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mt-2">
                  Sprawy w toku
                </h3>
              </div>
              <V5Pill tone="ai" pulse>
                4 AGENT ACTIVE
              </V5Pill>
            </div>
            <ul className="divide-y divide-[hsl(var(--v5-infra-150))]">
              {workflows.map((w) => (
                <li key={w.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-infra-50))] font-mono text-[0.6875rem] font-semibold text-[hsl(var(--v5-ink-700))]">
                    {w.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.9375rem] font-medium text-[hsl(var(--v5-ink-900))] truncate">
                      {w.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))]">
                      <span>{w.module}</span>
                      <span aria-hidden>·</span>
                      <span>{w.creditor}</span>
                      <span aria-hidden>·</span>
                      <span>{w.amount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={w.progress} />
                    <V5Pill tone={w.status === "active" ? "ai" : w.status === "audit" ? "audit" : "ok"} pulse={w.status === "active"}>
                      {w.statusLabel}
                    </V5Pill>
                  </div>
                </li>
              ))}
            </ul>
          </V5Surface>
        </V5Reveal>

        {/* AI Agent + Reasoning stream */}
        <V5Reveal delay={160}>
          <V5Surface variant="ai" className="p-7">
            <div className="flex items-center justify-between mb-5">
              <V5Eyebrow pulse icon={<span className="text-[hsl(var(--v5-violet-500))]">◆</span>}>
                AI orchestration
              </V5Eyebrow>
              <V5LivePulse tone="ai" size={8} />
            </div>
            <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-1">
              Asystent procedural
            </h3>
            <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-5">
              Generuję sprzeciw EPU dla sprawy CASE-2847.
            </p>
            <ul className="space-y-2.5 mb-5">
              {[
                { l: "retrieval · vector_search", s: "done" },
                { l: "reasoning · irac_chain", s: "done" },
                { l: "generation · sprzeciw.docx", s: "active" },
                { l: "audit · sign_evidence", s: "pending" },
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-[0.8125rem] font-mono">
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (step.s === "done"
                        ? "bg-[hsl(var(--v5-ok))]"
                        : step.s === "active"
                          ? "bg-[hsl(var(--v5-violet-500))] [animation:v5-pulse-soft_2.4s_ease-in-out_infinite]"
                          : "bg-[hsl(var(--v5-infra-300))]")
                    }
                  />
                  <span className={step.s === "pending" ? "text-[hsl(var(--v5-ink-500))]" : "text-[hsl(var(--v5-ink-900))]"}>
                    {step.l}
                  </span>
                </li>
              ))}
            </ul>
            <V5DataFlow tone="ai" />
            <div className="mt-5 grid grid-cols-2 gap-3 text-[0.75rem] font-mono">
              <div>
                <div className="text-[hsl(var(--v5-ink-500))]">model</div>
                <div className="text-[hsl(var(--v5-ink-900))] font-semibold">claude-3.5-sonnet</div>
              </div>
              <div>
                <div className="text-[hsl(var(--v5-ink-500))]">latency</div>
                <div className="text-[hsl(var(--v5-ink-900))] font-semibold">412ms</div>
              </div>
            </div>
          </V5Surface>
        </V5Reveal>
      </div>

      {/* ─── Bottom: deadlines + recent docs ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <V5Reveal delay={200}>
          <V5Surface variant="raised" className="p-7">
            <div className="flex items-center justify-between mb-5">
              <V5Eyebrow>Terminy procesowe</V5Eyebrow>
              <span className="text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))]">
                /api/deadlines/due
              </span>
            </div>
            <ul className="space-y-3">
              {deadlines.map((d, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center rounded-[var(--v5-radius-sm)] border border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-infra-50))] px-3 py-2 font-mono">
                    <span className="text-[0.625rem] text-[hsl(var(--v5-ink-500))]">{d.month}</span>
                    <span className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] leading-none">
                      {d.day}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.9375rem] font-medium text-[hsl(var(--v5-ink-900))] truncate">
                      {d.title}
                    </div>
                    <div className="text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))]">{d.case}</div>
                  </div>
                  <V5Pill tone={d.urgency === "high" ? "err" : d.urgency === "med" ? "warn" : "neutral"}>
                    {d.left}
                  </V5Pill>
                </li>
              ))}
            </ul>
          </V5Surface>
        </V5Reveal>

        <V5Reveal delay={240}>
          <V5Surface variant="raised" className="p-7">
            <div className="flex items-center justify-between mb-5">
              <V5Eyebrow>Ostatnie dokumenty</V5Eyebrow>
              <span className="text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))]">
                /api/documents
              </span>
            </div>
            <ul className="space-y-1">
              {documents.map((doc, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-[var(--v5-radius-sm)] px-2 py-2 hover:bg-[hsl(var(--v5-infra-50))] transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--v5-radius-sm)] border border-[hsl(var(--v5-infra-200))] bg-white font-mono text-[0.625rem] text-[hsl(var(--v5-ink-500))]">
                    {doc.kind}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.875rem] font-medium text-[hsl(var(--v5-ink-900))] truncate">
                      {doc.title}
                    </div>
                    <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">
                      v{doc.version} · {doc.when}
                    </div>
                  </div>
                  {doc.ai && (
                    <V5Pill tone="ai">AI</V5Pill>
                  )}
                </li>
              ))}
            </ul>
          </V5Surface>
        </V5Reveal>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="hidden md:block w-24 h-1.5 bg-[hsl(var(--v5-infra-150))] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-[hsl(var(--v5-violet-500))] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const workflows = [
  { id: "C-2847", title: "Sprzeciw od nakazu EPU — BIG Casus", module: "EPU", creditor: "BIG Casus S.A.", amount: "4 217 PLN", progress: 67, status: "active", statusLabel: "AI WORKING" },
  { id: "C-2843", title: "Skarga na komornika — czynności egzekucyjne", module: "Komornik", creditor: "Komornik Kowalski", amount: "—", progress: 92, status: "audit", statusLabel: "REVIEW" },
  { id: "C-2839", title: "Cesja wierzytelności — weryfikacja legitymacji", module: "Cesja", creditor: "Ultimo S.A.", amount: "8 940 PLN", progress: 45, status: "active", statusLabel: "AI WORKING" },
  { id: "C-2831", title: "Sprostowanie wpisu BIK", module: "BIK", creditor: "Santander", amount: "—", progress: 100, status: "done", statusLabel: "DONE" },
];

const deadlines = [
  { month: "MAJ", day: "31", title: "Sprzeciw EPU — termin", case: "CASE-2847", urgency: "high", left: "4 dni" },
  { month: "CZE", day: "07", title: "Odpowiedź na pozew", case: "CASE-2839", urgency: "med", left: "11 dni" },
  { month: "CZE", day: "14", title: "Rozprawa SO Warszawa", case: "CASE-2812", urgency: "low", left: "18 dni" },
];

const documents = [
  { kind: "DOC", title: "Sprzeciw EPU — BIG Casus.docx", version: 3, when: "12 min temu", ai: true },
  { kind: "PDF", title: "Nakaz zapłaty III Nc 845/25.pdf", version: 1, when: "2h temu" },
  { kind: "DOC", title: "Skarga na komornika — Kowalski.docx", version: 2, when: "wczoraj", ai: true },
  { kind: "PDF", title: "Wezwanie do zapłaty BIG.pdf", version: 1, when: "wczoraj" },
];
