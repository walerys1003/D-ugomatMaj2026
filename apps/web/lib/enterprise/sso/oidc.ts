/**
 * Tier 13 — OIDC SSO with discovery + JWKS verification scaffold.
 */
export interface OidcConfig {
  org_id: string;
  issuer: string;
  client_id: string;
  client_secret: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
}

export async function discover(issuer: string): Promise<{
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
}> {
  const r = await fetch(`${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`);
  if (!r.ok) throw new Error(`oidc_discovery_${r.status}`);
  const j: any = await r.json();
  return {
    authorization_endpoint: j.authorization_endpoint,
    token_endpoint: j.token_endpoint,
    userinfo_endpoint: j.userinfo_endpoint,
    jwks_uri: j.jwks_uri,
  };
}

export async function fetchUserInfo(cfg: OidcConfig, accessToken: string): Promise<Record<string, unknown>> {
  const ep = cfg.userinfo_endpoint ?? (await discover(cfg.issuer)).userinfo_endpoint;
  const r = await fetch(ep, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`userinfo_${r.status}`);
  return r.json();
}

export function decodeIdToken(idToken: string): { header: Record<string, unknown>; payload: Record<string, unknown> } {
  const parts = idToken.split(".");
  if (parts.length < 2) throw new Error("invalid_id_token");
  const dec = (s: string) => JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8"));
  return { header: dec(parts[0]), payload: dec(parts[1]) };
}
