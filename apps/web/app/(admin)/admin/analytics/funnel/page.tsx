import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Funnel | Admin Analytics | Długomat" };

interface FunnelStep {
  key: string;
  label: string;
  users: number;
  conversion_from_previous_percent: number;
  conversion_from_top_percent: number;
  avg_time_to_next_minutes: number | null;
}

interface FunnelData {
  range_label: string;
  steps: FunnelStep[];
  drop_off_alert: string | null;
}

async function fetchFunnel(range: string): Promise<FunnelData | null> {
  try {
    const res = await fetch(`/api/admin/analytics/funnel?range=${range}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as FunnelData;
  } catch {
    return null;
  }
}

const RANGES = [
  { value: "7d", label: "7 dni" },
  { value: "30d", label: "30 dni" },
  { value: "90d", label: "90 dni" },
];

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range ?? "30d";
  const data = await fetchFunnel(range);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-iron-500 hover:text-iron-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Lejek konwersji
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Od pierwszej wizyty do płatnej subskrypcji
        </p>
      </div>

      <div className="flex gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/analytics/funnel?range=${r.value}`}
            className={`text-sm px-3 py-1.5 rounded-full border ${
              range === r.value
                ? "border-iron-900 bg-iron-900 text-iron-50"
                : "border-iron-300 text-iron-700 hover:border-iron-400"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {data?.drop_off_alert && (
        <Card elevation="pop" urgency="warning">
          <CardContent className="pt-4 text-sm text-warn-700">
            <strong>Alert:</strong> {data.drop_off_alert}
          </CardContent>
        </Card>
      )}

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Etapy lejka ({data?.range_label ?? range})</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.steps.length === 0 ? (
            <p className="text-sm text-iron-500">Brak danych.</p>
          ) : (
            <ul className="space-y-3">
              {data.steps.map((s, i) => {
                const width = s.conversion_from_top_percent;
                return (
                  <li key={s.key}>
                    <div className="flex items-baseline justify-between text-sm mb-1">
                      <span className="font-medium text-iron-900 dark:text-iron-50">
                        {i + 1}. {s.label}
                      </span>
                      <span className="text-iron-600 dark:text-iron-400">
                        {s.users.toLocaleString("pl-PL")} użytkowników
                      </span>
                    </div>
                    <div className="relative h-9 rounded-md bg-iron-100 dark:bg-iron-800 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent-600 dark:bg-accent-500 transition-all"
                        style={{ width: `${Math.max(2, width)}%` }}
                      />
                      <div className="relative h-full flex items-center justify-between px-3 text-xs">
                        <span className="text-iron-50 font-medium drop-shadow">
                          {width.toFixed(1)}% z TOP
                        </span>
                        {i > 0 && (
                          <span className="text-iron-700 dark:text-iron-300">
                            {s.conversion_from_previous_percent.toFixed(1)}% z poprz.
                          </span>
                        )}
                      </div>
                    </div>
                    {s.avg_time_to_next_minutes !== null && i < data.steps.length - 1 && (
                      <div className="text-xs text-iron-500 mt-1">
                        Średni czas do następnego: {s.avg_time_to_next_minutes} min
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
