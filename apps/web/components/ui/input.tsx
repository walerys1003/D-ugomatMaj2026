import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — base form control, styled as an "institutional field".
 * Always rendered inside a `<FormField>` wrapper that provides label,
 * help text, and error slot (see components/ui/form-field.tsx).
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full rounded-md border bg-background px-3 py-2 text-fluid-sm",
          "placeholder:text-ink-400 text-ink-900 dark:text-ink-100",
          "transition-shadow duration-base ease-shield-out",
          "border-ink-200 dark:border-dlugomat-800",
          "focus:border-dlugomat-500 focus:outline-none focus:shadow-shield-focus",
          "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
          invalid && "border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_hsl(var(--danger-500)/0.35)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/**
 * Textarea — multi-line variant of Input. Same look & feel.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-fluid-sm",
          "placeholder:text-ink-400 text-ink-900 dark:text-ink-100",
          "transition-shadow duration-base ease-shield-out",
          "border-ink-200 dark:border-dlugomat-800",
          "focus:border-dlugomat-500 focus:outline-none focus:shadow-shield-focus",
          "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
          "resize-y",
          invalid && "border-danger-500 focus:border-danger-500",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
