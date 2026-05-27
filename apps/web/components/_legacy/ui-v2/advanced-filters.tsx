"use client";

import * as React from "react";
import { Filter, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AdvancedFilters — composable filter strip used in list views.
 * Renders selected filters as removable chips and a "Reset" affordance.
 */

export interface FilterDef {
  key: string;
  label: string;
  kind: "select" | "text" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface AdvancedFiltersProps {
  filters: FilterDef[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  className?: string;
}

export function AdvancedFilters({
  filters,
  value,
  onChange,
  className,
}: AdvancedFiltersProps) {
  const active = Object.entries(value).filter(([, v]) => v !== "" && v != null);

  function set(k: string, v: string) {
    onChange({ ...value, [k]: v });
  }

  function clear(k: string) {
    const next = { ...value };
    delete next[k];
    onChange(next);
  }

  function reset() {
    onChange({});
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-iron-200 bg-white p-3",
        "dark:border-iron-800 dark:bg-iron-950",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Filter aria-hidden className="size-4 text-dlugomat-600" />
        <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300">
          Filtry
        </span>
        {active.length > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1 text-fluid-xs font-semibold text-iron-500 hover:text-danger-600"
          >
            <RotateCcw className="size-3.5" />
            Wyczyść ({active.length})
          </button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filters.map((f) => (
          <FilterControl
            key={f.key}
            def={f}
            value={value[f.key] ?? ""}
            onChange={(v) => set(f.key, v)}
          />
        ))}
      </div>

      {active.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 border-t border-iron-100 pt-2 dark:border-dlugomat-800">
          {active.map(([k, v]) => {
            const def = filters.find((f) => f.key === k);
            const lbl =
              def?.kind === "select"
                ? def.options?.find((o) => o.value === v)?.label ?? v
                : v;
            return (
              <li key={k}>
                <span className="inline-flex items-center gap-1 rounded-full bg-dlugomat-100 px-2.5 py-1 text-fluid-xs font-semibold text-dlugomat-800 dark:bg-dlugomat-850 dark:text-dlugomat-200">
                  {def?.label ?? k}: {lbl}
                  <button
                    type="button"
                    aria-label={`Usuń filtr ${def?.label ?? k}`}
                    onClick={() => clear(k)}
                    className="rounded-full hover:bg-dlugomat-200 dark:hover:bg-dlugomat-800"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function FilterControl({
  def,
  value,
  onChange,
}: {
  def: FilterDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-fluid-xs text-iron-500">{def.label}</span>
      {def.kind === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-md border border-iron-200 bg-white px-2 text-fluid-sm focus-visible:outline-none focus-visible:shadow-shield-focus dark:border-iron-800 dark:bg-iron-950"
        >
          <option value="">— dowolny —</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={def.kind === "date" ? "date" : "text"}
          placeholder={def.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-md border border-iron-200 bg-white px-2 text-fluid-sm focus-visible:outline-none focus-visible:shadow-shield-focus dark:border-iron-800 dark:bg-iron-950"
        />
      )}
    </label>
  );
}
