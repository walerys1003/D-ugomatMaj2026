"use client";

/**
 * V5 Admin Ops Center — Agent 05: Admin Panel Redesign
 * --------------------------------------------------------------------------
 * Enterprise AI operations center. Realtime KPIs, audit streams, prompt
 * management, AI observability. Inspired by Vercel observability + Linear
 * + Datadog + Modal.
 */
import * as React from "react";
import Link from "next/link";

import { V5Surface, V5Pill, V5Eyebrow, V5Stat, V5Terminal, V5Hairline } from "@/components/v5/primitives";
import { V5DataFlow, V5LivePulse, V5Reveal, V5Counter } from "@/components/v5/motion";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  {
    label: "Operations",
    items: [
      { href: "/admin/dashboard", label: "Ops Center", active: true },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/rum", label: "RUM" },
      { href: "/admin/errors", label: "Error stream" },
      { href: "/admin/realtime-kpis", label: "Realtime KPIs", pill: "NEW" },
      { href: "/admin/job-queue", label: "Job queue" },
    ],
  },
  {
    label: "AI & Workflows",
    items: [
      { href: "/admin/prompts", label: "Prompts (LLM)" },
      { href: "/admin/workflows", label: "Workflows" },
      { href: "/admin/ai/usage", label: "AI usage", pill: "NEW" },
      { href: "/admin/ai/evaluate", label: "AI evaluation" },
    ],
  },
  {
    label: "Access",
    items: [
      { href: "/admin/users", label: "Users", pill: "NEW" },
      { href: "/admin/rbac", label: "RBAC" },
      { href: "/admin/impersonate", label: "Impersonation" },
      { href: "/admin/rate-limits", label: "Rate limits" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/admin/audit-log", label: "Audit log", pill: "NEW" },
      { href: "/admin/legal-hold", label: "Legal hold" },
      { href: "/admin/compliance", label: "DPIA / RoPA" },
      { href: "/admin/feature-flags", label: "Feature flags" },
      { href: "/admin/secrets", label: "Secrets" },
    ],
  },
];

export function V5AdminShell({ children, active = "/admin/dashboard" }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--v5-system-800))] text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:flex flex-col border-r border-white/8 bg-[hsl(var(--v5-ink-900))]">
          {/* Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] text-white">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                <path d="M2 2l5 4-5 4M8 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[0.875rem] font-semibold">Admin</div>
              <div className="text-[0.6875rem] font-mono text-white/40">v5-infra · ops</div>
            </div>
            <V5Pill tone="ai" className="ml-auto" pulse>
              LIVE
            </V5Pill>
          </div>

          {/* Region + status */}
          <div className="px-4 py-3 border-b border-white/8 grid grid-cols-2 gap-2 text-[0.6875rem] font-mono">
            <div>
              <div className="text-white/40">region</div>
              <div className="text-white">eu-warsaw-1</div>
            </div>
            <div>
              <div className="text-white/40">build</div>
              <div className="text-white">v5.0.1</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {ADMIN_NAV.map((g) => (
              <div key={g.label} className="mb-6 last:mb-0">
                <div className="px-3 mb-2 text-[0.625rem] font-semibold uppercase tracking-[var(--v5-tracking-uppercase)] text-white/40">
                  {g.label}
                </div>
                <ul className="space-y-px">
                  {g.items.map((it) => {
                    const isActive = active === it.href || it.active;
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-[var(--v5-radius-sm)] px-3 py-1.5 text-[0.8125rem] transition-colors",
                            isActive
                              ? "bg-[hsl(var(--v5-violet-500)/0.18)] text-white border-l-2 border-[hsl(var(--v5-violet-500))] -ml-0.5"
                              : "text-white/70 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <span>{it.label}</span>
                          {it.pill && (
                            <span className="rounded-[var(--v5-radius-sm)] bg-[hsl(var(--v5-ok))] px-1.5 py-0.5 font-mono text-[0.5625rem] font-bold text-white">
                              {it.pill}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/8 px-4 py-3 flex items-center justify-between text-[0.6875rem] font-mono">
            <span className="flex items-center gap-2 text-white/60">
              <V5LivePulse tone="ok" size={6} />
              all systems
            </span>
            <span className="text-white/40">99.97%</span>
          </div>
        </aside>

        <main className="flex flex-col">{children}</main>
      </div>
    </div>
  );
}

/* ============================================================================
 * Ops Center Dashboard
 * ============================================================================ */
export function V5OpsCenter() {
  return (
    <div className="bg-[hsl(var(--v5-system-800))] min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/8 bg-[hsl(var(--v5-ink-900))]/60 backdrop-blur sticky top-0 z-[var(--v5-z-sticky)]">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-white/40 mb-1">
              Operations / Ops Center
            </div>
            <h1 className="text-[1.375rem] font-semibold tracking-tight text-white">
              Realtime infrastructure overview
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <V5Pill tone="ok" pulse>
              all systems operational
            </V5Pill>
            <span className="text-[0.75rem] font-mono text-white/40">
              updated 2s ago
            </span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Realtime KPI grid */}
        <V5Reveal>
          <div className="grid gap-4 lg:grid-cols-6">
            <OpsKpi label="Active users" value={3247} delta="+128" tone="ok" />
            <OpsKpi label="AI calls / min" value={847} delta="+12%" tone="ai" />
            <OpsKpi label="P95 latency" value={412} suffix="ms" delta="-8%" tone="ok" />
            <OpsKpi label="Error rate" value={0.08} suffix="%" delta="-0.02" tone="ok" isFloat />
            <OpsKpi label="MRR" value={184290} prefix="" suffix=" PLN" delta="+4.7%" tone="ok" />
            <OpsKpi label="Job queue" value={12} delta="0" tone="neutral" />
          </div>
        </V5Reveal>

        {/* Two columns: Chart + AI activity */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Live chart placeholder */}
          <V5Reveal delay={80}>
            <div className="rounded-[var(--v5-radius-lg)] border border-white/8 bg-[hsl(var(--v5-ink-900))] p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <V5Eyebrow icon={<span className="text-[hsl(var(--v5-violet-500))]">●</span>}>
                    Activity stream
                  </V5Eyebrow>
                  <h3 className="text-[1.125rem] font-semibold text-white mt-2">
                    AI calls & document operations · 60 min
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[0.75rem] font-mono text-white/60">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--v5-violet-500))]" /> AI
                  </span>
                  <span className="flex items-center gap-1.5 text-[0.75rem] font-mono text-white/60">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--v5-ok))]" /> docs
                  </span>
                </div>
              </div>
              <FakeChart />
              <div className="mt-4">
                <V5DataFlow tone="ai" speed="fast" />
              </div>
            </div>
          </V5Reveal>

          {/* AI activity feed */}
          <V5Reveal delay={140}>
            <div className="rounded-[var(--v5-radius-lg)] border border-[hsl(var(--v5-violet-500)/0.32)] bg-[hsl(var(--v5-ink-900))] p-7">
              <div className="flex items-center justify-between mb-4">
                <V5Eyebrow pulse>AI orchestration</V5Eyebrow>
                <V5LivePulse tone="ai" size={8} />
              </div>
              <h3 className="text-[1.125rem] font-semibold text-white mb-5">
                Live agent activity
              </h3>
              <ul className="space-y-3">
                {aiActivity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        a.status === "active"
                          ? "bg-[hsl(var(--v5-violet-500))] [animation:v5-pulse-soft_2.4s_ease-in-out_infinite]"
                          : a.status === "done"
                            ? "bg-[hsl(var(--v5-ok))]"
                            : "bg-white/30",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.8125rem] text-white truncate">
                        <span className="font-mono text-[hsl(var(--v5-audit-300))]">{a.case}</span>
                        <span className="text-white/40 mx-1.5">·</span>
                        {a.action}
                      </div>
                      <div className="text-[0.6875rem] font-mono text-white/40 mt-0.5">
                        {a.model} · {a.duration}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </V5Reveal>
        </div>

        {/* Bottom: audit log terminal + system table */}
        <V5Reveal delay={200}>
          <V5Terminal title="audit.log · live tail · /api/admin/audit-log" scanlines>
            <div className="space-y-0.5 text-[0.8125rem]">
              {auditLines.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-white/30 shrink-0 font-mono w-20">{l.t}</span>
                  <span
                    className={
                      l.lvl === "OK"
                        ? "text-[hsl(var(--v5-ok))]"
                        : l.lvl === "AI"
                          ? "text-[hsl(var(--v5-violet-300))]"
                          : l.lvl === "WARN"
                            ? "text-[hsl(var(--v5-warn))]"
                            : "text-white/60"
                    }
                  >
                    [{l.lvl}]
                  </span>
                  <span className="text-white/80 truncate">{l.msg}</span>
                </div>
              ))}
            </div>
          </V5Terminal>
        </V5Reveal>
      </div>
    </div>
  );
}

function OpsKpi({
  label,
  value,
  delta,
  tone = "neutral",
  prefix,
  suffix,
  isFloat,
}: {
  label: string;
  value: number;
  delta?: string;
  tone?: "ok" | "ai" | "neutral" | "warn";
  prefix?: string;
  suffix?: string;
  isFloat?: boolean;
}) {
  const color =
    tone === "ai"
      ? "text-[hsl(var(--v5-violet-300))]"
      : tone === "ok"
        ? "text-[hsl(var(--v5-ok))]"
        : tone === "warn"
          ? "text-[hsl(var(--v5-warn))]"
          : "text-white";
  return (
    <div className="rounded-[var(--v5-radius-lg)] border border-white/8 bg-[hsl(var(--v5-ink-900))] p-4">
      <div className="text-[0.625rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-white/40 mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-[1.625rem] leading-none font-mono font-semibold tracking-tight ${color}`}>
          <V5Counter
            value={value}
            format={(n) => (isFloat ? n.toFixed(2) : n.toLocaleString("pl-PL"))}
            prefix={prefix}
            suffix={suffix}
          />
        </span>
      </div>
      {delta && (
        <div className="mt-1 text-[0.6875rem] font-mono text-[hsl(var(--v5-ok))]">
          {delta}
        </div>
      )}
    </div>
  );
}

function FakeChart() {
  // Static SVG chart — no JS chart lib needed for this showcase.
  return (
    <div className="relative h-48">
      <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="aiArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--v5-violet-500))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--v5-violet-500))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="docArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--v5-ok))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--v5-ok))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" x2="600" y1={36 * i + 18} y2={36 * i + 18} stroke="white" strokeOpacity="0.06" />
        ))}
        {/* AI line + area */}
        <path
          d="M0,120 L40,100 L80,110 L120,80 L160,90 L200,60 L240,70 L280,50 L320,55 L360,40 L400,45 L440,30 L480,50 L520,35 L560,40 L600,25 L600,180 L0,180 Z"
          fill="url(#aiArea)"
        />
        <path
          d="M0,120 L40,100 L80,110 L120,80 L160,90 L200,60 L240,70 L280,50 L320,55 L360,40 L400,45 L440,30 L480,50 L520,35 L560,40 L600,25"
          fill="none"
          stroke="hsl(var(--v5-violet-500))"
          strokeWidth="2"
        />
        {/* Doc line */}
        <path
          d="M0,140 L40,135 L80,138 L120,125 L160,130 L200,115 L240,118 L280,105 L320,110 L360,100 L400,105 L440,95 L480,98 L520,90 L560,95 L600,88"
          fill="none"
          stroke="hsl(var(--v5-ok))"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />
      </svg>
      <div className="absolute top-2 right-2 text-[0.6875rem] font-mono text-white/60">
        peak 847 · now <span className="text-[hsl(var(--v5-violet-300))]">823</span>
      </div>
    </div>
  );
}

const aiActivity = [
  { case: "CASE-2847", action: "Generating sprzeciw EPU", model: "claude-3.5-sonnet", duration: "412ms", status: "active" },
  { case: "CASE-2839", action: "RAG retrieval · 15 docs", model: "embedding-3", duration: "84ms", status: "done" },
  { case: "CASE-2812", action: "IRAC validation", model: "gpt-5", duration: "1.2s", status: "done" },
  { case: "CASE-2831", action: "OCR + classification", model: "vision-2", duration: "316ms", status: "done" },
  { case: "CASE-2809", action: "Audit signing", model: "internal", duration: "12ms", status: "done" },
];

const auditLines = [
  { t: "12:42:18", lvl: "AI", msg: "agent.run() · case_id=2847 · model=claude-3.5-sonnet" },
  { t: "12:42:17", lvl: "OK", msg: "user.session.start · org=ORG-7821 · ip=83.x.x.42" },
  { t: "12:42:14", lvl: "AI", msg: "rag.search · q='przedawnienie EPU' · 15 results · 84ms" },
  { t: "12:42:11", lvl: "OK", msg: "document.sign · doc=DOC-918 · sig=0x9f3a..." },
  { t: "12:42:08", lvl: "WARN", msg: "rate_limit · /api/ai/generate · 87% (org=ORG-7821)" },
  { t: "12:42:05", lvl: "OK", msg: "billing.usage.tick · ai_tokens=12k · cost=0.18 PLN" },
  { t: "12:42:01", lvl: "AI", msg: "evaluate.irac · case=2812 · score=0.91" },
  { t: "12:41:58", lvl: "OK", msg: "audit.event · type=DOC_VERSION_CREATE · ver=3" },
];
