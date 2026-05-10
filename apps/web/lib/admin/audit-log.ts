/**
 * Tier 10 — Append-only admin audit log.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export type AdminAction =
  | "user.suspend"
  | "user.unsuspend"
  | "user.delete"
  | "subscription.cancel"
  | "subscription.refund"
  | "feature_flag.update"
  | "coupon.create"
  | "coupon.revoke"
  | "payout.transfer"
  | "data.export"
  | "config.change";

export interface AuditEntry {
  actor_id: string;
  action: AdminAction;
  target_type: string;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  user_agent?: string | null;
}

export async function recordAuditEntry(entry: AuditEntry): Promise<void> {
  const sb = await createServerSupabase();
  await sb.from("admin_audit_log").insert({
    actor_id: entry.actor_id,
    action: entry.action,
    target_type: entry.target_type,
    target_id: entry.target_id ?? null,
    metadata: entry.metadata ?? {},
    ip: entry.ip ?? null,
    user_agent: entry.user_agent ?? null,
    created_at: new Date().toISOString(),
  });
}

export async function listRecentAuditEntries(limit = 200): Promise<AuditEntry[]> {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as AuditEntry[];
}
