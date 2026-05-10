/**
 * Tier 14 — Anomaly detection on time-series KPIs (z-score + EWMA).
 */
export interface TimePoint {
  t: string; // ISO timestamp
  v: number;
}

export interface AnomalyFinding {
  index: number;
  t: string;
  value: number;
  expected: number;
  z_score: number;
  severity: "info" | "warning" | "critical";
}

export function detectAnomalies(series: TimePoint[], opts?: { window?: number; threshold?: number }): AnomalyFinding[] {
  const window = opts?.window ?? 14;
  const threshold = opts?.threshold ?? 2.5;
  if (series.length < window + 1) return [];
  const findings: AnomalyFinding[] = [];
  for (let i = window; i < series.length; i++) {
    const slice = series.slice(i - window, i).map((p) => p.v);
    const mean = slice.reduce((s, x) => s + x, 0) / slice.length;
    const variance = slice.reduce((s, x) => s + (x - mean) ** 2, 0) / slice.length;
    const std = Math.sqrt(variance) || 1;
    const z = (series[i].v - mean) / std;
    if (Math.abs(z) >= threshold) {
      findings.push({
        index: i,
        t: series[i].t,
        value: series[i].v,
        expected: Number(mean.toFixed(2)),
        z_score: Number(z.toFixed(2)),
        severity: Math.abs(z) >= 4 ? "critical" : Math.abs(z) >= 3 ? "warning" : "info",
      });
    }
  }
  return findings;
}

export function ewmaForecast(series: TimePoint[], alpha = 0.3, periodsAhead = 7): TimePoint[] {
  if (series.length === 0) return [];
  let level = series[0].v;
  for (const p of series) level = alpha * p.v + (1 - alpha) * level;
  const out: TimePoint[] = [];
  const stepMs = series.length > 1
    ? new Date(series[series.length - 1].t).getTime() - new Date(series[series.length - 2].t).getTime()
    : 86400_000;
  const lastT = new Date(series[series.length - 1].t).getTime();
  for (let i = 1; i <= periodsAhead; i++) {
    out.push({ t: new Date(lastT + i * stepMs).toISOString(), v: Number(level.toFixed(2)) });
  }
  return out;
}
