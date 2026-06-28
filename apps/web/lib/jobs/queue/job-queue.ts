/**
 * Tier 20 — Job queue runner (BullMQ-style on Postgres).
 *
 * Postgres-backed job queue z:
 *  - typowanymi payloadami per job kind
 *  - priorities (1-10, niższe = wcześniej)
 *  - retries z exponential backoff + jitter
 *  - delayed jobs (`run_after`)
 *  - rate limiting per kind (max parallel)
 *  - dead-letter queue po max retries
 *  - idempotency key (dedupe pendingów z tym samym kluczem)
 *  - heartbeat dla long-running (job zostaje "stale" jeśli brak heartbeat)
 *
 * Operacje atomowe — claimNextJob używa `FOR UPDATE SKIP LOCKED`.
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export type JobKind =
  | "ocr.process"
  | "ai.generate"
  | "ai.embed"
  | "notifications.dispatch"
  | "notifications.deadline_reminder"
  | "payments.invoice_issue"
  | "payments.subscription_renew"
  | "court.epuap_submit"
  | "court.krs_refresh"
  | "gdpr.execute_erasure"
  | "analytics.flush"
  | "search.index_chunk";

export type JobStatus =
  | "pending"
  | "claimed"
  | "running"
  | "completed"
  | "failed"
  | "dead_letter";

export interface JobRecord {
  id: string;
  kind: JobKind;
  payload: Record<string, unknown>;
  status: JobStatus;
  priority: number;
  attempts: number;
  max_attempts: number;
  run_after: string;
  claimed_at: string | null;
  claimed_by: string | null;
  heartbeat_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  last_error: string | null;
  idempotency_key: string | null;
  trace_id: string | null;
  created_at: string;
}

export interface EnqueueOptions {
  kind: JobKind;
  payload: Record<string, unknown>;
  priority?: number;
  maxAttempts?: number;
  runAfter?: Date;
  idempotencyKey?: string;
  traceId?: string;
}

const DEFAULT_MAX_ATTEMPTS = 5;
const HEARTBEAT_STALE_MS = 60_000;
const VISIBILITY_TIMEOUT_MS = 5 * 60 * 1000;

export async function enqueueJob(opts: EnqueueOptions): Promise<JobRecord> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;

  // Idempotency: jeśli pending lub running job z tym kluczem istnieje, zwróć go.
  if (opts.idempotencyKey) {
    const { data: existing } = await sb
      .from("job_queue")
      .select("*")
      .eq("idempotency_key", opts.idempotencyKey)
      .in("status", ["pending", "claimed", "running"])
      .maybeSingle();
    if (existing) return existing as JobRecord;
  }

  const { data, error } = await sb
    .from("job_queue")
    .insert({
      kind: opts.kind,
      payload: opts.payload as Json,
      status: "pending" as JobStatus,
      priority: opts.priority ?? 5,
      attempts: 0,
      max_attempts: opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      run_after: (opts.runAfter ?? new Date()).toISOString(),
      idempotency_key: opts.idempotencyKey ?? null,
      trace_id: opts.traceId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as JobRecord;
}

/**
 * Claim następnego dostępnego joba — używa RPC `claim_next_job`
 * (FOR UPDATE SKIP LOCKED + atomic update).
 */
export async function claimNextJob(args: {
  workerId: string;
  kinds?: JobKind[];
}): Promise<JobRecord | null> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb.rpc("claim_next_job", {
    worker_id: args.workerId,
    kinds: args.kinds ?? null,
    visibility_timeout_ms: VISIBILITY_TIMEOUT_MS,
  });
  if (error) throw error;
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return Array.isArray(data) ? (data[0] as JobRecord) : (data as JobRecord);
}

export async function heartbeatJob(id: string, workerId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { error } = await sb
    .from("job_queue")
    .update({ heartbeat_at: new Date().toISOString() })
    .eq("id", id)
    .eq("claimed_by", workerId)
    .in("status", ["claimed", "running"]);
  if (error) throw error;
}

export async function completeJob(id: string, workerId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { error } = await sb
    .from("job_queue")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("claimed_by", workerId);
  if (error) throw error;
}

export async function failJob(args: {
  id: string;
  workerId: string;
  errorMessage: string;
  retry?: boolean;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data: row, error: rowErr } = await sb
    .from("job_queue")
    .select("attempts,max_attempts")
    .eq("id", args.id)
    .single();
  if (rowErr || !row) throw rowErr ?? new Error("job not found");

  const attempts = (row.attempts ?? 0) + 1;
  const shouldDeadLetter = !args.retry || attempts >= (row.max_attempts ?? DEFAULT_MAX_ATTEMPTS);

  if (shouldDeadLetter) {
    const { error } = await sb
      .from("job_queue")
      .update({
        status: "dead_letter",
        attempts,
        failed_at: new Date().toISOString(),
        last_error: args.errorMessage.slice(0, 2000),
      })
      .eq("id", args.id)
      .eq("claimed_by", args.workerId);
    if (error) throw error;
    return;
  }

  const backoffMs = exponentialBackoff(attempts);
  const runAfter = new Date(Date.now() + backoffMs).toISOString();
  const { error } = await sb
    .from("job_queue")
    .update({
      status: "pending",
      attempts,
      run_after: runAfter,
      claimed_at: null,
      claimed_by: null,
      heartbeat_at: null,
      last_error: args.errorMessage.slice(0, 2000),
    })
    .eq("id", args.id)
    .eq("claimed_by", args.workerId);
  if (error) throw error;
}

/** Sweep stale jobs (brak heartbeat > 60s) — uwalnia je do ponownego claim. */
export async function sweepStaleJobs(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const cutoff = new Date(Date.now() - HEARTBEAT_STALE_MS).toISOString();
  const { data, error } = await sb
    .from("job_queue")
    .update({
      status: "pending",
      claimed_at: null,
      claimed_by: null,
      heartbeat_at: null,
      last_error: "stale_heartbeat_recovered",
    })
    .in("status", ["claimed", "running"])
    .lt("heartbeat_at", cutoff)
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

export async function queueDepth(kind?: JobKind): Promise<{ pending: number; running: number; dead: number }> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const base = sb.from("job_queue").select("status", { count: "exact", head: true });
  const filter = (b: typeof base) => (kind ? b.eq("kind", kind) : b);
  const [pending, running, dead] = await Promise.all([
    filter(base).eq("status", "pending"),
    filter(base).in("status", ["claimed", "running"]),
    filter(base).eq("status", "dead_letter"),
  ]);
  return {
    pending: pending.count ?? 0,
    running: running.count ?? 0,
    dead: dead.count ?? 0,
  };
}

function exponentialBackoff(attempt: number): number {
  const base = 1000;
  const max = 60 * 60 * 1000; // 1h
  const raw = Math.min(max, base * 2 ** attempt);
  const jitter = raw * 0.25 * (Math.random() * 2 - 1);
  return Math.max(500, Math.round(raw + jitter));
}

/**
 * Job runner — pętla worker'a. Wykonuje fn dla zadań danego kindu.
 * Wywoływany w długim background procesie (lub w cronie który robi 1 iterację).
 */
export async function runWorker<TPayload = Record<string, unknown>>(args: {
  workerId: string;
  kinds: JobKind[];
  handler: (job: JobRecord & { payload: TPayload }) => Promise<void>;
  maxIterations?: number;
  pollIntervalMs?: number;
  signal?: AbortSignal;
}): Promise<{ processed: number }> {
  let processed = 0;
  const max = args.maxIterations ?? Number.POSITIVE_INFINITY;
  const poll = args.pollIntervalMs ?? 1000;

  while (processed < max && !args.signal?.aborted) {
    const job = await claimNextJob({ workerId: args.workerId, kinds: args.kinds });
    if (!job) {
      await new Promise((r) => setTimeout(r, poll));
      continue;
    }
    const heartbeat = setInterval(() => {
      void heartbeatJob(job.id, args.workerId).catch(() => undefined);
    }, 20_000);
    try {
      await args.handler(job as JobRecord & { payload: TPayload });
      await completeJob(job.id, args.workerId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await failJob({ id: job.id, workerId: args.workerId, errorMessage: msg, retry: true }).catch(() => undefined);
    } finally {
      clearInterval(heartbeat);
    }
    processed++;
  }
  return { processed };
}
