import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { getEvidenceRequests, summarizeEvidenceProgress } from "@/lib/ai/evidence-requests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Audyt 2026-06-27 (iter. 35): tabele `cases` i `evidence_uploads` są
  // dotypowane — usuwamy `as any`. REALNY BUG: kolumna `case_type` NIE ISTNIEJE
  // (prawidłowo: `type`). Wcześniej zapytanie padało w runtime.
  const sb = getSupabaseAdmin();
  const { data: caseRow } = await sb
    .from("cases")
    .select("id, user_id, type")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  const { data: uploadedDocs } = await sb
    .from("evidence_uploads")
    .select("evidence_id")
    .eq("case_id", id);
  const uploaded = (uploadedDocs ?? []).map((u) => ({ id: u.evidence_id }));

  const requests = getEvidenceRequests(caseRow.type);
  const progress = summarizeEvidenceProgress(caseRow.type, uploaded);
  return NextResponse.json({ requests, progress, uploaded_ids: uploaded.map((u) => u.id) });
}
