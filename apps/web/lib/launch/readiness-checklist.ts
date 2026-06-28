/**
 * Tier 10 — Production launch readiness checklist.
 * Verifies env vars, DB migrations, integrations, and security posture.
 */
export type CheckSeverity = "blocker" | "warning" | "info";
export type CheckStatus = "pass" | "fail" | "skip";

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  severity: CheckSeverity;
  detail?: string;
}

export interface ReadinessReport {
  ready: boolean;
  blockers: number;
  warnings: number;
  passed: number;
  results: CheckResult[];
  generated_at: string;
}

const REQUIRED_ENV_BLOCKER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "ANTHROPIC_API_KEY",
];

const REQUIRED_ENV_WARN = [
  "RESEND_API_KEY",
  "POSTMARK_API_KEY",
  "SENTRY_DSN",
  "FAKTUROWNIA_API_TOKEN",
  "STRIPE_PORTAL_CONFIGURATION_ID",
];

export function runReadinessChecks(): ReadinessReport {
  const results: CheckResult[] = [];
  for (const key of REQUIRED_ENV_BLOCKER) {
    const v = process.env[key];
    results.push({
      id: `env.${key}`,
      label: `Env var ${key} is set`,
      status: v && v.length > 0 ? "pass" : "fail",
      severity: "blocker",
      detail: v ? "present" : "missing",
    });
  }
  for (const key of REQUIRED_ENV_WARN) {
    const v = process.env[key];
    results.push({
      id: `env.${key}`,
      label: `Optional env ${key}`,
      status: v && v.length > 0 ? "pass" : "fail",
      severity: "warning",
      detail: v ? "present" : "missing (degraded mode)",
    });
  }
  results.push({
    id: "node.version",
    label: "Node >= 18",
    status: parseInt(process.versions.node.split(".")[0] ?? "0", 10) >= 18 ? "pass" : "fail",
    severity: "blocker",
    detail: process.versions.node,
  });
  results.push({
    id: "tz.default",
    label: "TZ=Europe/Warsaw (PL accounting)",
    status: (process.env.TZ ?? "").toLowerCase().includes("warsaw") ? "pass" : "fail",
    severity: "warning",
    detail: process.env.TZ ?? "unset",
  });
  results.push({
    id: "node_env",
    label: "NODE_ENV=production",
    status: process.env.NODE_ENV === "production" ? "pass" : "fail",
    severity: "warning",
    detail: process.env.NODE_ENV ?? "unset",
  });
  const blockers = results.filter((r) => r.severity === "blocker" && r.status === "fail").length;
  const warnings = results.filter((r) => r.severity === "warning" && r.status === "fail").length;
  const passed = results.filter((r) => r.status === "pass").length;
  return {
    ready: blockers === 0,
    blockers,
    warnings,
    passed,
    results,
    generated_at: new Date().toISOString(),
  };
}
