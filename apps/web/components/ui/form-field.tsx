"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * FormField — the standard "field shell" used everywhere inputs live.
 * Provides: label, optional required marker, help text, error slot,
 * and proper aria-describedby wiring for screen readers.
 */
export interface FormFieldProps {
  label: string;
  /**
   * Optional — when omitted we derive a stable id from the label slug.
   * Required behavior preserved when caller supplies one (recommended).
   */
  htmlFor?: string;
  required?: boolean;
  help?: React.ReactNode;
  error?: React.ReactNode;
  /** Optional inline hint shown to the right of the label. */
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required,
  help,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  // W10-phase2: htmlFor now optional; fall back to deterministic slug of label.
  const fieldId =
    htmlFor ??
    `field-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  // Inject aria-describedby into the single child input/textarea/select.
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: fieldId,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        {hint ? <span className="text-fluid-xs text-ink-500">{hint}</span> : null}
      </div>
      {child}
      {help ? (
        <p id={helpId} className="text-fluid-xs text-ink-500">
          {help}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-fluid-xs font-medium text-danger-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
