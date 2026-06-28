import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CohortGrid } from "@/components/analytics/cohort-grid";
import { computeWeeklyCohorts } from "@/lib/analytics/cohort-analysis";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Cohorts | Admin Analytics | Długomat" };
export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in?next=/admin/analytics/cohorts");

  const raw = await computeWeeklyCohorts(12).catch(() => []);
  const cohorts = raw.map((r) => ({
    cohort_label: r.cohort_week,
    cohort_size: r.cohort_size,
    retention: r.retention,
  }));

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Cohorty
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Retencja użytkowników w ujęciu kohortowym (12 tygodni) — liczone z
          tabeli zdarzeń.
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Retencja tygodniowa</CardTitle>
        </CardHeader>
        <CardContent>
          {cohorts.length > 0 ? (
            <CohortGrid cohorts={cohorts} periodLabel="Tydzień" />
          ) : (
            <p className="text-sm text-ink-500">
              Brak danych kohortowych w wybranym oknie. Wynik pojawi się, gdy
              zbierzemy wystarczająco zdarzeń aktywności użytkowników.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
