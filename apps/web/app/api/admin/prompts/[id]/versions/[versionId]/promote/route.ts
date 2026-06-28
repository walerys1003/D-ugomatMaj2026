/**
 * Tier 33-4 — Promote AI prompt version to production.
 *
 * POST /api/admin/prompts/[id]/versions/[versionId]/promote
 *
 * Transakcyjnie:
 *  1. Sprawdź uprawnienia (requireFullAdmin)
 *  2. Stara wersja `production` → `deprecated`
 *  3. Nowa wersja → `production` + zapisz `promoted_at` + `promoted_by`
 *  4. Wpisz audit-log (`audit_events`)
 *  5. Redirect z powrotem na stronę wersji
 */
import { NextResponse } from "next/server";
import { requireFullAdmin, AdminAccessDeniedError } from "@/lib/admin/rbac";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; versionId: string }> },
) {
  // Audyt 2026-06-28: poprzednio `requireFullAdmin()` było wywoływane, ale
  // wynik NIE był sprawdzany w gate'cie. Bezpieczeństwo było zachowane
  // (funkcja rzuca AdminAccessDeniedError dla nie-adminów), lecz nieuprawnione
  // żądanie kończyło się surowym 500 z nieobsłużonym throw zamiast czystego
  // 403. Owijamy w try/catch i zwracamy poprawny kod statusu.
  let admin: Awaited<ReturnType<typeof requireFullAdmin>>;
  try {
    admin = await requireFullAdmin();
  } catch (err) {
    if (err instanceof AdminAccessDeniedError) {
      return NextResponse.json({ error: "forbidden", message: err.message }, { status: 403 });
    }
    logger.error("admin.prompts.promote_auth_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "auth_error" }, { status: 500 });
  }

  const { id, versionId } = await ctx.params;
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();

  try {
    // Pobierz nową wersję
    const { data: newVersion, error: fetchErr } = await sb
      .from("ai_prompt_versions")
      .select("id, prompt_id, version, status")
      .eq("id", versionId)
      .eq("prompt_id", id)
      .maybeSingle();

    if (fetchErr || !newVersion) {
      return NextResponse.json({ error: "version_not_found" }, { status: 404 });
    }
    if (newVersion.status === "production") {
      return NextResponse.json({ error: "already_production" }, { status: 409 });
    }

    // Stare wersje prod → deprecated
    await sb
      .from("ai_prompt_versions")
      .update({ status: "deprecated" })
      .eq("prompt_id", id)
      .eq("status", "production");

    // Nowa wersja → production
    const nowIso = new Date().toISOString();
    const { error: updErr } = await sb
      .from("ai_prompt_versions")
      .update({
        status: "production",
        promoted_at: nowIso,
        promoted_by: admin.userId ?? admin.email ?? "admin",
      })
      .eq("id", versionId);

    if (updErr) {
      return NextResponse.json({ error: "update_failed", detail: updErr.message }, { status: 500 });
    }

    // Audit log
    await sb.from("audit_events").insert({
      event_type: "ai_prompt_version_promoted",
      actor_id: admin.userId ?? null,
      actor_email: admin.email ?? null,
      target_type: "ai_prompt_version",
      target_id: versionId,
      metadata: {
        prompt_id: id,
        version: newVersion.version,
      },
      created_at: nowIso,
    });

    // Browser form-submit → redirect
    const url = new URL(req.url);
    const back = `${url.origin}/admin/prompts/${id}/versions`;
    return NextResponse.redirect(back, { status: 303 });
  } catch (err) {
    logger.error("admin.prompts.promote_failed", {
      promptId: id,
      versionId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "promote_failed" }, { status: 500 });
  }
}
