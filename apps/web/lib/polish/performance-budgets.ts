/**
 * Tier 10 — Performance budgets. Compared against Web Vitals + Lighthouse scores.
 */
export interface PerfBudget {
  metric: "LCP" | "INP" | "CLS" | "TTFB" | "FCP" | "TBT" | "JS_KB" | "CSS_KB" | "IMG_KB" | "TOTAL_KB";
  good_max: number;
  needs_improvement_max: number;
  unit: "ms" | "score" | "kb";
}

export const PERF_BUDGETS: PerfBudget[] = [
  { metric: "LCP", good_max: 2500, needs_improvement_max: 4000, unit: "ms" },
  { metric: "INP", good_max: 200, needs_improvement_max: 500, unit: "ms" },
  { metric: "CLS", good_max: 0.1, needs_improvement_max: 0.25, unit: "score" },
  { metric: "TTFB", good_max: 800, needs_improvement_max: 1800, unit: "ms" },
  { metric: "FCP", good_max: 1800, needs_improvement_max: 3000, unit: "ms" },
  { metric: "TBT", good_max: 200, needs_improvement_max: 600, unit: "ms" },
  { metric: "JS_KB", good_max: 300, needs_improvement_max: 500, unit: "kb" },
  { metric: "CSS_KB", good_max: 80, needs_improvement_max: 150, unit: "kb" },
  { metric: "IMG_KB", good_max: 600, needs_improvement_max: 1200, unit: "kb" },
  { metric: "TOTAL_KB", good_max: 1200, needs_improvement_max: 2500, unit: "kb" },
];

export type BudgetVerdict = "good" | "needs_improvement" | "poor";

export function classifyMetric(metric: PerfBudget["metric"], value: number): BudgetVerdict {
  const b = PERF_BUDGETS.find((x) => x.metric === metric);
  if (!b) return "good";
  if (value <= b.good_max) return "good";
  if (value <= b.needs_improvement_max) return "needs_improvement";
  return "poor";
}

export interface BudgetReport {
  metrics: Array<{ metric: PerfBudget["metric"]; value: number; verdict: BudgetVerdict }>;
  overall: BudgetVerdict;
  generated_at: string;
}

export function buildBudgetReport(values: Partial<Record<PerfBudget["metric"], number>>): BudgetReport {
  const metrics = PERF_BUDGETS.filter((b) => values[b.metric] != null).map((b) => ({
    metric: b.metric,
    value: values[b.metric] as number,
    verdict: classifyMetric(b.metric, values[b.metric] as number),
  }));
  let overall: BudgetVerdict = "good";
  if (metrics.some((m) => m.verdict === "poor")) overall = "poor";
  else if (metrics.some((m) => m.verdict === "needs_improvement")) overall = "needs_improvement";
  return { metrics, overall, generated_at: new Date().toISOString() };
}
