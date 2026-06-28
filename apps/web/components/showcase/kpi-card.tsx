import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KpiCard — kanoniczny kafelek metryki (redesign 02 §5.2, 04 §7/§8).
 *
 * Jeden wzorzec dla: panel user (dashboard, strona sprawy), panel admin
 * (metrics, analytics), landing (hero stat-row alternatywa). Eliminuje
 * lokalne wariacje „stat box" rozsiane po panelach.
 *
 * Tokeny kanoniczne wyłącznie. Kolor (warn/danger/success) TYLKO z kontekstem
 * liczbowym — zgodnie z zasadą 02 §0 („kolor nigdy nie jest dekoracją").
 */

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** Pomocniczy opis pod wartością */
  hint?: string;
  /** Ikona kontekstowa (lucide) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Trend — renderuje strzałkę + wartość zmiany */
  trend?: { direction: "up" | "down" | "flat"; label: string; positive?: boolean };
  tone?: "default" | "brand" | "success" | "warn" | "danger";
}

const VALUE_TONE: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-ink-900 dark:text-white",
  brand: "text-dlugomat-700 dark:text-dlugomat-300",
  success: "text-accent-700 dark:text-accent-300",
  warn: "text-warn-600 dark:text-warn-500",
  danger: "text-danger-700 dark:text-danger-500",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  tone = "default",
  className,
  ...props
}: KpiCardProps) {
  const TrendIcon =
    trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendPositive = trend?.positive ?? trend?.direction === "up";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-ink-200 bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-ink-500">
          {label}
        </span>
        {Icon ? <Icon className="size-4 text-ink-400" aria-hidden /> : null}
      </div>
      <span
        className={cn(
          "font-display text-3xl font-semibold leading-none tabular-nums",
          VALUE_TONE[tone]
        )}
      >
        {value}
      </span>
      <div className="flex items-center gap-2">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums",
              trendPositive
                ? "text-accent-700 dark:text-accent-300"
                : "text-danger-600 dark:text-danger-500"
            )}
          >
            <TrendIcon className="size-3" aria-hidden />
            {trend.label}
          </span>
        ) : null}
        {hint ? <span className="text-[12px] text-ink-500">{hint}</span> : null}
      </div>
    </div>
  );
}
