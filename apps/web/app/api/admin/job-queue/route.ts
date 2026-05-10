/**
 * Tier 20 — Admin job queue API (BullMQ-style Postgres queue).
 *
 * GET    /api/admin/job-queue?kind=ocr.process  → queue depth (admin)
 * POST   /api/admin/job-queue                   → enqueue job (admin / service)
 * PATCH  /api/admin/job-queue                   → sweep stale heartbeats (cron-only)
 *
 * UWAGA: różne od `/api/jobs` które obsługuje generation-queue (legacy).
 * Ta trasa wystawia nowy uniwersalny job runner z `lib/jobs/queue/job-queue.ts`.
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { enqueueJob, queueDepth, sweepStaleJobs, type JobKind } from "@/lib/jobs/queue";

async function requireAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  return { ok: role === "admin", userId: user.id };
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const kind = (new URL(req.url).searchParams.get("kind") ?? undefined) as JobKind | undefined;
  const depth = await queueDepth(kind);
  return NextResponse.json({ depth });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as
    | {
        kind?: JobKind;
        payload?: Record<string, unknown>;
        priority?: number;
        maxAttempts?: number;
        runAfter?: string;
        idempotencyKey?: string;
      }
    | null;
  if (!body?.kind || !body?.payload) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const job = await enqueueJob({
    kind: body.kind,
    payload: body.payload,
    priority: body.priority,
    maxAttempts: body.maxAttempts,
    runAfter: body.runAfter ? new Date(body.runAfter) : undefined,
    idempotencyKey: body.idempotencyKey,
  });
  return NextResponse.json({ job }, { status: 201 });
}

export async function PATCH(req: Request) {
  const key = req.headers.get("x-cron-key");
  if (!key || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const recovered = await sweepStaleJobs();
  return NextResponse.json({ recovered });
}
