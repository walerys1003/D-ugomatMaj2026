/**
 * V5-INFRA · Marketing primitives (Wave 5)
 * --------------------------------------------------------------------------
 * Shared marketing surfaces used across V5 routes:
 *   - V5MarketingLayout  · header + footer wrapper
 *   - V5HeroSimple       · single-column hero with eyebrow + headline + body + CTA pair
 *   - V5FeatureGrid      · grid of feature cards (icon + title + body)
 *   - V5StatBand         · large numeric stat band
 *   - V5ComparisonTable  · feature comparison (us vs competitors)
 *   - V5Faq              · accordion-style FAQ (uses native <details>)
 *   - V5CtaBand          · dark closing CTA band
 *   - V5Testimonial      · single quote with author
 *   - V5SocialProofStrip · marquee of partner names
 *   - V5StepsList        · numbered step list (how it works)
 *   - V5IconBullet       · checked bullet item
 *   - V5Logos            · static logo grid
 */
import * as React from "react";

import {
  V5Body,
  V5Button,
  V5Container,
  V5Eyebrow,
  V5Hairline,
  V5Headline,
  V5Pill,
  V5Section,
  V5Surface,
} from "@/components/v5/primitives";
import {
  V5DataFlow,
  V5LivePulse,
  V5Marquee,
  V5Reveal,
  V5Stagger,
} from "@/components/v5/motion";
import { V5Footer, V5Header } from "@/components/v5/landing/header";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * V5MarketingLayout
 * ─────────────────────────────────────────────────────────────────── */
export function V5MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[hsl(var(--v5-infra-25))] overflow-x-hidden min-h-screen">
      <V5Header />
      <main className="min-w-0">{children}</main>
      <V5Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5HeroSimple — single-column marketing hero
 * ─────────────────────────────────────────────────────────────────── */
export function V5HeroSimple({
  eyebrow,
  headline,
  body,
  ctas,
  meta,
}: {
  eyebrow?: string;
  headline: React.ReactNode;
  body?: React.ReactNode;
  ctas?: { label: string; href: string; variant?: "primary" | "secondary" }[];
  meta?: React.ReactNode;
}) {
  return (
    <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 v5-topology-fade opacity-40 v5-topology-grid"
      />
      <V5Container width="content">
        <V5Reveal>
          {eyebrow && (
            <V5Eyebrow className="mb-6" pulse>
              {eyebrow}
            </V5Eyebrow>
          )}
          <V5Headline level="h1" className="mb-6 max-w-[20ch]">
            {headline}
          </V5Headline>
          {body && (
            <V5Body size="lg" className="max-w-[60ch] mb-8">
              {body}
            </V5Body>
          )}
          {ctas && ctas.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {ctas.map((c, i) => (
                <V5Button key={i} variant={c.variant ?? (i === 0 ? "primary" : "secondary")} size="lg" asChild>
                  <a href={c.href}>{c.label}</a>
                </V5Button>
              ))}
            </div>
          )}
          {meta && <div className="mt-8">{meta}</div>}
        </V5Reveal>
      </V5Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5FeatureGrid
 * ─────────────────────────────────────────────────────────────────── */
export type V5Feature = {
  icon?: React.ReactNode;
  title: string;
  body: string;
  pill?: string;
};

export function V5FeatureGrid({
  features,
  cols = 3,
  eyebrow,
  heading,
}: {
  features: V5Feature[];
  cols?: 2 | 3 | 4;
  eyebrow?: string;
  heading?: React.ReactNode;
}) {
  const colsCls =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <V5Section density="compact">
      <V5Container width="max">
        {(eyebrow || heading) && (
          <div className="mb-10 max-w-[58ch]">
            {eyebrow && (
              <V5Eyebrow className="mb-4">{eyebrow}</V5Eyebrow>
            )}
            {heading && <V5Headline level="h2">{heading}</V5Headline>}
          </div>
        )}
        <div className={cn("grid gap-5 min-w-0", colsCls)}>
          <V5Stagger step={70}>
            {features.map((f, i) => (
              <V5Surface
                key={i}
                variant="raised"
                className="p-7 h-full"
                interactive
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  {f.icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-100))] text-[hsl(var(--v5-violet-700))]">
                      {f.icon}
                    </div>
                  )}
                  {f.pill && <V5Pill tone="ai">{f.pill}</V5Pill>}
                </div>
                <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">
                  {f.title}
                </h3>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-500))] [text-wrap:pretty]">
                  {f.body}
                </p>
              </V5Surface>
            ))}
          </V5Stagger>
        </div>
      </V5Container>
    </V5Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5StatBand — big numeric stat row
 * ─────────────────────────────────────────────────────────────────── */
export function V5StatBand({
  stats,
}: {
  stats: { value: string; label: string; sub?: string }[];
}) {
  return (
    <V5Section density="compact" className="bg-white border-y border-[hsl(var(--v5-infra-200))]">
      <V5Container width="max">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
          {stats.map((s, i) => (
            <V5Reveal key={i} delay={i * 60}>
              <div className="min-w-0">
                <div className="font-mono text-[2.25rem] sm:text-[2.75rem] font-semibold tracking-tight text-[hsl(var(--v5-ink-900))] leading-none mb-2">
                  {s.value}
                </div>
                <div className="text-[0.875rem] font-medium text-[hsl(var(--v5-ink-700))]">
                  {s.label}
                </div>
                {s.sub && (
                  <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mt-1">
                    {s.sub}
                  </div>
                )}
              </div>
            </V5Reveal>
          ))}
        </div>
      </V5Container>
    </V5Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5ComparisonTable — feature matrix
 * ─────────────────────────────────────────────────────────────────── */
export function V5ComparisonTable({
  columns,
  rows,
  eyebrow,
  heading,
}: {
  columns: { label: string; highlight?: boolean }[];
  rows: { label: string; values: (string | boolean)[] }[];
  eyebrow?: string;
  heading?: React.ReactNode;
}) {
  return (
    <V5Section density="compact">
      <V5Container width="max">
        {(eyebrow || heading) && (
          <div className="mb-10 max-w-[58ch]">
            {eyebrow && <V5Eyebrow className="mb-4">{eyebrow}</V5Eyebrow>}
            {heading && <V5Headline level="h2">{heading}</V5Headline>}
          </div>
        )}
        <V5Surface variant="raised" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-infra-50))]">
                  <th className="px-6 py-4 font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                    feature
                  </th>
                  {columns.map((c, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-6 py-4 font-semibold text-[0.875rem]",
                        c.highlight
                          ? "text-[hsl(var(--v5-violet-700))] bg-[hsl(var(--v5-violet-100)/0.4)]"
                          : "text-[hsl(var(--v5-ink-700))]",
                      )}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-[hsl(var(--v5-infra-200))] last:border-0"
                  >
                    <td className="px-6 py-3.5 text-[hsl(var(--v5-ink-700))]">{r.label}</td>
                    {r.values.map((v, j) => (
                      <td
                        key={j}
                        className={cn(
                          "px-6 py-3.5 text-[hsl(var(--v5-ink-900))]",
                          columns[j]?.highlight && "bg-[hsl(var(--v5-violet-100)/0.2)]",
                        )}
                      >
                        {typeof v === "boolean" ? (
                          v ? (
                            <span className="text-[hsl(var(--v5-ok))] font-semibold">✓</span>
                          ) : (
                            <span className="text-[hsl(var(--v5-ink-400))]">—</span>
                          )
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </V5Surface>
      </V5Container>
    </V5Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5Faq — accordion-style FAQ
 * ─────────────────────────────────────────────────────────────────── */
export function V5Faq({
  items,
  eyebrow,
  heading,
}: {
  items: { q: string; a: string }[];
  eyebrow?: string;
  heading?: React.ReactNode;
}) {
  return (
    <V5Section density="compact">
      <V5Container width="content">
        {(eyebrow || heading) && (
          <div className="mb-10 max-w-[58ch]">
            {eyebrow && <V5Eyebrow className="mb-4">{eyebrow}</V5Eyebrow>}
            {heading && <V5Headline level="h2">{heading}</V5Headline>}
          </div>
        )}
        <div className="space-y-3 min-w-0">
          {items.map((it, i) => (
            <details
              key={i}
              className="group rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white open:bg-[hsl(var(--v5-infra-25))] transition-colors"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 list-none [&::-webkit-details-marker]:hidden">
                <span className="text-[1rem] font-medium text-[hsl(var(--v5-ink-900))]">
                  {it.q}
                </span>
                <span
                  aria-hidden
                  className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full border border-[hsl(var(--v5-infra-200))] text-[hsl(var(--v5-ink-500))] font-mono text-[0.875rem] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 -mt-1 text-[0.9375rem] text-[hsl(var(--v5-ink-500))] [text-wrap:pretty]">
                {it.a}
              </div>
            </details>
          ))}
        </div>
      </V5Container>
    </V5Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5CtaBand — dark closing CTA
 * ─────────────────────────────────────────────────────────────────── */
export function V5CtaBand({
  eyebrow,
  headline,
  body,
  ctas,
}: {
  eyebrow?: string;
  headline: React.ReactNode;
  body?: React.ReactNode;
  ctas?: { label: string; href: string; variant?: "primary" | "secondary" | "terminal" }[];
}) {
  return (
    <section className="bg-[hsl(var(--v5-ink-900))] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 v5-topology-grid v5-topology-fade pointer-events-none" />
      <V5Container width="max">
        <div className="py-20 sm:py-28 relative">
          <div className="max-w-[58ch]">
            {eyebrow && (
              <V5Eyebrow className="!text-white/60 mb-4" pulse>
                {eyebrow}
              </V5Eyebrow>
            )}
            <V5Headline level="h2" className="!text-white mb-5">
              {headline}
            </V5Headline>
            {body && (
              <V5Body size="lg" className="!text-white/70 mb-8">
                {body}
              </V5Body>
            )}
            {ctas && (
              <div className="flex flex-wrap gap-3">
                {ctas.map((c, i) => (
                  <V5Button
                    key={i}
                    variant={c.variant ?? (i === 0 ? "primary" : "terminal")}
                    size="lg"
                    asChild
                  >
                    <a href={c.href}>{c.label}</a>
                  </V5Button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-12">
            <V5DataFlow tone="ai" speed="slow" />
          </div>
        </div>
      </V5Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5Testimonial — quote block
 * ─────────────────────────────────────────────────────────────────── */
export function V5Testimonial({
  quote,
  author,
  role,
  org,
}: {
  quote: string;
  author: string;
  role?: string;
  org?: string;
}) {
  return (
    <V5Surface variant="elevated" className="p-8 sm:p-10">
      <div className="text-[hsl(var(--v5-violet-500))] font-serif text-[3rem] leading-none mb-3">
        ❝
      </div>
      <blockquote className="text-[1.0625rem] sm:text-[1.1875rem] leading-[1.55] text-[hsl(var(--v5-ink-900))] [text-wrap:pretty] mb-6">
        {quote}
      </blockquote>
      <V5Hairline className="mb-4" />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[0.9375rem] font-semibold text-[hsl(var(--v5-ink-900))] truncate">
            {author}
          </div>
          {(role || org) && (
            <div className="text-[0.8125rem] text-[hsl(var(--v5-ink-500))] truncate">
              {role}
              {role && org && " · "}
              {org}
            </div>
          )}
        </div>
        <V5LivePulse tone="ok" />
      </div>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5SocialProofStrip — marquee of partner names
 * ─────────────────────────────────────────────────────────────────── */
export function V5SocialProofStrip({
  label = "Zaufali nam",
  names,
}: {
  label?: string;
  names: string[];
}) {
  return (
    <section className="bg-white border-y border-[hsl(var(--v5-infra-200))]">
      <V5Container width="max">
        <div className="py-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10 min-w-0">
          <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] shrink-0">
            {label}
          </div>
          <div className="min-w-0 flex-1">
            <V5Marquee duration={36}>
              {names.map((n) => (
                <span
                  key={n}
                  className="font-mono text-[0.8125rem] text-[hsl(var(--v5-ink-700))]"
                >
                  {n}
                </span>
              ))}
            </V5Marquee>
          </div>
        </div>
      </V5Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5StepsList — numbered procedural steps
 * ─────────────────────────────────────────────────────────────────── */
export function V5StepsList({
  steps,
  eyebrow,
  heading,
}: {
  steps: { title: string; body: string; meta?: string }[];
  eyebrow?: string;
  heading?: React.ReactNode;
}) {
  return (
    <V5Section density="compact">
      <V5Container width="max">
        {(eyebrow || heading) && (
          <div className="mb-10 max-w-[58ch]">
            {eyebrow && <V5Eyebrow className="mb-4">{eyebrow}</V5Eyebrow>}
            {heading && <V5Headline level="h2">{heading}</V5Headline>}
          </div>
        )}
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {steps.map((s, i) => (
            <V5Reveal key={i} delay={i * 80}>
              <V5Surface variant="raised" className="p-7 h-full">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-mono text-[2rem] font-semibold tracking-tight text-[hsl(var(--v5-violet-500))] leading-none">
                    0{i + 1}
                  </span>
                  {s.meta && (
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                      {s.meta}
                    </span>
                  )}
                </div>
                <h3 className="text-[1.0625rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2 [text-wrap:balance]">
                  {s.title}
                </h3>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-500))] [text-wrap:pretty]">
                  {s.body}
                </p>
              </V5Surface>
            </V5Reveal>
          ))}
        </ol>
      </V5Container>
    </V5Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5IconBullet — single checkmark bullet item
 * ─────────────────────────────────────────────────────────────────── */
export function V5IconBullet({
  children,
  tone = "ok",
}: {
  children: React.ReactNode;
  tone?: "ok" | "ai" | "audit";
}) {
  const colorVar =
    tone === "ai" ? "--v5-violet-500" : tone === "audit" ? "--v5-audit-500" : "--v5-ok";
  return (
    <li className="flex items-start gap-3 text-[0.9375rem] text-[hsl(var(--v5-ink-700))] min-w-0">
      <span
        aria-hidden
        className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[0.625rem] font-bold text-white"
        style={{ background: `hsl(var(${colorVar}))` }}
      >
        ✓
      </span>
      <span className="flex-1 min-w-0 [text-wrap:pretty]">{children}</span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5PricingTier — single pricing card
 * ─────────────────────────────────────────────────────────────────── */
export function V5PricingTier({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlight = false,
  badge,
}: {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <V5Surface
      variant={highlight ? "ai" : "raised"}
      className={cn(
        "p-7 h-full relative flex flex-col",
        highlight && "ring-1 ring-[hsl(var(--v5-violet-500)/0.5)]",
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-7">
          <V5Pill tone="ai" pulse>
            {badge}
          </V5Pill>
        </div>
      )}
      <div className="mb-5">
        <div className="text-[0.6875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mb-2">
          {name}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[2.25rem] font-semibold tracking-tight text-[hsl(var(--v5-ink-900))] leading-none">
            {price}
          </span>
          {period && (
            <span className="text-[0.8125rem] font-mono text-[hsl(var(--v5-ink-500))]">
              {period}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mt-3 [text-wrap:pretty]">
            {description}
          </p>
        )}
      </div>
      <V5Hairline className="mb-5" />
      <ul className="space-y-3 flex-1 mb-6">
        {features.map((f, i) => (
          <V5IconBullet key={i} tone={highlight ? "ai" : "ok"}>
            {f}
          </V5IconBullet>
        ))}
      </ul>
      <V5Button variant={highlight ? "primary" : "secondary"} size="lg" asChild>
        <a href={cta.href}>{cta.label}</a>
      </V5Button>
    </V5Surface>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5Module404Skeleton — used for routes without specific content yet
 * ─────────────────────────────────────────────────────────────────── */
export function V5Logos({ logos }: { logos: string[] }) {
  return (
    <V5Section density="compact">
      <V5Container width="max">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center min-w-0">
          {logos.map((l) => (
            <div
              key={l}
              className="flex h-14 items-center justify-center rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white px-4"
            >
              <span className="font-mono text-[0.8125rem] text-[hsl(var(--v5-ink-700))] truncate">
                {l}
              </span>
            </div>
          ))}
        </div>
      </V5Container>
    </V5Section>
  );
}
