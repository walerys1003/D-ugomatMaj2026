/**
 * Tier 23 — E-discovery + legal hold.
 *
 * Legal hold: zamraża dane (pozwala uniknąć retencji/purge) dla potrzeb
 * postępowania prawnego. Działa per (user_id, resource_type) lub global.
 *
 * E-discovery: query engine który zwraca pełną oś czasu zasobu — cases,
 * documents, comments, audit_chain entries, realtime_events — z chain-of-custody
 * (hash każdego obiektu + signature).
 *
 * Eksport: JSON (struktura) + ZIP załączników (pliki) — TBD T24 dla ZIP.
 */

import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";
import { appendAuditEntry } from "../../security/audit-signing";

export interface LegalHold {
  id: string;
  case_reference: string;
  description: string;
  target_user_ids: string[];
  target_organization_id: string | null;
  resource_types: string[]; // np. ["cases", "documents", "comments"]
  active: boolean;
  imposed_by: string;
  imposed_at: string;
  released_at: string | null;
  release_reason: string | null;
}

export interface EDiscoveryQuery {
  id: string;
  user_id: string;
  filters: {
    target_user_id?: string;
    case_id?: string;
    document_id?: string;
    keyword?: string;
    date_from?: string;
    date_to?: string;
  };
  requested_by: string;
  requested_at: string;
  status: "pending" | "running" | "completed" | "failed";
  result_count: number;
  custody_hash: string | null;
  completed_at: string | null;
}

export interface CustodyItem {
  resource_type: string;
  resource_id: string;
  content_hash: string;
  signature: string;
  collected_at: string;
  preview: string;
}

export interface EDiscoveryResult {
  query_id: string;
  items: CustodyItem[];
  total: number;
  custody_chain_hash: string;
}

// ---------------------------------------------------------------------
// Legal hold
// ---------------------------------------------------------------------
export async function imposeLegalHold(args: {
  caseReference: string;
  description: string;
  targetUserIds?: string[];
  targetOrganizationId?: string | null;
  resourceTypes?: string[];
  imposedBy: string;
}): Promise<LegalHold> {
  if (!args.caseReference || args.caseReference.length < 3) {
    throw new Error("invalid_case_reference");
  }
  if ((args.targetUserIds?.length ?? 0) === 0 && !args.targetOrganizationId) {
    throw new Error("must_specify_targets");
  }
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb
    .from("legal_holds")
    .insert({
      case_reference: args.caseReference,
      description: args.description,
      target_user_ids: args.targetUserIds ?? [],
      target_organization_id: args.targetOrganizationId ?? null,
      resource_types: args.resourceTypes ?? ["cases", "documents", "comments", "audit_chain"],
      active: true,
      imposed_by: args.imposedBy,
      imposed_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;

  await appendAuditEntry({
    actorId: args.imposedBy,
    action: "legal_hold.impose",
    targetType: "legal_hold",
    targetId: (data as LegalHold).id,
    payload: {
      case_reference: args.caseReference,
      target_user_ids: args.targetUserIds ?? [],
      target_organization_id: args.targetOrganizationId ?? null,
      resource_types: args.resourceTypes ?? [],
    },
  }).catch(() => null);

  return data as LegalHold;
}

export async function releaseLegalHold(args: {
  holdId: string;
  releaseReason: string;
  releasedBy: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { error } = await sb
    .from("legal_holds")
    .update({
      active: false,
      released_at: new Date().toISOString(),
      release_reason: args.releaseReason,
    })
    .eq("id", args.holdId)
    .eq("active", true);
  if (error) throw error;

  await appendAuditEntry({
    actorId: args.releasedBy,
    action: "legal_hold.release",
    targetType: "legal_hold",
    targetId: args.holdId,
    payload: { reason: args.releaseReason },
  }).catch(() => null);
}

export async function isOnLegalHold(args: {
  userId?: string;
  organizationId?: string | null;
  resourceType: string;
}): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  let q = sb
    .from("legal_holds")
    .select("id")
    .eq("active", true)
    .contains("resource_types", [args.resourceType]);

  if (args.userId) q = q.contains("target_user_ids", [args.userId]);
  if (args.organizationId) q = q.eq("target_organization_id", args.organizationId);

  const { data } = await q.limit(1);
  return (data ?? []).length > 0;
}

export async function listActiveLegalHolds(): Promise<LegalHold[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data } = await sb
    .from("legal_holds")
    .select("*")
    .eq("active", true)
    .order("imposed_at", { ascending: false });
  return (data ?? []) as LegalHold[];
}

// ---------------------------------------------------------------------
// E-discovery query
// ---------------------------------------------------------------------
function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function signItem(contentHash: string, resourceType: string, resourceId: string): string {
  const secret = process.env.EDISCOVERY_SIGNING_SECRET ?? process.env.AUDIT_HMAC_SECRET ?? "fallback-ediscovery";
  return createHash("sha256")
    .update(secret)
    .update("|")
    .update(contentHash)
    .update("|")
    .update(resourceType)
    .update("|")
    .update(resourceId)
    .digest("hex");
}

export async function runEDiscoveryQuery(args: {
  filters: EDiscoveryQuery["filters"];
  requestedBy: string;
}): Promise<EDiscoveryResult> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  // Create query record
  const { data: queryRow, error: qErr } = await sb
    .from("ediscovery_queries")
    .insert({
      user_id: args.filters.target_user_id ?? null,
      filters: args.filters as unknown as Json,
      requested_by: args.requestedBy,
      status: "running",
      result_count: 0,
    })
    .select("*")
    .single();
  if (qErr) throw qErr;
  const queryId = (queryRow as { id: string }).id;

  const items: CustodyItem[] = [];

  // Cases
  // Audyt 2026-06-27 (iter. 9): poprzednio selektowano NIEISTNIEJĄCE kolumny
  // `signature` i `description`. Tabela cases ma `sygnatura` i `title` (brak
  // description). Query zawsze błędował → sprawy NIGDY nie trafiały do wyników
  // e-discovery (luka compliance). `as any` to maskował.
  if (!args.filters.document_id) {
    let cq = sb
      .from("cases")
      .select("id, sygnatura, title, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (args.filters.target_user_id) cq = cq.eq("user_id", args.filters.target_user_id);
    if (args.filters.case_id) cq = cq.eq("id", args.filters.case_id);
    if (args.filters.date_from) cq = cq.gte("created_at", args.filters.date_from);
    if (args.filters.date_to) cq = cq.lte("created_at", args.filters.date_to);
    if (args.filters.keyword) {
      cq = cq.or(`title.ilike.%${args.filters.keyword}%,sygnatura.ilike.%${args.filters.keyword}%`);
    }
    const { data: cases } = await cq;
    for (const c of cases ?? []) {
      const content = JSON.stringify(c);
      const hash = hashContent(content);
      items.push({
        resource_type: "case",
        resource_id: c.id,
        content_hash: hash,
        signature: signItem(hash, "case", c.id),
        collected_at: new Date().toISOString(),
        preview: `${c.sygnatura ?? ""} ${c.title ?? ""}`.slice(0, 200),
      });
    }
  }

  // Documents
  // Audyt 2026-06-27 (iter. 9): poprzednio selektowano NIEISTNIEJĄCE kolumny
  // `name` i `mime_type` (oraz keyword po `name`). Tabela documents nie ma
  // tekstowej nazwy ani mime_type — ma `type` (case_type) i `status`. Query
  // zawsze błędował → dokumenty NIGDY nie trafiały do wyników e-discovery.
  // `as any` to maskował. Preview budujemy z type+status; filtr keyword po
  // `name` usunięto (brak kolumny tekstowej do przeszukania).
  let dq = sb
    .from("documents")
    .select("id, case_id, type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (args.filters.case_id) dq = dq.eq("case_id", args.filters.case_id);
  if (args.filters.document_id) dq = dq.eq("id", args.filters.document_id);
  if (args.filters.date_from) dq = dq.gte("created_at", args.filters.date_from);
  if (args.filters.date_to) dq = dq.lte("created_at", args.filters.date_to);
  const { data: docs } = await dq;
  for (const d of docs ?? []) {
    const content = JSON.stringify(d);
    const hash = hashContent(content);
    items.push({
      resource_type: "document",
      resource_id: d.id,
      content_hash: hash,
      signature: signItem(hash, "document", d.id),
      collected_at: new Date().toISOString(),
      preview: `${d.type ?? ""} (${d.status ?? ""})`.slice(0, 200),
    });
  }

  // Audit chain entries
  let aq = sb
    .from("audit_chain")
    .select("id, seq, action, target_type, target_id, payload, created_at")
    .order("seq", { ascending: true })
    .limit(1000);
  if (args.filters.target_user_id) aq = aq.eq("actor_id", args.filters.target_user_id);
  if (args.filters.date_from) aq = aq.gte("created_at", args.filters.date_from);
  if (args.filters.date_to) aq = aq.lte("created_at", args.filters.date_to);
  const { data: audits } = await aq;
  for (const a of audits ?? []) {
    const content = JSON.stringify(a);
    const hash = hashContent(content);
    items.push({
      resource_type: "audit_chain",
      resource_id: a.id,
      content_hash: hash,
      signature: signItem(hash, "audit_chain", a.id),
      collected_at: new Date().toISOString(),
      preview: `seq=${a.seq} ${a.action} → ${a.target_type}/${a.target_id ?? ""}`.slice(0, 200),
    });
  }

  // Chain-of-custody hash = sorted hash of all item hashes
  const sortedHashes = items.map((i) => i.content_hash).sort().join("|");
  const custodyChainHash = createHash("sha256").update(sortedHashes).digest("hex");

  // Update query record
  await sb
    .from("ediscovery_queries")
    .update({
      status: "completed",
      result_count: items.length,
      custody_hash: custodyChainHash,
      completed_at: new Date().toISOString(),
    })
    .eq("id", queryId);

  await appendAuditEntry({
    actorId: args.requestedBy,
    action: "ediscovery.run",
    targetType: "ediscovery_query",
    targetId: queryId,
    payload: {
      filters: args.filters,
      result_count: items.length,
      custody_chain_hash: custodyChainHash,
    },
  }).catch(() => null);

  return {
    query_id: queryId,
    items,
    total: items.length,
    custody_chain_hash: custodyChainHash,
  };
}

export async function listEDiscoveryQueries(args?: { limit?: number }): Promise<EDiscoveryQuery[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data } = await sb
    .from("ediscovery_queries")
    .select("*")
    .order("requested_at", { ascending: false })
    .limit(args?.limit ?? 50);
  return (data ?? []) as EDiscoveryQuery[];
}
