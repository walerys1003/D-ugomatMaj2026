/**
 * Tier 34-5 — GDPR export v2 endpoint (streamed ZIP).
 *
 * POST /api/gdpr/export-v2
 *   Body: nic. Wymaga zalogowanego usera.
 *   Odp: 202 Accepted + job_id (export uruchamiany asynchronicznie).
 *
 * GET /api/gdpr/export-v2?job_id=...
 *   Sprawdza status; jeśli ready → 200 z signed URL do ZIP-a w storage.
 *
 * Rate limit: 1 eksport / 24h / user (art. 12 ust. 5 RODO — żądania nieuzasadnione/nadmierne).
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_HOURS = 24;

export async function POST(_req: Request) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = auth.user.id;

  // Cooldown — last successful export < 24h?
  const since = new Date(Date.now() - COOLDOWN_HOURS * 3600_000).toISOString();
  const { count } = await sb
    .from("gdpr_export_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", since);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "cooldown_active", message: `Możesz pobrać dane raz na ${COOLDOWN_HOURS}h.` },
      { status: 429 },
    );
  }

  // Enqueue job — worker (cron lub edge func) wywoła buildExportContent + spakuje ZIP
  const { data: job, error } = await sb
    .from("gdpr_export_jobs")
    .insert({
      user_id: userId,
      status: "queued",
      schema_version: "2.0.0",
      requested_at: new Date().toISOString(),
    })
    .select("id, status")
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "enqueue_failed" }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, job_id: job.id, status: job.status, eta_minutes: 5 },
    { status: 202 },
  );
}

export async function GET(req: Request) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id");
  if (!jobId) return NextResponse.json({ error: "missing_job_id" }, { status: 400 });

  const { data: job, error } = await sb
    .from("gdpr_export_jobs")
    .select("id, status, file_path, completed_at, error_message")
    .eq("id", jobId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error || !job) return NextResponse.json({ error: "job_not_found" }, { status: 404 });

  if (job.status !== "completed") {
    return NextResponse.json({ ok: true, status: job.status });
  }

  // Wygeneruj signed URL ważny 15 min
  const { data: signed } = await sb.storage
    .from("gdpr-exports")
    .createSignedUrl(job.file_path as string, 900);

  return NextResponse.json({
    ok: true,
    status: "completed",
    completed_at: job.completed_at,
    download_url: signed?.signedUrl ?? null,
    expires_in_seconds: 900,
  });
}
