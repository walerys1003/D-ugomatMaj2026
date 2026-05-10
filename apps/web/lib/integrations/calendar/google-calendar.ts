/**
 * Tier 12 — Google Calendar sync via OAuth2 + Calendar API v3.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface GoogleCalCredentials {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id: string;
}

export async function refreshAccessToken(creds: GoogleCalCredentials): Promise<GoogleCalCredentials> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("google_oauth_not_configured");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) throw new Error(`google_refresh_${r.status}`);
  const j: any = await r.json();
  const next: GoogleCalCredentials = {
    ...creds,
    access_token: j.access_token,
    expires_at: new Date(Date.now() + (j.expires_in ?? 3600) * 1000).toISOString(),
  };
  const sb = await createServerSupabase();
  await sb.from("oauth_credentials").update({ access_token: next.access_token, expires_at: next.expires_at }).eq("user_id", creds.user_id).eq("provider", "google");
  return next;
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  source_id: string; // case/deadline id for idempotency
}

export async function upsertEvent(creds: GoogleCalCredentials, evt: CalendarEventInput): Promise<{ event_id: string }> {
  let active = creds;
  if (new Date(active.expires_at).getTime() < Date.now() + 60_000) {
    active = await refreshAccessToken(active);
  }
  const body = {
    summary: evt.summary,
    description: (evt.description ?? "") + `\n\n[dlugomat:source=${evt.source_id}]`,
    start: { dateTime: evt.start, timeZone: "Europe/Warsaw" },
    end: { dateTime: evt.end, timeZone: "Europe/Warsaw" },
    location: evt.location,
    extendedProperties: { private: { source_id: evt.source_id } },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 * 24 }] },
  };
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(active.calendar_id)}/events`, {
    method: "POST",
    headers: { authorization: `Bearer ${active.access_token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`google_calendar_${r.status}`);
  const j: any = await r.json();
  return { event_id: j.id };
}
