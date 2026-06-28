import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { computeNps } from "@/lib/analytics/nps-survey";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "NPS | Admin Analytics | Długomat" };
export const dynamic = "force-dynamic";

const pct = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

export default async function NpsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in?next=/admin/analytics/nps");

  const data = await computeNps(90);

  const promotersPct = pct(data.promoters, data.total);
  const passivesPct = pct(data.passives, data.total);
  const detractorsPct = pct(data.detractors, data.total);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Net Promoter Score
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {data.total} odpowiedzi w oknie {data.period_days} dni.
        </p>
      </div>

      {data.total === 0 ? (
        <Card elevation="subtle">
          <CardContent className="pt-6 text-sm text-ink-500">
            Brak odpowiedzi NPS w wybranym oknie. Wynik pojawi się tutaj, gdy
            użytkownicy zaczną wypełniać ankietę (POST /api/analytics/nps).
          </CardContent>
        </Card>
      ) : (
        <>
          <Card elevation="pop">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                    NPS aktualny
                  </div>
                  <div className="font-display text-5xl font-semibold text-accent-700">
                    {data.nps}
                  </div>
                </div>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="bg-accent-600"
                  style={{ width: `${promotersPct}%` }}
                  title={`Promotorzy: ${promotersPct}%`}
                />
                <div
                  className="bg-ink-300 dark:bg-ink-700"
                  style={{ width: `${passivesPct}%` }}
                  title={`Pasywni: ${passivesPct}%`}
                />
                <div
                  className="bg-danger-600"
                  style={{ width: `${detractorsPct}%` }}
                  title={`Detraktorzy: ${detractorsPct}%`}
                />
              </div>
              <div className="flex justify-between text-xs text-ink-500 mt-2">
                <span>Promotorzy: {data.promoters} ({promotersPct}%)</span>
                <span>Pasywni: {data.passives} ({passivesPct}%)</span>
                <span>Detraktorzy: {data.detractors} ({detractorsPct}%)</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
