/**
 * Tier 10 — Lighthouse-style scorecard aggregator.
 * Accepts raw category scores and produces a graded summary for the admin dashboard.
 */
export type LhCategory = "performance" | "accessibility" | "best_practices" | "seo" | "pwa";

export interface LhInput {
  url: string;
  performance: number; // 0..100
  accessibility: number;
  best_practices: number;
  seo: number;
  pwa?: number;
  collected_at?: string;
}

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface Scorecard {
  url: string;
  scores: Record<LhCategory, number | null>;
  grades: Record<LhCategory, Grade | null>;
  overall: number;
  overall_grade: Grade;
  recommendations: string[];
  collected_at: string;
}

function toGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function buildScorecard(input: LhInput): Scorecard {
  const scores: Record<LhCategory, number | null> = {
    performance: input.performance,
    accessibility: input.accessibility,
    best_practices: input.best_practices,
    seo: input.seo,
    pwa: input.pwa ?? null,
  };
  const grades: Record<LhCategory, Grade | null> = {
    performance: toGrade(input.performance),
    accessibility: toGrade(input.accessibility),
    best_practices: toGrade(input.best_practices),
    seo: toGrade(input.seo),
    pwa: input.pwa != null ? toGrade(input.pwa) : null,
  };
  const considered = [input.performance, input.accessibility, input.best_practices, input.seo].filter(
    (n) => typeof n === "number",
  );
  const overall = Math.round(considered.reduce((s, n) => s + n, 0) / Math.max(1, considered.length));
  const recommendations: string[] = [];
  if (input.performance < 90) recommendations.push("Optimize LCP/INP — check image sizes, defer non-critical JS.");
  if (input.accessibility < 90) recommendations.push("Run /api/quality/a11y on key pages to fix WCAG issues.");
  if (input.best_practices < 90) recommendations.push("Audit console errors and third-party script CSP.");
  if (input.seo < 90) recommendations.push("Ensure all pages have meta description and unique titles.");
  if (input.pwa != null && input.pwa < 80) recommendations.push("Verify manifest and service worker registration.");
  return {
    url: input.url,
    scores,
    grades,
    overall,
    overall_grade: toGrade(overall),
    recommendations,
    collected_at: input.collected_at ?? new Date().toISOString(),
  };
}
