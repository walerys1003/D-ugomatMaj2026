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
  if (value <= 0) return "bg-iron-50 dark:bg-iron-900 text-iron-400";
  if (value < 0.2) return "bg-accent-50 dark:bg-accent-700/10 text-iron-700 dark:text-iron-300";
  if (value < 0.4) return "bg-accent-100 dark:bg-accent-700/20 text-accent-800 dark:text-accent-200";
  if (value < 0.6) return "bg-accent-200 dark:bg-accent-700/40 text-accent-900 dark:text-accent-50";
  if (value < 0.8) return "bg-accent-400 dark:bg-accent-600 text-iron-50";
  return "bg-accent-600 dark:bg-accent-500 text-iron-50";
}

export function CohortGrid({ cohorts, periodLabel = "Miesiąc" }: CohortGridProps) {
  if (cohorts.length === 0) {
    return (
      <p className="text-sm text-iron-500">Brak danych do wyświetlenia kohort.</p>
    );
  }

  const maxPeriods = Math.max(...cohorts.map((c) => c.retention.length));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-iron-200 dark:border-iron-800 text-iron-500">
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
              className="border-b border-iron-100 dark:border-iron-900"
            >
              <td className="py-2 pr-3 text-iron-900 dark:text-iron-50 font-medium whitespace-nowrap">
                {c.cohort_label}
              </td>
              <td className="py-2 pr-3 text-right text-iron-600 dark:text-iron-400">
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
