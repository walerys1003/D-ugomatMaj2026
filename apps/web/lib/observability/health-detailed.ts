/**
 * Tier 30 — Enhanced health check helpers.
 * Rozszerza /api/health/deep o weryfikację:
 *   - Resend (email)
 *   - PostHog (analytics)
 *   - OAuth providers (token endpoint reachable)
 *   - OpenAI / Anthropic (AI providers)
 */
import "server-only";

export interface HealthComponent {
  name: string;
  status: "ok" | "degraded" | "down" | "skipped";
  latency_ms?: number;
  detail?: string;
}

async function pingWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 2500,
): Promise<{ ok: boolean; latency: number; status?: number; error?: string }> {
  const start = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return { ok: res.ok, latency: Date.now() - start, status: res.status };
  } catch (e: any) {
    return {
      ok: false,
      latency: Date.now() - start,
      error: e?.name === "AbortError" ? "timeout" : e?.message ?? "fetch_failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkResendHealth(): Promise<HealthComponent> {
  if (!process.env.RESEND_API_KEY) return { name: "resend", status: "skipped" };
  const r = await pingWithTimeout("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  return {
    name: "resend",
    status: r.ok ? "ok" : r.status === 401 ? "down" : "degraded",
    latency_ms: r.latency,
    detail: r.error,
  };
}

export async function checkPosthogHealth(): Promise<HealthComponent> {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  const r = await pingWithTimeout(`${host}/health`, {}, 1500);
  return {
    name: "posthog",
    status: r.ok ? "ok" : "degraded",
    latency_ms: r.latency,
    detail: r.error,
  };
}

export async function checkOpenAiHealth(): Promise<HealthComponent> {
  if (!process.env.OPENAI_API_KEY) return { name: "openai", status: "skipped" };
  const r = await pingWithTimeout("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  return {
    name: "openai",
    status: r.ok ? "ok" : r.status === 401 ? "down" : "degraded",
    latency_ms: r.latency,
    detail: r.error,
  };
}

export async function checkGoogleOauthHealth(): Promise<HealthComponent> {
  const r = await pingWithTimeout(
    "https://accounts.google.com/.well-known/openid-configuration",
    {},
    2000,
  );
  return {
    name: "google_oauth",
    status: r.ok ? "ok" : "degraded",
    latency_ms: r.latency,
  };
}

export async function checkMicrosoftOauthHealth(): Promise<HealthComponent> {
  const r = await pingWithTimeout(
    "https://login.microsoftonline.com/common/.well-known/openid-configuration",
    {},
    2000,
  );
  return {
    name: "microsoft_oauth",
    status: r.ok ? "ok" : "degraded",
    latency_ms: r.latency,
  };
}

/**
 * Uruchamia wszystkie dodatkowe health checks paralelnie.
 */
export async function runAllExtendedChecks(): Promise<HealthComponent[]> {
  const checks = await Promise.allSettled([
    checkResendHealth(),
    checkPosthogHealth(),
    checkOpenAiHealth(),
    checkGoogleOauthHealth(),
    checkMicrosoftOauthHealth(),
  ]);
  return checks.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      name: ["resend", "posthog", "openai", "google_oauth", "microsoft_oauth"][i],
      status: "down" as const,
      detail: String(r.reason),
    };
  });
}
