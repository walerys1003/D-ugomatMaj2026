import { NextResponse } from "next/server";
import { computeWeeklyCohorts } from "@/lib/analytics/cohort-analysis";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  return NextResponse.json({ cohorts: await computeWeeklyCohorts(12) });
}
