"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SegmentedControl — accessible "tabbed" toggle with `role=tablist`.
 * Optimised for short label lists (2–5 segments).
 */
export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-iron-200 bg-iron-50 p-1",
        "dark:border-iron-800 dark:bg-dlugomat-900",
        className,
      )}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-fluid-sm font-semibold transition",
              "focus-visible:outline-none focus-visible:shadow-shield-focus",
              selected
                ? "bg-white text-dlugomat-900 shadow-card dark:bg-iron-950 dark:text-iron-50"
                : "text-iron-600 hover:text-iron-900 dark:text-iron-300 dark:hover:text-iron-50",
            )}
          >
            {o.label}
            {o.hint ? (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 text-fluid-xs",
                  selected
                    ? "bg-dlugomat-100 text-dlugomat-800 dark:bg-dlugomat-850 dark:text-dlugomat-200"
                    : "bg-iron-200 text-iron-700 dark:bg-dlugomat-850 dark:text-iron-300",
                )}
              >
                {o.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
