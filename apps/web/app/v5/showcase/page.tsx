/**
 * V5 SHOWCASE — All 10 agents in a single procedural tour.
 * ----------------------------------------------------------------------------
 * Route: /v5/showcase
 * Purpose: Live demonstration of the V5-INFRA design system + each agent's
 * output, mounted on a single scrolling page.
 */
import type { Metadata } from "next";

import { V5Header, V5Footer } from "@/components/v5/landing/header";
import { V5HeroCockpit } from "@/components/v5/landing/hero-cockpit";
import {
  V5ProofStrip,
  V5MetricsBand,
  V5ReasoningSection,
  V5ModulesGrid,
  V5EnterpriseTrust,
  V5EnterpriseCta,
} from "@/components/v5/landing/sections";
import {
  V5Body,
  V5Container,
  V5Eyebrow,
  V5Headline,
  V5Section,
  V5Surface,
  V5Hairline,
  V5Pill,
} from "@/components/v5/primitives";
import { V5Reveal } from "@/components/v5/motion";
import { V5PanelShell, V5PanelTopBar } from "@/components/v5/panel/shell";
import { V5PanelDashboard } from "@/components/v5/panel/dashboard";
import { V5AdminShell, V5OpsCenter } from "@/components/v5/admin/ops-center";
import {
  V5IracChain,
  V5AuditChain,
  V5RetrievalTopology,
} from "@/components/v5/reasoning/topology";
import { V5ModelRouter, V5AgentRun } from "@/components/v5/ai/orchestration";
import {
  V5CaseTimeline,
  V5WinProbability,
  V5EvidenceGrid,
} from "@/components/v5/case/case-system";
import {
  V5VersionTree,
  V5LegalDiff,
  V5SignaturePanel,
} from "@/components/v5/docs/document-infra";
import { V5MobileTabBar, V5MobileTopBar, V5MobileCard } from "@/components/v5/mobile";

export const metadata: Metadata = {
  title: "V5-INFRA Showcase · Procedural Intelligence OS",
  description:
    "Pełna prezentacja V5-INFRA — ultra enterprise AI-native legal operating system od Mandatomat.",
};

export default function V5ShowcasePage() {
  return (
    <div data-v5-showcase className="bg-[hsl(var(--v5-infra-25))] overflow-x-hidden">
      {/* SHOWCASE BANNER */}
      <div className="bg-[hsl(var(--v5-ink-900))] text-white">
        <V5Container width="wide">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between font-mono text-[0.75rem]">
            <div className="flex items-center gap-3">
              <span className="rounded-[var(--v5-radius-sm)] bg-[hsl(var(--v5-violet-500))] px-2 py-0.5 font-bold text-[0.625rem]">
                V5
              </span>
              <span className="text-white/80">
                Pełny showcase: Design System · Landing · Panel · Admin · Reasoning · AI · Cases · Docs · Mobile · Motion
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <span>10 agentów</span>
              <span>·</span>
              <span>build v5.0.1</span>
            </div>
          </div>
        </V5Container>
      </div>

      <V5Header />
      <V5HeroCockpit />

      <V5ProofStrip />

      {/* SECTION DIVIDER */}
      <SectionDivider id="design" number="01" label="Design System Architect" agent="Agent 01 + 10" />

      <V5Section density="compact">
        <V5Container width="max">
          <V5Reveal>
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <V5Eyebrow className="mb-4">Tokens · Typography · Spacing</V5Eyebrow>
                <V5Headline level="h3" className="mb-4">
                  Infrastructure-grade design language
                </V5Headline>
                <V5Body size="lg">
                  120% native scale, layered elevation, audit-native palette,
                  AI-glow surface signature. Każdy token zdefiniowany w CSS
                  variables, każdy komponent komponowalny.
                </V5Body>
              </div>
              <V5Surface variant="elevated" className="p-8">
                <div className="space-y-4 font-mono text-[0.875rem]">
                  <Token label="--v5-font-display" val="clamp(5.75rem, 6vw + 1rem, 8.75rem)" />
                  <Token label="--v5-space-section" val="clamp(11.25rem, 14vw, 16.25rem)" />
                  <Token label="--v5-violet-500" val="hsl(240 91% 66%)" swatch="bg-[hsl(var(--v5-violet-500))]" />
                  <Token label="--v5-ok" val="hsl(156 100% 38%)" swatch="bg-[hsl(var(--v5-ok))]" />
                  <Token label="--v5-shadow-3" val="0 12px 32px hsla(...)" />
                  <Token label="--v5-ease-cinematic" val="cubic-bezier(0.22, 1, 0.36, 1)" />
                </div>
              </V5Surface>
            </div>
          </V5Reveal>
        </V5Container>
      </V5Section>

      {/* AGENT 02 — Landing sections */}
      <SectionDivider id="landing" number="02" label="Landing Page" agent="Agent 02" />
      <V5MetricsBand />
      <V5ReasoningSection />
      <V5ModulesGrid />
      <V5EnterpriseTrust />

      {/* AGENT 03 + 06 — Reasoning + AI Orchestration */}
      <SectionDivider id="reasoning" number="03" label="Reasoning Engine UX" agent="Agent 03 + 06" />

      <V5Section density="compact">
        <V5Container width="max">
          <div className="grid gap-6 lg:grid-cols-2">
            <V5Reveal>
              <V5IracChain
                steps={[
                  { type: "Issue", text: "Czy roszczenie powoda jest przedawnione?", confidence: 0.94 },
                  { type: "Rule", text: "Art. 118 k.c. — 3-letni termin przedawnienia dla roszczeń konsumenckich.", source: "uchwała SN III/2021", confidence: 0.96 },
                  { type: "Application", text: "Wymagalność roszczenia: 2019-04. Pozew wniesiony: 2025-03. Termin upłynął 2022-04.", confidence: 0.91 },
                  { type: "Conclusion", text: "Roszczenie jest przedawnione. Należy podnieść zarzut z art. 117 § 2¹ k.c. w sprzeciwie.", confidence: 0.93 },
                ]}
              />
            </V5Reveal>
            <V5Reveal delay={100}>
              <V5RetrievalTopology />
            </V5Reveal>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <V5Reveal delay={140}>
              <V5AuditChain
                nodes={[
                  { hash: "0x9f3a...", type: "ingest", label: "Nakaz zapłaty — OCR + parse", when: "12:38:02" },
                  { hash: "0x4b2c...", type: "retrieval", label: "RAG search · 15 documents", when: "12:38:04" },
                  { hash: "0x812e...", type: "reasoning", label: "IRAC chain construction", when: "12:38:07" },
                  { hash: "0x612a...", type: "generation", label: "Sprzeciw EPU draft v3", when: "12:38:14" },
                  { hash: "0x317d...", type: "sign", label: "Audit signing · Ed25519", when: "12:38:16", signer: "system@mandatomat" },
                ]}
              />
            </V5Reveal>
            <V5Reveal delay={180}>
              <V5AgentRun />
            </V5Reveal>
          </div>

          <div className="mt-6">
            <V5Reveal delay={220}>
              <V5ModelRouter />
            </V5Reveal>
          </div>
        </V5Container>
      </V5Section>

      {/* AGENT 04 — User Panel */}
      <SectionDivider id="panel" number="04" label="User Panel" agent="Agent 04" />

      <V5Section density="compact">
        <V5Container width="max">
          <V5Reveal>
            <V5Surface variant="raised" className="overflow-hidden">
              {/* Browser chrome */}
              <div className="border-b border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-infra-50))] px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--v5-err))]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--v5-warn))]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--v5-ok))]" />
                </div>
                <div className="flex-1 rounded-[var(--v5-radius-sm)] bg-white border border-[hsl(var(--v5-infra-200))] px-3 py-1 font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">
                  mandatomat.app/panel
                </div>
                <V5Pill tone="ai">PANEL</V5Pill>
              </div>
              <div className="h-[820px] overflow-hidden">
                <V5PanelShell activePath="/panel">
                  <V5PanelTopBar
                    title="Pulpit"
                    breadcrumbs={["Praca", "Pulpit"]}
                    actions={
                      <button className="rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] px-4 py-2 text-[0.875rem] font-medium text-white hover:bg-[hsl(var(--v5-violet-600))]">
                        + Nowa sprawa
                      </button>
                    }
                  />
                  <V5PanelDashboard />
                </V5PanelShell>
              </div>
            </V5Surface>
          </V5Reveal>
        </V5Container>
      </V5Section>

      {/* AGENT 05 — Admin */}
      <SectionDivider id="admin" number="05" label="Admin Ops Center" agent="Agent 05" theme="dark" />

      <section className="bg-[hsl(var(--v5-system-800))] py-16">
        <V5Container width="max">
          <V5Reveal>
            <V5Surface variant="raised" className="overflow-hidden">
              <div className="border-b border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-infra-50))] px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--v5-err))]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--v5-warn))]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--v5-ok))]" />
                </div>
                <div className="flex-1 rounded-[var(--v5-radius-sm)] bg-white border border-[hsl(var(--v5-infra-200))] px-3 py-1 font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">
                  mandatomat.app/admin
                </div>
                <V5Pill tone="ai" pulse>OPS · LIVE</V5Pill>
              </div>
              <div className="h-[860px] overflow-hidden">
                <V5AdminShell active="/admin/dashboard">
                  <V5OpsCenter />
                </V5AdminShell>
              </div>
            </V5Surface>
          </V5Reveal>
        </V5Container>
      </section>

      {/* AGENT 07 — Cases */}
      <SectionDivider id="cases" number="06" label="Case Management" agent="Agent 07" />

      <V5Section density="compact">
        <V5Container width="max">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] min-w-0">
            <V5Reveal>
              <V5CaseTimeline
                events={[
                  { date: "2025-03-12 · 09:14", type: "letter", title: "Otrzymano nakaz zapłaty", detail: "EPU sygn. III Nc 845/25 · BIG Casus S.A. · 4 217 PLN" },
                  { date: "2025-03-12 · 09:18", type: "ai", title: "AI analiza nakazu", detail: "OCR + NLP · zidentyfikowano 14 art., wykryto cesję", status: "ok" },
                  { date: "2025-03-13 · 14:42", type: "ai", title: "Generowanie sprzeciwu EPU", detail: "agent.run() · 412ms · win-prob 0.78" },
                  { date: "2025-03-13 · 14:43", type: "audit", title: "Audit chain signed", detail: "hash 0x9f3a... · Ed25519 signature" },
                  { date: "2025-03-14 · 11:02", type: "sign", title: "Podpisano EPUAP", detail: "Sprzeciw wysłany do SR Warszawa-Wola · TSA timestamp", status: "ok" },
                ]}
              />
            </V5Reveal>
            <div className="space-y-6 min-w-0">
              <V5Reveal delay={100}>
                <V5WinProbability />
              </V5Reveal>
              <V5Reveal delay={140}>
                <V5EvidenceGrid />
              </V5Reveal>
            </div>
          </div>
        </V5Container>
      </V5Section>

      {/* AGENT 08 — Documents */}
      <SectionDivider id="docs" number="07" label="Document Infrastructure" agent="Agent 08" />

      <V5Section density="compact">
        <V5Container width="max">
          <div className="grid gap-6 lg:grid-cols-2">
            <V5Reveal>
              <V5VersionTree
                versions={[
                  { version: 5, label: "Sprzeciw EPU — wersja końcowa", author: "Jan K.", when: "12 min temu", current: true, hash: "0x9f3a...", signed: true, ai: true },
                  { version: 4, label: "Korekta cytatów orzecznictwa", author: "AI Asystent", when: "2h temu", ai: true, hash: "0x4b2c..." },
                  { version: 3, label: "Dodanie zarzutu przedawnienia", author: "AI Asystent", when: "3h temu", ai: true, hash: "0x812e..." },
                  { version: 2, label: "Pierwsza redakcja", author: "Jan K.", when: "wczoraj", hash: "0x612a..." },
                  { version: 1, label: "Szablon początkowy", author: "system", when: "wczoraj", hash: "0x317d..." },
                ]}
              />
            </V5Reveal>
            <div className="space-y-6">
              <V5Reveal delay={100}>
                <V5LegalDiff />
              </V5Reveal>
              <V5Reveal delay={140}>
                <V5SignaturePanel />
              </V5Reveal>
            </div>
          </div>
        </V5Container>
      </V5Section>

      {/* AGENT 09 — Mobile */}
      <SectionDivider id="mobile" number="08" label="Mobile System" agent="Agent 09" />

      <V5Section density="compact">
        <V5Container width="max">
          <V5Reveal>
            <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <V5Eyebrow className="mb-4">Native mobile AI infrastructure</V5Eyebrow>
                <V5Headline level="h3" className="mb-5">
                  Nie mini-desktop. Native AI OS.
                </V5Headline>
                <V5Body size="lg" className="mb-6">
                  Bottom-tab navigation, touch-optimized procedural cards,
                  adaptive top bar, safe-area aware. Mobile to nie zmniejszone
                  desktopowe UI — to natywna powierzchnia infrastrukturalna.
                </V5Body>
                <ul className="space-y-3 text-[0.9375rem]">
                  {[
                    "Bottom tab bar · 5 destinations max",
                    "Touch-optimized cards · 44px tap targets",
                    "Safe-area-inset aware",
                    "Adaptive top bar · context-aware",
                    "Reduced cognitive load · 1 task at a time",
                  ].map((x, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--v5-violet-500))]" />
                      <span className="text-[hsl(var(--v5-ink-700))]">{x}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone frame */}
              <div className="mx-auto">
                <div className="relative w-[320px] h-[640px] rounded-[40px] border-8 border-[hsl(var(--v5-ink-900))] bg-[hsl(var(--v5-infra-25))] overflow-hidden shadow-[var(--v5-shadow-4)]">
                  <V5MobileTopBar title="Pulpit" />
                  <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-110px)]">
                    <V5MobileCard
                      title="Sprzeciw EPU — BIG Casus"
                      meta="CASE-2847 · 4 217 PLN"
                      status="AI WORKING"
                      statusTone="ai"
                    />
                    <V5MobileCard
                      title="Skarga na komornika"
                      meta="CASE-2843 · review"
                      status="REVIEW"
                      statusTone="warn"
                    />
                    <V5MobileCard
                      title="Cesja Ultimo S.A."
                      meta="CASE-2839 · 8 940 PLN"
                      status="AI"
                      statusTone="ai"
                    />
                    <V5MobileCard
                      title="Sprostowanie BIK"
                      meta="CASE-2831 · done"
                      status="DONE"
                      statusTone="ok"
                    />
                  </div>
                  <V5MobileTabBar active="/panel" />
                </div>
              </div>
            </div>
          </V5Reveal>
        </V5Container>
      </V5Section>

      {/* Final CTA */}
      <V5EnterpriseCta />
      <V5Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Section Divider — Agent label
 * ─────────────────────────────────────────────────────────────────── */
function SectionDivider({
  id,
  number,
  label,
  agent,
  theme = "light",
}: {
  id: string;
  number: string;
  label: string;
  agent: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  return (
    <div
      id={id}
      className={isDark ? "bg-[hsl(var(--v5-system-800))] text-white" : "bg-[hsl(var(--v5-infra-50))] border-y border-[hsl(var(--v5-infra-200))]"}
    >
      <V5Container width="max">
        <div className="flex flex-col gap-3 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={`text-[0.6875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] mb-1.5 ${isDark ? "text-white/40" : "text-[hsl(var(--v5-ink-500))]"}`}>
              Agent · {agent}
            </div>
            <div className="flex items-baseline gap-4">
              <span className={`font-mono text-[2rem] font-semibold leading-none tracking-tight ${isDark ? "text-[hsl(var(--v5-violet-300))]" : "text-[hsl(var(--v5-violet-500))]"}`}>
                /{number}
              </span>
              <h2 className={`text-[1.5rem] font-semibold tracking-tight ${isDark ? "text-white" : "text-[hsl(var(--v5-ink-900))]"}`}>
                {label}
              </h2>
            </div>
          </div>
          <div className={`font-mono text-[0.75rem] ${isDark ? "text-white/40" : "text-[hsl(var(--v5-ink-500))]"}`}>
            v5-infra · showcase/{id}
          </div>
        </div>
      </V5Container>
    </div>
  );
}

function Token({ label, val, swatch }: { label: string; val: string; swatch?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[hsl(var(--v5-infra-200))] pb-3 last:border-0 last:pb-0">
      {swatch && <span className={`h-5 w-5 rounded ${swatch} shrink-0`} />}
      <span className="text-[hsl(var(--v5-violet-700))] shrink-0">{label}</span>
      <span className="text-[hsl(var(--v5-ink-500))] truncate ml-auto">{val}</span>
    </div>
  );
}
