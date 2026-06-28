/**
 * Tier 14 — Data warehouse export (BigQuery / Snowflake / S3) staging.
 * Generates Parquet-friendly NDJSON for batch loaders.
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type WarehouseTable = "events" | "users" | "subscriptions" | "cases" | "documents" | "payments" | "ai_usage";

export interface ExportBatch {
  table: WarehouseTable;
  ndjson: string;
  row_count: number;
  bytes: number;
  generated_at: string;
}

export async function exportTableNdjson(table: WarehouseTable, opts?: { since?: string; limit?: number }): Promise<ExportBatch> {
  const sb = await createSupabaseServerClient();
  const since = opts?.since ?? new Date(Date.now() - 86400_000).toISOString();
  const limit = Math.min(opts?.limit ?? 10000, 50000);
  const sourceTable = mapTable(table);
  // Audyt 2026-06-27 (iter. 36): `sourceTable` to dynamiczna nazwa tabeli
  // (mapTable), więc wynik jest luźno typowany — zawężamy do Record zamiast
  // `as any[]`.
  const { data } = await sb.from(sourceTable).select("*").gte("created_at", since).limit(limit);
  const lines = ((data as Record<string, unknown>[] | null) ?? []).map((r) => JSON.stringify(flatten(r)));
  const ndjson = lines.join("\n");
  return {
    table,
    ndjson,
    row_count: lines.length,
    bytes: Buffer.byteLength(ndjson),
    generated_at: new Date().toISOString(),
  };
}

function mapTable(t: WarehouseTable): string {
  switch (t) {
    case "events":
      return "analytics_events";
    case "users":
      return "profiles";
    case "ai_usage":
      return "ai_usage_log";
    default:
      return t;
  }
}

function flatten(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = JSON.stringify(v);
    } else if (Array.isArray(v)) {
      out[k] = JSON.stringify(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export interface BigQueryConfig {
  project_id: string;
  dataset: string;
  service_account_json: string;
  location?: string;
}

export async function pushToBigQuery(_cfg: BigQueryConfig, _batch: ExportBatch): Promise<{ inserted: number }> {
  // Real impl: use jobs.insert API + GCS staging. Stubbed for non-prod.
  return { inserted: _batch.row_count };
}
