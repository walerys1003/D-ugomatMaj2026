// Consent ledger — append-only record of every consent given/withdrawn,
// with policy version reference. Used as evidence for DPA / GDPR audits.

import { randomUUID } from "crypto";

export type ConsentPurpose =
  | "marketing_email"
  | "marketing_sms"
  | "marketing_push"
  | "analytics_telemetry"
  | "profiling"
  | "data_sharing_partners"
  | "ai_model_training"
  | "cookies_functional"
  | "cookies_analytics"
  | "cookies_marketing";

export interface ConsentEntry {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  policyVersion: string;
  source: "signup" | "settings" | "cookie_banner" | "email_optout";
  ip?: string;
  userAgent?: string;
  capturedAt: string;
}

export async function recordConsent(
  supabase: any,
  params: {
    userId: string;
    purpose: ConsentPurpose;
    granted: boolean;
    policyVersion: string;
    source: ConsentEntry["source"];
    ip?: string;
    userAgent?: string;
  },
): Promise<ConsentEntry> {
  const row = {
    id: randomUUID(),
    user_id: params.userId,
    purpose: params.purpose,
    granted: params.granted,
    policy_version: params.policyVersion,
    source: params.source,
    ip: params.ip ?? null,
    user_agent: params.userAgent ?? null,
  };
  const { data, error } = await supabase.from("consent_ledger").insert(row).select("*").single();
  if (error) throw error;
  return mapEntry(data);
}

export async function listConsents(supabase: any, userId: string): Promise<ConsentEntry[]> {
  const { data, error } = await supabase
    .from("consent_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapEntry);
}

// Effective consent — latest entry per purpose decides the current state.
export async function currentConsent(supabase: any, userId: string): Promise<Record<ConsentPurpose, boolean>> {
  const entries = await listConsents(supabase, userId);
  const latest: Partial<Record<ConsentPurpose, ConsentEntry>> = {};
  for (const e of entries) {
    const existing = latest[e.purpose];
    if (!existing || new Date(e.capturedAt) > new Date(existing.capturedAt)) {
      latest[e.purpose] = e;
    }
  }
  const result = {} as Record<ConsentPurpose, boolean>;
  for (const p of Object.keys(latest) as ConsentPurpose[]) result[p] = !!latest[p]?.granted;
  return result;
}

function mapEntry(r: any): ConsentEntry {
  return {
    id: r.id,
    userId: r.user_id,
    purpose: r.purpose,
    granted: !!r.granted,
    policyVersion: r.policy_version,
    source: r.source,
    ip: r.ip ?? undefined,
    userAgent: r.user_agent ?? undefined,
    capturedAt: r.captured_at,
  };
}
