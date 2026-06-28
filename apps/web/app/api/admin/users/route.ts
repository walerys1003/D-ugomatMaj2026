import { NextRequest, NextResponse } from "next/server";
import { searchUsers, suspendUser, unsuspendUser, setUserRole } from "@/lib/admin/user-management";
import { recordAuditEntry } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ users: await searchUsers(q) });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const body = await req.json().catch(() => null);
  if (!body?.user_id || !body?.action) {
    return NextResponse.json({ error: "missing user_id or action" }, { status: 400 });
  }
  switch (body.action) {
    case "suspend":
      await suspendUser(body.user_id, body.reason ?? "");
      await recordAuditEntry({
        actor_id: gate.userId,
        action: "user.suspend",
        target_type: "user",
        target_id: body.user_id,
        metadata: { reason: body.reason ?? null },
      });
      break;
    case "unsuspend":
      await unsuspendUser(body.user_id);
      await recordAuditEntry({
        actor_id: gate.userId,
        action: "user.unsuspend",
        target_type: "user",
        target_id: body.user_id,
      });
      break;
    case "set_role":
      if (!["user", "admin", "support"].includes(body.role)) {
        return NextResponse.json({ error: "invalid role" }, { status: 400 });
      }
      await setUserRole(body.user_id, body.role);
      await recordAuditEntry({
        actor_id: gate.userId,
        action: "config.change",
        target_type: "user",
        target_id: body.user_id,
        metadata: { role: body.role },
      });
      break;
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
