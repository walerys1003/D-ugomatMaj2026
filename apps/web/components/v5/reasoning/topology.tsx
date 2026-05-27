"use client";

/**
 * V5 Reasoning Topology — Agent 03: Reasoning Engine UX
 * --------------------------------------------------------------------------
 * Visual language for AI reasoning. Audit chains, evidence visualization,
 * retrieval infrastructure, AI observability.
 */
import * as React from "react";

import { V5Surface, V5Pill, V5Eyebrow } from "@/components/v5/primitives";
import { V5LivePulse, V5DataFlow, V5Reveal } from "@/components/v5/motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * IRAC Chain Visualizer
 * ─────────────────────────────────────────────────────────────────── */
type IracStep = {
  type: "Issue" | "Rule" | "Application" | "Conclusion";
  text: string;
  source?: string;
  confidence?: number;
};

export function V5IracChain({ steps }: { steps: IracStep[] }) {
  return (
    <V5Surface variant="ai" className="p-7">
      <div className="flex items-center justify-between mb-6">
        <V5Eyebrow pulse>IRAC reasoning chain</V5Eyebrow>
        <V5Pill tone="ai">/api/ai/irac</V5Pill>
      </div>

      <ol className="relative space-y-5">
        <span aria-hidden className="absolute left-[15px] top-2 bottom-2 w-px bg-[hsl(var(--v5-violet-500)/0.3)]" />
        {steps.map((s, i) => (
          <li key={i} className="relative pl-12">
            <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--v5-violet-500))] text-white font-mono text-[0.625rem] font-bold uppercase">
              {s.type[0]}
            </span>
            <div className="rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-violet-500)/0.18)] bg-white/80 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.6875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-violet-700))] font-semibold">
                  {s.type}
                </span>
                {typeof s.confidence === "number" && (
                  <span className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">
                    confidence: <span className="text-[hsl(var(--v5-ok))] font-semibold">{(s.confidence * 100).toFixed(0)}%</span>
                  </span>
                )}
              </div>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-900))]">{s.text}</p>
              {s.source && (
                <div className="mt-2 flex items-center gap-2 text-[0.75rem] font-mono text-[hsl(var(--v5-audit-700))]">
                  <span>◇</span>
                  <span className="underline-offset-2 hover:underline cursor-pointer">{s.source}</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Audit Chain — Evidence provenance graph
 * ─────────────────────────────────────────────────────────────────── */
type AuditNode = {
  hash: string;
  type: "ingest" | "retrieval" | "reasoning" | "generation" | "sign";
  label: string;
  when: string;
  signer?: string;
};

export function V5AuditChain({ nodes }: { nodes: AuditNode[] }) {
  return (
    <V5Surface variant="raised" className="p-7" topology="grid">
      <div className="flex items-center justify-between mb-6">
        <V5Eyebrow icon={<span>◇</span>}>Audit chain · signed provenance</V5Eyebrow>
        <V5Pill tone="audit">SHA-256 + Ed25519</V5Pill>
      </div>

      <div className="space-y-2">
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-4 rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-3.5">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--v5-radius-md)] font-mono text-[0.625rem] font-semibold uppercase",
                  n.type === "ingest" && "bg-[hsl(var(--v5-ink-100))] text-[hsl(var(--v5-ink-700))]",
                  n.type === "retrieval" && "bg-[hsl(var(--v5-audit-500)/0.1)] text-[hsl(var(--v5-audit-700))]",
                  n.type === "reasoning" && "bg-[hsl(var(--v5-violet-500)/0.1)] text-[hsl(var(--v5-violet-700))]",
                  n.type === "generation" && "bg-[hsl(var(--v5-violet-500)/0.1)] text-[hsl(var(--v5-violet-700))]",
                  n.type === "sign" && "bg-[hsl(var(--v5-ok)/0.1)] text-[hsl(var(--v5-ok))]",
                )}
              >
                {n.type === "ingest" ? "IN" : n.type === "retrieval" ? "RG" : n.type === "reasoning" ? "RZ" : n.type === "generation" ? "GN" : "✓"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.875rem] font-medium text-[hsl(var(--v5-ink-900))] truncate">{n.label}</div>
                <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))] truncate">
                  hash <span className="text-[hsl(var(--v5-audit-700))]">{n.hash}</span> · {n.when}
                  {n.signer && <> · signed by <span className="text-[hsl(var(--v5-ink-900))]">{n.signer}</span></>}
                </div>
              </div>
              {n.type === "sign" && <V5LivePulse tone="ok" size={6} />}
            </div>
            {i < nodes.length - 1 && (
              <div className="ml-[18px] h-3 w-px bg-[hsl(var(--v5-infra-300))]" />
            )}
          </React.Fragment>
        ))}
      </div>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Retrieval Topology — Vector search visualization
 * ─────────────────────────────────────────────────────────────────── */
export function V5RetrievalTopology() {
  const hits = [
    { sig: "III CSK 191/19", title: "Przedawnienie roszczeń EPU", score: 0.94, year: "2019" },
    { sig: "II CSK 462/18", title: "Cesja a legitymacja procesowa", score: 0.91, year: "2018" },
    { sig: "IV CSK 80/20", title: "EPU + art. 505 k.p.c.", score: 0.88, year: "2020" },
    { sig: "I CSK 234/21", title: "Zarzut przedawnienia konsumenta", score: 0.85, year: "2021" },
    { sig: "III CZP 14/22", title: "Wykładnia art. 117 § 2¹ k.c.", score: 0.83, year: "2022" },
  ];
  return (
    <V5Surface variant="raised" className="p-7">
      <div className="flex items-center justify-between mb-5">
        <V5Eyebrow icon={<span>◈</span>}>Retrieval · vector search</V5Eyebrow>
        <V5Pill tone="audit">/api/ai/rag/search</V5Pill>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-infra-50))] border border-[hsl(var(--v5-infra-200))] px-3 py-2 font-mono text-[0.8125rem]">
        <span className="text-[hsl(var(--v5-audit-700))]">q:</span>
        <span className="text-[hsl(var(--v5-ink-900))]">&quot;przedawnienie EPU cesja wierzytelności&quot;</span>
      </div>
      <ul className="space-y-2">
        {hits.map((h, i) => (
          <li key={i} className="flex items-center gap-4 rounded-[var(--v5-radius-sm)] hover:bg-[hsl(var(--v5-infra-25))] px-2 py-2.5 transition-colors">
            <span className="font-mono text-[0.6875rem] text-[hsl(var(--v5-ink-500))] w-6">#{i + 1}</span>
            <span className="font-mono text-[0.8125rem] font-semibold text-[hsl(var(--v5-audit-700))] w-32">{h.sig}</span>
            <span className="flex-1 min-w-0 text-[0.875rem] text-[hsl(var(--v5-ink-900))] truncate">{h.title}</span>
            <span className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">{h.year}</span>
            <div className="hidden sm:flex items-center gap-2 w-32">
              <div className="flex-1 h-1 bg-[hsl(var(--v5-infra-150))] rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--v5-violet-500))]" style={{ width: `${h.score * 100}%` }} />
              </div>
              <span className="text-[0.6875rem] font-mono text-[hsl(var(--v5-violet-500))] font-semibold">
                {h.score.toFixed(2)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <V5DataFlow tone="audit" speed="slow" />
      </div>
    </V5Surface>
  );
}
