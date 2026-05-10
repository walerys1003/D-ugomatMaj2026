import { NextRequest, NextResponse } from "next/server";
import { listFlags, upsertFlag } from "@/lib/admin/feature-flags";
import { recordAuditEntry } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  return NextResponse.json({ flags: await listFlags() });
}

export async function PUT(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const body = await req.json().catch(() => null);
  if (!body?.key) return NextResponse.json({ error: "missing key" }, { status: 400 });
  await upsertFlag(
    {
      key: body.key,
      enabled: !!body.enabled,
      rollout_pct: Math.max(0, Math.min(100, Number(body.rollout_pct ?? 0))),
      description: body.description,
      user_overrides: body.user_overrides ?? {},
    },
    gate.userId,
  );
  await recordAuditEntry({
    actor_id: gate.userId,
    action: "feature_flag.update",
    target_type: "feature_flag",
    target_id: body.key,
    metadata: { enabled: !!body.enabled, rollout_pct: body.rollout_pct },
  });
  return NextResponse.json({ ok: true });
}
