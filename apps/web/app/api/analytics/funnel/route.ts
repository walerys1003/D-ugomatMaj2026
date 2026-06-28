import { NextRequest, NextResponse } from "next/server";
import { computeFunnel } from "@/lib/analytics/funnel-builder";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.steps)) return NextResponse.json({ error: "missing steps" }, { status: 400 });
  const result = await computeFunnel(body.steps, { sinceDays: body.since_days ?? 30, orgId: body.org_id });
  return NextResponse.json(result);
}
