"use client";

/**
 * V5-INFRA motion — Agent 10: Motion & Interaction Systems
 * --------------------------------------------------------------------------
 * Calm, cinematic, operational. NEVER bouncy. NEVER flashy.
 * All motion respects prefers-reduced-motion.
 */
import * as React from "react";

import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * Reveal — Subtle fade+slide-up on scroll into view
 * ─────────────────────────────────────────────────────────────────── */
export function V5Reveal({
  children,
  delay = 0,
  className,
  as: As = "div",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  direction?: "up" | "down" | "left" | "right" | "fade";
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(node);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const offset =
    direction === "up"
      ? "translate3d(0, 14px, 0)"
      : direction === "down"
        ? "translate3d(0, -14px, 0)"
        : direction === "left"
          ? "translate3d(14px, 0, 0)"
          : direction === "right"
            ? "translate3d(-14px, 0, 0)"
            : "none";

  const Component = As as React.ElementType;
  return (
    <Component
      ref={ref as React.RefObject<never>}
      className={cn("will-change-transform min-w-0", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : offset,
        transition: `opacity 640ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 640ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </Component>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Stagger — children reveal one after another
 * ─────────────────────────────────────────────────────────────────── */
export function V5Stagger({
  children,
  step = 80,
  className,
  startDelay = 0,
}: {
  children: React.ReactNode;
  step?: number;
  className?: string;
  startDelay?: number;
}) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <V5Reveal key={i} delay={startDelay + i * step}>
          {child}
        </V5Reveal>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Pulse — Live data indicator
 * ─────────────────────────────────────────────────────────────────── */
export function V5LivePulse({
  tone = "ai",
  size = 8,
  className,
}: {
  tone?: "ai" | "ok" | "warn" | "err" | "audit";
  size?: number;
  className?: string;
}) {
  const colorVar =
    tone === "ai"
      ? "--v5-violet-500"
      : tone === "ok"
        ? "--v5-ok"
        : tone === "warn"
          ? "--v5-warn"
          : tone === "audit"
            ? "--v5-audit-500"
            : "--v5-err";
  return (
    <span
      aria-label={`Live ${tone}`}
      className={cn("relative inline-flex", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          background: `hsl(var(${colorVar}))`,
          animation: "v5-pulse-glow 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        }}
      />
      <span
        className="relative inline-block rounded-full"
        style={{
          width: size,
          height: size,
          background: `hsl(var(${colorVar}))`,
        }}
      />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * DataFlow — Procedural data movement (orchestration visualization)
 * ─────────────────────────────────────────────────────────────────── */
export function V5DataFlow({
  className,
  tone = "ai",
  speed = "normal",
}: {
  className?: string;
  tone?: "ai" | "audit";
  speed?: "slow" | "normal" | "fast";
}) {
  const color = tone === "ai" ? "--v5-violet-500" : "--v5-audit-500";
  const dur = speed === "slow" ? "4.8s" : speed === "fast" ? "1.8s" : "3.2s";
  return (
    <div
      aria-hidden
      className={cn("relative h-px overflow-hidden", className)}
      style={{ background: `hsl(var(${color}) / 0.1)` }}
    >
      <span
        className="absolute inset-y-0 w-[24%]"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(var(${color})), transparent)`,
          animation: `v5-data-flow ${dur} cubic-bezier(0.65, 0, 0.35, 1) infinite`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Topology hover — subtle hover state for cards
 * ─────────────────────────────────────────────────────────────────── */
export function V5HoverLift({
  children,
  className,
  intensity = "normal",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: "subtle" | "normal" | "strong";
}) {
  const lift =
    intensity === "subtle" ? "1px" : intensity === "strong" ? "4px" : "2px";
  return (
    <div
      className={cn(
        "group transition-transform duration-[var(--v5-dur-base)] ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
      style={{
        // @ts-expect-error custom prop
        "--v5-hover-lift": lift,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `translateY(-${lift})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * AmbientGlow — Slow-breathing AI surface aura
 * ─────────────────────────────────────────────────────────────────── */
export function V5AmbientGlow({
  className,
  tone = "ai",
}: {
  className?: string;
  tone?: "ai" | "audit";
}) {
  const color = tone === "ai" ? "--v5-violet-500" : "--v5-audit-500";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -inset-px rounded-[inherit]", className)}
      style={{
        background: `radial-gradient(60% 80% at 50% 0%, hsl(var(${color}) / 0.18) 0%, transparent 70%)`,
        animation: "v5-pulse-soft 6s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Marquee — gently scrolling proof / logo strip
 * ─────────────────────────────────────────────────────────────────── */
export function V5Marquee({
  children,
  className,
  duration = 40,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex w-max gap-12"
        style={{
          animation: `v5-marquee ${duration}s linear infinite`,
        }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-12">
          {children}
        </div>
      </div>
      <style jsx>{`
        @keyframes v5-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Counter — Animated number count-up
 * ─────────────────────────────────────────────────────────────────── */
export function V5Counter({
  value,
  duration = 1600,
  format = (n) => n.toLocaleString("pl-PL"),
  className,
  prefix,
  suffix,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let start = 0;

    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      // ease-out-quint
      const eased = 1 - Math.pow(1 - p, 5);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            raf = requestAnimationFrame(tick);
            obs.unobserve(node);
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {format(n)}
      {suffix}
    </span>
  );
}
