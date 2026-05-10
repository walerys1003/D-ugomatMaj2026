/**
 * Tier 23 — Admin impersonation tokens.
 *
 * Pozwala administratorowi tymczasowo działać jako inny user (np. dla
 * customer support, debugging). Każda sesja:
 *  - ma TTL (default 30 min, max 4h)
 *  - jest scoped (np. tylko read-only na cases)
 *  - wymaga reason (audyt)
 *  - generuje token (HMAC-podpisany) widoczny w UI baner
 *  - każde użycie jest logowane do impersonation_audit
 *  - może być w każdej chwili odwołane (revoke)
 *  - explicit deny dla akcji destrukcyjnych (delete, change_password)
 */

import { createHash, randomBytes, createHmac, timingSafeEqual } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type ImpersonationScope = "read_only" | "support" | "debug" | "full";

export interface ImpersonationSession {
  id: string;
  admin_id: string;
  target_user_id: string;
  reason: string;
  scope: ImpersonationScope;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  started_at: string;
  expires_at: string;
  revoked_at: string | null;
  use_count: number;
}

const DEFAULT_TTL_MINUTES = 30;
const MAX_TTL_MINUTES = 240; // 4h

// Akcje zawsze zabronione w impersonation (nawet dla scope=full)
const FORBIDDEN_ACTIONS = new Set([
  "user.delete",
  "user.change_password",
  "user.change_email",
  "user.disable_mfa",
  "user.api_keys.create",
  "user.api_keys.rotate",
  "subscription.cancel.force",
]);

// Macierz scope → dozwolone akcje (wildcard '*' = wszystko poza FORBIDDEN)
const SCOPE_PERMISSIONS: Record<ImpersonationScope, string[]> = {
  read_only: ["*.read", "*.list", "*.get"],
  support: ["*.read", "*.list", "*.get", "case.comment", "ticket.*"],
  debug: ["*.read", "*.list", "*.get", "case.replay", "agent.replay"],
  full: ["*"],
};

function signToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

function getSecret(): string {
  return process.env.IMPERSONATION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "fallback-dev-secret-impersonation";
}

/**
 * Tworzy sesję impersonacji — zwraca token raw (do user_agent), zapisuje hash.
 */
export async function startImpersonation(args: {
  adminId: string;
  targetUserId: string;
  reason: string;
  scope?: ImpersonationScope;
  ttlMinutes?: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ session: ImpersonationSession; token: string }> {
  if (!args.reason || args.reason.length < 8) {
    throw new Error("impersonation_requires_reason");
  }
  if (args.adminId === args.targetUserId) {
    throw new Error("cannot_impersonate_self");
  }
  const ttl = Math.min(args.ttlMinutes ?? DEFAULT_TTL_MINUTES, MAX_TTL_MINUTES);
  const scope = args.scope ?? "read_only";

  // Verify admin role
  const supabase = await createSupabaseServerClient();
  const { data: { user: actor } } = await supabase.auth.getUser();
  const actorRole = (actor?.app_metadata as Record<string, unknown> | undefined)?.role;
  if (actor?.id !== args.adminId || actorRole !== "admin") {
    throw new Error("forbidden_only_admin_can_impersonate");
  }

  const tokenRaw = randomBytes(32).toString("base64url");
  const tokenSigned = signToken(tokenRaw, getSecret());
  const tokenHash = createHash("sha256").update(tokenSigned).digest("hex");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 60_000);

  const { data, error } = await supabase
    .from("impersonation_sessions")
    .insert({
      admin_id: args.adminId,
      target_user_id: args.targetUserId,
      reason: args.reason,
      scope,
      token_hash: tokenHash,
      ip_address: args.ipAddress ?? null,
      user_agent: args.userAgent ?? null,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;

  // Audit: dispatch + log
  await supabase.from("admin_audit_log").insert({
    actor_id: args.adminId,
    action: "impersonation.start",
    target_type: "user",
    target_id: args.targetUserId,
    metadata: { scope, ttl_minutes: ttl, reason: args.reason },
    ip: args.ipAddress ?? null,
    user_agent: args.userAgent ?? null,
    created_at: now.toISOString(),
  }).then(() => null).catch(() => null);

  return {
    session: data as ImpersonationSession,
    token: tokenRaw,
  };
}

/**
 * Weryfikuje token. Zwraca aktywną sesję lub null.
 */
export async function verifyImpersonationToken(token: string): Promise<ImpersonationSession | null> {
  if (!token || token.length < 16) return null;
  const tokenSigned = signToken(token, getSecret());
  const tokenHash = createHash("sha256").update(tokenSigned).digest("hex");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("impersonation_sessions")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!data) return null;

  // Constant-time compare na hash (defense-in-depth, mimo że eq już użył index)
  const stored = Buffer.from((data as ImpersonationSession).token_hash, "hex");
  const computed = Buffer.from(tokenHash, "hex");
  if (stored.length !== computed.length || !timingSafeEqual(stored, computed)) {
    return null;
  }

  // Bump use_count
  await supabase
    .from("impersonation_sessions")
    .update({ use_count: ((data as ImpersonationSession).use_count ?? 0) + 1 })
    .eq("id", (data as ImpersonationSession).id)
    .then(() => null)
    .catch(() => null);

  return data as ImpersonationSession;
}

/**
 * Sprawdza, czy akcja jest dozwolona w danej sesji impersonacji.
 */
export function isImpersonationActionAllowed(
  session: ImpersonationSession,
  action: string,
): boolean {
  if (FORBIDDEN_ACTIONS.has(action)) return false;
  const allowed = SCOPE_PERMISSIONS[session.scope] ?? [];
  return allowed.some((pattern) => {
    if (pattern === "*") return true;
    if (pattern === action) return true;
    if (pattern.endsWith(".*")) return action.startsWith(pattern.slice(0, -2) + ".");
    if (pattern.startsWith("*.")) return action.endsWith(pattern.slice(1));
    return false;
  });
}

export async function revokeImpersonation(args: {
  sessionId: string;
  revokedByUserId: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("impersonation_sessions")
    .update({ revoked_at: now })
    .eq("id", args.sessionId)
    .is("revoked_at", null);
  if (error) throw error;

  await supabase.from("admin_audit_log").insert({
    actor_id: args.revokedByUserId,
    action: "impersonation.revoke",
    target_type: "impersonation_session",
    target_id: args.sessionId,
    metadata: {},
    created_at: now,
  }).then(() => null).catch(() => null);
}

export async function listActiveImpersonations(adminId?: string): Promise<ImpersonationSession[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("impersonation_sessions")
    .select("*")
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("started_at", { ascending: false });
  if (adminId) q = q.eq("admin_id", adminId);
  const { data } = await q;
  return (data ?? []) as ImpersonationSession[];
}

/**
 * Wymusza expire wszystkich sesji starszych niż max TTL (cron job).
 */
export async function sweepExpiredImpersonations(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("impersonation_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .lt("expires_at", new Date().toISOString())
    .is("revoked_at", null)
    .select("id");
  return (data ?? []).length;
}
