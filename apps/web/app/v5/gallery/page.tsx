"use client";

/**
 * V5-INFRA · Primitives Gallery
 * --------------------------------------------------------------------------
 * Route: /v5/gallery
 *
 * Storybook-equivalent for V5: every primitive rendered in isolation with
 * all variants + states. Replaces the need for a separate Storybook install.
 *
 * Each section is a "story" demonstrating a primitive's API surface.
 *
 * Marked "use client" because we pass function props (e.g. V5Counter format)
 * directly to client components for live demonstrations.
 */
import {
  V5Body,
  V5Button,
  V5Container,
  V5Eyebrow,
  V5Hairline,
  V5Headline,
  V5Pill,
  V5Section,
  V5Stat,
  V5Surface,
  V5Terminal,
} from "@/components/v5/primitives";
import {
  V5AmbientGlow,
  V5Counter,
  V5DataFlow,
  V5HoverLift,
  V5LivePulse,
  V5Marquee,
  V5Reveal,
  V5Stagger,
} from "@/components/v5/motion";

/* ──────────────────────────────────────────────────────────────────────
 * Story shell — wraps each example in a labelled card.
 * ────────────────────────────────────────────────────────────────────── */
function Story({
  name,
  api,
  notes,
  children,
}: {
  name: string;
  api?: string;
  notes?: string;
  children: React.ReactNode;
}) {
  return (
    <V5Surface variant="raised" className="p-7" topology="dots">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            primitive
          </div>
          <div className="text-[1.0625rem] font-semibold text-[hsl(var(--v5-ink-900))]">
            {name}
          </div>
        </div>
        {api && <V5Pill tone="audit">{api}</V5Pill>}
      </div>
      {notes && (
        <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-5 [text-wrap:pretty]">
          {notes}
        </p>
      )}
      <V5Hairline className="mb-5" />
      <div className="space-y-4">{children}</div>
    </V5Surface>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-[0.6875rem] text-[hsl(var(--v5-ink-500))] w-24 shrink-0 uppercase tracking-[var(--v5-tracking-uppercase)]">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3 min-w-0">{children}</div>
    </div>
  );
}

export default function V5GalleryPage() {
  return (
    <div data-v5-gallery className="min-h-screen bg-[hsl(var(--v5-infra-25))] overflow-x-hidden">
      {/* HEADER */}
      <div className="border-b border-[hsl(var(--v5-infra-200))] bg-white">
        <V5Container width="max">
          <div className="py-10">
            <V5Eyebrow className="mb-3" pulse>
              V5-INFRA · primitives
            </V5Eyebrow>
            <V5Headline level="h2" className="mb-3">
              Gallery — every primitive, every state
            </V5Headline>
            <V5Body size="lg">
              Storybook-equivalent. Każdy element designsystemu w izolacji z pełnym
              przeglądem wariantów, stanów i tokenów które konsumuje.
            </V5Body>
          </div>
        </V5Container>
      </div>

      <V5Section density="compact">
        <V5Container width="max">
          <div className="grid gap-6 lg:grid-cols-2 min-w-0">
            {/* V5Headline */}
            <Story
              name="V5Headline"
              api="display / h1 / h2 / h3 / h4"
              notes="Fluid clamp() typography. Auto text-wrap:balance, tracking calibrated per level."
            >
              <V5Headline level="display" className="!text-[2.5rem] sm:!text-[3rem]">
                Display
              </V5Headline>
              <V5Headline level="h1" className="!text-[2rem] sm:!text-[2.5rem]">H1 — Procedural OS</V5Headline>
              <V5Headline level="h2" className="!text-[1.75rem]">H2 — Reasoning engine</V5Headline>
              <V5Headline level="h3" className="!text-[1.5rem]">H3 — Module section</V5Headline>
              <V5Headline level="h4" className="!text-[1.25rem]">H4 — Component group</V5Headline>
            </Story>

            {/* V5Body */}
            <Story
              name="V5Body"
              api="lg / default / small · primary / secondary / muted"
              notes="Long-form text with text-wrap:pretty and tone-aware color tokens."
            >
              <V5Body size="lg" tone="primary">
                Body-lg primary — Procedural intelligence engine to nie chatbot.
                To audit-native AI infrastructure dla decyzji prawnych.
              </V5Body>
              <V5Body size="default" tone="secondary">
                Body default secondary — używane do większości akapitów,
                domyślny kolor ink-500.
              </V5Body>
              <V5Body size="small" tone="muted">
                Body small muted — etykiety, sekundarne adnotacje, footer copy.
              </V5Body>
            </Story>

            {/* V5Button */}
            <Story
              name="V5Button"
              api="primary / secondary / ghost / terminal · sm / md / lg"
              notes="forwardRef + asChild. Token-driven shadows, focus-ring built-in."
            >
              <Row label="primary">
                <V5Button size="sm">Sign EPUAP</V5Button>
                <V5Button size="md">Generate sprzeciw</V5Button>
                <V5Button size="lg">Skanuj nakaz</V5Button>
              </Row>
              <Row label="secondary">
                <V5Button variant="secondary" size="sm">Cancel</V5Button>
                <V5Button variant="secondary" size="md">Save draft</V5Button>
                <V5Button variant="secondary" size="lg">Open module</V5Button>
              </Row>
              <Row label="ghost">
                <V5Button variant="ghost" size="sm">Cancel</V5Button>
                <V5Button variant="ghost" size="md">Skip</V5Button>
              </Row>
              <Row label="terminal">
                <V5Button variant="terminal" size="sm">$ run scan</V5Button>
                <V5Button variant="terminal" size="md">$ exec agent</V5Button>
              </Row>
            </Story>

            {/* V5Pill */}
            <Story
              name="V5Pill"
              api="ok / warn / err / ai / audit / neutral · pulse"
              notes="Status tags with optional pulse animation. Audit-native palette."
            >
              <Row label="tones">
                <V5Pill tone="ok">✓ signed</V5Pill>
                <V5Pill tone="warn">pending</V5Pill>
                <V5Pill tone="err">rejected</V5Pill>
                <V5Pill tone="ai">AI working</V5Pill>
                <V5Pill tone="audit">SOC 2</V5Pill>
                <V5Pill tone="neutral">draft</V5Pill>
              </Row>
              <Row label="pulse">
                <V5Pill tone="ai" pulse>LIVE · agent.run()</V5Pill>
                <V5Pill tone="ok" pulse>uptime 99.98%</V5Pill>
                <V5Pill tone="err" pulse>3 alerts</V5Pill>
              </Row>
            </Story>

            {/* V5Eyebrow */}
            <Story
              name="V5Eyebrow"
              api="children + icon + pulse"
              notes="Section labels — uppercase tracking, monospace, optional pulse + icon."
            >
              <V5Eyebrow>Plain eyebrow</V5Eyebrow>
              <V5Eyebrow pulse>With pulse</V5Eyebrow>
              <V5Eyebrow icon={<span className="text-[hsl(var(--v5-violet-500))]">◈</span>}>
                With icon
              </V5Eyebrow>
              <V5Eyebrow icon={<span>⚡</span>} pulse>
                Icon + pulse · audit chain live
              </V5Eyebrow>
            </Story>

            {/* V5Stat */}
            <Story
              name="V5Stat"
              api="label / value / delta / hint / tone"
              notes="KPI primitive with monospace digits, directional delta, audit-tone variants."
            >
              <div className="grid grid-cols-2 gap-5">
                <V5Stat
                  label="Win-prob"
                  value="78%"
                  delta={{ value: "+4.2", direction: "up" }}
                  hint="vs 7d"
                  tone="ok"
                />
                <V5Stat
                  label="Latency"
                  value="412ms"
                  delta={{ value: "−18", direction: "up" }}
                  tone="ai"
                />
                <V5Stat
                  label="Pisma"
                  value="2 847"
                  delta={{ value: "+312", direction: "up" }}
                />
                <V5Stat
                  label="Errors"
                  value="0.03%"
                  delta={{ value: "+0.01", direction: "down" }}
                />
              </div>
            </Story>

            {/* V5Surface */}
            <Story
              name="V5Surface"
              api="flat / raised / elevated / ai / terminal · interactive · topology"
              notes="Card system with min-w-0 baked in, optional ambient topology overlay."
            >
              <div className="grid grid-cols-2 gap-3">
                <V5Surface variant="flat" className="p-4 text-[0.8125rem]">flat</V5Surface>
                <V5Surface variant="raised" className="p-4 text-[0.8125rem]">raised</V5Surface>
                <V5Surface variant="elevated" className="p-4 text-[0.8125rem]">elevated</V5Surface>
                <V5Surface variant="ai" className="p-4 text-[0.8125rem]">ai</V5Surface>
                <V5Surface variant="terminal" className="p-4 text-[0.8125rem] col-span-2">
                  <span className="text-white font-mono">$ terminal surface</span>
                </V5Surface>
              </div>
            </Story>

            {/* V5Terminal */}
            <Story
              name="V5Terminal"
              api="title + children (lines)"
              notes="Mobile-safe terminal with overflow-x-auto + word-break for long hashes."
            >
              <V5Terminal title="agent.run()">
                <div>$ agent.scan(nakaz.pdf)</div>
                <div className="text-[hsl(var(--v5-ok))]">✓ OCR complete · 412ms</div>
                <div className="text-[hsl(var(--v5-violet-300))]">→ IRAC reasoning chain initiated</div>
                <div className="text-[hsl(var(--v5-audit-500))]">⌖ retrieval · 14 art. k.c.</div>
                <div className="text-[hsl(var(--v5-ok))]">
                  ✓ signed 0x9f3a1c4d8e7b2f0a4c5d6e7f8a9b0c1d2e3f4a5b
                </div>
              </V5Terminal>
            </Story>

            {/* V5LivePulse */}
            <Story
              name="V5LivePulse"
              api="ai / ok / warn / err / audit"
              notes="Heartbeat indicator with ring expansion. Honors prefers-reduced-motion."
            >
              <Row label="ai"><V5LivePulse tone="ai" /> <span className="text-[0.8125rem]">agent.run()</span></Row>
              <Row label="ok"><V5LivePulse tone="ok" /> <span className="text-[0.8125rem]">uptime stable</span></Row>
              <Row label="warn"><V5LivePulse tone="warn" /> <span className="text-[0.8125rem]">queue 84% full</span></Row>
              <Row label="err"><V5LivePulse tone="err" /> <span className="text-[0.8125rem]">3 alerts</span></Row>
              <Row label="audit"><V5LivePulse tone="audit" /> <span className="text-[0.8125rem]">audit chain</span></Row>
            </Story>

            {/* V5Counter */}
            <Story
              name="V5Counter"
              api="value + duration + decimals + prefix/suffix"
              notes="IntersectionObserver-triggered count-up. Animates on first viewport entry."
            >
              <div className="grid grid-cols-2 gap-4 font-mono text-[2rem] font-semibold">
                <div><V5Counter value={2847} duration={1400} /></div>
                <div><V5Counter value={9998} suffix="%" duration={1400} format={(n) => (n / 100).toFixed(2)} /></div>
                <div><V5Counter value={412} suffix="ms" duration={1400} /></div>
                <div><V5Counter value={156000} duration={1400} prefix="€" /></div>
              </div>
            </Story>

            {/* V5Reveal + Stagger */}
            <Story
              name="V5Reveal / V5Stagger"
              api="threshold + delay + offset (Stagger only)"
              notes="IntersectionObserver-based fade+slide reveal. Reduced-motion safe."
            >
              <V5Reveal>
                <V5Surface variant="elevated" className="p-4 text-[0.875rem]">
                  This card reveals on viewport entry with default 80ms delay.
                </V5Surface>
              </V5Reveal>
              <V5Stagger step={120}>
                <V5Surface variant="raised" className="p-4 text-[0.875rem]">Stagger item 1</V5Surface>
                <V5Surface variant="raised" className="p-4 text-[0.875rem]">Stagger item 2</V5Surface>
                <V5Surface variant="raised" className="p-4 text-[0.875rem]">Stagger item 3</V5Surface>
              </V5Stagger>
            </Story>

            {/* V5HoverLift */}
            <Story
              name="V5HoverLift"
              api="intensity: subtle / normal / strong"
              notes="Translate-up on hover. Honors reduced motion."
            >
              <div className="grid grid-cols-3 gap-3">
                <V5HoverLift intensity="subtle">
                  <V5Surface variant="elevated" className="p-4 text-[0.8125rem] text-center">
                    subtle
                  </V5Surface>
                </V5HoverLift>
                <V5HoverLift intensity="normal">
                  <V5Surface variant="elevated" className="p-4 text-[0.8125rem] text-center">
                    normal
                  </V5Surface>
                </V5HoverLift>
                <V5HoverLift intensity="strong">
                  <V5Surface variant="elevated" className="p-4 text-[0.8125rem] text-center">
                    strong
                  </V5Surface>
                </V5HoverLift>
              </div>
            </Story>

            {/* V5DataFlow */}
            <Story
              name="V5DataFlow"
              api="lines (number) + speed"
              notes="Animated horizontal data-flow lines for AI/network visuals."
            >
              <V5Surface variant="ai" className="p-5">
                <div className="space-y-3">
                  <V5DataFlow tone="ai" speed="slow" />
                  <V5DataFlow tone="ai" speed="normal" />
                  <V5DataFlow tone="audit" speed="fast" />
                  <V5DataFlow tone="audit" speed="normal" />
                </div>
              </V5Surface>
            </Story>

            {/* V5Marquee */}
            <Story
              name="V5Marquee"
              api="speed + direction"
              notes="Infinite horizontal scroll for partner/proof strips."
            >
              <V5Marquee duration={28}>
                {["BIG", "Vindex", "Casus", "Pragma", "Kruk", "EOS", "Hoist", "Intrum"].map((b) => (
                  <span
                    key={b}
                    className="font-mono text-[0.8125rem] text-[hsl(var(--v5-ink-500))] px-6"
                  >
                    {b.toUpperCase()} ·
                  </span>
                ))}
              </V5Marquee>
            </Story>

            {/* V5AmbientGlow */}
            <Story
              name="V5AmbientGlow"
              api="color + size + position"
              notes="Procedural ambient glow for hero / AI sections."
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-28 rounded-[var(--v5-radius-lg)] bg-[hsl(var(--v5-ink-900))] overflow-hidden">
                  <V5AmbientGlow tone="ai" />
                  <div className="relative flex h-full items-center justify-center font-mono text-white/80 text-[0.75rem]">
                    tone=ai
                  </div>
                </div>
                <div className="relative h-28 rounded-[var(--v5-radius-lg)] bg-[hsl(var(--v5-ink-900))] overflow-hidden">
                  <V5AmbientGlow tone="audit" />
                  <div className="relative flex h-full items-center justify-center font-mono text-white/80 text-[0.75rem]">
                    tone=audit
                  </div>
                </div>
              </div>
            </Story>

            {/* V5Hairline */}
            <Story
              name="V5Hairline"
              api="horizontal / vertical"
              notes="Infrastructure-grade divider, token-driven color."
            >
              <V5Hairline />
              <div className="flex items-center gap-4">
                <span className="text-[0.875rem]">Left</span>
                <V5Hairline orientation="vertical" className="h-6" />
                <span className="text-[0.875rem]">Right</span>
              </div>
            </Story>
          </div>
        </V5Container>
      </V5Section>

      {/* TOKEN REFERENCE */}
      <V5Section density="compact" className="bg-[hsl(var(--v5-ink-900))] text-white">
        <V5Container width="max">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] min-w-0">
            <div className="min-w-0">
              <V5Eyebrow className="text-white/60 mb-3" pulse>
                tokens.css · reference
              </V5Eyebrow>
              <V5Headline level="h3" className="!text-white mb-3">
                Wszystkie tokeny w jednym miejscu
              </V5Headline>
              <V5Body className="!text-white/70" size="lg">
                Każdy primitive konsumuje wyłącznie CSS variables z{" "}
                <code className="font-mono text-white">styles/v5/tokens.css</code>.
                Brak inline hex, brak magic numbers.
              </V5Body>
            </div>
            <V5Surface variant="terminal" className="p-6">
              <div className="space-y-2 font-mono text-[0.8125rem]">
                <div className="text-white/60">{"/* color */"}</div>
                <div>--v5-violet-500: hsl(240 91% 66%);</div>
                <div>--v5-audit-500: hsl(231 80% 64%);</div>
                <div>--v5-ok:        hsl(156 100% 38%);</div>
                <div className="text-white/60 mt-3">{"/* typography */"}</div>
                <div>--v5-font-display: clamp(3rem, 6vw + 1rem, 8.75rem);</div>
                <div>--v5-font-h1:      clamp(2.5rem, 5vw + .5rem, 5.5rem);</div>
                <div className="text-white/60 mt-3">{"/* spacing */"}</div>
                <div>--v5-space-section: clamp(11.25rem, 14vw, 16.25rem);</div>
                <div>--v5-space-card:    clamp(2.25rem, 3.5vw, 3.5rem);</div>
                <div className="text-white/60 mt-3">{"/* motion */"}</div>
                <div>--v5-ease-cinematic: cubic-bezier(.22,1,.36,1);</div>
                <div>--v5-dur-base:       320ms;</div>
              </div>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>
    </div>
  );
}
