import { NextResponse } from "next/server";
import { computeRevenueMetrics } from "@/lib/analytics/revenue-metrics";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  return NextResponse.json(await computeRevenueMetrics());
}
