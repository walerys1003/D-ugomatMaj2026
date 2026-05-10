import { NextRequest, NextResponse } from "next/server";
import { OAUTH_PROVIDERS, exchangeCode, OAuthProviderId } from "@/lib/integrations/oauth/oauth-providers";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: { provider: string } }) {
  const cfg = OAUTH_PROVIDERS[ctx.params.provider as OAuthProviderId];
  if (!cfg) return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("oauth_state")?.value;
  if (!code || !state || state !== cookieState) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }
  const base = new URL(req.url).origin;
  const tokens = await exchangeCode(cfg, { code, baseUrl: base });
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  await sb.from("oauth_credentials").upsert(
    {
      user_id: user.id,
      provider: cfg.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      scope: cfg.scopes.join(" "),
      raw: tokens.raw,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );
  return NextResponse.redirect(`${base}/panel/integracje?connected=${cfg.id}`);
}
