/**
 * Tier 27 — GET /api/admin/realtime-kpis
 * Endpoint do polling-owego odświeżania KPI w dashboardzie admina.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getRealtimeKpis, deriveAlerts } from "@/lib/admin/realtime-kpis";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: gate.status });
  }
  const kpis = await getRealtimeKpis();
  const alerts = deriveAlerts(kpis);
  return NextResponse.json({ kpis, alerts });
}
