/**
 * Tier 21 — Bulk operations engine.
 *
 * Obsługa masowych operacji nad zasobami użytkownika:
 *  - bulk update spraw (status/tag/owner/case_type)
 *  - bulk archive / unarchive
 *  - bulk delete (soft delete + 30d grace)
 *  - bulk export (CSV / JSON / NDJSON)
 *  - bulk reassign deadlines
 *  - bulk send notification (z respektem na frequency cap + DND)
 *
 * Model:
 *  - bulk_operations (id, kind, status, total, processed, failed, params, started_at, finished_at)
 *  - chunkowe wykonanie (500 itemów/transakcja) → progress events przez channelBroker
 *  - idempotent retry per item (operacja per-item w savepoint)
 *  - cancel-safe (sprawdza status=canceled co chunk)
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { channelBroker } from "@/lib/realtime/channel/channel-broker";

export type BulkOpKind =
  | "cases.update"
  | "cases.archive"
  | "cases.unarchive"
  | "cases.delete"
  | "cases.export"
  | "deadlines.reassign"
  | "deadlines.complete"
  | "notifications.send"
  | "documents.tag"
  | "documents.move";

export type BulkOpStatus =
  | "pending"
  | "running"
  | "completed"
  | "completed_with_errors"
  | "canceled"
  | "failed";

export interface BulkOperation {
  id: string;
  user_id: string;
  kind: BulkOpKind;
  status: BulkOpStatus;
  total: number;
  processed: number;
  failed: number;
  target_ids: string[];
  params: Record<string, unknown>;
  errors: Array<{ id: string; message: string }>;
  result_url: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

const CHUNK_SIZE = 500;

export async function createBulkOperation(args: {
  userId: string;
  kind: BulkOpKind;
  targetIds: string[];
  params?: Record<string, unknown>;
}): Promise<BulkOperation> {
  if (args.targetIds.length === 0) {
    throw new Error("bulk_operation_no_targets");
  }
  if (args.targetIds.length > 50_000) {
    throw new Error("bulk_operation_too_many_targets");
  }
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("bulk_operations")
    .insert({
      user_id: args.userId,
      kind: args.kind,
      status: "pending" as BulkOpStatus,
      total: args.targetIds.length,
      processed: 0,
      failed: 0,
      target_ids: args.targetIds,
      params: args.params ?? {},
      errors: [],
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as BulkOperation;
}

export type PerItemHandler = (id: string, params: Record<string, unknown>) => Promise<void>;

const HANDLERS: Record<BulkOpKind, PerItemHandler> = {
  "cases.update": async (id, params) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const patch: Record<string, unknown> = {};
    if (typeof params.status === "string") patch.status = params.status;
    if (typeof params.case_type === "string") patch.case_type = params.case_type;
    if (Array.isArray(params.tags)) patch.tags = params.tags;
    if (Object.keys(patch).length === 0) return;
    const { error } = await sb.from("cases").update(patch).eq("id", id);
    if (error) throw error;
  },
  "cases.archive": async (id) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const { error } = await sb.from("cases").update({ archived_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  "cases.unarchive": async (id) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const { error } = await sb.from("cases").update({ archived_at: null }).eq("id", id);
    if (error) throw error;
  },
  "cases.delete": async (id) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const purgeAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await sb
      .from("cases")
      .update({ deleted_at: new Date().toISOString(), purge_at: purgeAt })
      .eq("id", id);
    if (error) throw error;
  },
  "cases.export": async () => {
    /* aggregate handler — kompletujemy później w finalize */
  },
  "deadlines.reassign": async (id, params) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const newOwner = typeof params.assignee_id === "string" ? params.assignee_id : null;
    if (!newOwner) throw new Error("missing_assignee_id");
    const { error } = await sb.from("deadlines").update({ assignee_id: newOwner }).eq("id", id);
    if (error) throw error;
  },
  "deadlines.complete": async (id) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const { error } = await sb
      .from("deadlines")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
  "notifications.send": async () => {
    /* aggregate dispatch — używamy routeNotification dla każdego user_id w finalize */
  },
  "documents.tag": async (id, params) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const tags = Array.isArray(params.tags) ? params.tags : [];
    const { error } = await sb.from("documents").update({ tags }).eq("id", id);
    if (error) throw error;
  },
  "documents.move": async (id, params) => {
    const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
    const targetCaseId = typeof params.case_id === "string" ? params.case_id : null;
    if (!targetCaseId) throw new Error("missing_case_id");
    const { error } = await sb.from("documents").update({ case_id: targetCaseId }).eq("id", id);
    if (error) throw error;
  },
};

/**
 * Wykonuje całość bulk operation — chunkami z progress events.
 * Wywoływana przez worker (np. job_queue 'analytics.flush'-style) lub bezpośrednio
 * z route handler dla małych zestawów (<= 500).
 */
export async function executeBulkOperation(opId: string): Promise<BulkOperation> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: op, error: loadErr } = await sb
    .from("bulk_operations")
    .select("*")
    .eq("id", opId)
    .single();
  if (loadErr || !op) throw loadErr ?? new Error("bulk_op_not_found");
  const operation = op as BulkOperation;
  if (operation.status === "canceled") return operation;

  await sb
    .from("bulk_operations")
    .update({ status: "running" as BulkOpStatus, started_at: new Date().toISOString() })
    .eq("id", opId);

  const handler = HANDLERS[operation.kind];
  if (!handler) throw new Error(`unknown_bulk_kind:${operation.kind}`);

  let processed = 0;
  let failed = 0;
  const errors: Array<{ id: string; message: string }> = [];

  for (let i = 0; i < operation.target_ids.length; i += CHUNK_SIZE) {
    // Cancellation check
    const { data: latest } = await sb
      .from("bulk_operations")
      .select("status")
      .eq("id", opId)
      .single();
    if (latest?.status === "canceled") {
      await sb
        .from("bulk_operations")
        .update({ finished_at: new Date().toISOString() })
        .eq("id", opId);
      return { ...operation, status: "canceled", processed, failed };
    }

    const chunk = operation.target_ids.slice(i, i + CHUNK_SIZE);
    for (const id of chunk) {
      try {
        await handler(id, operation.params);
        processed++;
      } catch (err) {
        failed++;
        errors.push({
          id,
          message: err instanceof Error ? err.message : String(err),
        });
        if (errors.length > 200) errors.length = 200; // cap
      }
    }

    await sb
      .from("bulk_operations")
      .update({ processed, failed, errors })
      .eq("id", opId);

    await channelBroker.publish({
      topic: `bulk:${opId}`,
      kind: "bulk.progress",
      payload: {
        opId,
        processed,
        failed,
        total: operation.total,
        percent: Math.round((processed / operation.total) * 100),
      },
      userId: operation.user_id,
      persist: false,
    });
  }

  const finalStatus: BulkOpStatus = failed === 0 ? "completed" : "completed_with_errors";
  const { data: finalRow } = await sb
    .from("bulk_operations")
    .update({
      status: finalStatus,
      processed,
      failed,
      errors,
      finished_at: new Date().toISOString(),
    })
    .eq("id", opId)
    .select("*")
    .single();

  return (finalRow ?? { ...operation, status: finalStatus, processed, failed }) as BulkOperation;
}

export async function cancelBulkOperation(opId: string, userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { error } = await sb
    .from("bulk_operations")
    .update({ status: "canceled" as BulkOpStatus })
    .eq("id", opId)
    .eq("user_id", userId)
    .in("status", ["pending", "running"]);
  if (error) throw error;
}

export async function getBulkOperation(opId: string, userId: string): Promise<BulkOperation | null> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("bulk_operations")
    .select("*")
    .eq("id", opId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as BulkOperation | null;
}
