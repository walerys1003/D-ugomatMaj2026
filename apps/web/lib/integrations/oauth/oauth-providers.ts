/**
 * Tier 12 — Generic OAuth2 third-party connector registry.
 * Supports Google, Microsoft (Teams/Outlook), Slack, Notion.
 */
export type OAuthProviderId = "google" | "microsoft" | "slack" | "notion";

export interface OAuthProviderConfig {
  id: OAuthProviderId;
  display_name: string;
  authorize_url: string;
  token_url: string;
  client_id_env: string;
  client_secret_env: string;
  scopes: string[];
  redirect_uri_path: string;
}

export const OAUTH_PROVIDERS: Record<OAuthProviderId, OAuthProviderConfig> = {
  google: {
    id: "google",
    display_name: "Google",
    authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
    token_url: "https://oauth2.googleapis.com/token",
    client_id_env: "GOOGLE_CLIENT_ID",
    client_secret_env: "GOOGLE_CLIENT_SECRET",
    scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar.events"],
    redirect_uri_path: "/api/integrations/oauth/google/callback",
  },
  microsoft: {
    id: "microsoft",
    display_name: "Microsoft 365",
    authorize_url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token_url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    client_id_env: "MICROSOFT_CLIENT_ID",
    client_secret_env: "MICROSOFT_CLIENT_SECRET",
    scopes: ["openid", "email", "offline_access", "Calendars.ReadWrite", "Mail.Send"],
    redirect_uri_path: "/api/integrations/oauth/microsoft/callback",
  },
  slack: {
    id: "slack",
    display_name: "Slack",
    authorize_url: "https://slack.com/oauth/v2/authorize",
    token_url: "https://slack.com/api/oauth.v2.access",
    client_id_env: "SLACK_CLIENT_ID",
    client_secret_env: "SLACK_CLIENT_SECRET",
    scopes: ["chat:write", "incoming-webhook", "channels:read"],
    redirect_uri_path: "/api/integrations/oauth/slack/callback",
  },
  notion: {
    id: "notion",
    display_name: "Notion",
    authorize_url: "https://api.notion.com/v1/oauth/authorize",
    token_url: "https://api.notion.com/v1/oauth/token",
    client_id_env: "NOTION_CLIENT_ID",
    client_secret_env: "NOTION_CLIENT_SECRET",
    scopes: [],
    redirect_uri_path: "/api/integrations/oauth/notion/callback",
  },
};

export function buildAuthorizeUrl(p: OAuthProviderConfig, opts: { state: string; baseUrl: string }): string {
  const params = new URLSearchParams({
    client_id: process.env[p.client_id_env] ?? "",
    redirect_uri: `${opts.baseUrl}${p.redirect_uri_path}`,
    response_type: "code",
    state: opts.state,
  });
  if (p.scopes.length) params.set("scope", p.scopes.join(" "));
  if (p.id === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }
  return `${p.authorize_url}?${params.toString()}`;
}

export async function exchangeCode(p: OAuthProviderConfig, opts: { code: string; baseUrl: string }): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  raw: Record<string, unknown>;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: `${opts.baseUrl}${p.redirect_uri_path}`,
    client_id: process.env[p.client_id_env] ?? "",
    client_secret: process.env[p.client_secret_env] ?? "",
  });
  const r = await fetch(p.token_url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body,
  });
  if (!r.ok) throw new Error(`${p.id}_token_${r.status}`);
  const j: any = await r.json();
  return { access_token: j.access_token, refresh_token: j.refresh_token, expires_in: j.expires_in, raw: j };
}
