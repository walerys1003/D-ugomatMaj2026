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
  flat: "border border-iron-200/80 dark:border-iron-800/60 bg-card",
  raised: "border border-iron-200/60 dark:border-iron-800/40 bg-card shadow-card",
  floating: "border border-iron-200/60 dark:border-iron-800/40 bg-popover shadow-pop",
};

const PAD: Record<SurfacePadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
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
        "rounded-lg",
        ELEV[elevation],
        PAD[padded],
        interactive &&
          "transition-all duration-base ease-shield-out hover:-translate-y-px hover:border-dlugomat-300/80 hover:shadow-pop focus-within:shadow-shield-focus",
        className
      )}
      {...props}
    />
  );
});
