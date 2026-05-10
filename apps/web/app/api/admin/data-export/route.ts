import { NextRequest, NextResponse } from "next/server";
import { exportUserData, eraseUserData } from "@/lib/admin/data-export";
import { recordAuditEntry } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "missing user_id" }, { status: 400 });
  const data = await exportUserData(userId);
  await recordAuditEntry({
    actor_id: gate.userId,
    action: "data.export",
    target_type: "user",
    target_id: userId,
  });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "missing user_id" }, { status: 400 });
  await eraseUserData(userId);
  await recordAuditEntry({
    actor_id: gate.userId,
    action: "user.delete",
    target_type: "user",
    target_id: userId,
  });
  return NextResponse.json({ ok: true });
}
