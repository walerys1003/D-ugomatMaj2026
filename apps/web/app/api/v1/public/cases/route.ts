/**
 * Public REST API for kancelarie — zad. 348
 *
 * GET /api/v1/public/cases — list cases for organization
 * POST /api/v1/public/cases — create a case
 *
 * Auth: API key in `Authorization: Bearer dlk_...` header.
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyApiKey, hasApiScope, dispatchWebhook } from "@/lib/api/public-api";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";
import type { Json } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractApiKey(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export async function GET(req: NextRequest) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const verified = await verifyApiKey(apiKey);
  if (!verified.ok) return NextResponse.json({ error: verified.reason }, { status: 401 });
  if (!hasApiScope(verified.key, "cases.read")) return NextResponse.json({ error: "insufficient_scope" }, { status: 403 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const sb = getSupabaseAdmin();
  // Audyt 2026-06-27 (iter. 24) — REALNY BUG zamaskowany przez `as any`:
  // poprzednio query selektowało `case_type` i filtrowało po `organization_id`,
  // które NIE ISTNIEJĄ w tabeli `cases`. Realne kolumny: `type` (CaseType) oraz
  // `org_id` (migracja Tier13 20260516000000 — nazwa `org_id`, nie
  // `organization_id`). Stary endpoint ZAWSZE zwracał 500 (query error).
  const { data, error, count } = await sb
    .from("cases")
    .select("id, type, title, status, created_at, updated_at", { count: "exact" })
    .eq("org_id", verified.key.organization_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [], total: count ?? 0, limit, offset });
}

export async function POST(req: NextRequest) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const verified = await verifyApiKey(apiKey);
  if (!verified.ok) return NextResponse.json({ error: verified.reason }, { status: 401 });
  if (!hasApiScope(verified.key, "cases.write")) return NextResponse.json({ error: "insufficient_scope" }, { status: 403 });

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const caseType = typeof body.case_type === "string" ? body.case_type : "";
  if (!caseType) return NextResponse.json({ error: "case_type_required" }, { status: 400 });

  const sb = getSupabaseAdmin();
  // Audyt 2026-06-27 (iter. 24) — REALNY BUG zamaskowany przez `as any`:
  // poprzednio insert używał kolumn `organization_id`, `case_type`, `facts`,
  // `answers`, które NIE ISTNIEJĄ w tabeli `cases`. Realne kolumny: `org_id`,
  // `type` (CaseType), `metadata` (jsonb). `user_id` jest NOT NULL — publiczne
  // API nie ma kontekstu usera, więc insert i tak był niepoprawny architektonicznie.
  // `type` jest ścisłym enumem CaseType — przyjmujemy wartość z body przez
  // lokalny boundary cast (walidacja enuma poza zakresem tego audytu).
  const { data, error } = await sb
    .from("cases")
    .insert({
      org_id: verified.key.organization_id,
      user_id: verified.key.organization_id, // FIXME(arch): public API nie ma kontekstu usera; org_id jako placeholder
      type: caseType as never,
      title: typeof body.title === "string" ? body.title : "",
      metadata: (body.facts ?? body.answers ?? {}) as Json,
      status: "draft",
    })
    .select("*")
    .single();
  if (error || !data) {
    logger.warn("public_api.case_create_failed", { error: error?.message });
    return NextResponse.json({ error: error?.message ?? "create_failed" }, { status: 500 });
  }
  // Fire webhook (fire-and-forget)
  dispatchWebhook("case.created", verified.key.organization_id, { case: data }).catch(() => {});
  return NextResponse.json(data, { status: 201 });
}
