// GDPR — Right to Erasure (art. 17). Two-phase deletion:
//  1. Soft-delete with tombstone + 30-day grace (user can cancel)
//  2. Hard-delete after grace: rows wiped or anonymized; audit_log retained
//     for legal-retention obligations (anonymized).

import { randomUUID, createHash } from "crypto";

const GRACE_DAYS = 30;

// Tables whose rows are anonymized (not deleted) due to legal-retention obligations.
const ANONYMIZE_ONLY = new Set(["payments", "audit_log", "org_audit_log", "consent_ledger"]);

// Tables whose rows are wiped entirely.
const HARD_DELETE_TABLES = [
  "user_sessions",
  "api_keys",
  "push_subscriptions",
  "offline_queue",
  "messages",
  "document_drafts",
  "notifications",
  "nps_responses",
  "metric_snapshots",
  "user_preferences",
];

export interface ErasureRequest {
  id: string;
  userId: string;
  reason?: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  scheduledFor: string;
  completedAt?: string;
  createdAt: string;
}

export async function requestErasure(supabase: any, userId: string, reason?: string): Promise<ErasureRequest> {
  const scheduledFor = new Date(Date.now() + GRACE_DAYS * 86_400_000).toISOString();
  const row = {
    id: randomUUID(),
    user_id: userId,
    reason: reason ?? null,
    status: "pending" as const,
    scheduled_for: scheduledFor,
  };
  const { data, error } = await supabase.from("erasure_requests").insert(row).select("*").single();
  if (error) throw error;
  return mapRequest(data);
}

export async function cancelErasure(supabase: any, userId: string, requestId: string): Promise<void> {
  await supabase
    .from("erasure_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("user_id", userId)
    .eq("status", "pending");
}

export async function executeErasure(supabase: any, requestId: string): Promise<{ deletedRows: number; anonymizedRows: number }> {
  const { data: req, error: e1 } = await supabase.from("erasure_requests").select("*").eq("id", requestId).single();
  if (e1) throw e1;
  if (req.status !== "pending") throw new Error("not_pending");
  if (new Date(req.scheduled_for).getTime() > Date.now()) throw new Error("not_yet_scheduled");

  const userId = req.user_id;
  let deletedRows = 0;
  let anonymizedRows = 0;

  for (const t of HARD_DELETE_TABLES) {
    try {
      const { count } = await supabase.from(t).delete({ count: "exact" }).eq("user_id", userId);
      deletedRows += count ?? 0;
    } catch { /* skip */ }
  }

  for (const t of ANONYMIZE_ONLY) {
    try {
      const { count } = await supabase
        .from(t)
        .update(
          { user_id: null, anonymized_at: new Date().toISOString(), anonymized_user_hash: hashUser(userId) },
          { count: "exact" },
        )
        .eq("user_id", userId);
      anonymizedRows += count ?? 0;
    } catch { /* skip */ }
  }

  await supabase.from("profiles").update({ deleted_at: new Date().toISOString(), email: null, full_name: null }).eq("id", userId);

  await supabase
    .from("erasure_requests")
    .update({ status: "completed", completed_at: new Date().toISOString(), deleted_rows: deletedRows, anonymized_rows: anonymizedRows })
    .eq("id", requestId);

  return { deletedRows, anonymizedRows };
}

function hashUser(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

function mapRequest(r: any): ErasureRequest {
  return {
    id: r.id,
    userId: r.user_id,
    reason: r.reason ?? undefined,
    status: r.status,
    scheduledFor: r.scheduled_for,
    completedAt: r.completed_at ?? undefined,
    createdAt: r.created_at,
  };
}
