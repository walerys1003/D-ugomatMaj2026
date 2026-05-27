"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tier 29 — ContextualTooltip.
 * Mini-popover dla skrótowych podpowiedzi prawnych przy polach formularzy.
 * Klawiatura: focus = open, Esc/blur = close.
 */
interface Props {
  title?: string;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function ContextualTooltip({ title, children, className, iconClassName }: Props) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-label="Podpowiedź"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded-full p-0.5 text-ink-400 hover:text-dlugomat-600 focus:outline-none focus:ring-2 focus:ring-dlugomat-300"
      >
        <Info className={cn("h-3.5 w-3.5", iconClassName)} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-lg border border-ink-200 bg-white p-3 text-fluid-xs text-ink-700 shadow-lg dark:border-dlugomat-700 dark:bg-dlugomat-900 dark:text-ink-200"
        >
          {title && <span className="mb-1 block font-semibold text-ink-900 dark:text-white">{title}</span>}
          {children}
        </span>
      )}
    </span>
  );
}
