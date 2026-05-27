/**
 * Tier 6 zad. 278 — CSP report endpoint.
 *
 * Przyjmuje raporty CSP od przeglądarki:
 *   - Content-Type: application/csp-report (legacy)
 *   - Content-Type: application/reports+json (Reporting API v1)
 *
 * Przechowuje raporty w `audit_log` (event_type='csp_violation').
 * Stosujemy throttle per directive+URL aby uniknąć log spamu.
 *
 * Wykorzystywany przez nagłówki:
 *   Content-Security-Policy-Report-Only: ...; report-uri /api/csp-report
 *   Reporting-Endpoints: csp="/api/csp-report"
 *   Content-Security-Policy: ...; report-to csp
 */
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LegacyCspReport {
  "csp-report"?: {
    "document-uri"?: string;
    referrer?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "original-policy"?: string;
    "blocked-uri"?: string;
    "status-code"?: number;
    "source-file"?: string;
    "line-number"?: number;
    "column-number"?: number;
  };
}

interface ReportingApiReport {
  type?: string;
  age?: number;
  url?: string;
  user_agent?: string;
  body?: {
    documentURL?: string;
    referrer?: string;
    blockedURL?: string;
    effectiveDirective?: string;
    originalPolicy?: string;
    sourceFile?: string;
    lineNumber?: number;
    columnNumber?: number;
    disposition?: string;
  };
}

interface NormalizedReport {
  document_url: string;
  blocked_url: string;
  directive: string;
  source_file?: string;
  line?: number;
  column?: number;
  disposition?: string;
}

// In-process throttle — zatrzymuje powtarzające się raporty (60s window).
const recent = new Map<string, number>();
const THROTTLE_MS = 60_000;

function throttleKey(r: NormalizedReport): string {
  return `${r.directive}|${r.blocked_url}|${r.document_url}`;
}

function shouldThrottle(r: NormalizedReport): boolean {
  const key = throttleKey(r);
  const last = recent.get(key) ?? 0;
  const now = Date.now();
  if (now - last < THROTTLE_MS) return true;
  recent.set(key, now);
  // GC
  if (recent.size > 5000) {
    for (const [k, t] of recent.entries()) {
      if (now - t > THROTTLE_MS * 2) recent.delete(k);
    }
  }
  return false;
}

function normalize(payload: unknown): NormalizedReport[] {
  const out: NormalizedReport[] = [];
  if (!payload) return out;

  // Reporting API v1: array of reports
  if (Array.isArray(payload)) {
    for (const r of payload as ReportingApiReport[]) {
      if (r.type && r.type !== "csp-violation") continue;
      const b = r.body ?? {};
      out.push({
        document_url: b.documentURL ?? r.url ?? "",
        blocked_url: b.blockedURL ?? "",
        directive: b.effectiveDirective ?? "",
        source_file: b.sourceFile,
        line: b.lineNumber,
        column: b.columnNumber,
        disposition: b.disposition,
      });
    }
    return out;
  }

  // Legacy: { "csp-report": {...} }
  const legacy = (payload as LegacyCspReport)["csp-report"];
  if (legacy) {
    out.push({
      document_url: legacy["document-uri"] ?? "",
      blocked_url: legacy["blocked-uri"] ?? "",
      directive: legacy["effective-directive"] ?? legacy["violated-directive"] ?? "",
      source_file: legacy["source-file"],
      line: legacy["line-number"],
      column: legacy["column-number"],
    });
  }
  return out;
}

export async function POST(req: NextRequest): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const reports = normalize(parsed);
  if (reports.length === 0) return new NextResponse(null, { status: 204 });

  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const toInsert: Array<Record<string, unknown>> = [];

  for (const r of reports) {
    if (shouldThrottle(r)) continue;
    // Ignoruj browser-extensions, które generują szum.
    if (
      r.blocked_url.startsWith("chrome-extension://") ||
      r.blocked_url.startsWith("moz-extension://") ||
      r.blocked_url.startsWith("safari-extension://") ||
      r.blocked_url === "asset" ||
      r.blocked_url === "inline"
    ) {
      // dalej logujemy do telemetrii, ale rzadziej
    }

    logger.warn("csp.violation", {
      directive: r.directive,
      blocked: r.blocked_url.slice(0, 200),
      doc: r.document_url.slice(0, 200),
      src: r.source_file?.slice(0, 200),
    });

    if (sb) {
      toInsert.push({
        event_type: "csp_violation",
        actor_type: "browser",
        resource_type: "csp",
        resource_id: r.directive,
        metadata: {
          directive: r.directive,
          blocked_url: r.blocked_url.slice(0, 500),
          document_url: r.document_url.slice(0, 500),
          source_file: r.source_file?.slice(0, 500),
          line: r.line,
          column: r.column,
          disposition: r.disposition,
        },
      });
    }
  }

  if (sb && toInsert.length > 0) {
    try {
      await sb.from("audit_log").insert(toInsert);
    } catch (e) {
      logger.warn("csp.audit_log_insert_failed", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
