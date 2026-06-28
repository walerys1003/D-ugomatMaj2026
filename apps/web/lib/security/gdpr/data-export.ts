// GDPR — Right to Access (art. 15) + Right to Data Portability (art. 20).
// Generates a JSON dump of all data the user has across our tables.

export interface DataExportOptions {
  tables?: string[];
  includeBinaryRefs?: boolean;
}

const DEFAULT_TABLES = [
  "profiles",
  "user_preferences",
  "cases",
  "documents",
  "document_drafts",
  "messages",
  "deadlines",
  "payments",
  "subscriptions",
  "notifications",
  "audit_log",
  "consent_ledger",
  "user_sessions",
  "api_keys",
  "push_subscriptions",
  "offline_queue",
  "nps_responses",
];

export interface DataExportResult {
  generatedAt: string;
  userId: string;
  tables: Record<string, unknown[]>;
  metadata: {
    rowCount: number;
    tableCount: number;
    durationMs: number;
  };
}

export async function exportUserData(supabase: any, userId: string, opts: DataExportOptions = {}): Promise<DataExportResult> {
  const t0 = Date.now();
  const tables = opts.tables ?? DEFAULT_TABLES;
  const result: Record<string, unknown[]> = {};
  let rowCount = 0;
  for (const table of tables) {
    try {
      const { data } = await supabase.from(table).select("*").eq("user_id", userId);
      const rows = data ?? [];
      if (rows.length > 0) {
        result[table] = rows;
        rowCount += rows.length;
      }
    } catch {
      // Skip tables that don't have user_id or don't exist in this deployment.
      continue;
    }
  }
  // profiles table uses id not user_id.
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId);
    if (data?.length) {
      result["profiles"] = data;
      rowCount += data.length;
    }
  } catch { /* skip */ }

  return {
    generatedAt: new Date().toISOString(),
    userId,
    tables: result,
    metadata: { rowCount, tableCount: Object.keys(result).length, durationMs: Date.now() - t0 },
  };
}

export function exportToJsonLines(exp: DataExportResult): string {
  const lines: string[] = [];
  lines.push(JSON.stringify({ _meta: exp.metadata, generatedAt: exp.generatedAt, userId: exp.userId }));
  for (const [table, rows] of Object.entries(exp.tables)) {
    // Audyt 2026-06-27 (iter. 36): `rows` jest już `unknown[]` (z DataExportResult)
    // — wystarczy zawęzić element do obiektu zamiast `as any[]`.
    for (const row of rows) {
      lines.push(JSON.stringify({ _table: table, ...(row as Record<string, unknown>) }));
    }
  }
  return lines.join("\n");
}
