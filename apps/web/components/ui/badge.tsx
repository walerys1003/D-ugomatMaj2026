import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — inline status / label. Brand spec §3.2.3 mandates that
 * status colours always carry numeric context (e.g. "3 dni"); this
 * component supports that via the `withDot` and `children` props but
 * does not enforce it (orchestrator review responsibility).
 */
export const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
    "text-fluid-xs font-semibold tracking-wide"
  ),
  {
    variants: {
      tone: {
        info: "bg-dlugomat-100 border-dlugomat-200 text-dlugomat-800 dark:bg-dlugomat-850 dark:border-dlugomat-700 dark:text-dlugomat-200",
        success:
          "bg-accent-100 border-accent-200 text-accent-700 dark:bg-accent-700/20 dark:border-accent-600/40 dark:text-accent-300",
        warning:
          "bg-warn-100 border-warn-500/40 text-warn-600 dark:bg-warn-500/15 dark:border-warn-500/40 dark:text-warn-100",
        danger:
          "bg-danger-100 border-danger-500/40 text-danger-700 dark:bg-danger-500/15 dark:border-danger-500/40 dark:text-danger-100",
        neutral:
          "bg-iron-100 border-iron-200 text-iron-700 dark:bg-dlugomat-850 dark:border-dlugomat-800 dark:text-iron-200",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

/**
 * `BadgeLegacyVariant` — shadcn-compatible variant set, zachowane jako
 * deprecated alias (Sprint typecheck A). Mapuje na canonical `tone`.
 *
 * Pełna migracja: <Badge variant="outline"> → <Badge tone="neutral">,
 * <Badge variant="destructive"> → <Badge tone="danger">, etc.
 * Do czasu codemod-u wszystkich 8 konsumentów (marketplace, dpa, precedensy,
 * kalkulatory) compat-layer poniżej mapuje wartości w runtime.
 */
type BadgeLegacyVariant = "default" | "secondary" | "destructive" | "outline";

const LEGACY_TONE_MAP: Record<BadgeLegacyVariant, NonNullable<BadgeProps["tone"]>> = {
  default: "info",
  secondary: "neutral",
  destructive: "danger",
  outline: "neutral",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
  /** @deprecated Use `tone` instead. Maps to canonical tone for back-compat. */
  variant?: BadgeLegacyVariant;
}

const DOT: Record<NonNullable<BadgeProps["tone"]>, string> = {
  info: "bg-dlugomat-500",
  success: "bg-accent-500",
  warning: "bg-warn-500",
  danger: "bg-danger-500",
  neutral: "bg-iron-400",
};

export function Badge({
  className,
  tone,
  variant,
  withDot,
  children,
  ...props
}: BadgeProps) {
  // Priorytet: tone (canonical) > variant (deprecated) > "neutral"
  const resolvedTone: NonNullable<BadgeProps["tone"]> =
    tone ?? (variant ? LEGACY_TONE_MAP[variant] : "neutral");
  return (
    <span className={cn(badgeVariants({ tone: resolvedTone }), className)} {...props}>
      {withDot ? (
        <span aria-hidden className={cn("size-1.5 rounded-full", DOT[resolvedTone])} />
      ) : null}
      {children}
    </span>
  );
}
