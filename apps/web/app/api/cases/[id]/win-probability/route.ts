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
  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, user_id, case_type, facts, answers, created_at, deadline_at, amount, creditor_type, documents_count")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  const result = calculateWinProbability({
    case_type: caseRow.case_type,
    deadline_at: caseRow.deadline_at,
    documents_count: caseRow.documents_count ?? 0,
    facts: caseRow.facts,
    answers: caseRow.answers,
    amount: caseRow.amount,
    creditor_type: caseRow.creditor_type,
  });
  return NextResponse.json(result);
}
