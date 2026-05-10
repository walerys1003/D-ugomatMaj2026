import { NextResponse } from "next/server";
import { getAdminMetrics } from "@/lib/admin/dashboard-metrics";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const m = await getAdminMetrics();
  return NextResponse.json(m);
}
