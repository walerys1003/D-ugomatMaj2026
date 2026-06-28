/**
 * Tier 20 — Prometheus metrics endpoint.
 *
 * GET /api/metrics — zwraca format Prometheus text v0.0.4
 * Chronione `METRICS_SCRAPE_KEY` w nagłówku `x-scrape-key`.
 */

import { renderPrometheus } from "@/lib/observability/metrics";

export async function GET(req: Request) {
  const key = req.headers.get("x-scrape-key");
  const expected = process.env.METRICS_SCRAPE_KEY;
  if (expected && key !== expected) {
    return new Response("forbidden", { status: 403 });
  }
  const body = renderPrometheus();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
