/**
 * Tier 23 — Impersonation admin API.
 *
 * POST   /api/admin/impersonate          → start session (returns token)
 * GET    /api/admin/impersonate          → list active
 * DELETE /api/admin/impersonate?id=…     → revoke
 */

import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/rbac";
import {
  startImpersonation,
  listActiveImpersonations,
  revokeImpersonation,
  type ImpersonationScope,
} from "@/lib/security/impersonation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// W8-3: migrated to central RBAC facade. Local wrapper preserved for
// minimal diff at call sites + backwards-compatible return shape.
async function getAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const r = await requirePlatformAdmin();
  return r.ok ? { ok: true, userId: r.userId } : { ok: false };
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok || !admin.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as
    | {
        targetUserId?: string;
        reason?: string;
        scope?: ImpersonationScope;
        ttlMinutes?: number;
      }
    | null;
  if (!body?.targetUserId || !body?.reason) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const { session, token } = await startImpersonation({
      adminId: admin.userId,
      targetUserId: body.targetUserId,
      reason: body.reason,
      scope: body.scope,
      ttlMinutes: body.ttlMinutes,
      ipAddress: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });
    return NextResponse.json({ session, token }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "impersonation_failed" },
      { status: 400 },
    );
  }
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const sessions = await listActiveImpersonations();
  return NextResponse.json({ sessions });
}

export async function DELETE(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok || !admin.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await revokeImpersonation({ sessionId: id, revokedByUserId: admin.userId });
  return NextResponse.json({ ok: true });
}
