import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { runRevision } from "@/lib/ai/multi-turn-revision";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";
import { parseIdempotencyHeader, reserveIdempotency, completeIdempotency, abortIdempotency } from "@/lib/observability/idempotency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
  if (!instruction) return NextResponse.json({ error: "instruction_required" }, { status: 400 });
  if (instruction.length > 2000) return NextResponse.json({ error: "instruction_too_long" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: doc } = await sb
    .from("documents")
    .select("id, case_id, content_markdown, cases!inner(user_id, case_type, facts)")
    .eq("id", id)
    .maybeSingle();
  if (!doc || (doc as any).cases?.user_id !== auth.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Idempotency
  const idemKey = parseIdempotencyHeader(req.headers.get("idempotency-key"));
  const idemScope = `documents.revise:${id}`;
  let reservationId: string | null = null;
  if (idemKey) {
    const lookup = await reserveIdempotency<{ document_id: string; version_id: string }>({
      scope: idemScope,
      key: idemKey,
      user_id: auth.user.id,
    });
    if (lookup.hit && lookup.status === "completed" && lookup.result) {
      return NextResponse.json(lookup.result, {
        status: lookup.http_status ?? 200,
        headers: { "X-Idempotent-Replay": "true" },
      });
    }
    if (lookup.hit && lookup.status === "in_progress") {
      return NextResponse.json({ error: "idempotency_in_progress" }, { status: 409, headers: { "Retry-After": "5" } });
    }
    reservationId = (lookup as any).reservation_id ?? null;
  }

  try {
    const result = await runRevision({
      document_id: id,
      case_id: (doc as any).case_id,
      user_id: auth.user.id,
      previous_markdown: (doc as any).content_markdown ?? "",
      instruction,
      case_type: (doc as any).cases?.case_type,
      case_facts: (doc as any).cases?.facts,
    });
    if (idemKey && reservationId) {
      await completeIdempotency({ scope: idemScope, key: idemKey, user_id: auth.user.id, result, http_status: 200 });
    }
    return NextResponse.json(result);
  } catch (err) {
    if (idemKey && reservationId) {
      await abortIdempotency({ scope: idemScope, key: idemKey, user_id: auth.user.id });
    }
    logger.error("documents.revise_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "revise_failed" }, { status: 500 });
  }
}
