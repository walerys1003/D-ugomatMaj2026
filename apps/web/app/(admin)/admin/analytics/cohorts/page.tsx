import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CohortGrid, type CohortRow } from "@/components/analytics/cohort-grid";

export const metadata: Metadata = { title: "Cohorts | Admin Analytics | Długomat" };

interface CohortsData {
  metric: "retention" | "revenue_retention";
  period: "month" | "week";
  cohorts: CohortRow[];
  insights: string[];
}

async function fetchCohorts(metric: string, period: string): Promise<CohortsData | null> {
  try {
    const res = await fetch(
      `/api/admin/analytics/cohorts?metric=${metric}&period=${period}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as CohortsData;
  } catch {
    return null;
  }
}

const METRICS = [
  { value: "retention", label: "Retencja użytkowników" },
  { value: "revenue_retention", label: "Retencja przychodów" },
];

const PERIODS = [
  { value: "month", label: "Miesięcznie" },
  { value: "week", label: "Tygodniowo" },
];

export default async function CohortsPage({
  searchParams,
}: {
  searchParams: Promise<{ metric?: string; period?: string }>;
}) {
  const sp = await searchParams;
  const metric = sp.metric ?? "retention";
  const period = sp.period ?? "month";
  const data = await fetchCohorts(metric, period);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-iron-500 hover:text-iron-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Cohorty
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Retencja użytkowników i przychodów w ujęciu kohortowym
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <Link
              key={m.value}
              href={`/admin/analytics/cohorts?metric=${m.value}&period=${period}`}
              className={`text-sm px-3 py-1.5 rounded-full border ${
                metric === m.value
                  ? "border-iron-900 bg-iron-900 text-iron-50"
                  : "border-iron-300 text-iron-700 hover:border-iron-400"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/admin/analytics/cohorts?metric=${metric}&period=${p.value}`}
              className={`text-sm px-3 py-1.5 rounded-full border ${
                period === p.value
                  ? "border-iron-900 bg-iron-900 text-iron-50"
                  : "border-iron-300 text-iron-700 hover:border-iron-400"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>
            {METRICS.find((m) => m.value === metric)?.label} (
            {PERIODS.find((p) => p.value === period)?.label})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <CohortGrid
              cohorts={data.cohorts}
              periodLabel={period === "month" ? "Miesiąc" : "Tydzień"}
            />
          ) : (
            <p className="text-sm text-iron-500">Brak danych.</p>
          )}
        </CardContent>
      </Card>

      {data && data.insights.length > 0 && (
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Spostrzeżenia</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-iron-700 dark:text-iron-300 list-disc list-inside">
              {data.insights.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
