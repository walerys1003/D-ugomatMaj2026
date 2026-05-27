import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { calculateWinProbability } from "@/lib/ai/win-probability";

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
    .select("id, user_id, case_type, facts, answers, created_at, deadline_at, amount, creditor_type, documents_count")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  const result = calculateWinProbability({
    caseType: caseRow.case_type,
    answers: caseRow.answers ?? {},
    caseFacts: caseRow.facts ?? {},
  });
  return NextResponse.json(result);
}
