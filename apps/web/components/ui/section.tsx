import * as React from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerWidth } from "@/components/ui/container";

/**
 * Section — kanoniczny blok pionowy landingu i paneli.
 *
 * Cel: zlikwidować wariacje `py-16 md:py-24`, `py-20`, `py-32 lg:py-40` które
 * tworzą poszarpany rytm pionowy strony. Trzy gęstości — i tylko trzy.
 *
 *   - compact: 56 / 80 / 96 px  (FAQ, trust bars, sekcje wsparcia)
 *   - regular: 96 / 128 / 160 px (większość sekcji landingu)
 *   - spacious: 128 / 192 / 240 px (hero, CTA band, „big idea")
 *
 * `tone` zarządza tłem i automatycznie dobiera dark-mode counterpart.
 * `surface` rysuje subtelną siatkę „shield grid" — używamy oszczędnie,
 * tylko w hero i AI showcase, nigdy w gridzie modułów (za dużo szumu).
 */
export type SectionTone = "default" | "muted" | "navy" | "ink";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  density?: "compact" | "regular" | "spacious";
  width?: ContainerWidth;
  surface?: boolean;
  containerClassName?: string;
}

const TONE: Record<SectionTone, string> = {
  default: "bg-background text-foreground",
  muted: "bg-iron-50 text-foreground dark:bg-dlugomat-950/40",
  navy: "bg-dlugomat-900 text-white",
  ink: "bg-iron-950 text-white",
};

const DENSITY: Record<NonNullable<SectionProps["density"]>, string> = {
  compact: "py-14 md:py-20 lg:py-24",
  regular: "py-24 md:py-32 lg:py-40",
  spacious: "py-32 md:py-48 lg:py-60",
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(
  {
    tone = "default",
    density = "regular",
    width = "lg",
    surface,
    className,
    containerClassName,
    children,
    ...props
  },
  ref
) {
  return (
    <section
      ref={ref}
      className={cn("relative isolate overflow-hidden", TONE[tone], DENSITY[density], className)}
      {...props}
    >
      {surface ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-[0.35]",
            "[background-image:linear-gradient(to_right,hsl(var(--dlugomat-500)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--dlugomat-500)/0.06)_1px,transparent_1px)]",
            "[background-size:48px_48px]",
            "[mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_85%)]"
          )}
        />
      ) : null}
      <Container width={width} className={cn("relative", containerClassName)}>
        {children}
      </Container>
    </section>
  );
});
