import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Container — kanoniczny wrapper poziomy.
 *
 * Cel: wszystkie sekcje landing/panel mają tę samą szerokość maks. i ten sam
 * padding boczny niezależnie od tego, kto pisze JSX. Bez tego co druga sekcja
 * ma `max-w-6xl`, `max-w-7xl`, `container mx-auto px-6` w wariacjach.
 *
 * Trzy szerokości (Brand spec §3.3.3 — rytm pionowy + szerokość czytna):
 *   - sm: 768px  (long-form, baza wiedzy, artykuły)
 *   - md: 1120px (panel content, pojedyncze widoki sprawy)
 *   - lg: 1280px (landing, dashboardy z gridem 12)
 *
 * Padding boczny rośnie liniowo z viewport — dziedziczone z tailwind.config
 * theme.container, ale tu opakowane w komponent dla spójności DX.
 */
export type ContainerWidth = "sm" | "md" | "lg" | "xl";

const WIDTH: Record<ContainerWidth, string> = {
  // v4-ι.6 — szerszy "lg" (landing) i mniejszy padding poziomy:
  // landing teraz 1400px (z 1200) → po 1.2× root font scale realna treść
  // mieści się komfortowo bez utraty rytmu kolumn.
  sm: "max-w-[720px]",    // long-form
  md: "max-w-[1080px]",   // panel content
  lg: "max-w-[1400px]",   // landing default — szersze niż Linear (1200), bliżej Stripe (1280)
  xl: "max-w-[1480px]",   // dashboard / wide canvas
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ width = "lg", as: Component = "div", className, ...props }, ref) {
    return (
      <Component
        ref={ref}
        className={cn(
          // Mniejszy padding poziomy: px-4 mobile (16px), sm:px-5 (20px), lg:px-6 (24px)
          // zamiast wcześniejszego px-4/sm:px-6/lg:px-8 (16/24/32).
          "mx-auto w-full px-4 sm:px-5 lg:px-6",
          WIDTH[width],
          className
        )}
        {...props}
      />
    );
  }
);
