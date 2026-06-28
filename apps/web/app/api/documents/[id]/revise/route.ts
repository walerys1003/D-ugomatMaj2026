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

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
  if (!instruction) return NextResponse.json({ error: "instruction_required" }, { status: 400 });
  if (instruction.length > 2000) return NextResponse.json({ error: "instruction_too_long" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  // Audyt 2026-06-27 (iter. 11): poprzednio embedded join selektował
  // NIEISTNIEJĄCE kolumny `cases.case_type` i `cases.facts`. Tabela cases ma
  // `type` (case_type) i `metadata` (jsonb). Query zawsze błędował => endpoint
  // revise ZAWSZE zwracał 404. `as any` to maskował.
  // Embedded join nie jest inferowany przez typed-select — modelujemy wynik
  // jednym lokalnym, typowanym castem.
  const { data: docRaw } = await supabase
    .from("documents")
    .select("id, case_id, content_markdown, cases!inner(user_id, type, metadata)")
    .eq("id", id)
    .maybeSingle();
  const doc = docRaw as {
    id: string;
    case_id: string;
    content_markdown: string | null;
    cases: { user_id: string; type: string; metadata: Record<string, unknown> | null } | null;
  } | null;
  if (!doc || doc.cases?.user_id !== auth.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Idempotency
  const idemKey = parseIdempotencyHeader(req.headers.get("idempotency-key"));
  const idemScope = `documents.revise:${id}`;
  // Audyt 2026-06-27 (iter. 11): poprzednio `reservationId` brano z
  // `(lookup as any).reservation_id`, którego IdempotencyLookup NIE ZAWIERA —
  // zawsze było null => completeIdempotency/abortIdempotency NIGDY się nie
  // wykonywały (rekordy in_progress wisiały do TTL, wynik nigdy nie zapisany).
  // reserveIdempotency zwraca { hit:false } gdy rezerwacja się powiodła — to
  // jest sygnał "posiadamy rezerwację". `as any` to maskował.
  let reserved = false;
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
    // miss (hit === false) => rezerwacja należy do nas.
    reserved = true;
  }

  try {
    const result = await runRevision({
      documentId: id,
      caseId: doc.case_id,
      userId: auth.user.id,
      currentMarkdown: doc.content_markdown ?? "",
      instruction,
      caseType: doc.cases?.type,
      caseFacts: doc.cases?.metadata ?? {},
    });
    if (idemKey && reserved) {
      await completeIdempotency(
        { scope: idemScope, key: idemKey, user_id: auth.user.id },
        result,
        200,
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    if (idemKey && reserved) {
      await abortIdempotency({ scope: idemScope, key: idemKey, user_id: auth.user.id });
    }
    logger.error("documents.revise_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "revise_failed" }, { status: 500 });
  }
}
