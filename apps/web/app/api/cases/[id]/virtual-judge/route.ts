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

  // Audyt 2026-06-27 (iter. 35): tabela `cases` jest dotypowana — usuwamy
  // `as any`. REALNY BUG: kolumny `case_type` i `facts` NIE ISTNIEJĄ
  // (prawidłowo: `type`; fakty sprawy są w `metadata`). Zapytanie wcześniej
  // padało w runtime, maskowane przez `as any`.
  const sb = getSupabaseAdmin();
  const { data: caseRow } = await sb
    .from("cases")
    .select("id, user_id, type, metadata")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  let body: {
    document_markdown?: string;
    opposing_party?: "konsument" | "przedsiebiorca" | "bank" | "windykator" | "skarb_panstwa" | "inny";
  } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const result = await runVirtualJudge({
      case_type: caseRow.type,
      case_facts: typeof caseRow.metadata === "string"
        ? caseRow.metadata
        : JSON.stringify(caseRow.metadata ?? {}),
      user_document_markdown: body.document_markdown,
      opposing_party: body.opposing_party,
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("virtual_judge.api_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
