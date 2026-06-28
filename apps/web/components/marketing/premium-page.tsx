import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * PremiumPage — reużywalny shell stron marketingowych w szacie
 * "Corporate Blue Light" (01-DLUGOMAT-corporate-blue). Buduje spójny:
 *   - PageHero  (eyebrow pill + H1 + lede + CTA pair, subtelny blue mesh)
 *   - PageSection (sekcja z opcjonalnym nagłówkiem)
 *   - FeatureGrid / FeatureCard
 *   - StepGrid / StepCard
 *   - CtaBand   (ciemny blok końcowy)
 *
 * Wszystko korzysta z tokenów (--dlugomat-* / --ink-*), więc dziedziczy
 * paletę globalną i działa w dark-mode. Belka i stopka pochodzą z
 * (marketing)/layout.tsx — tu renderujemy wyłącznie treść strony.
 */

type CTA = { href: string; label: string };

export function PageHero({
  eyebrow,
  title,
  lede,
  primary,
  secondary,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  primary?: CTA;
  secondary?: CTA;
  children?: React.ReactNode;
}) {
  return (
    <section className="dlu-page-hero">
      <div className="container py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? <span className="dlu-eyebrow mb-5">{eyebrow}</span> : null}
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-5xl lg:text-6xl dark:text-white">
            {title}
          </h1>
          {lede ? (
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-600">
              {lede}
            </p>
          ) : null}
          {(primary || secondary) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {primary ? (
                <Link href={primary.href} className="dlu-btn dlu-btn-lg dlu-btn-primary group">
                  {primary.label}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ) : null}
              {secondary ? (
                <Link href={secondary.href} className="dlu-btn dlu-btn-lg dlu-btn-ghost">
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function PageSection({
  eyebrow,
  title,
  lede,
  children,
  tinted,
  className,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  tinted?: boolean;
  className?: string;
}) {
  return (
    <section className={tinted ? "bg-ink-50" : "bg-background"}>
      <div className={`container py-16 sm:py-20 lg:py-24 ${className ?? ""}`}>
        {(eyebrow || title || lede) && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            {eyebrow ? <span className="dlu-eyebrow mb-4">{eyebrow}</span> : null}
            {title ? <h2 className="dlu-h2 mt-2">{title}</h2> : null}
            {lede ? <p className="mt-4 text-lg leading-relaxed text-ink-600">{lede}</p> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function FeatureGrid({
  cols = 3,
  children,
}: {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const map = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };
  return <div className={`grid grid-cols-1 gap-6 ${map[cols]}`}>{children}</div>;
}

export function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="dlu-card dlu-card-hover p-6">
      {Icon ? (
        <span className="dlu-icon-square mb-4">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <h3 className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink-900 dark:text-white">
        {title}
      </h3>
      {children ? <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{children}</p> : null}
    </div>
  );
}

export function StepGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

export function StepCard({
  num,
  icon: Icon,
  title,
  time,
  children,
}: {
  num: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  time?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="dlu-card dlu-card-hover relative overflow-hidden p-7">
      <span className="dlu-step-num absolute -top-2 right-5 select-none">{num}</span>
      <div className="relative">
        {Icon ? (
          <span className="dlu-icon-grad mb-5">
            <Icon className="size-6" aria-hidden />
          </span>
        ) : null}
        <h3 className="text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink-900 dark:text-white">
          {title}
        </h3>
        {children ? <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{children}</p> : null}
        {time ? <span className="dlu-time-pill mt-4">{time}</span> : null}
      </div>
    </div>
  );
}

export function CheckList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex items-start gap-3 border-b border-ink-200 py-3 text-[15px] leading-relaxed text-ink-800 last:border-b-0"
        >
          <span className="dlu-check mt-0.5">✓</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function CtaBand({
  title,
  lede,
  primary,
  secondary,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  primary: CTA;
  secondary?: CTA;
}) {
  return (
    <section className="bg-background">
      <div className="container pb-20 pt-4 sm:pb-24">
        <div className="dlu-cta-dark px-8 py-14 text-center sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            {lede ? <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-ink-300">{lede}</p> : null}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={primary.href}
                className="dlu-btn dlu-btn-lg group bg-white text-ink-900 hover:-translate-y-px hover:bg-dlugomat-50"
              >
                {primary.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="dlu-btn dlu-btn-lg border border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
                >
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
