/**
 * Tier 10 — Minimal OpenAPI 3.1 spec generator for Długomat public API endpoints.
 * Hand-curated registry — kept in sync with /apps/web/app/api/public/.
 */
export interface OpenApiPath {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  summary: string;
  tags: string[];
  requestBody?: Record<string, unknown>;
  parameters?: Record<string, unknown>[];
  responses: Record<string, { description: string }>;
  security?: Array<Record<string, unknown[]>>;
}

const REGISTRY: OpenApiPath[] = [
  {
    path: "/api/public/v1/cases",
    method: "get",
    summary: "List cases for authenticated API key",
    tags: ["cases"],
    parameters: [
      { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 200 } },
      { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
    ],
    responses: {
      "200": { description: "Paginated list of cases" },
      "401": { description: "Unauthorized" },
      "429": { description: "Rate limited" },
    },
    security: [{ apiKey: [] }],
  },
  {
    path: "/api/public/v1/cases",
    method: "post",
    summary: "Create case",
    tags: ["cases"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/CaseCreate" },
        },
      },
    },
    responses: {
      "201": { description: "Created" },
      "400": { description: "Validation error" },
    },
    security: [{ apiKey: [] }],
  },
  {
    path: "/api/public/v1/documents/{id}",
    method: "get",
    summary: "Retrieve a generated document",
    tags: ["documents"],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
      "200": { description: "Document payload" },
      "404": { description: "Not found" },
    },
    security: [{ apiKey: [] }],
  },
  {
    path: "/api/public/v1/billing/subscriptions",
    method: "get",
    summary: "Get current subscription for API key owner",
    tags: ["billing"],
    responses: { "200": { description: "Subscription details" } },
    security: [{ apiKey: [] }],
  },
];

export function generateOpenApiSpec(): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const r of REGISTRY) {
    paths[r.path] ??= {};
    paths[r.path][r.method] = {
      summary: r.summary,
      tags: r.tags,
      parameters: r.parameters,
      requestBody: r.requestBody,
      responses: r.responses,
      security: r.security,
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "Długomat Public API",
      version: "1.0.0",
      description:
        "Public REST API for case management, document generation, and billing. Auth via API keys (X-API-Key header).",
      contact: { name: "Długomat", url: "https://dlugomat.pl" },
      license: { name: "Proprietary" },
    },
    servers: [{ url: "https://dlugomat.pl" }, { url: "https://staging.dlugomat.pl" }],
    paths,
    components: {
      securitySchemes: {
        apiKey: { type: "apiKey", in: "header", name: "X-API-Key" },
      },
      schemas: {
        CaseCreate: {
          type: "object",
          required: ["case_type"],
          properties: {
            case_type: { type: "string" },
            title: { type: "string" },
            metadata: { type: "object", additionalProperties: true },
          },
        },
      },
    },
  };
}
