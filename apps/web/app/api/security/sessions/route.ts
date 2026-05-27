import { NextRequest, NextResponse } from "next/server";
import { listSessions, revokeSession, revokeAllSessionsExcept } from "@/lib/security/sessions/session-manager";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const currentId = req.headers.get("x-session-id") ?? undefined;
  try {
    const sessions = await listSessions(supabase, user.id, currentId);
    return NextResponse.json({ sessions });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "list_failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sessionId = req.nextUrl.searchParams.get("id");
  const allExcept = req.nextUrl.searchParams.get("all_except");
  try {
    if (allExcept) {
      const revoked = await revokeAllSessionsExcept(supabase, user.id, allExcept);
      await recordSecurityEvent(supabase, {
        userId: user.id,
        type: "auth.session_revoked",
        metadata: { count: revoked, scope: "all_except" },
      });
      return NextResponse.json({ revoked });
    }
    if (!sessionId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    await revokeSession(supabase, user.id, sessionId);
    await recordSecurityEvent(supabase, {
      userId: user.id,
      type: "auth.session_revoked",
      metadata: { sessionId },
    });
    return NextResponse.json({ revoked: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "revoke_failed" }, { status: 500 });
  }
}
