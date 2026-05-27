"use client";

import * as React from "react";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OnboardingTooltip — anchored callout shown once per user (localStorage flag).
 * Intended for highlighting newly released features without modal interruption.
 */
export interface OnboardingTooltipProps {
  storageKey: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function OnboardingTooltip({
  storageKey,
  title,
  description,
  ctaLabel = "Pokaż",
  ctaHref,
  side = "bottom",
  className,
}: OnboardingTooltipProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(`dlugomat:onboarding:${storageKey}`);
      if (!seen) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(`dlugomat:onboarding:${storageKey}`, "1");
    } catch {}
  }

  if (!visible) return null;

  const arrow = {
    top: "bottom-[-6px] left-6 rotate-45",
    right: "left-[-6px] top-6 rotate-45",
    bottom: "top-[-6px] left-6 rotate-45",
    left: "right-[-6px] top-6 rotate-45",
  } as const;

  return (
    <div
      role="status"
      className={cn(
        "relative max-w-sm rounded-xl border border-accent-300 bg-white p-4 shadow-pop",
        "dark:border-accent-600/40 dark:bg-iron-950",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute size-3 border border-accent-300 bg-white dark:border-accent-600/40 dark:bg-iron-950",
          arrow[side],
        )}
      />
      <button
        type="button"
        aria-label="Zamknij wskazówkę"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded p-1 text-iron-500 hover:bg-iron-100 focus-visible:outline-none focus-visible:shadow-shield-focus dark:hover:bg-dlugomat-900"
      >
        <X className="size-3.5" />
      </button>
      <div className="flex flex-col gap-1 pr-6">
        <span className="text-fluid-xs font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
          Nowość
        </span>
        <h4 className="text-fluid-base font-semibold text-iron-900 dark:text-iron-50">
          {title}
        </h4>
        <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
          {description}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={dismiss}
          className="text-fluid-xs font-semibold text-iron-500 hover:text-iron-700"
        >
          Później
        </button>
        {ctaHref ? (
          <a
            href={ctaHref}
            onClick={dismiss}
            className="inline-flex items-center gap-1 rounded-md bg-dlugomat-700 px-3 py-1.5 text-fluid-xs font-semibold text-white hover:bg-dlugomat-800 focus-visible:outline-none focus-visible:shadow-shield-focus"
          >
            {ctaLabel}
            <ChevronRight className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
