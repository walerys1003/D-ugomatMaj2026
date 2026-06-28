/**
 * V5-INFRA primitives — Agent 01: Design System Architect
 * --------------------------------------------------------------------------
 * Building blocks for the ultra-enterprise AI-native legal OS.
 * All primitives consume CSS variables from `styles/v5/tokens.css`.
 *
 * Layering principle: each primitive is the smallest reusable infrastructure
 * unit. Compose, do not extend. No inline hex values, no magic numbers.
 */
import * as React from "react";

import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
 * Container — Infrastructure layout shells
 * ─────────────────────────────────────────────────────────────────── */
type ContainerWidth = "max" | "wide" | "content" | "narrow";
const containerClass: Record<ContainerWidth, string> = {
  max: "v5-container",
  wide: "v5-container-wide",
  content: "v5-container-content",
  narrow: "v5-container-narrow",
};

export function V5Container({
  width = "wide",
  className,
  children,
  as: As = "div",
}: {
  width?: ContainerWidth;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}) {
  const Component = As as React.ElementType;
  return <Component className={cn(containerClass[width], className)}>{children}</Component>;
}

/* ─────────────────────────────────────────────────────────────────────
 * Section — Infrastructure rhythm
 * ─────────────────────────────────────────────────────────────────── */
export function V5Section({
  density = "normal",
  className,
  children,
  id,
  topology,
}: {
  density?: "normal" | "compact";
  className?: string;
  children: React.ReactNode;
  id?: string;
  /** Optional ambient background pattern */
  topology?: "grid" | "dots" | "none";
}) {
  return (
    <section
      id={id}
      className={cn(
        density === "compact" ? "v5-section-sm" : "v5-section",
        "relative",
        className,
      )}
    >
      {topology && topology !== "none" && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 v5-topology-fade opacity-50",
            topology === "grid" && "v5-topology-grid",
            topology === "dots" && "v5-topology-dots",
          )}
        />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Eyebrow — Section labels, AI-native uppercase tracking
 * ─────────────────────────────────────────────────────────────────── */
export function V5Eyebrow({
  children,
  className,
  icon,
  pulse,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span className={cn("v5-text-eyebrow inline-flex items-center gap-2", className)}>
      {pulse && (
        <span
          aria-hidden
          className="relative inline-flex h-1.5 w-1.5"
        >
          <span className="absolute inset-0 rounded-full bg-[hsl(var(--v5-violet-500))] opacity-75 [animation:v5-pulse-soft_2.4s_ease-in-out_infinite]" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--v5-violet-500))]" />
        </span>
      )}
      {icon}
      <span>{children}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Headlines — Display, H1, H2, H3
 * ─────────────────────────────────────────────────────────────────── */
type HeadlineLevel = "display" | "h1" | "h2" | "h3" | "h4";
const headlineMap: Record<HeadlineLevel, { tag: keyof JSX.IntrinsicElements; cls: string }> = {
  display: { tag: "h1", cls: "v5-text-display" },
  h1: { tag: "h1", cls: "v5-text-h1" },
  h2: { tag: "h2", cls: "v5-text-h2" },
  h3: { tag: "h3", cls: "v5-text-h3" },
  h4: { tag: "h4", cls: "v5-text-h4" },
};

export function V5Headline({
  level = "h2",
  className,
  children,
  balance = true,
}: {
  level?: HeadlineLevel;
  className?: string;
  children: React.ReactNode;
  balance?: boolean;
}) {
  const { tag, cls } = headlineMap[level];
  const Tag = tag as React.ElementType;
  return (
    <Tag
      className={cn(
        cls,
        "text-[hsl(var(--v5-ink-900))]",
        balance && "[text-wrap:balance]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Body — Long-form text
 * ─────────────────────────────────────────────────────────────────── */
export function V5Body({
  size = "default",
  className,
  children,
  tone = "secondary",
}: {
  size?: "lg" | "default" | "small";
  className?: string;
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "muted";
}) {
  const sizeCls =
    size === "lg" ? "v5-text-body-lg" : size === "small" ? "v5-text-small" : "v5-text-body";
  const toneCls =
    tone === "primary"
      ? "text-[hsl(var(--v5-ink-900))]"
      : tone === "muted"
        ? "text-[hsl(var(--v5-ink-400))]"
        : "text-[hsl(var(--v5-ink-500))]";
  return (
    <p className={cn(sizeCls, toneCls, "[text-wrap:pretty]", className)}>{children}</p>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Surface — Card system (infrastructure modules)
 * ─────────────────────────────────────────────────────────────────── */
type SurfaceVariant = "flat" | "raised" | "elevated" | "ai" | "terminal";

export function V5Surface({
  variant = "raised",
  className,
  children,
  interactive = false,
  topology,
  ...rest
}: {
  variant?: SurfaceVariant;
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
  topology?: "grid" | "dots";
} & React.HTMLAttributes<HTMLDivElement>) {
  const variantCls: Record<SurfaceVariant, string> = {
    flat: "v5-surface",
    raised: "v5-surface-raised",
    elevated: "v5-surface-elevated",
    ai: "v5-surface-ai",
    terminal: "v5-surface-terminal",
  };
  return (
    <div
      {...rest}
      className={cn(
        variantCls[variant],
        "relative overflow-hidden min-w-0",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-[var(--v5-dur-base)] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[var(--v5-shadow-3)]",
        className,
      )}
    >
      {topology && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-[0.35] v5-topology-fade",
            topology === "grid" && "v5-topology-grid",
            topology === "dots" && "v5-topology-dots",
          )}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Button — V5 CTAs
 * ─────────────────────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "terminal";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariant: Record<ButtonVariant, string> = {
  primary:
    "bg-[hsl(var(--v5-violet-500))] text-white hover:bg-[hsl(var(--v5-violet-600))] active:bg-[hsl(var(--v5-violet-700))] shadow-[var(--v5-shadow-2)]",
  secondary:
    "bg-white text-[hsl(var(--v5-ink-900))] border border-[hsl(var(--v5-infra-200))] hover:border-[hsl(var(--v5-violet-500))] hover:text-[hsl(var(--v5-violet-500))]",
  ghost:
    "bg-transparent text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))]",
  terminal:
    "bg-[hsl(var(--v5-system-800))] text-white border border-white/10 hover:bg-[hsl(var(--v5-ink-900))] font-mono",
};
const buttonSize: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.9375rem]",
  md: "h-12 px-6 text-[1rem]",
  lg: "h-14 px-8 text-[1.0625rem]",
};

export const V5Button = React.forwardRef<
  HTMLElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
  }
>(({ variant = "primary", size = "md", className, children, asChild, ...rest }, ref) => {
  const classes = cn(
    "v5-focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--v5-radius-md)] font-medium transition-[background,color,border-color,transform,box-shadow] duration-[var(--v5-dur-fast)] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]",
    buttonVariant[variant],
    buttonSize[size],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { className?: string };
    return React.cloneElement(children as React.ReactElement, {
      ref,
      ...rest,
      className: cn(classes, childProps.className),
    });
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      {...rest}
      className={classes}
    >
      {children}
    </button>
  );
});
V5Button.displayName = "V5Button";

/* ─────────────────────────────────────────────────────────────────────
 * Pill — Status tags (ok / warn / err / ai / neutral)
 * ─────────────────────────────────────────────────────────────────── */
type PillTone = "ok" | "warn" | "err" | "ai" | "audit" | "neutral";
const pillTone: Record<PillTone, string> = {
  ok: "bg-[hsl(var(--v5-ok)/0.1)] text-[hsl(var(--v5-ok))] border-[hsl(var(--v5-ok)/0.25)]",
  warn: "bg-[hsl(var(--v5-warn)/0.1)] text-[hsl(var(--v5-warn))] border-[hsl(var(--v5-warn)/0.25)]",
  err: "bg-[hsl(var(--v5-err)/0.1)] text-[hsl(var(--v5-err))] border-[hsl(var(--v5-err)/0.25)]",
  ai: "bg-[hsl(var(--v5-violet-100))] text-[hsl(var(--v5-violet-700))] border-[hsl(var(--v5-violet-500)/0.32)]",
  audit:
    "bg-[hsl(var(--v5-audit-500)/0.08)] text-[hsl(var(--v5-audit-700))] border-[hsl(var(--v5-audit-500)/0.25)]",
  neutral: "bg-[hsl(var(--v5-infra-100))] text-[hsl(var(--v5-ink-700))] border-[hsl(var(--v5-infra-200))]",
};

export function V5Pill({
  tone = "neutral",
  className,
  children,
  pulse,
}: {
  tone?: PillTone;
  className?: string;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--v5-radius-pill)] border px-3 py-1 text-[0.8125rem] font-medium leading-none",
        pillTone[tone],
        className,
      )}
    >
      {pulse && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current [animation:v5-pulse-soft_2.4s_ease-in-out_infinite]"
        />
      )}
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Hairline — Infrastructure dividers
 * ─────────────────────────────────────────────────────────────────── */
export function V5Hairline({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-[hsl(var(--v5-infra-200))]",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Stat — KPI / metric display
 * ─────────────────────────────────────────────────────────────────── */
export function V5Stat({
  label,
  value,
  delta,
  hint,
  tone = "neutral",
  monospace = true,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  hint?: string;
  tone?: "neutral" | "ai" | "ok";
  monospace?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="v5-text-caption text-[hsl(var(--v5-ink-500))] uppercase tracking-[var(--v5-tracking-uppercase)] text-[0.75rem]">
        {label}
      </span>
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "text-[2.25rem] leading-[1.1] font-semibold tracking-tight",
            monospace && "font-mono",
            tone === "ai" && "text-[hsl(var(--v5-violet-500))]",
            tone === "ok" && "text-[hsl(var(--v5-ok))]",
            tone === "neutral" && "text-[hsl(var(--v5-ink-900))]",
          )}
        >
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "text-[0.875rem] font-mono font-medium",
              delta.direction === "up" && "text-[hsl(var(--v5-ok))]",
              delta.direction === "down" && "text-[hsl(var(--v5-err))]",
              delta.direction === "flat" && "text-[hsl(var(--v5-ink-500))]",
            )}
          >
            {delta.direction === "up" && "↑ "}
            {delta.direction === "down" && "↓ "}
            {delta.direction === "flat" && "→ "}
            {delta.value}
          </span>
        )}
      </div>
      {hint && (
        <span className="text-[0.8125rem] text-[hsl(var(--v5-ink-500))]">{hint}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Code / Terminal block
 * ─────────────────────────────────────────────────────────────────── */
export function V5Terminal({
  title,
  children,
  className,
  scanlines,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  scanlines?: boolean;
}) {
  return (
    <div
      className={cn(
        "v5-surface-terminal relative font-mono text-[0.8125rem] sm:text-[0.875rem] leading-relaxed min-w-0 overflow-hidden",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-4 py-2.5 text-[0.6875rem] sm:text-[0.75rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-white/60 min-w-0">
          <span className="flex items-center gap-2 min-w-0 truncate">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--v5-ok))] [animation:v5-pulse-soft_2.4s_ease-in-out_infinite]" />
            <span className="truncate">{title}</span>
          </span>
          <span className="shrink-0 text-white/30">v5-infra</span>
        </div>
      )}
      <div className="px-3 sm:px-4 py-3 overflow-x-auto" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
        {children}
      </div>
      {scanlines && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, white 2px, white 3px)",
          }}
        />
      )}
    </div>
  );
}
