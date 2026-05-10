/**
 * Tier 23 — Impersonation admin API.
 *
 * POST   /api/admin/impersonate          → start session (returns token)
 * GET    /api/admin/impersonate          → list active
 * DELETE /api/admin/impersonate?id=…     → revoke
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  startImpersonation,
  listActiveImpersonations,
  revokeImpersonation,
  type ImpersonationScope,
} from "@/lib/security/impersonation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  return { ok: role === "admin", userId: user.id };
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
