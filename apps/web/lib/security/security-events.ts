// Security event log — append-only, used for SIEM ingestion and incident timelines.
import { randomUUID } from "crypto";

export type SecurityEventType =
  | "auth.login_success"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.mfa_setup"
  | "auth.mfa_verified"
  | "auth.mfa_failed"
  | "auth.backup_code_used"
  | "auth.password_reset_requested"
  | "auth.password_reset_completed"
  | "auth.webauthn_registered"
  | "auth.webauthn_verified"
  | "auth.session_revoked"
  | "auth.api_key_created"
  | "auth.api_key_revoked"
  | "threat.high_risk_blocked"
  | "threat.rate_limit_hit"
  | "threat.ip_blocked"
  | "gdpr.consent_granted"
  | "gdpr.consent_withdrawn"
  | "gdpr.export_requested"
  | "gdpr.erasure_requested"
  | "gdpr.erasure_executed";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

const SEVERITY_OF: Record<SecurityEventType, Severity> = {
  "auth.login_success": "info",
  "auth.login_failed": "low",
  "auth.logout": "info",
  "auth.mfa_setup": "info",
  "auth.mfa_verified": "info",
  "auth.mfa_failed": "medium",
  "auth.backup_code_used": "medium",
  "auth.password_reset_requested": "low",
  "auth.password_reset_completed": "medium",
  "auth.webauthn_registered": "info",
  "auth.webauthn_verified": "info",
  "auth.session_revoked": "low",
  "auth.api_key_created": "low",
  "auth.api_key_revoked": "low",
  "threat.high_risk_blocked": "high",
  "threat.rate_limit_hit": "low",
  "threat.ip_blocked": "high",
  "gdpr.consent_granted": "info",
  "gdpr.consent_withdrawn": "info",
  "gdpr.export_requested": "info",
  "gdpr.erasure_requested": "medium",
  "gdpr.erasure_executed": "high",
};

export interface SecurityEvent {
  id: string;
  userId?: string;
  type: SecurityEventType;
  severity: Severity;
  ip?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export async function recordSecurityEvent(
  supabase: any,
  params: { userId?: string; type: SecurityEventType; ip?: string; userAgent?: string; metadata?: Record<string, unknown> },
): Promise<SecurityEvent> {
  const row = {
    id: randomUUID(),
    user_id: params.userId ?? null,
    type: params.type,
    severity: SEVERITY_OF[params.type],
    ip: params.ip ?? null,
    user_agent: params.userAgent ?? null,
    metadata: params.metadata ?? {},
  };
  const { data, error } = await supabase.from("security_events").insert(row).select("*").single();
  if (error) throw error;
  return mapEvent(data);
}

export async function recentEventsForUser(supabase: any, userId: string, limit = 50): Promise<SecurityEvent[]> {
  const { data, error } = await supabase
    .from("security_events")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

function mapEvent(r: any): SecurityEvent {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    type: r.type,
    severity: r.severity,
    ip: r.ip ?? undefined,
    userAgent: r.user_agent ?? undefined,
    metadata: r.metadata ?? {},
    occurredAt: r.occurred_at,
  };
}
