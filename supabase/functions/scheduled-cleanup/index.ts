/**
 * Wave 9 / W9-2 — Supabase Edge Function: scheduled-cleanup
 *
 * Daily housekeeping for ephemeral / retention-bound data:
 *
 *   1. `idempotency_records` older than 24 hours
 *   2. `webhook_deliveries` with `status='delivered'` older than 30 days
 *   3. `analytics_events` older than 90 days (PII-light raw events;
 *      aggregations preserved in `metric_snapshots`)
 *   4. `rate_limit_log` rows older than 24 hours
 *   5. `webauthn_challenges` not consumed within 10 minutes
 *   6. `impersonation_sessions` expired (`expires_at < now()`)
 *   7. `email_queue` rows successfully sent more than 7 days ago
 *
 * Triggered daily at 03:15 UTC via Supabase Cron:
 *
 *   select cron.schedule(
 *     'scheduled-cleanup-daily',
 *     '15 3 * * *',
 *     $$
 *       select net.http_post(
 *         url := 'https://<project-ref>.functions.supabase.co/scheduled-cleanup',
 *         headers := jsonb_build_object(
 *           'Authorization', 'Bearer ' || current_setting('app.cron_secret')
 *         )
 *       );
 *     $$
 *   );
 *
 * Returns JSON summary of deletion counts for each table.
 *
 * Tolerant: any individual table cleanup that fails (e.g. table doesn't
 * exist in the current schema) is logged but does NOT abort the run.
 */

// @ts-ignore — Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface CleanupTask {
  name: string;
  table: string;
  column: string;
  /** ISO timestamp cutoff — rows where `column < cutoff` are deleted. */
  ageMinutes: number;
  /** Optional extra filter (only deletes rows matching this status). */
  extraFilter?: { col: string; eq: string };
}

const TASKS: CleanupTask[] = [
  { name: "idempotency_records",     table: "idempotency_records",     column: "created_at",   ageMinutes: 24 * 60 },
  { name: "webhook_deliveries_old",  table: "webhook_deliveries",      column: "delivered_at", ageMinutes: 30 * 24 * 60, extraFilter: { col: "status", eq: "delivered" } },
  { name: "analytics_events_old",    table: "analytics_events",        column: "occurred_at",  ageMinutes: 90 * 24 * 60 },
  { name: "rate_limit_log_old",      table: "rate_limit_log",          column: "created_at",   ageMinutes: 24 * 60 },
  { name: "webauthn_challenges_old", table: "webauthn_challenges",     column: "created_at",   ageMinutes: 10 },
  { name: "impersonation_expired",   table: "impersonation_sessions",  column: "expires_at",   ageMinutes: 0 },
  { name: "email_queue_sent_old",    table: "email_queue",             column: "sent_at",      ageMinutes: 7 * 24 * 60,  extraFilter: { col: "status", eq: "sent" } },
];

function authorize(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return false;
  const token = auth.slice(7).trim();
  return token === CRON_SECRET || token === SERVICE_KEY;
}

Deno.serve(async (req: Request) => {
  if (!authorize(req)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const results: Record<string, { deleted: number | null; error?: string }> = {};
  const startedAt = Date.now();

  for (const task of TASKS) {
    const cutoff = new Date(Date.now() - task.ageMinutes * 60_000).toISOString();
    try {
      // Build delete query. We use `.lt()` for "older than cutoff".
      let q = sb.from(task.table).delete({ count: "exact" }).lt(task.column, cutoff);
      if (task.extraFilter) {
        // @ts-ignore — chainable
        q = q.eq(task.extraFilter.col, task.extraFilter.eq);
      }
      const { error, count } = await q;
      if (error) {
        results[task.name] = { deleted: null, error: error.message };
      } else {
        results[task.name] = { deleted: count ?? 0 };
      }
    } catch (e: unknown) {
      results[task.name] = { deleted: null, error: (e as Error).message };
    }
  }

  const totalDeleted = Object.values(results).reduce(
    (acc, r) => acc + (r.deleted ?? 0),
    0,
  );
  const durationMs = Date.now() - startedAt;

  // Best-effort: write summary to a hypothetical cleanup_runs table.
  try {
    await sb.from("scheduled_cleanup_runs").insert({
      run_at: new Date().toISOString(),
      duration_ms: durationMs,
      total_deleted: totalDeleted,
      details: results,
    } as never);
  } catch {
    // Table may not exist — silent.
  }

  return new Response(
    JSON.stringify({
      ok: true,
      duration_ms: durationMs,
      total_deleted: totalDeleted,
      details: results,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "content-type": "application/json" } },
  );
});
