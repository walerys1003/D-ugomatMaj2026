/**
 * Tier 24 — Court e-filing API.
 *  POST /api/integrations/court           — create draft or one-shot submit
 *  GET  /api/integrations/court           — list user filings (?case_id, ?status)
 *  GET  /api/integrations/court?id=...    — get single filing
 *  PATCH /api/integrations/court?id=...   — refresh status from gateway
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  createDraft,
  submitFiling,
  submitOneShot,
  listFilings,
  getFiling,
  refreshStatus,
  COURT_SYSTEMS_META,
  type CourtFilingInput,
  type CourtFilingStatus,
} from "@/lib/integrations/court";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.system || !body?.court_code || !body?.pleading_type || !Array.isArray(body?.documents)) {
    return NextResponse.json(
      { error: "missing_fields", required: ["system", "court_code", "pleading_type", "documents"] },
      { status: 400 },
    );
  }

  const input: CourtFilingInput = {
    user_id: user.id,
    case_id: body.case_id,
    system: body.system,
    court_code: body.court_code,
    pleading_type: body.pleading_type,
    parties: body.parties ?? [],
    documents: body.documents,
    metadata: body.metadata,
    signed_envelope: body.signed_envelope,
  };

  const meta = COURT_SYSTEMS_META[input.system];
  if (!meta) return NextResponse.json({ error: "invalid_system" }, { status: 400 });
  const tooBig = input.documents.find((d) => {
    const bytes = Buffer.byteLength(d.content_base64, "base64");
    return bytes > meta.max_doc_mb * 1024 * 1024;
  });
  if (tooBig) {
    return NextResponse.json(
      { error: "document_too_large", filename: tooBig.filename, max_mb: meta.max_doc_mb },
      { status: 413 },
    );
  }

  try {
    if (body.mode === "draft") {
      const f = await createDraft(input);
      return NextResponse.json(f, { status: 201 });
    }
    if (body.mode === "submit" && body.filing_id) {
      const f = await submitFiling(body.filing_id, input);
      return NextResponse.json(f, { status: 200 });
    }
    // default: one-shot (draft + submit) with idempotency
    const f = await submitOneShot(input);
    return NextResponse.json(f, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "submit_failed", message: String(e) }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const f = await getFiling(id);
    if (!f || f.user_id !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(f);
  }

  const case_id = req.nextUrl.searchParams.get("case_id") ?? undefined;
  const status = (req.nextUrl.searchParams.get("status") as CourtFilingStatus) ?? undefined;
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const items = await listFilings({ user_id: user.id, case_id, status, limit });
  return NextResponse.json({ items, meta: COURT_SYSTEMS_META });
}

export async function PATCH(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const f = await getFiling(id);
  if (!f || f.user_id !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const updated = await refreshStatus(id);
  return NextResponse.json(updated);
}
