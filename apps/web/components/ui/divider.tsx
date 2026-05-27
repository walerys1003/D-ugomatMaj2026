import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Divider — kanoniczna kreska rozdzielająca.
 *
 * Zastępuje rozsiane `border-t border-iron-200`, które w dark mode bywały
 * niewidoczne. Używa kolorów semantycznych z tokens. Opcjonalna etykieta
 * (np. „LUB", „Sekcja 2") wyrównana do środka.
 */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: React.ReactNode;
}

export function Divider({
  orientation = "horizontal",
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("h-full w-px bg-iron-200 dark:bg-iron-800", className)}
        {...props}
      />
    );
  }
  if (label) {
    return (
      <div
        role="separator"
        className={cn("flex items-center gap-3 text-fluid-xs text-iron-500", className)}
        {...props}
      >
        <span className="h-px flex-1 bg-iron-200 dark:bg-iron-800" />
        <span className="uppercase tracking-[0.18em]">{label}</span>
        <span className="h-px flex-1 bg-iron-200 dark:bg-iron-800" />
      </div>
    );
  }
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-iron-200 dark:bg-iron-800", className)}
      {...props}
    />
  );
}
