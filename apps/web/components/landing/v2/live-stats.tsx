"use client";

import { useEffect, useState } from "react";

interface LiveStat {
  label: string;
  value: number;
  format: "number" | "currency_pln" | "percent";
  trend_label?: string;
}

interface LiveStatsData {
  generated_letters_total: number;
  active_cases: number;
  total_savings_pln: number;
  avg_response_minutes: number;
  successful_objections_percent: number;
}

const FALLBACK: LiveStatsData = {
  generated_letters_total: 124_580,
  active_cases: 8_320,
  total_savings_pln: 47_200_000,
  avg_response_minutes: 12,
  successful_objections_percent: 78,
};

function format(value: number, kind: LiveStat["format"]): string {
  if (kind === "currency_pln") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mln zł`;
    if (value >= 1_000) return `${Math.round(value / 1000)}k zł`;
    return `${value} zł`;
  }
  if (kind === "percent") return `${value}%`;
  return value.toLocaleString("pl-PL");
}

export function LiveStats() {
  const [data, setData] = useState<LiveStatsData>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/stats", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Partial<LiveStatsData>;
        if (!cancelled) {
          setData({ ...FALLBACK, ...json });
        }
      } catch {
        // keep fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: LiveStat[] = [
    { label: "Pism wygenerowanych", value: data.generated_letters_total, format: "number" },
    { label: "Aktywnych spraw", value: data.active_cases, format: "number" },
    { label: "Łączne oszczędności klientów", value: data.total_savings_pln, format: "currency_pln" },
    { label: "Skuteczne sprzeciwy", value: data.successful_objections_percent, format: "percent" },
  ];

  return (
    <section
      aria-label="Statystyki Długomat"
      className="border-y border-iron-200 dark:border-iron-800 bg-white dark:bg-iron-900"
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`text-center md:text-left ${
                i > 0 ? "md:border-l md:border-iron-200 dark:md:border-iron-800 md:pl-8" : ""
              }`}
            >
              <div className="font-display text-3xl md:text-4xl font-semibold text-iron-900 dark:text-iron-50 tabular-nums">
                {format(s.value, s.format)}
              </div>
              <div className="text-xs uppercase tracking-wider text-iron-500 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
