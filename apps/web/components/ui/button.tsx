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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded",
    "text-sm font-medium leading-none",
    "transition-[background,color,box-shadow,border-color] duration-150 ease-out",
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    // Tarcza v3 — focus ring zachowuje shield-focus dla brand consistency.
    "focus-visible:shadow-shield-focus"
  ),
  {
    variants: {
      variant: {
        // Primary — solid navy 800 (deeper than v2 700), inset highlight
        // top dla "lifted button" efektu (Linear/Stripe pattern).
        primary: cn(
          "bg-dlugomat-800 text-white shadow-sm",
          "shadow-[inset_0_1px_0_0_hsl(var(--dlugomat-500)/0.30),0_1px_2px_0_hsl(220_40%_8%/0.08)]",
          "hover:bg-dlugomat-900 active:bg-dlugomat-950"
        ),
        success: cn(
          "bg-accent-600 text-white shadow-sm",
          "shadow-[inset_0_1px_0_0_hsl(var(--accent-400)/0.45),0_1px_2px_0_hsl(220_40%_8%/0.08)]",
          "hover:bg-accent-700 active:bg-accent-700"
        ),
        danger: cn(
          "bg-danger-600 text-white shadow-sm",
          "shadow-[inset_0_1px_0_0_hsl(var(--danger-500)/0.45),0_1px_2px_0_hsl(220_40%_8%/0.08)]",
          "hover:bg-danger-700 active:bg-danger-700"
        ),
        // Secondary — Linear-style: białe tło + inset 1px ring + delikatny shadow.
        secondary: cn(
          "bg-white text-ink-800 shadow-[inset_0_0_0_1px_hsl(var(--ink-300)),0_1px_1px_0_hsl(220_40%_8%/0.04)]",
          "hover:bg-ink-50 hover:shadow-[inset_0_0_0_1px_hsl(var(--ink-400)),0_1px_2px_0_hsl(220_40%_8%/0.06)]",
          "active:bg-ink-100",
          "dark:bg-dlugomat-900 dark:text-ink-800 dark:shadow-[inset_0_0_0_1px_hsl(var(--dlugomat-800)),0_1px_1px_0_hsl(220_60%_2%/0.20)]",
          "dark:hover:bg-dlugomat-850"
        ),
        ghost: cn(
          "bg-transparent text-ink-700",
          "hover:bg-ink-100 hover:text-ink-900",
          "dark:hover:bg-dlugomat-850 dark:hover:text-white"
        ),
        link: cn(
          "bg-transparent text-dlugomat-700 underline-offset-4 px-0",
          "hover:underline hover:text-dlugomat-800",
          "dark:text-dlugomat-300 dark:hover:text-dlugomat-200"
        ),
        // ---- Legacy shadcn aliases (zachowane z v2) -----------------
        default: cn(
          "bg-dlugomat-800 text-white shadow-sm",
          "shadow-[inset_0_1px_0_0_hsl(var(--dlugomat-500)/0.30),0_1px_2px_0_hsl(220_40%_8%/0.08)]",
          "hover:bg-dlugomat-900 active:bg-dlugomat-950"
        ),
        destructive: cn(
          "bg-danger-600 text-white shadow-sm",
          "hover:bg-danger-700 active:bg-danger-700"
        ),
        outline: cn(
          "bg-transparent text-ink-800 shadow-[inset_0_0_0_1px_hsl(var(--ink-300))]",
          "hover:bg-ink-50 hover:shadow-[inset_0_0_0_1px_hsl(var(--ink-400))]",
          "dark:text-ink-800 dark:shadow-[inset_0_0_0_1px_hsl(var(--dlugomat-800))]",
          "dark:hover:bg-dlugomat-850"
        ),
      },
      size: {
        // Tarcza v3 — tight 8pt: 32 / 36 / 40 (było 36/44/48).
        sm: "h-8 px-2.5 text-xs gap-1.5",
        md: "h-9 px-3.5",
        lg: "h-10 px-5 text-base",
        icon: "h-9 w-9 p-0",
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

    // When using asChild, Radix Slot requires EXACTLY ONE React element child.
    // We must therefore inject the loading spinner *inside* the user-provided
    // element rather than alongside it. For non-asChild we keep the previous
    // structure (spinner + children) since a native <button> accepts many kids.
    const spinner =
      loading ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null;

    let content: React.ReactNode;
    if (asChild) {
      // Ensure children is a single React element; if not, wrap in a <span>.
      const onlyChild = React.isValidElement(children) ? children : <span>{children}</span>;
      content = React.cloneElement(
        onlyChild as React.ReactElement,
        undefined,
        <>
          {spinner}
          {(onlyChild as React.ReactElement).props.children}
        </>
      );
    } else {
      content = (
        <>
          {spinner}
          {children}
        </>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);
Button.displayName = "Button";
