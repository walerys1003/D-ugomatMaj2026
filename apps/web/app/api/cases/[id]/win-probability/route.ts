import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { calculateWinProbability } from "@/lib/ai/win-probability";
import type { Json } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Audyt 2026-06-27 (iter. 35): tabela `cases` jest dotypowana — usuwamy
  // `as any`. REALNE BUGI ujawnione przez typy:
  //  • kolumna `case_type` NIE ISTNIEJE — prawidłowa to `type`;
  //  • kolumny `facts`, `answers`, `deadline_at`, `amount`, `creditor_type`,
  //    `documents_count` NIE ISTNIEJĄ — odpowiedzi kreatora trzymane są
  //    w `wizard_state.answers`, a dane sprawy w `metadata`. Wcześniej `as any`
  //    maskował te zapytania → PostgREST zwracał błąd "column does not exist".
  const sb = getSupabaseAdmin();
  const { data: caseRow } = await sb
    .from("cases")
    .select("id, user_id, type, metadata, wizard_state, created_at")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "case_not_found" }, { status: 404 });

  const answers = (caseRow.wizard_state?.answers ?? {}) as Record<string, Json>;
  const caseFacts = (caseRow.metadata ?? {}) as Record<string, unknown>;
  const result = calculateWinProbability({
    caseType: caseRow.type,
    answers,
    caseFacts,
  });
  return NextResponse.json(result);
}
