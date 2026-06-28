import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Anomalies | Admin Analytics | Długomat" };
export const dynamic = "force-dynamic";

export default async function AnomaliesPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in?next=/admin/analytics/anomalies");

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Wykrywanie anomalii
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Automatyczne wykrywanie odchyleń od baseline w kluczowych metrykach
          (z-score &gt; 2σ).
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Detektor on-demand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-600 dark:text-ink-400">
          <p>
            Detekcja anomalii działa w trybie <strong>on-demand</strong>:
            endpoint <code className="font-mono">POST /api/analytics/anomalies</code>{" "}
            przyjmuje szereg czasowy metryki i zwraca odchylenia oraz prognozę
            EWMA. Nie utrzymujemy jeszcze tabeli historii wykrytych anomalii,
            więc nie pokazujemy tu listy „zaległych” zdarzeń, których nie ma.
          </p>
          <p>
            Gdy uruchomimy zbieracz snapshotów metryk i tabelę
            <code className="font-mono"> anomaly_findings</code>, ten widok zacznie
            renderować historię. Do tego czasu detektor jest dostępny przez API
            i wykorzystywany przez harmonogram monitorujący.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
