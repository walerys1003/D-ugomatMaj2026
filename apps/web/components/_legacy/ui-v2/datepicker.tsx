"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DatePicker — semantic wrapper over native <input type="date"> with PL
 * formatting hint. We deliberately use the native control for accessibility
 * and locale support — no JS calendar to mount.
 */
export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  helper?: string;
  value?: string; // ISO yyyy-mm-dd
  defaultValue?: string;
  min?: string;
  max?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export function DatePicker({
  id,
  name,
  label,
  helper,
  value,
  defaultValue,
  min,
  max,
  required,
  onChange,
  className,
}: DatePickerProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300"
        >
          {label}
          {required ? <span aria-hidden className="text-danger-600"> *</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <Calendar
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-iron-500"
        />
        <input
          id={inputId}
          name={name}
          type="date"
          required={required}
          value={value}
          defaultValue={defaultValue}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "h-11 w-full rounded-lg border border-iron-200 bg-white pl-9 pr-3 text-fluid-sm",
            "focus-visible:outline-none focus-visible:shadow-shield-focus",
            "dark:border-iron-800 dark:bg-iron-950",
          )}
        />
      </div>
      {helper ? (
        <p className="text-fluid-xs text-iron-500">{helper}</p>
      ) : null}
    </div>
  );
}
