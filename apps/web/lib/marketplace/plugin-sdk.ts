// Plugin SDK + manifest schema. Plugins extend Długomat with custom UI panels,
// background hooks and document generators. Manifest schema validated at install.
export type PluginPermission =
  | "cases:read"
  | "cases:write"
  | "documents:read"
  | "documents:write"
  | "ai:invoke"
  | "billing:read"
  | "webhooks:emit"
  | "settings:read"
  | "network:fetch";

export interface PluginManifest {
  id: string; // reverse-DNS, e.g. com.example.duplikator
  name: string;
  version: string; // semver
  apiVersion: "2024-01" | "2024-06" | "2025-01";
  publisher: string;
  description: string;
  entrypoints: {
    panel?: string; // iframe URL
    backgroundWorker?: string; // worker URL
    webhookSubscriber?: string;
  };
  permissions: PluginPermission[];
  configSchema?: Record<string, unknown>;
  uiHooks?: Array<"case.toolbar" | "document.actions" | "settings.tab" | "dashboard.widget">;
  pricing?: { model: "free" | "paid"; priceCents?: number };
}

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.\-]+)?$/;
const REVERSE_DNS_RE = /^[a-z0-9.\-]{3,80}$/;
const VALID_API = ["2024-01", "2024-06", "2025-01"];
const ALL_PERMISSIONS: PluginPermission[] = [
  "cases:read",
  "cases:write",
  "documents:read",
  "documents:write",
  "ai:invoke",
  "billing:read",
  "webhooks:emit",
  "settings:read",
  "network:fetch",
];

export function validateManifest(m: unknown): { ok: true; manifest: PluginManifest } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!m || typeof m !== "object") return { ok: false, errors: ["manifest must be an object"] };
  const x = m as Record<string, any>;
  if (!REVERSE_DNS_RE.test(String(x.id ?? ""))) errors.push("id must be reverse-DNS");
  if (!x.name || typeof x.name !== "string") errors.push("name required");
  if (!SEMVER_RE.test(String(x.version ?? ""))) errors.push("version must be semver");
  if (!VALID_API.includes(String(x.apiVersion))) errors.push("apiVersion unsupported");
  if (!x.publisher) errors.push("publisher required");
  if (!x.description) errors.push("description required");
  if (!Array.isArray(x.permissions)) errors.push("permissions must be an array");
  else {
    for (const p of x.permissions) if (!ALL_PERMISSIONS.includes(p)) errors.push(`unknown permission: ${p}`);
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, manifest: x as PluginManifest };
}

// Plugin sandbox profile — minimal capability surface enforced at runtime.
export interface SandboxProfile {
  cpuMsBudget: number;
  memoryMbBudget: number;
  egressAllowlist: string[];
  permissions: PluginPermission[];
  timeoutMs: number;
}

export function defaultSandboxProfile(permissions: PluginPermission[]): SandboxProfile {
  return {
    cpuMsBudget: 5000,
    memoryMbBudget: 128,
    egressAllowlist: ["api.dlugomat.pl", "api.openai.com", "api.anthropic.com"],
    permissions,
    timeoutMs: 30_000,
  };
}

export function permissionsRiskScore(permissions: PluginPermission[]): number {
  const weights: Record<PluginPermission, number> = {
    "cases:read": 2,
    "cases:write": 4,
    "documents:read": 2,
    "documents:write": 4,
    "ai:invoke": 1,
    "billing:read": 3,
    "webhooks:emit": 2,
    "settings:read": 2,
    "network:fetch": 3,
  };
  return permissions.reduce((s, p) => s + (weights[p] ?? 0), 0);
}
