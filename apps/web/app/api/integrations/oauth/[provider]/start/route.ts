import { NextRequest, NextResponse } from "next/server";
import { OAUTH_PROVIDERS, buildAuthorizeUrl, OAuthProviderId } from "@/lib/integrations/oauth/oauth-providers";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: { provider: string } }) {
  const cfg = OAUTH_PROVIDERS[ctx.params.provider as OAuthProviderId];
  if (!cfg) return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  const state = randomUUID();
  const base = new URL(req.url).origin;
  const url = buildAuthorizeUrl(cfg, { state, baseUrl: base });
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600 });
  return res;
}
