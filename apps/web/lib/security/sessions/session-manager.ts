// Session management — list devices, revoke, enforce concurrent session caps.

import { createHash } from "crypto";

export interface UserSession {
  id: string;
  userId: string;
  deviceFingerprint: string;
  userAgent: string;
  ip: string;
  country?: string;
  city?: string;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  current?: boolean;
}

export function deviceFingerprint(userAgent: string, acceptLanguage?: string, secChUa?: string): string {
  return createHash("sha256")
    .update(`${userAgent}|${acceptLanguage ?? ""}|${secChUa ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

export async function recordSessionActivity(
  supabase: any,
  userId: string,
  sessionId: string,
  ctx: { userAgent: string; ip: string; country?: string; city?: string },
): Promise<void> {
  const fingerprint = deviceFingerprint(ctx.userAgent);
  await supabase.from("user_sessions").upsert(
    {
      id: sessionId,
      user_id: userId,
      device_fingerprint: fingerprint,
      user_agent: ctx.userAgent,
      ip: ctx.ip,
      country: ctx.country ?? null,
      city: ctx.city ?? null,
      last_activity_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function listSessions(supabase: any, userId: string, currentSessionId?: string): Promise<UserSession[]> {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("last_activity_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    deviceFingerprint: r.device_fingerprint,
    userAgent: r.user_agent,
    ip: r.ip,
    country: r.country ?? undefined,
    city: r.city ?? undefined,
    lastActivityAt: r.last_activity_at,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    current: r.id === currentSessionId,
  }));
}

export async function revokeSession(supabase: any, userId: string, sessionId: string): Promise<void> {
  await supabase.from("user_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", sessionId).eq("user_id", userId);
}

export async function revokeAllSessionsExcept(supabase: any, userId: string, keepSessionId: string): Promise<number> {
  const { count } = await supabase
    .from("user_sessions")
    .update({ revoked_at: new Date().toISOString() }, { count: "exact" })
    .eq("user_id", userId)
    .neq("id", keepSessionId)
    .is("revoked_at", null);
  return count ?? 0;
}

const MAX_CONCURRENT_SESSIONS = 10;

export async function enforceConcurrentSessionLimit(supabase: any, userId: string): Promise<number> {
  const { data } = await supabase
    .from("user_sessions")
    .select("id,last_activity_at")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("last_activity_at", { ascending: false });
  const sessions = data ?? [];
  if (sessions.length <= MAX_CONCURRENT_SESSIONS) return 0;
  const idsToRevoke = sessions.slice(MAX_CONCURRENT_SESSIONS).map((s: any) => s.id);
  if (idsToRevoke.length === 0) return 0;
  await supabase
    .from("user_sessions")
    .update({ revoked_at: new Date().toISOString(), revoke_reason: "concurrent_limit" })
    .in("id", idsToRevoke);
  return idsToRevoke.length;
}
