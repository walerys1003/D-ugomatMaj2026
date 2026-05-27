"use client";

/**
 * V5 Hero Cockpit — Agent 02: Landing Page Redesign
 * --------------------------------------------------------------------------
 * Hero ma wyglądać jak AI legal control center / procedural cockpit /
 * infrastructure orchestration panel. NIE jak marketing hero.
 *
 * Composition:
 *   left  — proposition + CTA + audit signals
 *   right — live procedural cockpit (cases, AI reasoning, audit chain)
 */
import * as React from "react";
import Link from "next/link";

import {
  V5Body,
  V5Button,
  V5Container,
  V5Eyebrow,
  V5Headline,
  V5Pill,
  V5Surface,
} from "@/components/v5/primitives";
import { V5DataFlow, V5LivePulse, V5Reveal, V5Stagger } from "@/components/v5/motion";

export function V5HeroCockpit() {
  return (
    <section className="relative isolate overflow-hidden bg-[hsl(var(--v5-infra-25))] pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Ambient infrastructure backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 v5-topology-grid opacity-[0.4] v5-topology-fade"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1100px] rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--v5-violet-500)) 0%, transparent 60%)",
        }}
      />

      <V5Container width="max" className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1.15fr] lg:gap-20">
          {/* ─── LEFT — Proposition ─── */}
          <div className="flex flex-col gap-10 min-w-0">
            <V5Reveal>
              <V5Eyebrow pulse>
                Procedural Intelligence · System v5
              </V5Eyebrow>
            </V5Reveal>

            <V5Reveal delay={80}>
              <V5Headline level="h1">
                Legal operating system{" "}
                <span className="text-[hsl(var(--v5-violet-500))]">
                  dla zadłużonych.
                </span>
              </V5Headline>
            </V5Reveal>

            <V5Reveal delay={160}>
              <V5Body size="lg" className="max-w-[44ch]">
                Procedural reasoning engine, audit-native AI i infrastructure-grade
                automation w jednej platformie. Skanuj nakaz, analizuj zadłużenie,
                generuj pisma — z pełną ścieżką audytu od źródła do podpisu.
              </V5Body>
            </V5Reveal>

            <V5Reveal delay={240}>
              <div className="flex flex-wrap items-center gap-4">
                <V5Button size="lg" asChild>
                  <Link href="/skaner-nakazu">
                    Uruchom skaner nakazu
                    <span aria-hidden className="ml-1">
                      →
                    </span>
                  </Link>
                </V5Button>
                <V5Button size="lg" variant="secondary" asChild>
                  <Link href="/jak-to-dziala">Architektura systemu</Link>
                </V5Button>
              </div>
            </V5Reveal>

            <V5Reveal delay={320}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <V5LivePulse tone="ok" size={6} />
                  <span className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] font-mono">
                    99.97% uptime
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <V5LivePulse tone="ai" size={6} />
                  <span className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] font-mono">
                    GPT-5 · Claude · routing
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <V5LivePulse tone="audit" size={6} />
                  <span className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] font-mono">
                    audit-native · RODO
                  </span>
                </div>
              </div>
            </V5Reveal>
          </div>

          {/* ─── RIGHT — Procedural Cockpit ─── */}
          <V5Reveal delay={400} direction="left">
            <CockpitPanel />
          </V5Reveal>
        </div>
      </V5Container>
    </section>
  );
}

/* ============================================================================
 * Cockpit Panel — Live infrastructure visualization
 * ============================================================================ */

function CockpitPanel() {
  return (
    <V5Surface variant="elevated" topology="grid" className="p-7 lg:p-9">
      {/* Header — system status */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--v5-infra-200))] pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] text-white">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path
                d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V4L8 1z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div>
            <div className="text-[0.875rem] font-semibold text-[hsl(var(--v5-ink-900))]">
              Tarcza Control Center
            </div>
            <div className="text-[0.75rem] text-[hsl(var(--v5-ink-500))] font-mono">
              ORG-7821 · prod-eu-warsaw-1
            </div>
          </div>
        </div>
        <V5Pill tone="ai" pulse>
          AI ACTIVE
        </V5Pill>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <KpiTile label="Sprawy" value="184" delta="+12" tone="neutral" />
        <KpiTile label="Pisma AI / 24h" value="47" delta="+8" tone="ai" />
        <KpiTile label="Win-prob avg" value="78%" delta="+4" tone="ok" />
      </div>

      {/* Live reasoning chain */}
      <div className="rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-infra-50))] border border-[hsl(var(--v5-infra-200))] p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] font-semibold text-[hsl(var(--v5-violet-700))]">
            Reasoning Chain
          </span>
          <span className="text-[0.6875rem] text-[hsl(var(--v5-ink-500))] font-mono">
            CASE-2847
          </span>
        </div>
        <ReasoningStep
          step="01"
          label="Skanowanie nakazu zapłaty"
          status="done"
          detail="OCR + NLP · 14 art. zidentyfikowanych"
        />
        <ReasoningStep
          step="02"
          label="Analiza wierzytelności"
          status="done"
          detail="Cesja BIG → cesja Casus → przedawnienie 3 lata"
        />
        <ReasoningStep
          step="03"
          label="Generowanie sprzeciwu EPU"
          status="active"
          detail="agent.run() · 4 wzorce · IRAC validation"
        />
        <ReasoningStep
          step="04"
          label="Verification + audit signing"
          status="pending"
          detail="EPUAP · signed-evidence-chain"
        />
      </div>

      {/* Data flow indicator */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))]">
          <span>retrieval → reasoning → audit</span>
          <span className="text-[hsl(var(--v5-violet-500))]">streaming</span>
        </div>
        <V5DataFlow tone="ai" speed="normal" />
      </div>

      {/* Bottom strip — orchestrated modules */}
      <div className="flex flex-wrap gap-2">
        <ModuleChip label="Skaner" active />
        <ModuleChip label="EPU" active />
        <ModuleChip label="BIK" />
        <ModuleChip label="Komornik" />
        <ModuleChip label="Cesja" />
        <ModuleChip label="Ugoda" />
        <ModuleChip label="Upadłość" />
      </div>
    </V5Surface>
  );
}

function KpiTile({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "ai" | "ok";
}) {
  const color =
    tone === "ai"
      ? "text-[hsl(var(--v5-violet-500))]"
      : tone === "ok"
        ? "text-[hsl(var(--v5-ok))]"
        : "text-[hsl(var(--v5-ink-900))]";
  return (
    <div className="rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-3">
      <div className="text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] font-semibold text-[hsl(var(--v5-ink-500))] mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[1.5rem] leading-none font-mono font-semibold ${color}`}>
          {value}
        </span>
        <span className="text-[0.75rem] font-mono text-[hsl(var(--v5-ok))]">
          ↑ {delta}
        </span>
      </div>
    </div>
  );
}

function ReasoningStep({
  step,
  label,
  status,
  detail,
}: {
  step: string;
  label: string;
  status: "done" | "active" | "pending";
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
      <div
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[0.625rem] font-semibold " +
          (status === "done"
            ? "bg-[hsl(var(--v5-ok))] text-white"
            : status === "active"
              ? "bg-[hsl(var(--v5-violet-500))] text-white [animation:v5-pulse-glow_2.4s_ease-in-out_infinite]"
              : "bg-[hsl(var(--v5-infra-150))] text-[hsl(var(--v5-ink-500))]")
        }
      >
        {status === "done" ? "✓" : step}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={
            "text-[0.8125rem] font-medium " +
            (status === "pending"
              ? "text-[hsl(var(--v5-ink-500))]"
              : "text-[hsl(var(--v5-ink-900))]")
          }
        >
          {label}
        </div>
        <div className="text-[0.6875rem] text-[hsl(var(--v5-ink-500))] font-mono mt-0.5 truncate">
          {detail}
        </div>
      </div>
      {status === "active" && (
        <V5LivePulse tone="ai" size={6} className="mt-2" />
      )}
    </div>
  );
}

function ModuleChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-[var(--v5-radius-sm)] border px-2.5 py-1 text-[0.6875rem] font-mono " +
        (active
          ? "border-[hsl(var(--v5-violet-500)/0.4)] bg-[hsl(var(--v5-violet-100))] text-[hsl(var(--v5-violet-700))]"
          : "border-[hsl(var(--v5-infra-200))] bg-white text-[hsl(var(--v5-ink-500))]")
      }
    >
      {active && (
        <span className="h-1 w-1 rounded-full bg-[hsl(var(--v5-violet-500))]" />
      )}
      {label}
    </span>
  );
}
