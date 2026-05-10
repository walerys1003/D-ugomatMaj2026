import { NextRequest, NextResponse } from "next/server";
import { buildSafeQuery, QueryRequest } from "@/lib/analytics/sql-builder";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const body = (await req.json().catch(() => null)) as QueryRequest | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  try {
    const { sql, params } = buildSafeQuery(body);
    return NextResponse.json({ sql, params });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
