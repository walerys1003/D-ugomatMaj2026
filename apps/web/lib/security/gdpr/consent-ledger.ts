// Consent ledger — append-only record of every consent given/withdrawn,
// with policy version reference. Used as evidence for DPA / GDPR audits.

import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

type Db = SupabaseClient<Database>;

// AUDYT #6 (iter28): wartości MUSZĄ pokrywać się z CHECK constraint w migracji
// 20260520000000_tier17_security_advanced.sql (consent_ledger.purpose). Wcześniej
// `as any` maskował, że kod używał wartości spoza constraintu (analytics_telemetry,
// data_sharing_partners, ai_model_training) — insert wywalał się w runtime.
export type ConsentPurpose =
  | "tos"
  | "privacy"
  | "marketing_email"
  | "marketing_sms"
  | "marketing_push"
  | "analytics"
  | "profiling"
  | "third_party_sharing"
  | "cookies_functional"
  | "cookies_analytics"
  | "cookies_marketing"
  | "ai_training"
  | "data_export";

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
  supabase: Db,
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
  // REALNY BUG (maskowany przez as any): kolumna to `version`, nie `policy_version`.
  const row = {
    id: randomUUID(),
    user_id: params.userId,
    purpose: params.purpose,
    granted: params.granted,
    version: params.policyVersion,
    source: params.source,
    ip: params.ip ?? null,
    user_agent: params.userAgent ?? null,
  };
  const { data, error } = await supabase.from("consent_ledger").insert(row).select("*").single();
  if (error) throw error;
  return mapEntry(data);
}

export async function listConsents(supabase: Db, userId: string): Promise<ConsentEntry[]> {
  // REALNY BUG (maskowany przez as any): kolumna to `recorded_at`, nie `captured_at`.
  const { data, error } = await supabase
    .from("consent_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapEntry);
}

// Effective consent — latest entry per purpose decides the current state.
export async function currentConsent(supabase: Db, userId: string): Promise<Record<ConsentPurpose, boolean>> {
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

type ConsentRow = Database["public"]["Tables"]["consent_ledger"]["Row"];

function mapEntry(r: ConsentRow): ConsentEntry {
  return {
    id: r.id,
    userId: r.user_id,
    purpose: r.purpose as ConsentPurpose,
    granted: !!r.granted,
    policyVersion: r.version,
    source: (r.source ?? "settings") as ConsentEntry["source"],
    ip: r.ip ?? undefined,
    userAgent: r.user_agent ?? undefined,
    capturedAt: r.recorded_at,
  };
}
