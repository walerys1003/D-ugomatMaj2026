import type { Metadata } from "next";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { getSloMetrics } from "@/lib/observability/slo-metrics";
import { ALL_CIRCUITS } from "@/lib/observability/circuit-breaker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "SLI / SLO — Admin",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tier 6 zad. 300 — SLO dashboard.
 * Pokazuje availability, error rate, p50/p95/p99 generacji AI oraz stan
 * circuit breakerów. Cel: 99.9% availability, p95 generate < 4 s.
 */

function fmtPct(v: number | null, digits = 3): string {
  if (v === null) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

function fmtMs(v: number | null): string {
  if (v === null) return "—";
  return `${Math.round(v)} ms`;
}

function availabilityTone(v: number | null): "success" | "warning" | "danger" | "neutral" {
  if (v === null) return "neutral";
  if (v >= 0.999) return "success";
  if (v >= 0.99) return "warning";
  return "danger";
}

function burnTone(v: number | null): "success" | "warning" | "danger" | "neutral" {
  if (v === null) return "neutral";
  if (v < 1) return "success";
  if (v < 10) return "warning";
  return "danger";
}

function circuitTone(state: string): "success" | "warning" | "danger" | "neutral" {
  if (state === "closed") return "success";
  if (state === "half-open") return "warning";
  if (state === "open") return "danger";
  return "neutral";
}

export default async function AdminSloPage() {
  await requireAdminOrRedirect();

  const [m1h, m24h] = await Promise.all([getSloMetrics(1), getSloMetrics(24)]);
  const circuits = ALL_CIRCUITS.map((c) => c.getState());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SLI / SLO</h1>
        <p className="text-sm text-muted-foreground">
          Target: 99.9% availability · p95 generate &lt; 4 s · error budget = 0.1%.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">Ostatnia godzina</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">Availability</CardTitle>
              <CardDescription className="text-xs">1 − error_rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  {fmtPct(m1h.availability)}
                </span>
                <Badge tone={availabilityTone(m1h.availability)}>
                  SLO {fmtPct(m1h.error_budget_target, 1)}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                requests: {m1h.request_count ?? "—"} · errors: {m1h.error_count ?? "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">Burn rate</CardTitle>
              <CardDescription className="text-xs">
                error_rate / error_budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  {m1h.error_budget_burn_rate === null
                    ? "—"
                    : `${m1h.error_budget_burn_rate.toFixed(2)}×`}
                </span>
                <Badge tone={burnTone(m1h.error_budget_burn_rate)}>
                  budżet:{" "}
                  {m1h.error_budget_remaining === null
                    ? "—"
                    : `${(m1h.error_budget_remaining * 100).toFixed(0)}%`}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                &gt; 1× — pożeramy budżet · &gt; 10× — alarm krytyczny
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">p95 generate</CardTitle>
              <CardDescription className="text-xs">duration_ms · AI pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  {fmtMs(m1h.p95_generate_ms)}
                </span>
                <Badge
                  tone={
                    m1h.p95_generate_ms === null
                      ? "neutral"
                      : m1h.p95_generate_ms < 4000
                        ? "success"
                        : m1h.p95_generate_ms < 8000
                          ? "warning"
                          : "danger"
                  }
                >
                  target 4 s
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                p50: {fmtMs(m1h.p50_generate_ms)} · p99: {fmtMs(m1h.p99_generate_ms)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">Error rate</CardTitle>
              <CardDescription className="text-xs">5xx + dead_letter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  {fmtPct(m1h.error_rate, 3)}
                </span>
                <Badge tone={burnTone(m1h.error_budget_burn_rate)}>
                  alarm &gt; 1%
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">okno: 1h</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Ostatnie 24 godziny</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold tabular-nums">
                {fmtPct(m24h.availability)}
              </span>
              <div className="mt-1 text-xs text-muted-foreground">
                requests: {m24h.request_count ?? "—"} · errors: {m24h.error_count ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">Burn rate</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold tabular-nums">
                {m24h.error_budget_burn_rate === null
                  ? "—"
                  : `${m24h.error_budget_burn_rate.toFixed(2)}×`}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">p95 generate</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold tabular-nums">
                {fmtMs(m24h.p95_generate_ms)}
              </span>
              <div className="mt-1 text-xs text-muted-foreground">
                p50: {fmtMs(m24h.p50_generate_ms)} · p99: {fmtMs(m24h.p99_generate_ms)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide">Error rate</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold tabular-nums">
                {fmtPct(m24h.error_rate, 3)}
              </span>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Circuit breakers</h2>
        <Card>
          <CardContent className="py-4">
            {circuits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak skonfigurowanych circuitów.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 text-left font-medium">Circuit</th>
                    <th className="py-2 text-left font-medium">Stan</th>
                    <th className="py-2 text-right font-medium">Błędy (okno)</th>
                    <th className="py-2 text-right font-medium">Otwarty od</th>
                  </tr>
                </thead>
                <tbody>
                  {circuits.map((c) => (
                    <tr key={c.circuit} className="border-b last:border-0">
                      <td className="py-2 font-medium">{c.circuit}</td>
                      <td className="py-2">
                        <Badge tone={circuitTone(c.state)}>{c.state}</Badge>
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.failureCount}</td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {c.openedAt ? new Date(c.openedAt).toLocaleTimeString("pl-PL") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
