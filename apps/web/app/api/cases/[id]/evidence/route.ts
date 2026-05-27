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

  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: caseRow } = await sb
    .from("cases")
    .select("id, user_id, case_type")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  const { data: uploadedDocs } = await sb
    .from("evidence_uploads")
    .select("evidence_id")
    .eq("case_id", id);
  const uploaded = (uploadedDocs ?? []).map((u) => ({ id: u.evidence_id }));

  const requests = getEvidenceRequests(caseRow.case_type);
  const progress = summarizeEvidenceProgress(caseRow.case_type, uploaded);
  return NextResponse.json({ requests, progress, uploaded_ids: uploaded.map((u) => u.id) });
}
