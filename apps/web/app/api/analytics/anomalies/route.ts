import { NextRequest, NextResponse } from "next/server";
import { detectAnomalies, ewmaForecast } from "@/lib/analytics/anomaly-detection";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.series)) return NextResponse.json({ error: "missing series" }, { status: 400 });
  const findings = detectAnomalies(body.series, { window: body.window, threshold: body.threshold });
  const forecast = body.forecast ? ewmaForecast(body.series, body.alpha ?? 0.3, body.periods ?? 7) : [];
  return NextResponse.json({ findings, forecast });
}
