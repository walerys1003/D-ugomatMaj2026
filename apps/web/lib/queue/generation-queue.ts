/**
 * Generation queue with priorities + async background generation — zad. 339, 340
 *
 * Lightweight job queue backed by `generation_jobs` table.
 * Priorities: critical > high > normal > low (FIFO within priority).
 * Workers claim jobs via SKIP LOCKED RPC.
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export type JobPriority = "critical" | "high" | "normal" | "low";
export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

const PRIORITY_RANK: Record<JobPriority, number> = { critical: 100, high: 75, normal: 50, low: 25 };

export interface GenerationJob {
  id: string;
  user_id: string;
  case_id: string;
  kind: "generation" | "revision" | "polish" | "summary" | "ocr";
  priority: JobPriority;
  priority_rank: number;
  status: JobStatus;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
  result?: Record<string, unknown>;
  error?: string;
  created_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  worker_id?: string;
}

export interface EnqueueInput {
  user_id: string;
  case_id: string;
  kind: GenerationJob["kind"];
  priority?: JobPriority;
  payload: Record<string, unknown>;
  /** Delay in seconds before job becomes eligible. */
  delay_seconds?: number;
  max_attempts?: number;
}

export async function enqueueGenerationJob(
  input: EnqueueInput,
): Promise<{ ok: true; job_id: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  const priority = input.priority ?? "normal";
  const scheduled_at = input.delay_seconds
    ? new Date(Date.now() + input.delay_seconds * 1000).toISOString()
    : new Date().toISOString();

  // Idempotency: skip duplicate queued jobs for same case+kind+priority
  if (input.kind === "generation") {
    const { data: existing } = await supabase
      .from("generation_jobs")
      .select("id")
      .eq("case_id", input.case_id)
      .eq("kind", input.kind)
      .in("status", ["queued", "running"])
      .maybeSingle();
    if (existing?.id) {
      return { ok: true, job_id: existing.id };
    }
  }

  const { data, error } = await supabase
    .from("generation_jobs")
    .insert({
      user_id: input.user_id,
      case_id: input.case_id,
      kind: input.kind,
      priority,
      priority_rank: PRIORITY_RANK[priority],
      status: "queued",
      payload: input.payload,
      attempts: 0,
      max_attempts: input.max_attempts ?? 3,
      scheduled_at,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "enqueue_failed" };
  return { ok: true, job_id: data.id };
}

export interface ClaimedJob extends GenerationJob {}

export async function claimNextJob(workerId: string): Promise<ClaimedJob | null> {
  const supabase = getSupabaseAdmin();
  // Use RPC if available, else fallback to a 2-step claim
  try {
    const { data } = await supabase.rpc("claim_next_generation_job", { p_worker_id: workerId });
    if (data && Array.isArray(data) && data[0]) return data[0] as ClaimedJob;
    if (data && !Array.isArray(data) && (data as any).id) return data as ClaimedJob;
  } catch (err) {
    logger.debug("queue.rpc_unavailable_fallback", { error: (err as Error).message });
  }
  // Fallback (race-prone, ok for low concurrency)
  const { data: candidate } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_at", new Date().toISOString())
    .order("priority_rank", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!candidate) return null;
  const { data: updated, error } = await supabase
    .from("generation_jobs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      worker_id: workerId,
      attempts: (candidate.attempts ?? 0) + 1,
    })
    .eq("id", candidate.id)
    .eq("status", "queued") // optimistic lock
    .select("*")
    .single();
  if (error) return null;
  return updated as ClaimedJob;
}

export async function completeJob(jobId: string, result: Record<string, unknown>): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("generation_jobs")
    .update({ status: "completed", completed_at: new Date().toISOString(), result })
    .eq("id", jobId);
}

export async function failJob(jobId: string, error: string, retry = true): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("generation_jobs")
    .select("attempts, max_attempts")
    .eq("id", jobId)
    .maybeSingle();
  if (!data) return;
  const exhausted = !retry || (data.attempts ?? 0) >= (data.max_attempts ?? 3);
  if (exhausted) {
    await supabase
      .from("generation_jobs")
      .update({ status: "failed", completed_at: new Date().toISOString(), error })
      .eq("id", jobId);
  } else {
    // re-queue with exponential backoff
    const backoffSec = Math.min(60 * Math.pow(2, data.attempts ?? 0), 3600);
    await supabase
      .from("generation_jobs")
      .update({
        status: "queued",
        scheduled_at: new Date(Date.now() + backoffSec * 1000).toISOString(),
        worker_id: null,
        error,
      })
      .eq("id", jobId);
  }
}

export async function cancelJob(userId: string, jobId: string): Promise<{ ok: boolean }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("generation_jobs")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("user_id", userId)
    .in("status", ["queued"]);
  return { ok: !error };
}

export async function getJob(jobId: string, userId: string): Promise<GenerationJob | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as GenerationJob | null) ?? null;
}

export async function listUserJobs(userId: string, opts?: { status?: JobStatus; limit?: number }): Promise<GenerationJob[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("generation_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 50);
  if (opts?.status) q = q.eq("status", opts.status);
  const { data } = await q;
  return (data as GenerationJob[]) ?? [];
}
