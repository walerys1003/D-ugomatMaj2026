/**
 * Tier 24 — CRM v2: unified upsert + sync log + retry.
 *
 * Wrapper nad istniejącym `crm-sync.ts` (HubSpot, Pipedrive) dodający:
 *  - persistent log (crm_sync_log)
 *  - retry/backoff (delegowany do queue runnera)
 *  - mapping case → CRM deal
 *  - lifecycle stage automation
 */
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  upsertHubspotContact,
  upsertPipedrivePerson,
  type CrmContact,
  type CrmProvider,
} from "@/lib/integrations/crm-sync";

export type SyncStatus = "pending" | "synced" | "failed";
export type EntityType = "contact" | "deal" | "company";

export interface SyncLogEntry {
  id: string;
  user_id: string;
  provider: CrmProvider | "salesforce" | "zoho";
  entity_type: EntityType;
  entity_ref: string | null;
  external_id: string | null;
  status: SyncStatus;
  payload: unknown;
  response: unknown;
  error: string | null;
  attempts: number;
  created_at: string;
  synced_at: string | null;
}

export async function syncContact(opts: {
  user_id: string;
  provider: CrmProvider;
  contact: CrmContact;
  entity_ref?: string;
}): Promise<SyncLogEntry> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const id = randomUUID();
  const baseRow = {
    id,
    user_id: opts.user_id,
    provider: opts.provider,
    entity_type: "contact" as EntityType,
    entity_ref: opts.entity_ref ?? null,
    payload: opts.contact,
    attempts: 0,
    status: "pending" as SyncStatus,
    created_at: new Date().toISOString(),
  };
  await sb.from("crm_sync_log").insert(baseRow);

  try {
    let externalId: string;
    let response: unknown;
    if (opts.provider === "hubspot") {
      const r = await upsertHubspotContact(opts.contact);
      externalId = r.id;
      response = r;
    } else if (opts.provider === "pipedrive") {
      const r = await upsertPipedrivePerson(opts.contact);
      externalId = String(r.id);
      response = r;
    } else {
      throw new Error(`provider_not_implemented:${opts.provider}`);
    }
    await sb
      .from("crm_sync_log")
      .update({
        external_id: externalId,
        status: "synced",
        response,
        attempts: 1,
        synced_at: new Date().toISOString(),
      })
      .eq("id", id);
    return {
      ...baseRow,
      external_id: externalId,
      response,
      attempts: 1,
      status: "synced",
      synced_at: new Date().toISOString(),
      error: null,
    };
  } catch (e) {
    await sb
      .from("crm_sync_log")
      .update({
        status: "failed",
        error: String(e).slice(0, 500),
        attempts: 1,
      })
      .eq("id", id);
    throw e;
  }
}

export async function listSyncLog(
  userId: string,
  opts: { provider?: CrmProvider; status?: SyncStatus; limit?: number } = {},
): Promise<SyncLogEntry[]> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  let q = sb
    .from("crm_sync_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (opts.provider) q = q.eq("provider", opts.provider);
  if (opts.status) q = q.eq("status", opts.status);
  q = q.limit(opts.limit ?? 50);
  const { data } = await q;
  return (data as any) ?? [];
}

/**
 * Map a Długomat `cases` row into a CRM "deal" payload.
 * Used by automation workflows when case transitions to certain stages.
 */
export function caseToCrmDeal(opts: {
  case_id: string;
  case_title: string;
  case_type: string;
  amount_grosze: number;
  status: string;
}): Record<string, unknown> {
  return {
    title: opts.case_title,
    value: opts.amount_grosze / 100,
    currency: "PLN",
    pipeline: "legal_cases",
    stage: mapStageFromStatus(opts.status),
    external_ref: opts.case_id,
    properties: {
      case_type: opts.case_type,
    },
  };
}

function mapStageFromStatus(s: string): string {
  if (s === "completed") return "won";
  if (s === "archived") return "lost";
  if (s === "paid" || s === "downloaded") return "negotiation";
  if (s === "generated") return "proposal_sent";
  return "qualified";
}
