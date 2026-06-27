import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { restoreDocumentVersion } from "@/lib/documents/versioning";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; versionId: string }> }) {
  const { id, versionId } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const { data: docRaw } = await sb
    .from("documents")
    .select("id, case_id, cases!inner(user_id)")
    .eq("id", id)
    .maybeSingle();
  // Embedded-join (cases!inner) nie jest wnioskowany przez typed-select —
  // modelujemy wynik jednym lokalnym, jawnym castem na granicy.
  const doc = docRaw as unknown as
    | { id: string; case_id: string; cases: { user_id: string } | null }
    | null;
  if (!doc || doc.cases?.user_id !== auth.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  try {
    const restored = await restoreDocumentVersion({
      caseId: doc.case_id,
      sourceVersionId: versionId,
      createdBy: auth.user.id,
    });
    return NextResponse.json({ ok: true, version: restored });
  } catch (err) {
    logger.error("documents.restore_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "restore_failed" }, { status: 500 });
  }
}
