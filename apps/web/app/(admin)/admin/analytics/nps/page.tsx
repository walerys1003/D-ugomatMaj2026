import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/analytics/sparkline";

export const metadata: Metadata = { title: "NPS | Admin Analytics | Długomat" };

interface NpsOverview {
  current_score: number;
  promoters_percent: number;
  passives_percent: number;
  detractors_percent: number;
  responses_30d: number;
  response_rate_percent: number;
  trend_90d: number[];
  by_segment: Array<{ segment: string; score: number; responses: number }>;
  top_themes: Array<{ theme: string; sentiment: "positive" | "neutral" | "negative"; count: number }>;
  recent_verbatims: Array<{ id: string; score: number; comment: string; created_at: string }>;
}

async function fetchNps(): Promise<NpsOverview | null> {
  try {
    const res = await fetch("/api/admin/analytics/nps", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as NpsOverview;
  } catch {
    return null;
  }
}

const SENTIMENT_COLOR = {
  positive: "bg-accent-50 text-accent-700 border-accent-200",
  neutral: "bg-iron-100 text-iron-700 border-iron-200",
  negative: "bg-danger-50 text-danger-700 border-danger-200",
};

export default async function NpsPage() {
  const data = await fetchNps();
  if (!data) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <p className="text-iron-600">Brak danych NPS.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-iron-500 hover:text-iron-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Net Promoter Score
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          {data.responses_30d} odpowiedzi w ostatnich 30 dniach ·{" "}
          {data.response_rate_percent}% response rate
        </p>
      </div>

      <Card elevation="pop">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-iron-500 mb-1">
                NPS aktualny
              </div>
              <div className="font-display text-5xl font-semibold text-accent-700">
                {data.current_score}
              </div>
            </div>
            <div className="text-accent-600">
              <Sparkline data={data.trend_90d} width={220} height={48} />
            </div>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div
              className="bg-accent-600"
              style={{ width: `${data.promoters_percent}%` }}
              title={`Promotorzy: ${data.promoters_percent}%`}
            />
            <div
              className="bg-iron-300 dark:bg-iron-700"
              style={{ width: `${data.passives_percent}%` }}
              title={`Pasywni: ${data.passives_percent}%`}
            />
            <div
              className="bg-danger-600"
              style={{ width: `${data.detractors_percent}%` }}
              title={`Detraktorzy: ${data.detractors_percent}%`}
            />
          </div>
          <div className="flex justify-between text-xs text-iron-500 mt-2">
            <span>Promotorzy: {data.promoters_percent}%</span>
            <span>Pasywni: {data.passives_percent}%</span>
            <span>Detraktorzy: {data.detractors_percent}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>NPS według segmentu</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-iron-200 dark:border-iron-800 text-xs uppercase tracking-wider text-iron-500">
                  <th className="py-2 pr-3">Segment</th>
                  <th className="py-2 pr-3 text-right">Odp.</th>
                  <th className="py-2 pr-3 text-right">NPS</th>
                </tr>
              </thead>
              <tbody>
                {data.by_segment.map((s) => (
                  <tr
                    key={s.segment}
                    className="border-b border-iron-100 dark:border-iron-900"
                  >
                    <td className="py-2 pr-3 font-medium text-iron-900 dark:text-iron-50">
                      {s.segment}
                    </td>
                    <td className="py-2 pr-3 text-right text-iron-500">{s.responses}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        s.score >= 30
                          ? "text-accent-700"
                          : s.score >= 0
                            ? "text-warn-700"
                            : "text-danger-700"
                      }`}
                    >
                      {s.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Najczęstsze tematy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.top_themes.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-iron-900 dark:text-iron-50">{t.theme}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-iron-500">{t.count}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_COLOR[t.sentiment]}`}
                    >
                      {t.sentiment}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Ostatnie komentarze</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recent_verbatims.map((v) => (
              <li
                key={v.id}
                className="rounded-lg border border-iron-200 dark:border-iron-800 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      v.score >= 9
                        ? "bg-accent-50 text-accent-700"
                        : v.score >= 7
                          ? "bg-iron-100 text-iron-700"
                          : "bg-danger-50 text-danger-700"
                    }`}
                  >
                    {v.score}/10
                  </span>
                  <span className="text-xs text-iron-500">
                    {new Date(v.created_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
                <p className="text-sm text-iron-700 dark:text-iron-300 italic">
                  "{v.comment}"
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
