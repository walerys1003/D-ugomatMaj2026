import { NextResponse } from "next/server";
import { listRecentAuditEntries } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(500, parseInt(url.searchParams.get("limit") ?? "200", 10)));
  return NextResponse.json({ entries: await listRecentAuditEntries(limit) });
}
