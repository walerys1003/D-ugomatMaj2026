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
import { requireFullAdmin } from "@/lib/admin/rbac";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; versionId: string }> },
) {
  const admin = await requireFullAdmin();
  const { id, versionId } = await ctx.params;
  const sb = await createServerSupabase();

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
      promoted_by: admin.user_id ?? admin.email ?? "admin",
    })
    .eq("id", versionId);

  if (updErr) {
    return NextResponse.json({ error: "update_failed", detail: updErr.message }, { status: 500 });
  }

  // Audit log
  await sb.from("audit_events").insert({
    event_type: "ai_prompt_version_promoted",
    actor_id: admin.user_id ?? null,
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
}
