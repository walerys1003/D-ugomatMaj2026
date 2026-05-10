/**
 * Tier 13 — Org-scoped audit trail v2 (extends Tier 10 admin_audit_log).
 * Tracks every sensitive action with actor, IP, user-agent, and tamper-evident hash chain.
 */
import { createHash } from "crypto";
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface OrgAuditEntry {
  org_id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  user_agent?: string | null;
}

export async function recordOrgAuditEntry(entry: OrgAuditEntry): Promise<void> {
  const sb = await createServerSupabase();
  // Compute hash chain: sha256(prev_hash + JSON(entry))
  const { data: last } = await sb
    .from("org_audit_log")
    .select("hash")
    .eq("org_id", entry.org_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const prev = last?.hash ?? "";
  const ts = new Date().toISOString();
  const hash = createHash("sha256")
    .update(prev + JSON.stringify({ ...entry, created_at: ts }))
    .digest("hex");
  await sb.from("org_audit_log").insert({
    org_id: entry.org_id,
    actor_id: entry.actor_id,
    action: entry.action,
    target_type: entry.target_type,
    target_id: entry.target_id ?? null,
    metadata: entry.metadata ?? {},
    ip: entry.ip ?? null,
    user_agent: entry.user_agent ?? null,
    prev_hash: prev,
    hash,
    created_at: ts,
  });
}

export async function verifyAuditChain(orgId: string): Promise<{ ok: boolean; broken_at?: string }> {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("org_audit_log")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  let prev = "";
  for (const e of (data as any[]) ?? []) {
    const expected = createHash("sha256")
      .update(prev + JSON.stringify({
        org_id: e.org_id,
        actor_id: e.actor_id,
        action: e.action,
        target_type: e.target_type,
        target_id: e.target_id,
        metadata: e.metadata,
        ip: e.ip,
        user_agent: e.user_agent,
        created_at: e.created_at,
      }))
      .digest("hex");
    if (e.hash !== expected) return { ok: false, broken_at: e.created_at };
    prev = e.hash;
  }
  return { ok: true };
}
