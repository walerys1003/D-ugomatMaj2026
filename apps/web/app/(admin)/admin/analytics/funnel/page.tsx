import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeFunnel } from "@/lib/analytics/funnel-builder";
import { STANDARD_FUNNEL } from "@/lib/growth/conversion-tracking";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Funnel | Admin Analytics | Długomat" };
export const dynamic = "force-dynamic";

const RANGES = [
  { value: "7d", label: "7 dni", days: 7 },
  { value: "30d", label: "30 dni", days: 30 },
  { value: "90d", label: "90 dni", days: 90 },
];

const STEP_LABELS: Record<string, string> = {
  landing_view: "Wizyta na stronie",
  signup_completed: "Rejestracja",
  wizard_started: "Rozpoczęcie kreatora",
  wizard_completed: "Ukończenie kreatora",
  checkout_started: "Rozpoczęcie płatności",
  payment_completed: "Płatność",
  document_downloaded: "Pobranie dokumentu",
};

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/logowanie?next=/admin/analytics/funnel");

  const sp = await searchParams;
  const range = sp.range ?? "30d";
  const days = RANGES.find((r) => r.value === range)?.days ?? 30;

  const result = await computeFunnel(
    STANDARD_FUNNEL.map((event) => ({ event })),
    { sinceDays: days },
  ).catch(() => null);

  const steps = result?.steps ?? [];

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Lejek konwersji
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Od pierwszej wizyty do pobrania dokumentu — liczone z tabeli zdarzeń.
        </p>
      </div>

      <div className="flex gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/analytics/funnel?range=${r.value}`}
            className={`text-sm px-3 py-1.5 rounded-full border ${
              range === r.value
                ? "border-ink-900 bg-ink-900 text-ink-50"
                : "border-ink-300 text-ink-700 hover:border-ink-400"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>
            Etapy lejka ({RANGES.find((r) => r.value === range)?.label})
            {result ? ` · konwersja ${(result.conversion_rate * 100).toFixed(1)}%` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length === 0 || (result?.total_users ?? 0) === 0 ? (
            <p className="text-sm text-ink-500">
              Brak zdarzeń w wybranym oknie. Lejek wypełni się danymi, gdy
              zaczniemy zbierać zdarzenia (analytics_events).
            </p>
          ) : (
            <ul className="space-y-3">
              {steps.map((s, i) => {
                const width = s.conversion_from_start * 100;
                return (
                  <li key={s.event}>
                    <div className="flex items-baseline justify-between text-sm mb-1">
                      <span className="font-medium text-ink-900 dark:text-ink-50">
                        {i + 1}. {STEP_LABELS[s.event] ?? s.event}
                      </span>
                      <span className="text-ink-600 dark:text-ink-400">
                        {s.count.toLocaleString("pl-PL")} użytkowników
                      </span>
                    </div>
                    <div className="relative h-9 rounded-md bg-ink-100 dark:bg-ink-800 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent-600 dark:bg-accent-500 transition-all"
                        style={{ width: `${Math.max(2, width)}%` }}
                      />
                      <div className="relative h-full flex items-center justify-between px-3 text-xs">
                        <span className="text-ink-50 font-medium drop-shadow">
                          {width.toFixed(1)}% z TOP
                        </span>
                        {i > 0 && (
                          <span className="text-ink-700 dark:text-ink-300">
                            {(s.conversion_from_previous * 100).toFixed(1)}% z poprz.
                          </span>
                        )}
                      </div>
                    </div>
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
