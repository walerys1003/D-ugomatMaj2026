/**
 * Tier 21 — Bulk operation single — get status + cancel.
 *
 * GET    /api/bulk-ops/[id]  → status / progress / errors
 * DELETE /api/bulk-ops/[id]  → cancel (jeśli pending/running)
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getBulkOperation, cancelBulkOperation } from "@/lib/bulk-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const op = await getBulkOperation(params.id, user.id);
  if (!op) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ operation: op });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await cancelBulkOperation(params.id, user.id);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "cancel_failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
