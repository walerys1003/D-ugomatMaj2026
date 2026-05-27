"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CopyButton — copies given text to clipboard, shows momentary success state.
 * Always announces success via aria-live.
 */
export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  label?: string;
  successLabel?: string;
}

export function CopyButton({
  value,
  label = "Kopiuj",
  successLabel = "Skopiowane",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // swallow — user can copy manually
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-iron-200 bg-white px-2.5 py-1",
        "text-fluid-xs font-semibold text-iron-700 transition",
        "hover:border-dlugomat-400 hover:text-dlugomat-700",
        "focus-visible:outline-none focus-visible:shadow-shield-focus",
        "dark:border-iron-800 dark:bg-iron-950 dark:text-iron-200",
        copied && "border-accent-500 text-accent-700",
        className,
      )}
      {...props}
    >
      {copied ? (
        <>
          <Check className="size-3.5" aria-hidden />
          {successLabel}
        </>
      ) : (
        <>
          <Copy className="size-3.5" aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}
