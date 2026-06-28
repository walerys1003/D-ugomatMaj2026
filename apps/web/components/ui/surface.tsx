import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface — kanoniczny pojemnik z tłem, krawędzią i cieniem.
 *
 * Zastępuje 11 lokalnych wariantów Card w panelu i landingu. Trzy poziomy
 * elewacji, mapowane bezpośrednio na tokens (shadow.subtle / card / pop).
 *
 *   - elevation="flat"  — flush z tłem, tylko border (default)
 *   - elevation="raised" — shadow-card, do widget paneli
 *   - elevation="floating" — shadow-pop, do dialog/popup/komand
 *
 * `padded` dobiera padding wewnętrzny zgodny z rytmem 4/8/12/16/24/32 px.
 * `interactive` daje hover-state spójny we wszystkich miejscach (lift, focus
 * ring, cursor) bez powtarzania utility classes.
 */
export type SurfaceElevation = "flat" | "raised" | "floating";
export type SurfacePadding = "none" | "sm" | "md" | "lg";

const ELEV: Record<SurfaceElevation, string> = {
  // Tarcza v3 — ink borders zamiast iron (true neutral, brak niebieskiego tintu),
  // tighter shadows z navy-tinted color, refined rounded (md=8 zamiast lg=12).
  flat: "border border-ink-200 dark:border-ink-200 bg-card",
  raised: "border border-ink-200 dark:border-ink-200 bg-card shadow-sm",
  floating: "border border-ink-200 dark:border-ink-200 bg-popover shadow-lg",
};

const PAD: Record<SurfacePadding, string> = {
  // 8pt grid: 16 / 20 / 24 / 32.
  none: "",
  sm: "p-4",   // 16
  md: "p-5",   // 20 — był 24, v3 tighter
  lg: "p-6",   // 24 — był 32
};

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: SurfaceElevation;
  padded?: SurfacePadding;
  interactive?: boolean;
  as?: React.ElementType;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { elevation = "flat", padded = "md", interactive, as: Component = "div", className, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-md",  // v3: 8px (było rounded-lg = 12px)
        ELEV[elevation],
        PAD[padded],
        interactive &&
          "transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-ink-300 hover:bg-ink-50/40 hover:shadow-md focus-within:shadow-shield-focus dark:hover:border-ink-300 dark:hover:bg-dlugomat-850/40",
        className
      )}
      {...props}
    />
  );
});
