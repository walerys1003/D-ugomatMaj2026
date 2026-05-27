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

  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error, count } = await sb
    .from("cases")
    .select("id, case_type, title, status, created_at, updated_at", { count: "exact" })
    .eq("organization_id", verified.key.organization_id)
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

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.case_type) return NextResponse.json({ error: "case_type_required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("cases")
    .insert({
      organization_id: verified.key.organization_id,
      case_type: body.case_type,
      title: body.title ?? null,
      facts: body.facts ?? null,
      answers: body.answers ?? {},
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
