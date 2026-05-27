import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Typography primitives — Tarcza v3 "Stoic".
 *
 * Cel: jedno źródło prawdy dla całej hierarchii tekstowej w produkcie.
 * Zastępuje 24+ konfigurakcji `font-display text-fluid-Nxl tracking-tight ...`
 * porozrzucanych po landingu, panelu i adminie (patrz docs/VISUAL_DELTA_V3.md
 * §2.1, §2.10).
 *
 * Reguła żelazna v3:
 *   - Surowe `text-3xl` / `font-display` / `tracking-tight` w nowym kodzie ZAKAZANE.
 *   - Hierarchia wyłącznie przez explicit primitive: <Display>, <Heading>,
 *     <Text>, <Eyebrow>, <Mono>, <Stat>.
 *   - Element-default h1..h6 w globals.css usunięte — primitivy renderują
 *     semantyczny tag (h1/h2/h3) ale wszystkie style przez className.
 *
 * Mapping na hierarchię landingową:
 *   <Display level=1>  Hero h1                    (5xl 48px / 7xl 72px desktop)
 *   <Display level=2>  Section landing h2          (4xl 36px / 5xl 48px)
 *   <Heading level=1>  Page title w panelu/adminie (3xl 30px / 4xl 36px)
 *   <Heading level=2>  Sekcja w panelu             (xl 20px / 2xl 24px)
 *   <Heading level=3>  Card title                  (lg 18px)
 *   <Heading level=4>  List title, table header    (md 16px)
 *   <Text size=lg>     Lead paragraph              (lg 18px)
 *   <Text size=base>   Body text                   (base 15px)  ← default
 *   <Text size=sm>     Caption, helper             (sm 14px)
 *   <Text size=xs>     Microcopy                   (xs 12px)
 *   <Eyebrow>          Section label, supertitle   (xs 12px uppercase)
 *   <Mono>             Sygn. akt, kod, ID          (sm 14px monospace)
 *   <Stat>             KPI value tile              (3xl/4xl tabular-nums)
 */

// =========================================================================
// Display — hero-tier headlines (landing only)
// =========================================================================

const displayVariants = cva(
  "font-display tracking-tight text-balance text-ink-900 dark:text-white",
  {
    variants: {
      level: {
        // Tarcza v4 — type scale +1: każdy poziom o stopień większy.
        // Powód: na 14" laptopie hero h1 wyglądał za drobno (5xl=48px).
        // Top-tier AI SaaS (Linear, Stripe, Anthropic) startuje hero
        // od ~60-72px desktop, my szliśmy od 48px.
        1: "text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] font-semibold leading-[1.02]",   // 60 / 72 / 88 / 96
        2: "text-5xl md:text-6xl font-semibold leading-[1.04]",                                    // 48 / 60
        3: "text-4xl md:text-5xl font-semibold leading-[1.06]",                                    // 36 / 48
      },
    },
    defaultVariants: { level: 1 },
  }
);

export interface DisplayProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof displayVariants> {
  as?: "h1" | "h2" | "h3";
}

export const Display = React.forwardRef<HTMLHeadingElement, DisplayProps>(
  function Display({ level = 1, as, className, ...props }, ref) {
    const Tag = (as ?? (`h${level}` as "h1" | "h2" | "h3")) as React.ElementType;
    return (
      <Tag ref={ref} className={cn(displayVariants({ level }), className)} {...props} />
    );
  }
);

// =========================================================================
// Heading — workspace / panel / admin / inner-section titles
// =========================================================================

const headingVariants = cva(
  "font-display tracking-tight text-ink-900 dark:text-white",
  {
    variants: {
      level: {
        // Tarcza v4 — type scale +1 (each level one step larger).
        1: "text-4xl md:text-5xl font-semibold leading-[1.08]",   // 36 / 48  (page title)
        2: "text-2xl md:text-3xl font-semibold leading-[1.15]",   // 24 / 30  (section heading)
        3: "text-xl md:text-2xl font-semibold leading-[1.2]",     // 20 / 24  (card title)
        4: "text-lg font-semibold leading-[1.25]",                 // 18       (list / column title)
      },
    },
    defaultVariants: { level: 2 },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading({ level = 2, as, className, ...props }, ref) {
    const Tag = (as ?? (`h${(level ?? 2) + 1}` as "h2" | "h3" | "h4" | "h5")) as React.ElementType;
    // level 1 → h2 (page heading under SiteHeader h1 implicit); level 4 → h5.
    // Override via `as` jeśli kontekst semantyczny tego wymaga.
    return (
      <Tag ref={ref} className={cn(headingVariants({ level }), className)} {...props} />
    );
  }
);

// =========================================================================
// Text — body / lead / caption / microcopy
// =========================================================================

const textVariants = cva("", {
  variants: {
    size: {
      // Tarcza v4 — body size bump. Standard SaaS marketing body to 17-18px,
      // panel/admin może zostać na 15-16. `base` urośnie z 15 → 16, `lg` z
      // 18 → 19 (między text-lg a text-xl).
      lg: "text-xl leading-[1.55]",        // 20 — lead para (hero subheadline)
      base: "text-[17px] leading-[1.65]",  // 17 — body default ↑ z 15
      sm: "text-[15px] leading-[1.55]",    // 15 — caption ↑ z 14
      xs: "text-[13px] leading-[1.5]",     // 13 — microcopy ↑ z 12
    },
    tone: {
      strong: "text-ink-900 dark:text-white",
      default: "text-ink-700 dark:text-ink-700",
      muted: "text-ink-500 dark:text-ink-500",
      subtle: "text-ink-400 dark:text-ink-400",
      brand: "text-dlugomat-700 dark:text-dlugomat-300",
      success: "text-accent-700 dark:text-accent-300",
      warning: "text-warn-600 dark:text-warn-500",
      danger: "text-danger-700 dark:text-danger-500",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: { size: "base", tone: "default", weight: "regular" },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(function Text(
  { size, tone, weight, as: Tag = "p", className, ...props },
  ref
) {
  return (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={cn(textVariants({ size, tone, weight }), className)}
      {...props}
    />
  );
});

// =========================================================================
// Eyebrow — uppercase supertitle (section labels)
// =========================================================================

const eyebrowVariants = cva(
  // Tarcza v4 — eyebrow 11 → 12.5px, lepsza czytelność na hero/section labels.
  "inline-flex items-center gap-1.5 text-[12.5px] font-semibold uppercase leading-none",
  {
    variants: {
      tone: {
        brand: "text-dlugomat-700 dark:text-dlugomat-300",
        neutral: "text-ink-500 dark:text-ink-500",
        success: "text-accent-700 dark:text-accent-300",
        warning: "text-warn-600 dark:text-warn-500",
        danger: "text-danger-700 dark:text-danger-500",
      },
      tracking: {
        tight: "tracking-[0.06em]",
        normal: "tracking-[0.14em]",
        wide: "tracking-[0.22em]",
      },
    },
    defaultVariants: { tone: "brand", tracking: "normal" },
  }
);

export interface EyebrowProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof eyebrowVariants> {
  withDot?: boolean;
}

const DOT_TONE: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  brand: "bg-dlugomat-500",
  neutral: "bg-ink-400",
  success: "bg-accent-500",
  warning: "bg-warn-500",
  danger: "bg-danger-500",
};

export function Eyebrow({
  tone = "brand",
  tracking,
  withDot,
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <span className={cn(eyebrowVariants({ tone, tracking }), className)} {...props}>
      {withDot ? (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", DOT_TONE[tone])}
        />
      ) : null}
      {children}
    </span>
  );
}

// =========================================================================
// Mono — inline monospace (sygnatury, kody, ID)
// =========================================================================

const monoVariants = cva("font-mono tabular-nums", {
  variants: {
    size: {
      xs: "text-[11px] leading-snug",
      sm: "text-[12.5px] leading-snug",
      base: "text-[13.5px] leading-snug",
    },
    tone: {
      default: "text-ink-700 dark:text-ink-700",
      muted: "text-ink-500 dark:text-ink-500",
      strong: "text-ink-900 dark:text-white",
    },
  },
  defaultVariants: { size: "sm", tone: "default" },
});

export interface MonoProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof monoVariants> {}

export function Mono({ size, tone, className, ...props }: MonoProps) {
  return <span className={cn(monoVariants({ size, tone }), className)} {...props} />;
}

// =========================================================================
// Stat — KPI value tile (TrustBar, Panel dashboard, Admin metrics)
// =========================================================================

export interface StatProps {
  /** Główna wartość — "12 min", "94%", "5–10×", "1 247 PLN" */
  value: React.ReactNode;
  /** Etykieta nad wartością (microcopy uppercase) */
  label?: React.ReactNode;
  /** Opis pod wartością (kontekst, jak to interpretować) */
  hint?: React.ReactNode;
  /** Ikona po lewej obok labela */
  icon?: React.ReactNode;
  /** Akcent kolorystyczny dla wartości */
  tone?: "default" | "brand" | "success" | "warning" | "danger";
  /** Rozmiar — md domyślnie (panel/admin), lg na hero/landing */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STAT_VALUE_TONE: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "text-ink-900 dark:text-white",
  brand: "text-dlugomat-800 dark:text-dlugomat-200",
  success: "text-accent-700 dark:text-accent-300",
  warning: "text-warn-600 dark:text-warn-500",
  danger: "text-danger-700 dark:text-danger-500",
};

const STAT_SIZE: Record<NonNullable<StatProps["size"]>, { value: string; gap: string }> = {
  // Tarcza v4 — Stat +1 step (panel KPIs i hero stats wyglądały za drobnie).
  sm: { value: "text-3xl", gap: "gap-1" },
  md: { value: "text-4xl", gap: "gap-1.5" },
  lg: { value: "text-5xl md:text-6xl", gap: "gap-2" },
};

export function Stat({
  value,
  label,
  hint,
  icon,
  tone = "default",
  size = "md",
  className,
}: StatProps) {
  const s = STAT_SIZE[size];
  return (
    <div className={cn("flex flex-col", s.gap, className)}>
      {label ? (
        <div className="flex items-center gap-2 text-ink-500">
          {icon ? <span aria-hidden className="text-ink-400">{icon}</span> : null}
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            {label}
          </span>
        </div>
      ) : null}
      <div
        className={cn(
          "font-display font-semibold tabular-nums tracking-tight",
          s.value,
          STAT_VALUE_TONE[tone]
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="text-xs text-ink-500 dark:text-ink-500">{hint}</div>
      ) : null}
    </div>
  );
}
