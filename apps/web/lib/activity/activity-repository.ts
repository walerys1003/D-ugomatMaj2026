/**
 * Activity repository — server-only odczyt aktywności konta użytkownika.
 *
 * Łączy zdarzenia z dwóch źródeł:
 *   - security_events (logowania, MFA, zmiany hasła, alerty bezpieczeństwa)
 *   - analytics_events (akcje produktowe: dokumenty, sprawy, AI, ustawienia)
 *
 * RLS filtruje po user_id = auth.uid(); dla analytics_events część zdarzeń
 * może mieć user_id NULL (anonimowe) — te są pomijane przez RLS.
 */
import "server-only";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type ActivityType =
  | "login"
  | "logout"
  | "doc_upload"
  | "case_update"
  | "settings_changed"
  | "ai_query"
  | "password_changed"
  | "mfa_enabled"
  | "other";

export type ActivityRisk = "low" | "normal" | "elevated";

export interface ActivityEvent {
  id: string;
  ts: string;
  type: ActivityType;
  description: string;
  ip?: string;
  device?: string;
  risk: ActivityRisk;
}

function mapSecurityType(type: string): ActivityType {
  const t = type.toLowerCase();
  if (t.includes("login") || t.includes("sign_in")) return "login";
  if (t.includes("logout") || t.includes("sign_out")) return "logout";
  if (t.includes("password")) return "password_changed";
  if (t.includes("mfa") || t.includes("2fa") || t.includes("totp"))
    return "mfa_enabled";
  return "other";
}

function mapAnalyticsType(event: string): ActivityType {
  const e = event.toLowerCase();
  if (e.includes("document") || e.includes("upload") || e.includes("ocr"))
    return "doc_upload";
  if (e.includes("case")) return "case_update";
  if (e.includes("ai") || e.includes("generate") || e.includes("chat"))
    return "ai_query";
  if (e.includes("settings") || e.includes("preferences"))
    return "settings_changed";
  return "other";
}

function severityToRisk(severity: string | null): ActivityRisk {
  const s = (severity ?? "").toLowerCase();
  if (s === "high" || s === "critical" || s === "elevated") return "elevated";
  if (s === "medium" || s === "warning" || s === "normal") return "normal";
  return "low";
}

const HUMAN_EVENT: Record<string, string> = {
  document_generated: "Wygenerowano pismo",
  document_downloaded: "Pobrano dokument",
  ocr_completed: "Zakończono skanowanie dokumentu",
  case_created: "Utworzono nową sprawę",
  case_updated: "Zaktualizowano sprawę",
  ai_query: "Zapytanie do AI asystenta",
  settings_updated: "Zmieniono ustawienia konta",
};

/**
 * Pobiera połączoną historię aktywności (max `limit` zdarzeń, posortowane malejąco).
 */
export async function getAccountActivity(
  limit = 50,
): Promise<ActivityEvent[]> {
  const supabase = createSupabaseServerClient();

  const [secRes, anaRes] = await Promise.all([
    supabase
      .from("security_events")
      .select("id, type, severity, ip, user_agent, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(limit),
    supabase
      .from("analytics_events")
      .select("id, event, properties, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(limit),
  ]);

  const events: ActivityEvent[] = [];

  for (const row of secRes.data ?? []) {
    events.push({
      id: `sec_${row.id}`,
      ts: row.occurred_at,
      type: mapSecurityType(row.type),
      description: humanizeSecurity(row.type),
      ip: row.ip ?? undefined,
      device: row.user_agent ?? undefined,
      risk: severityToRisk(row.severity),
    });
  }

  for (const row of anaRes.data ?? []) {
    events.push({
      id: `ana_${row.id}`,
      ts: row.occurred_at,
      type: mapAnalyticsType(row.event),
      description: HUMAN_EVENT[row.event] ?? humanizeEvent(row.event),
      risk: "low",
    });
  }

  events.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
  return events.slice(0, limit);
}

function humanizeSecurity(type: string): string {
  const map: Record<string, string> = {
    login_success: "Udane logowanie",
    login_failed: "Nieudana próba logowania",
    logout: "Wylogowanie",
    password_changed: "Zmiana hasła",
    mfa_enabled: "Włączono uwierzytelnianie dwuskładnikowe",
    mfa_disabled: "Wyłączono uwierzytelnianie dwuskładnikowe",
  };
  return map[type] ?? humanizeEvent(type);
}

function humanizeEvent(raw: string): string {
  return raw
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
