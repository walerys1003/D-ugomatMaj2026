"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MultiSelect — accessible multi-select with chips + popover list.
 * Keyboard navigation via tab + space. Closes on Escape.
 */
export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Wybierz…",
  id,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle(v: string) {
    onChange(
      value.includes(v) ? value.filter((x) => x !== v) : [...value, v],
    );
  }

  return (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-iron-200 bg-white px-3 py-1.5 text-left",
            "focus-visible:outline-none focus-visible:shadow-shield-focus",
            "dark:border-iron-800 dark:bg-iron-950",
          )}
        >
          {value.length === 0 ? (
            <span className="text-fluid-sm text-iron-400">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {value.map((v) => {
                const opt = options.find((o) => o.value === v);
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 rounded-full bg-dlugomat-100 px-2 py-0.5 text-fluid-xs font-semibold text-dlugomat-800 dark:bg-dlugomat-850 dark:text-dlugomat-200"
                  >
                    {opt?.label ?? v}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Usuń ${opt?.label ?? v}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(v);
                      }}
                      className="cursor-pointer rounded-full hover:bg-dlugomat-200 dark:hover:bg-dlugomat-800"
                    >
                      <X className="size-3" aria-hidden />
                    </span>
                  </span>
                );
              })}
            </span>
          )}
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-iron-500 transition",
              open && "rotate-180",
            )}
          />
        </button>
        {open ? (
          <ul
            role="listbox"
            aria-multiselectable
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-iron-200 bg-white shadow-pop dark:border-iron-800 dark:bg-iron-950"
          >
            {options.map((o) => {
              const selected = value.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-fluid-sm",
                      "hover:bg-iron-50 focus-visible:outline-none focus-visible:bg-iron-50 dark:hover:bg-dlugomat-900",
                      selected && "font-semibold text-dlugomat-700 dark:text-dlugomat-300",
                    )}
                  >
                    <span>{o.label}</span>
                    {selected ? (
                      <Check className="size-4 text-accent-600" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
