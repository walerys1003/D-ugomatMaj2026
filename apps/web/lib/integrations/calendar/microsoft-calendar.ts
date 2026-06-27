/**
 * Tier 24 — Microsoft 365 Calendar sync via Graph API.
 *
 * Pełny pendant do `google-calendar.ts`, używa Microsoft Graph:
 *   - OAuth2 client_credentials lub authorization_code flow (refresh_token)
 *   - POST/PATCH https://graph.microsoft.com/v1.0/me/events
 *   - idempotency po singleValueExtendedProperty 'source_id'
 *
 * Wymagane env:
 *   MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT (default: 'common')
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface MsCalCredentials {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id?: string; // optional: default 'primary' calendar
  scope?: string;
}

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const TENANT = () => process.env.MICROSOFT_TENANT ?? "common";

export async function refreshAccessToken(creds: MsCalCredentials): Promise<MsCalCredentials> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("microsoft_oauth_not_configured");
  const r = await fetch(`https://login.microsoftonline.com/${TENANT()}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token",
      scope: creds.scope ?? "offline_access Calendars.ReadWrite Mail.Send",
    }),
  });
  if (!r.ok) throw new Error(`microsoft_refresh_${r.status}`);
  const j: any = await r.json();
  const next: MsCalCredentials = {
    ...creds,
    access_token: j.access_token,
    refresh_token: j.refresh_token ?? creds.refresh_token,
    expires_at: new Date(Date.now() + (j.expires_in ?? 3600) * 1000).toISOString(),
  };
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  await sb
    .from("oauth_credentials")
    .update({
      access_token: next.access_token,
      refresh_token: next.refresh_token,
      expires_at: next.expires_at,
    })
    .eq("user_id", creds.user_id)
    .eq("provider", "microsoft");
  return next;
}

export interface MsCalendarEventInput {
  subject: string;
  body?: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  attendees?: { email: string; name?: string }[];
  source_id: string; // idempotency key (case/deadline id)
  reminder_minutes?: number;
}

async function ensureFresh(creds: MsCalCredentials): Promise<MsCalCredentials> {
  if (new Date(creds.expires_at).getTime() < Date.now() + 60_000) {
    return refreshAccessToken(creds);
  }
  return creds;
}

/**
 * Find existing event matching source_id (via singleValueExtendedProperty).
 */
async function findEventBySourceId(
  creds: MsCalCredentials,
  sourceId: string,
): Promise<string | null> {
  const propId = "String {66f5a359-4659-4830-9070-00040ec6ac6e} Name DlugomatSource";
  const filter = encodeURIComponent(
    `singleValueExtendedProperties/Any(ep: ep/id eq '${propId}' and ep/value eq '${sourceId}')`,
  );
  const r = await fetch(
    `${GRAPH_BASE}/me/events?$filter=${filter}&$expand=singleValueExtendedProperties($filter=id eq '${encodeURIComponent(propId)}')`,
    { headers: { authorization: `Bearer ${creds.access_token}` } },
  );
  if (!r.ok) return null;
  const j: any = await r.json();
  return j.value?.[0]?.id ?? null;
}

export async function upsertEvent(
  creds: MsCalCredentials,
  evt: MsCalendarEventInput,
): Promise<{ event_id: string; created: boolean }> {
  const active = await ensureFresh(creds);
  const existingId = await findEventBySourceId(active, evt.source_id);

  const body = {
    subject: evt.subject,
    body: { contentType: "html", content: (evt.body ?? "") + `<p><small>source=${evt.source_id}</small></p>` },
    start: { dateTime: evt.start, timeZone: "Europe/Warsaw" },
    end: { dateTime: evt.end, timeZone: "Europe/Warsaw" },
    location: evt.location ? { displayName: evt.location } : undefined,
    attendees: (evt.attendees ?? []).map((a) => ({
      emailAddress: { address: a.email, name: a.name ?? a.email },
      type: "required",
    })),
    isReminderOn: true,
    reminderMinutesBeforeStart: evt.reminder_minutes ?? 60 * 24,
    singleValueExtendedProperties: [
      {
        id: "String {66f5a359-4659-4830-9070-00040ec6ac6e} Name DlugomatSource",
        value: evt.source_id,
      },
    ],
  };

  let r: Response;
  if (existingId) {
    r = await fetch(`${GRAPH_BASE}/me/events/${existingId}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${active.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } else {
    r = await fetch(`${GRAPH_BASE}/me/events`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${active.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`microsoft_graph_${r.status}: ${txt.slice(0, 200)}`);
  }
  const j: any = await r.json();
  return { event_id: j.id, created: !existingId };
}

export async function deleteEvent(creds: MsCalCredentials, sourceId: string): Promise<boolean> {
  const active = await ensureFresh(creds);
  const id = await findEventBySourceId(active, sourceId);
  if (!id) return false;
  const r = await fetch(`${GRAPH_BASE}/me/events/${id}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${active.access_token}` },
  });
  return r.ok;
}

/**
 * Send transactional email via Microsoft Graph /me/sendMail.
 * Useful for case-related notifications when user is OAuth-connected.
 */
export async function sendMail(
  creds: MsCalCredentials,
  mail: {
    to: { email: string; name?: string }[];
    subject: string;
    body_html: string;
    cc?: { email: string; name?: string }[];
  },
): Promise<boolean> {
  const active = await ensureFresh(creds);
  const r = await fetch(`${GRAPH_BASE}/me/sendMail`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${active.access_token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: mail.subject,
        body: { contentType: "html", content: mail.body_html },
        toRecipients: mail.to.map((t) => ({
          emailAddress: { address: t.email, name: t.name ?? t.email },
        })),
        ccRecipients: (mail.cc ?? []).map((t) => ({
          emailAddress: { address: t.email, name: t.name ?? t.email },
        })),
      },
      saveToSentItems: true,
    }),
  });
  return r.ok;
}

export async function getCredentialsForUser(userId: string): Promise<MsCalCredentials | null> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data } = await sb
    .from("oauth_credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "microsoft")
    .maybeSingle();
  if (!data) return null;
  return {
    user_id: data.user_id,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    calendar_id: data.calendar_id ?? "primary",
    scope: data.scope,
  };
}
