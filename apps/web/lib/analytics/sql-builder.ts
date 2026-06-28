/**
 * Tier 14 — Safe SQL builder for ad-hoc analytics queries.
 * Allowlist of tables + columns + aggregations to prevent injection.
 */
const ALLOWED_TABLES = new Set([
  "analytics_events",
  "profiles",
  "subscriptions",
  "cases",
  "documents",
  "payments",
  "ai_usage_log",
]);

const ALLOWED_COLUMNS: Record<string, Set<string>> = {
  analytics_events: new Set(["event", "user_id", "org_id", "occurred_at", "properties"]),
  profiles: new Set(["id", "email", "created_at", "last_seen_at", "role"]),
  subscriptions: new Set(["id", "user_id", "plan_key", "cycle", "amount_grosze", "status", "created_at", "canceled_at"]),
  cases: new Set(["id", "user_id", "case_type", "status", "created_at", "org_id", "workspace_id"]),
  documents: new Set(["id", "case_id", "kind", "created_at"]),
  payments: new Set(["id", "user_id", "amount_grosze", "status", "created_at"]),
  ai_usage_log: new Set(["id", "user_id", "model_id", "task_type", "cost_grosze", "input_tokens", "output_tokens", "created_at"]),
};

export type Aggregation = "count" | "count_distinct" | "sum" | "avg" | "min" | "max";

export interface QueryRequest {
  table: string;
  select: { column: string; agg?: Aggregation; alias?: string }[];
  group_by?: string[];
  filters?: { column: string; op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in"; value: unknown }[];
  order_by?: { column: string; dir: "asc" | "desc" }[];
  limit?: number;
}

export interface BuiltQuery {
  sql: string;
  params: unknown[];
}

export function buildSafeQuery(req: QueryRequest): BuiltQuery {
  if (!ALLOWED_TABLES.has(req.table)) throw new Error(`forbidden_table:${req.table}`);
  const cols = ALLOWED_COLUMNS[req.table]!;
  const params: unknown[] = [];
  let p = 0;
  const ph = () => `$${++p}`;

  const selectParts = req.select.map((s) => {
    if (!cols.has(s.column) && s.column !== "*") throw new Error(`forbidden_column:${s.column}`);
    const expr = s.agg ? `${aggExpr(s.agg, s.column)}` : `"${s.column}"`;
    return `${expr}${s.alias ? ` AS "${s.alias}"` : ""}`;
  });
  let sql = `SELECT ${selectParts.join(", ")} FROM "${req.table}"`;

  if (req.filters && req.filters.length > 0) {
    const fparts = req.filters.map((f) => {
      if (!cols.has(f.column)) throw new Error(`forbidden_column:${f.column}`);
      if (f.op === "in" && Array.isArray(f.value)) {
        const placeholders = f.value.map(() => ph()).join(", ");
        params.push(...f.value);
        return `"${f.column}" IN (${placeholders})`;
      }
      params.push(f.value);
      const opMap: Record<string, string> = { eq: "=", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=" };
      return `"${f.column}" ${opMap[f.op] ?? "="} ${ph()}`;
    });
    sql += ` WHERE ${fparts.join(" AND ")}`;
  }

  if (req.group_by && req.group_by.length > 0) {
    for (const g of req.group_by) if (!cols.has(g)) throw new Error(`forbidden_column:${g}`);
    sql += ` GROUP BY ${req.group_by.map((g) => `"${g}"`).join(", ")}`;
  }

  if (req.order_by && req.order_by.length > 0) {
    sql += ` ORDER BY ${req.order_by.map((o) => `"${o.column}" ${o.dir.toUpperCase()}`).join(", ")}`;
  }

  sql += ` LIMIT ${Math.min(req.limit ?? 1000, 10000)}`;
  return { sql, params };
}

function aggExpr(agg: Aggregation, col: string): string {
  switch (agg) {
    case "count":
      return `COUNT("${col}")`;
    case "count_distinct":
      return `COUNT(DISTINCT "${col}")`;
    case "sum":
      return `SUM("${col}")`;
    case "avg":
      return `AVG("${col}")`;
    case "min":
      return `MIN("${col}")`;
    case "max":
      return `MAX("${col}")`;
  }
}
