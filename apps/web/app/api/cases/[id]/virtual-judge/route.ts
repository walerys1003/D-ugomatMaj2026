import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { runVirtualJudge } from "@/lib/ai/virtual-judge";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, user_id, case_type, facts")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const result = await runVirtualJudge({
      case_type: caseRow.case_type,
      case_facts: caseRow.facts ?? "",
      user_document_markdown: body.document_markdown,
      opposing_party: body.opposing_party,
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("virtual_judge.api_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
