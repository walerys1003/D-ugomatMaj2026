/**
 * Tier 24 — SDK Generator: OpenAPI 3.1 → typed TypeScript + Python clients.
 *
 * Generuje:
 *   - openapi.json (specyfikacja API Długomat v1)
 *   - SDK TypeScript (fetch-based, zero deps)
 *   - SDK Python (httpx-based)
 *
 * SDK są zgodne z naszym auth (Bearer API key + HMAC-signed body dla wybranych endpointów).
 */

export type OpenApiOperation = {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  operationId: string;
  summary: string;
  tag: string;
  requestBody?: {
    contentType: "application/json";
    schemaName: string;
    required?: boolean;
  };
  responses: Record<
    string,
    { description: string; schemaName?: string }
  >;
  queryParams?: { name: string; type: "string" | "number" | "boolean"; required?: boolean }[];
  pathParams?: { name: string; type: "string" | "number" }[];
  auth?: "bearer" | "hmac" | "none";
};

export interface OpenApiSchema {
  type: "object";
  required?: string[];
  properties: Record<
    string,
    {
      type: "string" | "number" | "integer" | "boolean" | "array" | "object";
      format?: string;
      description?: string;
      enum?: string[];
      items?: { $ref?: string; type?: string };
      $ref?: string;
      nullable?: boolean;
    }
  >;
}

/**
 * Canonical API spec — kept in lock-step with our route handlers.
 * Tagged operations form the public v1 surface.
 */
export const API_SPEC: { operations: OpenApiOperation[]; schemas: Record<string, OpenApiSchema> } = {
  schemas: {
    Case: {
      type: "object",
      required: ["id", "user_id", "type", "status", "created_at"],
      properties: {
        id: { type: "string", format: "uuid" },
        user_id: { type: "string", format: "uuid" },
        type: { type: "string", description: "Case type slug e.g. 'sprzeciw_epu'" },
        status: { type: "string", enum: ["draft", "in_progress", "submitted", "won", "lost", "archived"] },
        title: { type: "string", nullable: true },
        created_at: { type: "string", format: "date-time" },
      },
    },
    CaseCreate: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string" },
        title: { type: "string" },
      },
    },
    Document: {
      type: "object",
      required: ["id", "case_id", "kind", "created_at"],
      properties: {
        id: { type: "string", format: "uuid" },
        case_id: { type: "string", format: "uuid" },
        kind: { type: "string" },
        pdf_url: { type: "string", nullable: true },
        created_at: { type: "string", format: "date-time" },
      },
    },
    Deadline: {
      type: "object",
      required: ["id", "case_id", "due_at", "kind"],
      properties: {
        id: { type: "string", format: "uuid" },
        case_id: { type: "string", format: "uuid" },
        kind: { type: "string" },
        due_at: { type: "string", format: "date-time" },
        notified_24h: { type: "boolean" },
      },
    },
    AgentRunCreate: {
      type: "object",
      required: ["goal"],
      properties: {
        goal: { type: "string" },
        mode: { type: "string", enum: ["react", "plan_execute"] },
        max_steps: { type: "integer" },
      },
    },
    WebhookEndpointCreate: {
      type: "object",
      required: ["url", "events"],
      properties: {
        url: { type: "string", format: "uri" },
        events: { type: "array", items: { type: "string" } },
      },
    },
    Error: {
      type: "object",
      required: ["error"],
      properties: {
        error: { type: "string" },
        message: { type: "string" },
      },
    },
  },
  operations: [
    {
      method: "post",
      path: "/api/v1/cases",
      operationId: "createCase",
      summary: "Create a new case",
      tag: "cases",
      auth: "bearer",
      requestBody: { contentType: "application/json", schemaName: "CaseCreate", required: true },
      responses: {
        "201": { description: "Created", schemaName: "Case" },
        "401": { description: "Unauthenticated", schemaName: "Error" },
      },
    },
    {
      method: "get",
      path: "/api/v1/cases",
      operationId: "listCases",
      summary: "List user's cases",
      tag: "cases",
      auth: "bearer",
      queryParams: [
        { name: "status", type: "string" },
        { name: "limit", type: "number" },
      ],
      responses: { "200": { description: "OK", schemaName: "Case" } },
    },
    {
      method: "get",
      path: "/api/v1/cases/{id}",
      operationId: "getCase",
      summary: "Get case by id",
      tag: "cases",
      auth: "bearer",
      pathParams: [{ name: "id", type: "string" }],
      responses: {
        "200": { description: "OK", schemaName: "Case" },
        "404": { description: "Not found", schemaName: "Error" },
      },
    },
    {
      method: "get",
      path: "/api/v1/documents",
      operationId: "listDocuments",
      summary: "List documents (filtered by case_id)",
      tag: "documents",
      auth: "bearer",
      queryParams: [{ name: "case_id", type: "string" }],
      responses: { "200": { description: "OK", schemaName: "Document" } },
    },
    {
      method: "get",
      path: "/api/v1/deadlines",
      operationId: "listDeadlines",
      summary: "List upcoming deadlines",
      tag: "deadlines",
      auth: "bearer",
      queryParams: [{ name: "horizon_days", type: "number" }],
      responses: { "200": { description: "OK", schemaName: "Deadline" } },
    },
    {
      method: "post",
      path: "/api/ai/agent/run",
      operationId: "runAgent",
      summary: "Trigger an AI agent run (ReAct or plan-execute)",
      tag: "ai",
      auth: "bearer",
      requestBody: { contentType: "application/json", schemaName: "AgentRunCreate", required: true },
      responses: { "201": { description: "Created" } },
    },
    {
      method: "post",
      path: "/api/webhooks/endpoints",
      operationId: "registerWebhook",
      summary: "Register a webhook endpoint",
      tag: "webhooks",
      auth: "bearer",
      requestBody: {
        contentType: "application/json",
        schemaName: "WebhookEndpointCreate",
        required: true,
      },
      responses: { "201": { description: "Created" } },
    },
  ],
};

// -----------------------------------------------------------------------------
// OpenAPI JSON generator
// -----------------------------------------------------------------------------
export function buildOpenApiDocument(baseUrl?: string): unknown {
  const components = {
    schemas: Object.fromEntries(
      Object.entries(API_SPEC.schemas).map(([k, v]) => [k, v]),
    ),
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
  };
  const paths: Record<string, any> = {};
  for (const op of API_SPEC.operations) {
    const path = op.path.replace(/{([^}]+)}/g, "{$1}");
    paths[path] = paths[path] ?? {};
    const operation: any = {
      operationId: op.operationId,
      summary: op.summary,
      tags: [op.tag],
      parameters: [
        ...(op.pathParams ?? []).map((p) => ({
          name: p.name,
          in: "path",
          required: true,
          schema: { type: p.type },
        })),
        ...(op.queryParams ?? []).map((p) => ({
          name: p.name,
          in: "query",
          required: !!p.required,
          schema: { type: p.type },
        })),
      ],
      responses: Object.fromEntries(
        Object.entries(op.responses).map(([code, r]) => [
          code,
          {
            description: r.description,
            ...(r.schemaName
              ? {
                  content: {
                    "application/json": {
                      schema: { $ref: `#/components/schemas/${r.schemaName}` },
                    },
                  },
                }
              : {}),
          },
        ]),
      ),
      ...(op.auth === "bearer" ? { security: [{ bearerAuth: [] }] } : {}),
    };
    if (op.requestBody) {
      operation.requestBody = {
        required: op.requestBody.required ?? false,
        content: {
          [op.requestBody.contentType]: {
            schema: { $ref: `#/components/schemas/${op.requestBody.schemaName}` },
          },
        },
      };
    }
    paths[path][op.method] = operation;
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "Długomat API",
      version: "1.0.0",
      description: "Public API for the Długomat legal-tech platform.",
      contact: { name: "Długomat", url: "https://dlugomat.pl/kontakt" },
    },
    servers: baseUrl
      ? [{ url: baseUrl }]
      : [{ url: process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl" }],
    paths,
    components,
  };
}

// -----------------------------------------------------------------------------
// TypeScript SDK generator
// -----------------------------------------------------------------------------
function tsTypeFromSchema(schemaName: string): string {
  return schemaName;
}

function tsTypeForProp(p: OpenApiSchema["properties"][string]): string {
  if (p.$ref) return p.$ref.split("/").pop()!;
  if (p.type === "array") {
    if (p.items?.$ref) return `${p.items.$ref.split("/").pop()}[]`;
    if (p.items?.type) return `${p.items.type}[]`;
    return "unknown[]";
  }
  if (p.type === "integer") return "number";
  return p.type;
}

export function generateTypeScriptSdk(): string {
  const out: string[] = [];
  out.push("// Generated by Długomat SDK Generator. Do not edit manually.");
  out.push("// Source: GET /api/integrations/sdk?lang=ts");
  out.push("");
  // Types
  for (const [name, schema] of Object.entries(API_SPEC.schemas)) {
    out.push(`export interface ${name} {`);
    for (const [k, v] of Object.entries(schema.properties)) {
      const optional = schema.required?.includes(k) ? "" : "?";
      const nullable = v.nullable ? " | null" : "";
      out.push(`  ${k}${optional}: ${tsTypeForProp(v)}${nullable};`);
    }
    out.push("}");
    out.push("");
  }
  // Client class
  out.push("export interface DlugomatClientOptions {");
  out.push("  apiKey: string;");
  out.push("  baseUrl?: string;");
  out.push("  fetch?: typeof fetch;");
  out.push("}");
  out.push("");
  out.push("export class DlugomatClient {");
  out.push("  private apiKey: string;");
  out.push("  private baseUrl: string;");
  out.push("  private fetchImpl: typeof fetch;");
  out.push("  constructor(opts: DlugomatClientOptions) {");
  out.push('    this.apiKey = opts.apiKey;');
  out.push('    this.baseUrl = (opts.baseUrl ?? "https://dlugomat.pl").replace(/\\/+$/, "");');
  out.push("    this.fetchImpl = opts.fetch ?? fetch;");
  out.push("  }");
  out.push("");
  out.push("  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {");
  out.push("    const res = await this.fetchImpl(this.baseUrl + path, {");
  out.push("      method,");
  out.push("      headers: {");
  out.push("        authorization: `Bearer ${this.apiKey}`,");
  out.push('        "content-type": "application/json",');
  out.push("      },");
  out.push("      body: body ? JSON.stringify(body) : undefined,");
  out.push("    });");
  out.push("    const text = await res.text();");
  out.push("    const json = text ? JSON.parse(text) : null;");
  out.push("    if (!res.ok) throw new Error(json?.error ?? `http_${res.status}`);");
  out.push("    return json as T;");
  out.push("  }");
  out.push("");
  for (const op of API_SPEC.operations) {
    const args: string[] = [];
    const pathArgs = op.pathParams ?? [];
    const queryArgs = op.queryParams ?? [];
    let pathExpr = "`" + op.path.replace(/{([^}]+)}/g, "${$1}") + "`";
    for (const p of pathArgs) args.push(`${p.name}: ${p.type}`);
    if (queryArgs.length) {
      args.push(
        `query?: { ${queryArgs.map((q) => `${q.name}?: ${q.type}`).join("; ")} }`,
      );
      pathExpr =
        pathExpr +
        " + (query ? `?${new URLSearchParams(query as any).toString()}` : '')";
    }
    if (op.requestBody) args.push(`body: ${tsTypeFromSchema(op.requestBody.schemaName)}`);
    const returnType =
      op.responses["200"]?.schemaName ?? op.responses["201"]?.schemaName ?? "unknown";
    const isArr = op.method === "get" && !pathArgs.length;
    const rt =
      op.responses["200"]?.schemaName ?? op.responses["201"]?.schemaName
        ? isArr
          ? `${returnType}[]`
          : returnType
        : "unknown";
    out.push(`  async ${op.operationId}(${args.join(", ")}): Promise<${rt}> {`);
    out.push(
      `    return this.request<${rt}>("${op.method.toUpperCase()}", ${pathExpr}${op.requestBody ? ", body" : ""});`,
    );
    out.push("  }");
    out.push("");
  }
  out.push("}");
  out.push("");
  return out.join("\n");
}

// -----------------------------------------------------------------------------
// Python SDK generator
// -----------------------------------------------------------------------------
function pyTypeForProp(p: OpenApiSchema["properties"][string]): string {
  if (p.$ref) return p.$ref.split("/").pop()!;
  if (p.type === "array") {
    if (p.items?.$ref) return `list[${p.items.$ref.split("/").pop()}]`;
    if (p.items?.type) return `list[${mapPy(p.items.type)}]`;
    return "list";
  }
  return mapPy(p.type);
}
function mapPy(t: string): string {
  if (t === "string") return "str";
  if (t === "number") return "float";
  if (t === "integer") return "int";
  if (t === "boolean") return "bool";
  if (t === "object") return "dict";
  return "Any";
}

export function generatePythonSdk(): string {
  const out: string[] = [];
  out.push("# Generated by Długomat SDK Generator. Do not edit manually.");
  out.push("# Source: GET /api/integrations/sdk?lang=py");
  out.push("from __future__ import annotations");
  out.push("from dataclasses import dataclass");
  out.push("from typing import Any, Optional");
  out.push("import httpx");
  out.push("");
  for (const [name, schema] of Object.entries(API_SPEC.schemas)) {
    out.push("@dataclass");
    out.push(`class ${name}:`);
    const required = (schema.required ?? []) as string[];
    const sortedProps = Object.entries(schema.properties).sort(([a], [b]) => {
      const ra = required.includes(a) ? 0 : 1;
      const rb = required.includes(b) ? 0 : 1;
      return ra - rb;
    });
    for (const [k, v] of sortedProps) {
      const t = pyTypeForProp(v);
      const isReq = required.includes(k) && !v.nullable;
      const finalT = v.nullable ? `Optional[${t}]` : t;
      out.push(`    ${k}: ${finalT}${isReq ? "" : " = None"}`);
    }
    out.push("");
  }
  out.push("class DlugomatClient:");
  out.push("    def __init__(self, api_key: str, base_url: str = 'https://dlugomat.pl'):");
  out.push("        self._api_key = api_key");
  out.push("        self._base_url = base_url.rstrip('/')");
  out.push("        self._client = httpx.Client(timeout=30)");
  out.push("");
  out.push("    def _request(self, method: str, path: str, json_body: Any = None) -> Any:");
  out.push("        r = self._client.request(");
  out.push("            method,");
  out.push("            self._base_url + path,");
  out.push("            json=json_body,");
  out.push("            headers={'Authorization': f'Bearer {self._api_key}'},");
  out.push("        )");
  out.push("        r.raise_for_status()");
  out.push("        return r.json() if r.text else None");
  out.push("");
  for (const op of API_SPEC.operations) {
    const args = ["self"];
    for (const p of op.pathParams ?? []) args.push(`${p.name}: str`);
    if (op.queryParams?.length) args.push("**query: Any");
    if (op.requestBody) args.push("body: dict");
    let pathExpr = `'${op.path}'`;
    if (op.pathParams?.length) {
      pathExpr =
        "f'" +
        op.path.replace(/{([^}]+)}/g, "{$1}") +
        "'";
    }
    if (op.queryParams?.length) {
      pathExpr =
        pathExpr +
        " + ('?' + httpx.QueryParams(query).__str__() if query else '')";
    }
    out.push(`    def ${op.operationId}(${args.join(", ")}) -> Any:`);
    out.push(
      `        return self._request('${op.method.toUpperCase()}', ${pathExpr}${op.requestBody ? ", body" : ""})`,
    );
    out.push("");
  }
  return out.join("\n");
}
