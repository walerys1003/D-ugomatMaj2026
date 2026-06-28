import { NextRequest, NextResponse } from "next/server";
import { requestErasure, cancelErasure, executeErasure } from "@/lib/security/gdpr/right-to-erasure";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const reqRow = await requestErasure(sb, user.id, body.reason);
    await recordSecurityEvent(sb, {
      userId: user.id,
      type: "gdpr.erasure_requested",
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
      metadata: { requestId: reqRow.id, scheduledFor: reqRow.scheduledFor },
    });
    return NextResponse.json({ request: reqRow }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "erasure_failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("id");
  if (!requestId) return NextResponse.json({ error: "id_required" }, { status: 400 });
  try {
    await cancelErasure(sb, user.id, requestId);
    return NextResponse.json({ cancelled: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "cancel_failed" }, { status: 500 });
  }
}

// Admin-only — execute pending erasure after grace period.
export async function PATCH(req: NextRequest) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  // REALNY BUG (audyt #6): `profiles.role` ma wartości tylko 'user'|'admin'|
  // 'moderator' (typ UserRole / migracja init_profiles) — NIE ma 'owner'.
  // Poprzedni warunek `&& role !== "owner"` był martwy (role nigdy nie jest
  // "owner"), a `as any` to maskowało. Bramka admin = wyłącznie rola 'admin'.
  if (data?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.requestId) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  try {
    const result = await executeErasure(sb, body.requestId);
    await recordSecurityEvent(sb, {
      userId: user.id,
      type: "gdpr.erasure_executed",
      metadata: { requestId: body.requestId, ...result },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "execute_failed" }, { status: 500 });
  }
}
