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
  // v3 — adopted from Linear/Vercel/Anthropic measurement.
  sm: "max-w-[720px]",    // long-form (poprz. max-w-3xl ≈ 768)
  md: "max-w-[1080px]",   // panel content (tighter than v2 1120)
  lg: "max-w-[1200px]",   // landing default — Linear value
  xl: "max-w-[1320px]",   // dashboard z gridem 12 — Stripe value
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
        className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", WIDTH[width], className)}
        {...props}
      />
    );
  }
);
