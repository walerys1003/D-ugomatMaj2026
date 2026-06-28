"use client";

export interface CohortRow {
  cohort_label: string;
  cohort_size: number;
  retention: number[]; // % retencji per okres (0..1)
}

interface CohortGridProps {
  cohorts: CohortRow[];
  periodLabel?: string; // np. "Miesiąc"
}

function bgFor(value: number): string {
  // 0..1 -> kolor accent w gradiencie
  if (value <= 0) return "bg-ink-50 dark:bg-ink-900 text-ink-400";
  if (value < 0.2) return "bg-accent-50 dark:bg-accent-700/10 text-ink-700 dark:text-ink-300";
  if (value < 0.4) return "bg-accent-100 dark:bg-accent-700/20 text-accent-800 dark:text-accent-200";
  if (value < 0.6) return "bg-accent-200 dark:bg-accent-700/40 text-accent-900 dark:text-accent-50";
  if (value < 0.8) return "bg-accent-400 dark:bg-accent-600 text-ink-50";
  return "bg-accent-600 dark:bg-accent-500 text-ink-50";
}

export function CohortGrid({ cohorts, periodLabel = "Miesiąc" }: CohortGridProps) {
  if (cohorts.length === 0) {
    return (
      <p className="text-sm text-ink-500">Brak danych do wyświetlenia kohort.</p>
    );
  }

  const maxPeriods = Math.max(...cohorts.map((c) => c.retention.length));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-ink-200 dark:border-ink-800 text-ink-500">
            <th className="text-left py-2 pr-3 font-medium uppercase tracking-wider">
              Kohorta
            </th>
            <th className="text-right py-2 pr-3 font-medium uppercase tracking-wider">
              Wielkość
            </th>
            {Array.from({ length: maxPeriods }, (_, i) => (
              <th
                key={i}
                className="text-center py-2 px-1 font-medium uppercase tracking-wider"
              >
                {periodLabel} {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr
              key={c.cohort_label}
              className="border-b border-ink-100 dark:border-ink-900"
            >
              <td className="py-2 pr-3 text-ink-900 dark:text-ink-50 font-medium whitespace-nowrap">
                {c.cohort_label}
              </td>
              <td className="py-2 pr-3 text-right text-ink-600 dark:text-ink-400">
                {c.cohort_size.toLocaleString("pl-PL")}
              </td>
              {Array.from({ length: maxPeriods }, (_, i) => {
                const v = c.retention[i];
                if (v === undefined) {
                  return <td key={i} className="py-2 px-1" />;
                }
                return (
                  <td key={i} className="py-1 px-1 text-center">
                    <div
                      className={`rounded-md px-1.5 py-1.5 font-mono ${bgFor(v)}`}
                      title={`${Math.round(v * 1000) / 10}%`}
                    >
                      {Math.round(v * 100)}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
