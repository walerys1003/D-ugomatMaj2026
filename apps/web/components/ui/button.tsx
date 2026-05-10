import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — the cornerstone primitive of the Tarcza design system.
 *
 * Variants:
 *  - primary  : Shield Navy 700; the only "go" CTA on a page.
 *  - success  : Controlled Hope green; reserved for confirmation actions
 *               ("Wygeneruj pismo", "Zatwierdź ugodę"). Never decorative.
 *  - danger   : Red 600; destructive (cancel case, delete document).
 *  - secondary: Iron 100; non-primary actions on the same surface.
 *  - ghost    : transparent; tertiary actions, table rows.
 *  - link     : underline-on-hover; inline calls in body copy.
 *  - icon     : square; icon-only buttons must have aria-label.
 */
export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-fluid-sm font-semibold",
    "transition-[background,color,box-shadow,transform] duration-base ease-shield-out",
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    // Tarcza shield focus ring (replaces default browser outline)
    "focus-visible:shadow-shield-focus"
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-dlugomat-700 text-white shadow-card",
          "hover:bg-dlugomat-800 active:bg-dlugomat-900",
          "active:shadow-pressed"
        ),
        success: cn(
          "bg-accent-500 text-white shadow-card",
          "hover:bg-accent-400 active:bg-accent-600"
        ),
        danger: cn(
          "bg-danger-600 text-white shadow-card",
          "hover:bg-danger-500 active:bg-danger-700"
        ),
        secondary: cn(
          "bg-iron-100 text-iron-900 border border-iron-200",
          "hover:bg-iron-200 active:bg-iron-300",
          "dark:bg-dlugomat-850 dark:text-iron-100 dark:border-dlugomat-800",
          "dark:hover:bg-dlugomat-800"
        ),
        ghost: cn(
          "bg-transparent text-iron-700 hover:bg-iron-100",
          "dark:text-iron-200 dark:hover:bg-dlugomat-850"
        ),
        link: cn(
          "bg-transparent text-dlugomat-600 underline-offset-4",
          "hover:underline hover:text-dlugomat-700"
        ),
      },
      size: {
        sm: "h-9 px-3 text-fluid-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-fluid-base",
        icon: "h-11 w-11 p-0",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the button as its child component (e.g. Next.js Link). */
  asChild?: boolean;
  /** Show a leading spinner and disable interactions while pending. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";
