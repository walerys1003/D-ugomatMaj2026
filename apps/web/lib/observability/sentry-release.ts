/**
 * Tier 6 zad. 253 — Sentry release tracking.
 *
 * Cel: korelacja błędów z deployment'em (VERCEL_GIT_COMMIT_SHA). Pozwala
 * w Sentry / własnym dashboardzie zobaczyć "regression introduced by
 * commit abc123" zamiast czystego stack trace'a.
 *
 * Zachowanie:
 *   - Bez Sentry SDK: eksportujemy releaseId do logów + JSON response headers
 *   - Z Sentry SDK (lazy): wywołujemy Sentry.setRelease()
 *
 * Brak twardej zależności na `@sentry/nextjs` — try-require pattern.
 */

let cachedRelease: string | null = null;

export function getReleaseId(): string {
  if (cachedRelease) return cachedRelease;

  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    "";

  const env =
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development";

  cachedRelease = sha
    ? `dlugomat@${env}-${sha.slice(0, 7)}`
    : `dlugomat@${env}-local`;

  return cachedRelease;
}

export function getDeploymentMeta(): Record<string, string> {
  return {
    release: getReleaseId(),
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    region: process.env.VERCEL_REGION ?? "unknown",
    git_branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
    git_repo: process.env.VERCEL_GIT_REPO_SLUG ?? "unknown",
    deployed_at: process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN
      ? new Date().toISOString()
      : "unknown",
  };
}

/**
 * Wywoływane raz przy boot serwera (np. w `instrumentation.ts`).
 * Lazy-loaduje Sentry jeśli zainstalowany.
 */
export async function initReleaseTracking(): Promise<void> {
  const releaseId = getReleaseId();
  const meta = getDeploymentMeta();

  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      msg: "deployment.boot",
      ...meta,
    }),
  );

  // Lazy Sentry — nie wymaga deps.
  try {
    // @ts-expect-error — optional dep
    const Sentry = (await import("@sentry/nextjs").catch(() => null)) as
      | { setTag?: (k: string, v: string) => void; setContext?: (n: string, c: Record<string, unknown>) => void }
      | null;
    if (Sentry?.setTag) {
      Sentry.setTag("release", releaseId);
      Sentry.setTag("env", meta.env);
      Sentry.setContext?.("deployment", meta);
    }
  } catch {
    // brak Sentry — OK
  }
}
