import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — primary surface primitive. Three elevations:
 *  - flat   : no shadow (used inside other cards / lists)
 *  - subtle : default for content groupings
 *  - pop    : modal-like elevation for important callouts
 *
 * `urgency` adds a left status strip (overdue / critical / warning / success
 * / normal). Always paired with numeric context per brand spec §3.2.3.
 */
type Elevation = "flat" | "subtle" | "pop";
type Urgency = "overdue" | "critical" | "warning" | "normal" | "success" | "none";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  urgency?: Urgency;
}

const ELEVATION: Record<Elevation, string> = {
  flat: "",
  subtle: "shadow-card",
  pop: "shadow-pop",
};

const URGENCY_STRIP: Record<Urgency, string> = {
  none: "",
  normal: "status-strip-normal",
  warning: "status-strip-warning",
  critical: "status-strip-critical",
  overdue: "status-strip-overdue",
  success: "status-strip-success",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = "subtle", urgency = "none", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-card text-card-foreground border border-iron-200 dark:border-dlugomat-800",
        ELEVATION[elevation],
        URGENCY_STRIP[urgency],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-5 sm:p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-fluid-xl font-semibold leading-tight text-dlugomat-900 dark:text-iron-50", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-fluid-sm text-iron-600 dark:text-iron-300", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 px-5 py-4 sm:px-6 border-t border-iron-100 dark:border-dlugomat-800",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
