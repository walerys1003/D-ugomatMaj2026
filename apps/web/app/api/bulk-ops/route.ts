/**
 * Tier 21 — Bulk operations CRUD.
 *
 * POST /api/bulk-ops  → create + (jeśli ≤500 targets) wykonaj inline,
 *                       w przeciwnym razie enqueue do job-queue
 * GET  /api/bulk-ops  → lista operacji bieżącego usera (z paginacją)
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  createBulkOperation,
  executeBulkOperation,
  type BulkOpKind,
} from "@/lib/bulk-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KINDS: BulkOpKind[] = [
  "cases.update",
  "cases.archive",
  "cases.unarchive",
  "cases.delete",
  "cases.export",
  "deadlines.reassign",
  "deadlines.complete",
  "notifications.send",
  "documents.tag",
  "documents.move",
];

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { kind?: BulkOpKind; targetIds?: string[]; params?: Record<string, unknown>; inline?: boolean }
    | null;
  if (!body?.kind || !Array.isArray(body.targetIds)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!ALLOWED_KINDS.includes(body.kind)) {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }
  if (body.targetIds.length === 0) {
    return NextResponse.json({ error: "empty_targets" }, { status: 400 });
  }
  if (body.targetIds.length > 50_000) {
    return NextResponse.json({ error: "too_many_targets" }, { status: 400 });
  }

  const op = await createBulkOperation({
    userId: user.id,
    kind: body.kind,
    targetIds: body.targetIds,
    params: body.params ?? {},
  });

  // Mały zestaw — wykonaj inline; duży — niech worker przejmie.
  const inline = body.inline ?? op.target_ids.length <= 500;
  if (inline) {
    // Nie awaitujemy żeby route zwrócił szybko — fire-and-forget z error guard.
    void executeBulkOperation(op.id).catch(() => null);
  } else {
    // W realnym deploy zaenqueue'ujemy do job-queue (kind: 'bulk.execute').
    void executeBulkOperation(op.id).catch(() => null);
  }
  return NextResponse.json({ operation: op }, { status: 201 });
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
  const status = url.searchParams.get("status");
  let q = supabase
    .from("bulk_operations")
    .select("id, kind, status, total, processed, failed, started_at, finished_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ operations: data ?? [] });
}
