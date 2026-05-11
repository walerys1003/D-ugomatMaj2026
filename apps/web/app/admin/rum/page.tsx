import type { Metadata } from "next";
import { Activity, Gauge, Smartphone, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "RUM · Web Vitals · Admin · Długomat",
};

type Vital = {
  metric: "LCP" | "INP" | "CLS" | "TTFB" | "FCP";
  p75: number;
  unit: "ms" | "score";
  target_good: number;
  target_needs_imp: number;
};

const VITALS: Vital[] = [
  { metric: "LCP", p75: 1840, unit: "ms", target_good: 2500, target_needs_imp: 4000 },
  { metric: "INP", p75: 178, unit: "ms", target_good: 200, target_needs_imp: 500 },
  { metric: "CLS", p75: 0.07, unit: "score", target_good: 0.1, target_needs_imp: 0.25 },
  { metric: "TTFB", p75: 612, unit: "ms", target_good: 800, target_needs_imp: 1800 },
  { metric: "FCP", p75: 1240, unit: "ms", target_good: 1800, target_needs_imp: 3000 },
];

function rating(v: Vital): { label: string; tone: "success" | "warning" | "danger" } {
  if (v.p75 <= v.target_good) return { label: "Dobre", tone: "success" };
  if (v.p75 <= v.target_needs_imp)
    return { label: "Wymaga poprawy", tone: "warning" };
  return { label: "Słabe", tone: "danger" };
}

const ROUTES = [
  { path: "/", lcp_p75: 1640, inp_p75: 142, samples: 124_580 },
  { path: "/panel", lcp_p75: 2120, inp_p75: 218, samples: 38_120 },
  { path: "/panel/sprawy/nowa", lcp_p75: 2540, inp_p75: 287, samples: 9_840 },
  { path: "/cennik", lcp_p75: 1480, inp_p75: 124, samples: 21_320 },
  { path: "/panel/skaner", lcp_p75: 3120, inp_p75: 412, samples: 6_120 },
];

export default function RumPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Wydajność
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          RUM · Web Vitals
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Dane od prawdziwych użytkowników (Real User Monitoring) — wartości
          p75 dla głównych metryk Web Vitals w ciągu ostatnich 7 dni.
        </p>
      </header>

      {/* Top vitals */}
      <section
        aria-label="Główne metryki"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {VITALS.map((v) => {
          const r = rating(v);
          return (
            <Card key={v.metric} elevation="subtle">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                    {v.metric}
                  </span>
                  <Badge tone={r.tone} withDot>
                    {r.label}
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-fluid-2xl tabular-nums">
                  {v.unit === "ms"
                    ? `${v.p75} ms`
                    : v.p75.toFixed(2)}
                </CardTitle>
                <CardDescription>
                  Cel ≤{" "}
                  {v.unit === "ms"
                    ? `${v.target_good} ms`
                    : v.target_good.toFixed(2)}{" "}
                  · p75
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* Routes breakdown */}
      <section className="flex flex-col gap-3">
        <h2 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white">
          Podział na trasy
        </h2>
        <Card elevation="subtle" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                <tr className="text-left text-iron-600 dark:text-iron-300">
                  <th className="px-5 py-3 font-semibold">Ścieżka</th>
                  <th className="px-5 py-3 text-right font-semibold">LCP p75</th>
                  <th className="px-5 py-3 text-right font-semibold">INP p75</th>
                  <th className="px-5 py-3 text-right font-semibold">Próbki</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                {ROUTES.map((r) => {
                  const tone: "success" | "warning" | "danger" =
                    r.lcp_p75 <= 2500 && r.inp_p75 <= 200
                      ? "success"
                      : r.lcp_p75 <= 4000 && r.inp_p75 <= 500
                        ? "warning"
                        : "danger";
                  return (
                    <tr key={r.path}>
                      <td className="px-5 py-3 font-mono text-fluid-xs">
                        {r.path}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {r.lcp_p75} ms
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {r.inp_p75} ms
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-iron-500">
                        {r.samples.toLocaleString("pl-PL")}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={tone} withDot>
                          {tone === "success"
                            ? "OK"
                            : tone === "warning"
                              ? "Poprawić"
                              : "Pilne"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Device & connection */}
      <section className="grid gap-3 md:grid-cols-3">
        <Card elevation="subtle">
          <CardHeader>
            <span className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
              <Smartphone className="size-5" />
            </span>
            <CardTitle className="mt-2 text-fluid-base">Mobile</CardTitle>
            <CardDescription>LCP p75: 2 240 ms · 64% ruchu</CardDescription>
          </CardHeader>
        </Card>
        <Card elevation="subtle">
          <CardHeader>
            <span className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
              <Gauge className="size-5" />
            </span>
            <CardTitle className="mt-2 text-fluid-base">Desktop</CardTitle>
            <CardDescription>LCP p75: 1 240 ms · 34% ruchu</CardDescription>
          </CardHeader>
        </Card>
        <Card elevation="subtle">
          <CardHeader>
            <span className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
              <Timer className="size-5" />
            </span>
            <CardTitle className="mt-2 text-fluid-base">Slow 4G</CardTitle>
            <CardDescription>LCP p75: 3 840 ms · 12% ruchu</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
