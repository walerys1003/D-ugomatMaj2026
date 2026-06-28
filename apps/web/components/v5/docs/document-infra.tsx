"use client";

/**
 * V5 Document Infrastructure — Agent 08
 * --------------------------------------------------------------------------
 * Version history UX, AI revisions, legal diff systems, signature systems.
 * Binds to /api/documents/[id]/versions, /revise, /restore.
 */
import * as React from "react";

import { V5Surface, V5Pill, V5Eyebrow } from "@/components/v5/primitives";
import { V5LivePulse } from "@/components/v5/motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * Version Tree
 * ─────────────────────────────────────────────────────────────────── */
type Version = {
  version: number;
  label: string;
  author: string;
  when: string;
  ai?: boolean;
  signed?: boolean;
  current?: boolean;
  hash: string;
};

export function V5VersionTree({ versions }: { versions: Version[] }) {
  return (
    <V5Surface variant="raised" className="p-7">
      <div className="flex items-center justify-between mb-5">
        <V5Eyebrow>Document versions · immutable</V5Eyebrow>
        <V5Pill tone="audit">/api/documents/[id]/versions</V5Pill>
      </div>
      <ol className="relative space-y-1">
        <span aria-hidden className="absolute left-[18px] top-3 bottom-3 w-px bg-[hsl(var(--v5-infra-200))]" />
        {versions.map((v) => (
          <li
            key={v.version}
            className={cn(
              "relative flex items-start gap-4 rounded-[var(--v5-radius-md)] py-3 pl-12 pr-4 transition-colors",
              v.current ? "bg-[hsl(var(--v5-violet-100)/0.5)] border border-[hsl(var(--v5-violet-500)/0.32)]" : "hover:bg-[hsl(var(--v5-infra-25))]",
            )}
          >
            <span
              className={cn(
                "absolute left-2 top-3 flex h-8 w-8 items-center justify-center rounded-full font-mono text-[0.6875rem] font-semibold ring-4 ring-white",
                v.current && "bg-[hsl(var(--v5-violet-500))] text-white",
                v.ai && !v.current && "bg-[hsl(var(--v5-violet-100))] text-[hsl(var(--v5-violet-700))]",
                !v.ai && !v.current && "bg-[hsl(var(--v5-infra-100))] text-[hsl(var(--v5-ink-700))]",
              )}
            >
              v{v.version}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[0.9375rem] font-medium text-[hsl(var(--v5-ink-900))] truncate">
                  {v.label}
                </span>
                {v.ai && <V5Pill tone="ai">AI</V5Pill>}
                {v.signed && <V5Pill tone="ok">signed</V5Pill>}
                {v.current && <V5Pill tone="ai" pulse>current</V5Pill>}
              </div>
              <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))] mt-1">
                {v.author} · {v.when} · hash <span className="text-[hsl(var(--v5-audit-700))]">{v.hash}</span>
              </div>
            </div>
            {!v.current && (
              <button className="shrink-0 text-[0.75rem] font-mono text-[hsl(var(--v5-violet-500))] hover:underline">
                restore
              </button>
            )}
          </li>
        ))}
      </ol>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Legal Diff — side-by-side comparison
 * ─────────────────────────────────────────────────────────────────── */
export function V5LegalDiff() {
  const removed = "Wnoszę o oddalenie powództwa w całości.";
  const added = "Wnoszę o oddalenie powództwa w całości, podnoszę zarzut przedawnienia (art. 117 § 2¹ k.c.) i kwestionuję legitymację procesową powoda jako cesjonariusza.";

  return (
    <V5Surface variant="raised" className="p-7">
      <div className="flex items-center justify-between mb-5">
        <V5Eyebrow icon={<span>◆</span>}>AI revision · diff</V5Eyebrow>
        <V5Pill tone="ai">/api/documents/[id]/revise</V5Pill>
      </div>
      <div className="rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-infra-25))] overflow-hidden">
        <div className="border-b border-[hsl(var(--v5-infra-200))] bg-white px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">
            § 2 · Sprzeciw — petitum
          </span>
          <span className="font-mono text-[0.6875rem] text-[hsl(var(--v5-ink-500))]">
            v2 → v3
          </span>
        </div>
        <div className="divide-y divide-[hsl(var(--v5-infra-200))]">
          <div className="flex gap-3 px-4 py-3">
            <span className="font-mono text-[hsl(var(--v5-err))] shrink-0">−</span>
            <span className="font-mono text-[0.875rem] text-[hsl(var(--v5-err))] line-through bg-[hsl(var(--v5-err)/0.06)] flex-1">
              {removed}
            </span>
          </div>
          <div className="flex gap-3 px-4 py-3">
            <span className="font-mono text-[hsl(var(--v5-ok))] shrink-0">+</span>
            <span className="font-mono text-[0.875rem] text-[hsl(var(--v5-ok))] bg-[hsl(var(--v5-ok)/0.06)] flex-1">
              {added}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))]">
          AI rationale: <span className="text-[hsl(var(--v5-violet-700))]">dodanie zarzutu przedawnienia (art. 117 § 2¹ k.c.) + cesja BIG Casus</span>
        </div>
        <div className="flex gap-2">
          <button className="rounded-[var(--v5-radius-sm)] border border-[hsl(var(--v5-infra-200))] bg-white px-3 py-1.5 text-[0.75rem] font-mono hover:border-[hsl(var(--v5-violet-500))]">
            reject
          </button>
          <button className="rounded-[var(--v5-radius-sm)] bg-[hsl(var(--v5-violet-500))] text-white px-3 py-1.5 text-[0.75rem] font-mono hover:bg-[hsl(var(--v5-violet-600))]">
            accept
          </button>
        </div>
      </div>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Signature Panel
 * ─────────────────────────────────────────────────────────────────── */
export function V5SignaturePanel() {
  return (
    <V5Surface variant="raised" className="p-7">
      <div className="flex items-center justify-between mb-5">
        <V5Eyebrow icon={<span>◇</span>}>Document signature</V5Eyebrow>
        <V5Pill tone="audit">EPUAP + crypto</V5Pill>
      </div>
      <div className="rounded-[var(--v5-radius-md)] border border-dashed border-[hsl(var(--v5-violet-500)/0.4)] bg-[hsl(var(--v5-violet-100)/0.3)] p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[hsl(var(--v5-violet-500)/0.4)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[hsl(var(--v5-violet-500))]" fill="none">
            <path d="M5 15c4-8 10-8 14 0M9 9V5a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-[0.875rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-1">
          Gotowe do podpisu EPUAP
        </div>
        <div className="text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-4">
          Dokument zostanie zahashowany (SHA-256) i podpisany Twoim certyfikatem.
        </div>
        <button className="inline-flex items-center gap-2 rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] text-white px-5 py-2.5 text-[0.875rem] font-medium hover:bg-[hsl(var(--v5-violet-600))]">
          Podpisz przez EPUAP
          <V5LivePulse tone="ai" size={6} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-[0.6875rem] font-mono">
        <div>
          <div className="text-[hsl(var(--v5-ink-500))]">format</div>
          <div className="text-[hsl(var(--v5-ink-900))] font-semibold">PAdES BES</div>
        </div>
        <div>
          <div className="text-[hsl(var(--v5-ink-500))]">timestamp</div>
          <div className="text-[hsl(var(--v5-ink-900))] font-semibold">TSA PL</div>
        </div>
        <div>
          <div className="text-[hsl(var(--v5-ink-500))]">archive</div>
          <div className="text-[hsl(var(--v5-ink-900))] font-semibold">10 lat</div>
        </div>
      </div>
    </V5Surface>
  );
}
