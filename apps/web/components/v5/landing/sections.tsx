"use client";

/**
 * V5 Landing Sections — Agent 02
 * --------------------------------------------------------------------------
 * Proof, reasoning engine showcase, workflow engine, retrieval, legal
 * intelligence, enterprise trust. NO startup gimmicks.
 */
import * as React from "react";

import { V5Body, V5Container, V5Eyebrow, V5Headline, V5Section, V5Surface, V5Hairline, V5Terminal } from "@/components/v5/primitives";
import { V5LivePulse, V5Reveal, V5Counter, V5AmbientGlow } from "@/components/v5/motion";

/* ============================================================================
 * PROOF STRIP — Trust signals from enterprises / authorities
 * ============================================================================ */
export function V5ProofStrip() {
  return (
    <section className="border-y border-[hsl(var(--v5-infra-200))] bg-white py-12">
      <V5Container width="wide">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <V5Eyebrow>Zaufanie infrastrukturalne</V5Eyebrow>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Kancelarie Tier-1", "Banki PL", "Komornicy", "Doradcy restr.", "Fundusze", "Klienci B2B"].map(
              (l, i) => (
                <span
                  key={i}
                  className="text-[0.875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]"
                >
                  {l}
                </span>
              ),
            )}
          </div>
        </div>
      </V5Container>
    </section>
  );
}

/* ============================================================================
 * METRICS BAND — System scale (counter-animated)
 * ============================================================================ */
export function V5MetricsBand() {
  return (
    <V5Section density="compact" topology="dots">
      <V5Container width="max">
        <V5Reveal>
          <div className="mx-auto mb-16 max-w-[60ch] text-center">
            <V5Eyebrow className="justify-center mb-5">Skala infrastruktury</V5Eyebrow>
            <V5Headline level="h2" className="mb-5">
              Procedural cloud, który już pracuje
            </V5Headline>
            <V5Body size="lg" tone="secondary">
              Każdy nakaz, każde pismo, każda decyzja — z pełnym audytem,
              wersjonowaniem i podpisem kryptograficznym.
            </V5Body>
          </div>
        </V5Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Spraw obsłużonych", value: 184_290, suffix: "" },
            { label: "Wygrane sprzeciwy", value: 67_412, suffix: "" },
            { label: "Oszczędności klientów", value: 47.2, suffix: "M PLN", isFloat: true },
            { label: "Średni czas pisma", value: 92, suffix: "s" },
          ].map((m, i) => (
            <V5Reveal key={i} delay={i * 80}>
              <V5Surface variant="raised" className="p-7 lg:p-9">
                <div className="v5-text-eyebrow mb-3 text-[0.6875rem]">{m.label}</div>
                <div className="text-[2.75rem] leading-none font-mono font-semibold tracking-tight text-[hsl(var(--v5-ink-900))]">
                  <V5Counter
                    value={m.value}
                    format={(n) =>
                      m.isFloat ? (n / 1).toFixed(1) : n.toLocaleString("pl-PL")
                    }
                    suffix={m.suffix ? ` ${m.suffix}` : undefined}
                  />
                </div>
              </V5Surface>
            </V5Reveal>
          ))}
        </div>
      </V5Container>
    </V5Section>
  );
}

/* ============================================================================
 * REASONING ENGINE — Show how Mandatomat actually thinks
 * ============================================================================ */
export function V5ReasoningSection() {
  return (
    <V5Section>
      <V5Container width="max">
        <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 items-center">
          <V5Reveal>
            <div className="flex flex-col gap-7">
              <V5Eyebrow pulse icon={<span className="text-[hsl(var(--v5-violet-500))]">◆</span>}>
                Reasoning Engine
              </V5Eyebrow>
              <V5Headline level="h2">
                AI, która <span className="text-[hsl(var(--v5-violet-500))]">pokazuje</span>{" "}
                ścieżkę rozumowania.
              </V5Headline>
              <V5Body size="lg">
                Każda decyzja Mandatomatu jest audytowalna. Pokazujemy retrieval,
                rozumowanie IRAC, źródła orzeczeń i walidację — nie tylko output.
                Procedural reasoning, nie black-box chatbot.
              </V5Body>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { l: "Retrieval-augmented", h: "RAG na orzecznictwie SN, NSA, SO" },
                  { l: "IRAC validation", h: "Issue · Rule · Application · Conclusion" },
                  { l: "Source provenance", h: "Każde stwierdzenie z cytatem" },
                  { l: "Multi-model routing", h: "GPT-5 + Claude + open-source" },
                ].map((x, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-4"
                  >
                    <div className="v5-text-eyebrow text-[0.6875rem] mb-1.5 text-[hsl(var(--v5-violet-500))]">
                      {x.l}
                    </div>
                    <div className="text-[0.9375rem] font-medium text-[hsl(var(--v5-ink-900))]">
                      {x.h}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </V5Reveal>

          <V5Reveal delay={160} direction="left">
            <div className="relative">
              <V5Terminal title="reasoning.stream · CASE-2847" scanlines>
                <div className="space-y-1.5">
                  <Line tone="muted">
                    <span className="text-[hsl(var(--v5-violet-300))]">$</span> agent.run({"{"}case_id: "2847"{"}"})
                  </Line>
                  <Line tone="muted">▸ retrieval: vector_search(15 docs)</Line>
                  <Line tone="ok">
                    ✓ Sygn. III CSK 191/19 — przedawnienie 3 lata
                  </Line>
                  <Line tone="ok">
                    ✓ Sygn. II CSK 462/18 — cesja a legitymacja
                  </Line>
                  <Line tone="ok">
                    ✓ Sygn. IV CSK 80/20 — EPU + art. 505
                  </Line>
                  <Line tone="muted">▸ reasoning: irac_chain[4 steps]</Line>
                  <Line tone="ai">
                    issue: "Czy roszczenie przedawnione?"
                  </Line>
                  <Line tone="ai">
                    rule: "Art. 118 k.c. + uchwała SN III/2021"
                  </Line>
                  <Line tone="ai">
                    application: "Wymagalność: 2019-04 → 2022-04"
                  </Line>
                  <Line tone="ai">
                    conclusion: "Roszczenie przedawnione. Zarzut: art. 117 § 2¹ k.c."
                  </Line>
                  <Line tone="muted">▸ generating: sprzeciw_epu.docx</Line>
                  <Line tone="ok">
                    ✓ audit_chain.sign() · evidence_hash: 0x9f3a...
                  </Line>
                  <Line tone="violet">
                    → ready · win_probability: 0.84 · confidence: 0.91
                  </Line>
                </div>
              </V5Terminal>
              <V5AmbientGlow className="rounded-[var(--v5-radius-md)]" />
            </div>
          </V5Reveal>
        </div>
      </V5Container>
    </V5Section>
  );
}

function Line({
  tone,
  children,
}: {
  tone?: "muted" | "ok" | "ai" | "violet";
  children: React.ReactNode;
}) {
  const color =
    tone === "ok"
      ? "text-[hsl(var(--v5-ok))]"
      : tone === "ai"
        ? "text-[hsl(var(--v5-audit-300))]"
        : tone === "violet"
          ? "text-[hsl(var(--v5-violet-300))] font-semibold"
          : "text-white/60";
  return <div className={color}>{children}</div>;
}

/* ============================================================================
 * MODULES GRID — 8 modules as infrastructure tiles
 * ============================================================================ */
export function V5ModulesGrid() {
  const modules = [
    {
      href: "/skaner-nakazu",
      kbd: "01",
      label: "Skaner Nakazu",
      desc: "OCR + NLP analiza nakazów EPU i tradycyjnych.",
      tone: "primary",
    },
    {
      href: "/moduly/sprzeciw-epu",
      kbd: "02",
      label: "Sprzeciw od EPU",
      desc: "Generacja sprzeciwu z pełnym audytem.",
    },
    {
      href: "/moduly/komornik",
      kbd: "03",
      label: "Skarga na komornika",
      desc: "Procedural workflow art. 767 k.p.c.",
    },
    {
      href: "/moduly/cesja",
      kbd: "04",
      label: "Cesja wierzytelności",
      desc: "Weryfikacja legitymacji procesowej.",
    },
    {
      href: "/moduly/bik",
      kbd: "05",
      label: "BIK / KRD / Erif",
      desc: "Sprostowanie + usunięcie wpisów.",
    },
    {
      href: "/moduly/ugoda",
      kbd: "06",
      label: "Ugoda z wierzycielem",
      desc: "Multi-agent negocjacja + symulacja.",
    },
    {
      href: "/moduly/potracenia",
      kbd: "07",
      label: "Potrącenia i odsetki",
      desc: "Kalkulacja z orzecznictwem SN.",
    },
    {
      href: "/moduly/upadlosc",
      kbd: "08",
      label: "Upadłość konsumencka",
      desc: "End-to-end orchestration wniosku.",
    },
  ];

  return (
    <V5Section topology="grid">
      <V5Container width="max">
        <V5Reveal>
          <div className="mx-auto mb-16 max-w-[64ch] text-center">
            <V5Eyebrow className="justify-center mb-5">Modules · 8 procedural systems</V5Eyebrow>
            <V5Headline level="h2" className="mb-5">
              Każdy moduł to <span className="text-[hsl(var(--v5-violet-500))]">infrastructure unit</span>.
            </V5Headline>
            <V5Body size="lg" tone="secondary">
              Jeden design language, jeden audit chain, jeden orchestrator.
              Moduły komunikują się przez wewnętrzną szynę zdarzeń — Twoja sprawa
              przepływa między nimi bez utraty kontekstu.
            </V5Body>
          </div>
        </V5Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => (
            <V5Reveal key={m.href} delay={i * 60}>
              <a
                href={m.href}
                className="group block h-full"
              >
                <V5Surface
                  variant={m.tone === "primary" ? "ai" : "raised"}
                  interactive
                  className="h-full p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={
                        "font-mono text-[0.75rem] font-semibold uppercase tracking-[var(--v5-tracking-uppercase)] " +
                        (m.tone === "primary"
                          ? "text-[hsl(var(--v5-violet-500))]"
                          : "text-[hsl(var(--v5-ink-400))]")
                      }
                    >
                      MODULE/{m.kbd}
                    </span>
                    {m.tone === "primary" && <V5LivePulse tone="ai" size={6} />}
                  </div>
                  <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2.5">
                    {m.label}
                  </h3>
                  <p className="text-[0.9375rem] leading-relaxed text-[hsl(var(--v5-ink-500))]">
                    {m.desc}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-[0.8125rem] font-mono text-[hsl(var(--v5-violet-500))] opacity-0 group-hover:opacity-100 transition-opacity">
                    open
                    <span aria-hidden>→</span>
                  </div>
                </V5Surface>
              </a>
            </V5Reveal>
          ))}
        </div>
      </V5Container>
    </V5Section>
  );
}

/* ============================================================================
 * ENTERPRISE TRUST — Audit, compliance, security
 * ============================================================================ */
export function V5EnterpriseTrust() {
  const items = [
    { title: "RODO + GDPR", desc: "Pełna ścieżka konsumencka, prawo do bycia zapomnianym, export RoPA.", code: "GDPR/v2" },
    { title: "Audit-native", desc: "Każde działanie podpisane kryptograficznie, immutable event log.", code: "AUDIT/sig" },
    { title: "SOC 2 Type II", desc: "Ready · ISO 27001 in progress · roczne pen-testy.", code: "SOC/2" },
    { title: "EPUAP integration", desc: "Bezpośrednie podpisanie i wysyłka pism do sądów.", code: "EPUAP/api" },
    { title: "Legal Hold", desc: "Compliance officer dashboard, e-discovery, redaction.", code: "HOLD/v1" },
    { title: "RBAC + SSO", desc: "Org-grade kontrola dostępu, SAML, SCIM provisioning.", code: "ACCESS/scim" },
  ];

  return (
    <V5Section>
      <V5Container width="max">
        <V5Reveal>
          <div className="grid gap-12 mb-16 lg:grid-cols-[1fr_2fr] items-end">
            <div>
              <V5Eyebrow className="mb-4">Trust Architecture</V5Eyebrow>
              <V5Headline level="h2">
                Compliance jako <span className="text-[hsl(var(--v5-violet-500))]">primitive</span>.
              </V5Headline>
            </div>
            <V5Body size="lg" tone="secondary">
              Nie traktujemy bezpieczeństwa jak warstwy — to fundament systemu.
              Każde zdarzenie podpisane, każdy dokument ma immutable history,
              każdy dostęp jest auditowany w czasie rzeczywistym.
            </V5Body>
          </div>
        </V5Reveal>

        <div className="grid gap-px overflow-hidden rounded-[var(--v5-radius-xl)] border border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-infra-200))] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <V5Reveal key={i} delay={i * 40}>
              <div className="h-full bg-white p-7 lg:p-9 transition-colors hover:bg-[hsl(var(--v5-infra-25))]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-audit-500))]">
                    {it.code}
                  </span>
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[hsl(var(--v5-ok))]" fill="none">
                    <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-[1.1875rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2.5">
                  {it.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-[hsl(var(--v5-ink-500))]">
                  {it.desc}
                </p>
              </div>
            </V5Reveal>
          ))}
        </div>
      </V5Container>
    </V5Section>
  );
}

/* ============================================================================
 * ENTERPRISE CTA — Closing call-to-action band
 * ============================================================================ */
export function V5EnterpriseCta() {
  return (
    <V5Section>
      <V5Container width="content">
        <V5Reveal>
          <V5Surface variant="elevated" className="relative p-12 lg:p-20 text-center overflow-visible">
            <V5AmbientGlow className="rounded-[var(--v5-radius-xl)]" />
            <V5Eyebrow pulse className="justify-center mb-6">
              Ready to deploy
            </V5Eyebrow>
            <V5Headline level="h2" className="mb-6 max-w-[24ch] mx-auto">
              Uruchom swój pierwszy{" "}
              <span className="text-[hsl(var(--v5-violet-500))]">audyt nakazu</span> w 90 sekund.
            </V5Headline>
            <V5Body size="lg" tone="secondary" className="mx-auto mb-10 max-w-[52ch]">
              Bez karty, bez instalacji. Procedural reasoning engine, audit chain
              i orchestracja AI — gotowe do działania w Twojej przeglądarce.
            </V5Body>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/skaner-nakazu"
                className="v5-focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] px-8 text-[1.0625rem] font-medium text-white shadow-[var(--v5-shadow-2)] transition hover:bg-[hsl(var(--v5-violet-600))]"
              >
                Skanuj nakaz
                <span aria-hidden>→</span>
              </a>
              <a
                href="/dla-firm"
                className="v5-focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white px-8 text-[1.0625rem] font-medium text-[hsl(var(--v5-ink-900))] transition hover:border-[hsl(var(--v5-violet-500))]"
              >
                Plan dla kancelarii
              </a>
            </div>
            <V5Hairline className="mt-12" />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.8125rem] font-mono text-[hsl(var(--v5-ink-500))]">
              <span>30 dni gwarancji zwrotu</span>
              <span>RODO + SOC 2 ready</span>
              <span>Wsparcie 24/7</span>
            </div>
          </V5Surface>
        </V5Reveal>
      </V5Container>
    </V5Section>
  );
}
