/**
 * Tier 28 — OAuth provider management.
 * DELETE /api/integrations/oauth/[provider] — rozłącz integrację
 * GET    /api/integrations/oauth/[provider] — status połączenia
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_PROVIDERS = ["google", "microsoft", "slack", "notion"] as const;

export async function GET(_req: NextRequest, ctx: { params: { provider: string } }) {
  const provider = ctx.params.provider;
  if (!ALLOWED_PROVIDERS.includes(provider as any)) {
    return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  }

  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await sb
    .from("oauth_credentials")
    .select("provider, scope, expires_at, created_at")
    .eq("user_id", user.id)
    .eq("provider", provider)
    .maybeSingle();

  return NextResponse.json({ provider, connected: !!data, credential: data ?? null });
}

export async function DELETE(_req: NextRequest, ctx: { params: { provider: string } }) {
  const provider = ctx.params.provider;
  if (!ALLOWED_PROVIDERS.includes(provider as any)) {
    return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  }

  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await sb
    .from("oauth_credentials")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", provider);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  try {
    await sb.from("security_events").insert({
      user_id: user.id,
      type: "oauth.disconnected",
      metadata: { provider },
    });
  } catch {
    /* tolerable */
  }

  return NextResponse.json({ ok: true });
}
