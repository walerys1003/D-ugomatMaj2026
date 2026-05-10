/**
 * Tier 6 zad. 294 — OpenAPI YAML generated from Zod schemas.
 *
 * Endpoint: GET /api/openapi (?format=yaml|json)
 *
 * Generuje OpenAPI 3.1 spec na żywo z znanych route'ów. Nie dodajemy
 * zaleznosci `zod-to-openapi` (heavy) — używamy własnego minimalnego
 * mappera. Zaktualizuj `ROUTES` poniżej dla każdego publicznego endpointa.
 *
 * Cel:
 *   - Self-service docs dla integratorów (B2B)
 *   - Możliwość generowania klientów typedSDK (openapi-generator)
 *   - Snapshot testy schematów (CI: diff vs. plik /docs/openapi.yaml)
 */
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteSpec {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  summary: string;
  description?: string;
  tags: string[];
  auth: "none" | "user" | "admin" | "service";
  requestBody?: {
    contentType: string;
    schema: Record<string, unknown>;
    required?: boolean;
  };
  responses: Record<
    string,
    { description: string; contentType?: string; schema?: Record<string, unknown> }
  >;
  headers?: Record<string, { description: string; required?: boolean }>;
  rateLimit?: string;
}

const ROUTES: RouteSpec[] = [
  // ----- AI -----
  {
    path: "/api/ai/generate",
    method: "post",
    summary: "Generate document via AI (SSE streaming)",
    description:
      "Streams Server-Sent Events for live document generation. Supports Idempotency-Key header.",
    tags: ["AI"],
    auth: "user",
    headers: {
      "Idempotency-Key": {
        description: "UUID/ULID for idempotent retry (24h TTL).",
        required: false,
      },
    },
    requestBody: {
      contentType: "application/json",
      required: true,
      schema: {
        type: "object",
        required: ["caseId"],
        properties: { caseId: { type: "string", format: "uuid" } },
      },
    },
    responses: {
      "200": {
        description: "SSE stream",
        contentType: "text/event-stream",
      },
      "400": { description: "Invalid case ID or JSON body" },
      "401": { description: "Unauthenticated" },
      "403": { description: "Forbidden (case not owned)" },
      "404": { description: "Case not found" },
      "409": { description: "Idempotency in progress" },
      "429": { description: "Rate limit exceeded" },
      "503": { description: "AI temporarily unavailable" },
    },
    rateLimit: "5/min/user",
  },
  // ----- Cases -----
  {
    path: "/api/cases",
    method: "get",
    summary: "List user's cases",
    tags: ["Cases"],
    auth: "user",
    responses: {
      "200": {
        description: "Array of cases",
        contentType: "application/json",
      },
      "401": { description: "Unauthenticated" },
    },
  },
  {
    path: "/api/cases",
    method: "post",
    summary: "Create a new case",
    tags: ["Cases"],
    auth: "user",
    requestBody: {
      contentType: "application/json",
      required: true,
      schema: {
        type: "object",
        required: ["type", "title"],
        properties: {
          type: { type: "string" },
          title: { type: "string", maxLength: 200 },
        },
      },
    },
    responses: {
      "201": { description: "Case created" },
      "400": { description: "Validation failed" },
      "401": { description: "Unauthenticated" },
      "429": { description: "Rate limit exceeded" },
    },
  },
  // ----- Stripe -----
  {
    path: "/api/stripe/checkout",
    method: "post",
    summary: "Create Stripe Checkout Session",
    tags: ["Payments"],
    auth: "user",
    requestBody: {
      contentType: "application/json",
      required: true,
      schema: {
        type: "object",
        required: ["sku"],
        properties: {
          sku: { type: "string", enum: ["single", "package5", "subscription"] },
        },
      },
    },
    responses: {
      "200": { description: "Checkout URL returned" },
      "401": { description: "Unauthenticated" },
      "503": { description: "Stripe unavailable" },
    },
  },
  {
    path: "/api/stripe/webhook",
    method: "post",
    summary: "Stripe webhook (HMAC-verified)",
    tags: ["Payments", "Internal"],
    auth: "service",
    responses: {
      "200": { description: "Acknowledged" },
      "400": { description: "Invalid signature" },
    },
  },
  // ----- Health -----
  {
    path: "/api/health",
    method: "get",
    summary: "Liveness probe",
    tags: ["Health"],
    auth: "none",
    responses: { "200": { description: "OK" } },
  },
  {
    path: "/api/health/deep",
    method: "get",
    summary: "Deep readiness probe (Supabase, Stripe, Anthropic)",
    tags: ["Health"],
    auth: "service",
    responses: {
      "200": { description: "All systems operational" },
      "401": { description: "Missing health token" },
      "503": { description: "Critical dependency down" },
    },
  },
  {
    path: "/api/health/pool",
    method: "get",
    summary: "Connection pool / circuit / memory stats",
    tags: ["Health"],
    auth: "service",
    responses: {
      "200": { description: "Stats" },
      "401": { description: "Missing health token" },
    },
  },
  // ----- Observability -----
  {
    path: "/api/observability/vitals",
    method: "post",
    summary: "Web Vitals beacon (LCP/INP/CLS/FCP/TTFB)",
    tags: ["Observability"],
    auth: "none",
    responses: { "204": { description: "Accepted" } },
  },
  {
    path: "/api/observability/error",
    method: "post",
    summary: "Client error beacon",
    tags: ["Observability"],
    auth: "none",
    responses: { "204": { description: "Accepted" } },
  },
  // ----- Security -----
  {
    path: "/api/csp-report",
    method: "post",
    summary: "CSP violation report endpoint",
    tags: ["Security"],
    auth: "none",
    responses: { "204": { description: "Accepted" } },
  },
  // ----- RODO / GDPR -----
  {
    path: "/api/rodo/export",
    method: "post",
    summary: "Request RODO/GDPR data export",
    tags: ["GDPR"],
    auth: "user",
    responses: {
      "202": { description: "Export queued" },
      "401": { description: "Unauthenticated" },
      "429": { description: "Rate limit" },
    },
  },
  {
    path: "/api/rodo/delete",
    method: "post",
    summary: "Request account deletion",
    tags: ["GDPR"],
    auth: "user",
    responses: {
      "202": { description: "Deletion queued" },
      "401": { description: "Unauthenticated" },
    },
  },
];

function buildOpenApi(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const r of ROUTES) {
    if (!paths[r.path]) paths[r.path] = {};
    const op: Record<string, unknown> = {
      summary: r.summary,
      tags: r.tags,
      description: [
        r.description,
        r.rateLimit ? `Rate limit: ${r.rateLimit}.` : null,
        r.auth !== "none" ? `Auth: ${r.auth}.` : null,
      ]
        .filter(Boolean)
        .join(" "),
      security:
        r.auth === "none"
          ? []
          : r.auth === "service"
            ? [{ bearerAuth: [] }]
            : [{ supabaseSession: [] }],
      responses: Object.fromEntries(
        Object.entries(r.responses).map(([code, resp]) => [
          code,
          {
            description: resp.description,
            ...(resp.schema
              ? {
                  content: {
                    [resp.contentType ?? "application/json"]: { schema: resp.schema },
                  },
                }
              : {}),
          },
        ]),
      ),
    };
    if (r.requestBody) {
      op.requestBody = {
        required: r.requestBody.required ?? true,
        content: {
          [r.requestBody.contentType]: { schema: r.requestBody.schema },
        },
      };
    }
    if (r.headers) {
      op.parameters = Object.entries(r.headers).map(([name, h]) => ({
        in: "header",
        name,
        required: h.required ?? false,
        schema: { type: "string" },
        description: h.description,
      }));
    }
    paths[r.path][r.method] = op;
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Długomat API",
      version: "1.0.0",
      description:
        "AI-powered legal-tech SaaS for debtors. Public + internal API surface. See /docs/openapi.yaml for full spec.",
      contact: { email: "pomoc@dlugomat.pl", name: "Długomat Support" },
      license: { name: "Proprietary" },
    },
    servers: [
      { url: "https://dlugomat.pl", description: "Production" },
      { url: "https://staging.dlugomat.pl", description: "Staging" },
    ],
    components: {
      securitySchemes: {
        supabaseSession: {
          type: "apiKey",
          in: "cookie",
          name: "sb-access-token",
          description: "Supabase session cookie (set by /auth/login).",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Service token (HEALTH_DEEP_TOKEN, cron, webhooks).",
        },
      },
    },
    paths,
    tags: [
      { name: "AI", description: "AI generation endpoints." },
      { name: "Cases", description: "Case CRUD operations." },
      { name: "Payments", description: "Stripe integration." },
      { name: "Health", description: "Liveness and readiness probes." },
      { name: "Observability", description: "Web Vitals, errors, telemetry." },
      { name: "Security", description: "CSP reports, audit." },
      { name: "GDPR", description: "RODO data subject rights." },
      { name: "Internal", description: "Service-to-service only." },
    ],
  };
}

function toYaml(obj: unknown, indent = 0): string {
  // Minimalistyczny serializator JSON→YAML (wystarczy dla naszego spec'a).
  const sp = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "string") {
    if (/^[A-Za-z0-9_./:-]+$/.test(obj) && !/^(yes|no|true|false|null)$/i.test(obj))
      return obj;
    return JSON.stringify(obj);
  }
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((v) => {
        if (typeof v === "object" && v !== null) {
          const inner = toYaml(v, indent + 1).trimStart();
          return `${sp}- ${inner}`;
        }
        return `${sp}- ${toYaml(v, indent + 1)}`;
      })
      .join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        if (v === null || v === undefined) return `${sp}${k}: null`;
        if (typeof v === "object") {
          const inner = toYaml(v, indent + 1);
          if (Array.isArray(v) && v.length === 0) return `${sp}${k}: []`;
          if (!Array.isArray(v) && Object.keys(v).length === 0)
            return `${sp}${k}: {}`;
          return `${sp}${k}:\n${inner}`;
        }
        return `${sp}${k}: ${toYaml(v, 0)}`;
      })
      .join("\n");
  }
  return JSON.stringify(obj);
}

export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "yaml";
  const spec = buildOpenApi();

  if (format === "json") {
    return NextResponse.json(spec, {
      headers: {
        "cache-control": "public, max-age=300, s-maxage=600",
        "content-type": "application/json; charset=utf-8",
      },
    });
  }

  const yaml = toYaml(spec);
  return new NextResponse(yaml, {
    headers: {
      "content-type": "application/yaml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=600",
    },
  });
}
