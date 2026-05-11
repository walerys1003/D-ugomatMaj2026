/**
 * Tier 28 — User profile API.
 * PATCH /api/profile  — aktualizuje profiles.full_name / phone / locale / marketing_opt_in
 * GET   /api/profile  — zwraca własny profil
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data } = await sb
    .from("profiles")
    .select("id, full_name, phone, locale, marketing_opt_in, role, created_at")
    .eq("id", user.id)
    .maybeSingle();
  return NextResponse.json({ profile: data ?? null, email: user.email });
}

export async function PATCH(req: NextRequest) {
  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if (typeof body.full_name === "string") update.full_name = body.full_name.slice(0, 120);
  if (typeof body.phone === "string") update.phone = body.phone.slice(0, 30);
  if (typeof body.locale === "string" && ["pl", "en", "uk", "cs", "ro"].includes(body.locale))
    update.locale = body.locale;
  if (typeof body.marketing_opt_in === "boolean") update.marketing_opt_in = body.marketing_opt_in;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  const { error } = await sb.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
