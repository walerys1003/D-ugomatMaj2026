import { NextRequest, NextResponse } from "next/server";
import { buildScorecard } from "@/lib/quality/lighthouse-scorecard";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.url || typeof body.performance !== "number") {
    return NextResponse.json({ error: "missing url or performance" }, { status: 400 });
  }
  const card = buildScorecard({
    url: body.url,
    performance: body.performance,
    accessibility: body.accessibility ?? 0,
    best_practices: body.best_practices ?? 0,
    seo: body.seo ?? 0,
    pwa: body.pwa,
    collected_at: body.collected_at,
  });
  return NextResponse.json(card);
}
