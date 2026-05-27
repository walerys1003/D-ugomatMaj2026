import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Kbd — wskaźnik skrótu klawiszowego.
 *
 * Brand spec §3.5 — premium SaaS sygnalizuje shortcuts dyskretnie, nie
 * w kółko ikoną. Używamy w command palette, w toolbar dokumentu, w form
 * hintach („Cmd+Enter aby wysłać"). Renderuje się jako <kbd> dla a11y.
 */
export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-iron-200 bg-iron-50 px-1.5",
        "font-mono text-[0.6875rem] font-medium text-iron-700",
        "dark:border-iron-800 dark:bg-iron-900/70 dark:text-iron-200",
        className
      )}
      {...props}
    />
  );
}
