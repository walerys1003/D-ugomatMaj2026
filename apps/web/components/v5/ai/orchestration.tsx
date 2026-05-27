"use client";

/**
 * V5 AI Orchestration — Agent 06: AI Systems & Orchestration
 * --------------------------------------------------------------------------
 * UI for /api/ai/agent, /rag/search, /evaluate, /ocr, /irac, /usage,
 * /virtual-judge, /win-probability. Reasoning chains, model routing,
 * audit validation, agent coordination visualization.
 */
import * as React from "react";

import { V5Surface, V5Pill, V5Eyebrow } from "@/components/v5/primitives";
import { V5LivePulse, V5DataFlow, V5Reveal } from "@/components/v5/motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * Model Router — Multi-model orchestration view
 * ─────────────────────────────────────────────────────────────────── */
export function V5ModelRouter() {
  const models = [
    { name: "claude-3.5-sonnet", load: 67, status: "active", tone: "ai", role: "reasoning + IRAC" },
    { name: "gpt-5", load: 42, status: "active", tone: "ai", role: "generation + draft" },
    { name: "embedding-3-large", load: 89, status: "active", tone: "audit", role: "retrieval" },
    { name: "vision-2", load: 12, status: "idle", tone: "neutral", role: "OCR · nakazów" },
    { name: "internal-classifier", load: 34, status: "active", tone: "neutral", role: "routing decisions" },
  ];
  return (
    <V5Surface variant="raised" className="p-7">
      <div className="flex items-center justify-between mb-6">
        <V5Eyebrow icon={<span>◇</span>}>Model orchestration</V5Eyebrow>
        <V5Pill tone="ai" pulse>5 MODELS ROUTED</V5Pill>
      </div>
      <div className="space-y-3">
        {models.map((m, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-3.5">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <V5LivePulse tone={m.status === "active" ? "ai" : "ok"} size={6} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[0.875rem] font-semibold text-[hsl(var(--v5-ink-900))] truncate">
                  {m.name}
                </div>
                <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">{m.role}</div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 w-40">
              <div className="flex-1 h-1.5 bg-[hsl(var(--v5-infra-150))] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    m.load > 80 ? "bg-[hsl(var(--v5-warn))]" : "bg-[hsl(var(--v5-violet-500))]",
                  )}
                  style={{ width: `${m.load}%` }}
                />
              </div>
              <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-700))] w-10 text-right">
                {m.load}%
              </span>
            </div>
            <V5Pill tone={m.status === "active" ? "ai" : "neutral"} className="hidden md:inline-flex">
              {m.status}
            </V5Pill>
          </div>
        ))}
      </div>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Agent Run Status — Live agent.run() visualization
 * ─────────────────────────────────────────────────────────────────── */
export function V5AgentRun({ caseId = "CASE-2847" }: { caseId?: string }) {
  return (
    <V5Surface variant="ai" className="p-7">
      <div className="flex items-center justify-between mb-5">
        <V5Eyebrow pulse>agent.run() · live</V5Eyebrow>
        <V5Pill tone="ai">/api/ai/agent/run</V5Pill>
      </div>
      <div className="rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-violet-500)/0.2)] bg-white/70 backdrop-blur p-4">
        <div className="flex items-center justify-between mb-3 font-mono text-[0.75rem]">
          <span className="text-[hsl(var(--v5-violet-700))] font-semibold">{caseId}</span>
          <span className="text-[hsl(var(--v5-ink-500))]">elapsed: 1.8s</span>
        </div>
        <ol className="space-y-2.5">
          {[
            { l: "ingest · letter parse", s: "done", t: "84ms" },
            { l: "retrieval · 15 docs from RAG", s: "done", t: "112ms" },
            { l: "reasoning · IRAC chain build", s: "done", t: "412ms" },
            { l: "evaluate · IRAC validation", s: "done", t: "276ms" },
            { l: "generation · sprzeciw.docx", s: "active", t: "running…" },
            { l: "audit · sign + hash", s: "pending", t: "—" },
          ].map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[0.5625rem] font-bold",
                  s.s === "done" && "bg-[hsl(var(--v5-ok))] text-white",
                  s.s === "active" && "bg-[hsl(var(--v5-violet-500))] text-white [animation:v5-pulse-glow_2.4s_ease-in-out_infinite]",
                  s.s === "pending" && "bg-[hsl(var(--v5-infra-150))] text-[hsl(var(--v5-ink-500))]",
                )}
              >
                {s.s === "done" ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "flex-1 text-[0.8125rem]",
                  s.s === "pending" ? "text-[hsl(var(--v5-ink-500))]" : "text-[hsl(var(--v5-ink-900))]",
                )}
              >
                {s.l}
              </span>
              <span className="font-mono text-[0.6875rem] text-[hsl(var(--v5-ink-500))]">{s.t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <V5DataFlow tone="ai" speed="fast" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-[0.75rem] font-mono">
        <div>
          <div className="text-[hsl(var(--v5-ink-500))]">tokens</div>
          <div className="font-semibold text-[hsl(var(--v5-ink-900))]">12 487</div>
        </div>
        <div>
          <div className="text-[hsl(var(--v5-ink-500))]">cost</div>
          <div className="font-semibold text-[hsl(var(--v5-ink-900))]">0.18 PLN</div>
        </div>
        <div>
          <div className="text-[hsl(var(--v5-ink-500))]">confidence</div>
          <div className="font-semibold text-[hsl(var(--v5-ok))]">0.91</div>
        </div>
      </div>
    </V5Surface>
  );
}
