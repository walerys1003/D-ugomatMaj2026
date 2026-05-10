import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Logo — a stylised shield ("Tarcza") + wordmark. Inline SVG so it
 * inherits currentColor and stays crisp at every scale.
 *
 * Variants:
 *   - "default" : icon + wordmark
 *   - "mark"    : icon only (sidebar collapsed, favicons)
 */
export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "mark";
  size?: number;
}

export function Logo({ variant = "default", size = 28, className, ...props }: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-dlugomat-900 dark:text-white", className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden
        className="text-dlugomat-700 dark:text-dlugomat-400"
      >
        {/* Shield body — forms the "Tarcza" archetype */}
        <path
          d="M16 2.5 6 6.2v8.6c0 6.4 4.2 12 10 14.7 5.8-2.7 10-8.3 10-14.7V6.2L16 2.5Z"
          fill="currentColor"
        />
        {/* Inner highlight */}
        <path
          d="M16 5.7 9 8.3v6.5c0 4.6 3 8.7 7 10.6 4-1.9 7-6 7-10.6V8.3L16 5.7Z"
          fill="hsl(var(--dlugomat-500))"
          opacity="0.85"
        />
        {/* Cross-stripe (suggests legal document, not a medical cross) */}
        <rect x="14" y="10" width="4" height="11" rx="1" fill="white" />
        <rect x="11" y="13" width="10" height="3" rx="1" fill="white" />
      </svg>
      {variant === "default" ? (
        <span className="font-sans font-bold text-fluid-lg tracking-tight">
          Długomat
        </span>
      ) : null}
    </span>
  );
}
