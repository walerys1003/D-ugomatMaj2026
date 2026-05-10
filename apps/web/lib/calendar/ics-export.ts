/**
 * Calendar.ics export — zad. 342
 *
 * Generates RFC 5545-compliant iCalendar (.ics) feed for a user's deadlines + hearings.
 * Per-user signed feed URL: /api/calendar/[userId]/feed.ics?token=...
 */

import { createHmac } from "node:crypto";

export interface IcsEvent {
  uid: string;
  summary: string;
  description?: string;
  /** ISO date or datetime */
  dtstart: string;
  /** ISO date or datetime; defaults to dtstart + 1h */
  dtend?: string;
  location?: string;
  url?: string;
  /** "deadline" or "hearing" */
  category?: string;
  /** in minutes; default 1440 (1d) */
  alarm_minutes_before?: number;
  /** all-day event */
  all_day?: boolean;
  status?: "TENTATIVE" | "CONFIRMED" | "CANCELLED";
}

const PRODID = "-//Dlugomat//PL//Dlugomat Calendar//EN";
const CRLF = "\r\n";

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDate(iso: string, allDay = false): string {
  const d = new Date(iso);
  if (allDay) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  }
  return (
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "Z"
  );
}

function foldLine(line: string): string {
  // RFC 5545 §3.1: lines SHOULD NOT exceed 75 octets; fold with CRLF + space
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    parts.push((i === 0 ? "" : " ") + line.substring(i, Math.min(i + 73, line.length)));
    i += 73;
  }
  return parts.join(CRLF);
}

export function buildIcsFeed(events: IcsEvent[], calendarName = "Długomat — Terminy"): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:${PRODID}`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(`X-WR-CALNAME:${escapeIcsText(calendarName)}`);
  lines.push("X-WR-TIMEZONE:Europe/Warsaw");

  const now = formatDate(new Date().toISOString());

  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}@dlugomat.pl`);
    lines.push(`DTSTAMP:${now}`);
    if (ev.all_day) {
      lines.push(`DTSTART;VALUE=DATE:${formatDate(ev.dtstart, true)}`);
      const end = ev.dtend ?? ev.dtstart;
      lines.push(`DTEND;VALUE=DATE:${formatDate(end, true)}`);
    } else {
      lines.push(`DTSTART:${formatDate(ev.dtstart)}`);
      const end = ev.dtend ?? new Date(new Date(ev.dtstart).getTime() + 3600_000).toISOString();
      lines.push(`DTEND:${formatDate(end)}`);
    }
    lines.push(`SUMMARY:${escapeIcsText(ev.summary)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcsText(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    if (ev.category) lines.push(`CATEGORIES:${escapeIcsText(ev.category)}`);
    lines.push(`STATUS:${ev.status ?? "CONFIRMED"}`);
    lines.push("TRANSP:OPAQUE");

    // Default alarm: 1 day before
    const alarm = ev.alarm_minutes_before ?? 1440;
    if (alarm > 0) {
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${escapeIcsText(ev.summary)}`);
      lines.push(`TRIGGER:-PT${alarm}M`);
      lines.push("END:VALARM");
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join(CRLF) + CRLF;
}

/**
 * Sign feed token with HMAC-SHA256 over user_id, so users can revoke without leaking secrets.
 */
export function signFeedToken(userId: string, secret = process.env.CALENDAR_FEED_SECRET ?? "dev-feed-secret"): string {
  const payload = `${userId}:${Math.floor(Date.now() / 86_400_000)}`; // day-stable
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
}

export function verifyFeedToken(
  userId: string,
  token: string,
  secret = process.env.CALENDAR_FEED_SECRET ?? "dev-feed-secret",
): boolean {
  // Allow both "today" and "yesterday" tokens (24h grace)
  const today = Math.floor(Date.now() / 86_400_000);
  for (const day of [today, today - 1]) {
    const payload = `${userId}:${day}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
    if (expected === token) return true;
  }
  return false;
}
