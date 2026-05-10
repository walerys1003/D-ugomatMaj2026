/**
 * Tier 6 zad. 295 — API versioning strategy (v1 → v2 ready).
 *
 * Strategia: header-based + URL-path-based fallback.
 *   Priorytet:
 *     1) Header `Accept-Version: 2` lub `X-API-Version: 2`
 *     2) Prefix URL `/api/v2/...`
 *     3) Default → v1
 *
 * Lifecycle:
 *   - v1: current GA (stable, supported forever w MVP)
 *   - v2: future (breaking changes — np. nowy schemat case, refactor pricing)
 *   - Deprecation window: 12 miesięcy od ogłoszenia v3 do shutdown v1.
 *
 * Response headers:
 *   - `X-API-Version: 1` — aktualnie obsługiwany
 *   - `Sunset: <RFC 7231 date>` — gdy klient używa deprecated wersji
 *   - `Deprecation: true` — flag
 *   - `Link: </docs/api/v2-migration>; rel="deprecation"`
 */

export type ApiVersion = "1" | "2";

export const CURRENT_VERSION: ApiVersion = "1";
export const LATEST_VERSION: ApiVersion = "1"; // v2 jeszcze nie wydane
export const SUPPORTED_VERSIONS: ApiVersion[] = ["1"];

export interface VersionInfo {
  version: ApiVersion;
  deprecated: boolean;
  sunset?: string; // ISO date
  source: "header" | "url" | "default";
}

export function resolveApiVersion(
  headers: Headers,
  pathname: string,
): VersionInfo {
  // 1) Header
  const headerVer =
    headers.get("accept-version") ??
    headers.get("x-api-version") ??
    null;
  if (headerVer && isSupported(headerVer)) {
    return {
      version: headerVer as ApiVersion,
      deprecated: isDeprecated(headerVer as ApiVersion),
      sunset: getSunset(headerVer as ApiVersion),
      source: "header",
    };
  }

  // 2) URL prefix
  const match = pathname.match(/^\/api\/v(\d+)\//);
  if (match && isSupported(match[1])) {
    const v = match[1] as ApiVersion;
    return {
      version: v,
      deprecated: isDeprecated(v),
      sunset: getSunset(v),
      source: "url",
    };
  }

  // 3) Default
  return {
    version: CURRENT_VERSION,
    deprecated: false,
    source: "default",
  };
}

function isSupported(v: string): boolean {
  return SUPPORTED_VERSIONS.includes(v as ApiVersion);
}

function isDeprecated(v: ApiVersion): boolean {
  return false; // żadna jeszcze nie deprecated
}

function getSunset(v: ApiVersion): string | undefined {
  // Gdy ogłosimy v2 GA, wtedy ustawimy sunset dla v1
  // np. return v === "1" ? "Sun, 11 May 2027 00:00:00 GMT" : undefined;
  return undefined;
}

/**
 * Apply versioning headers do Response.
 */
export function applyVersionHeaders(
  response: Response,
  info: VersionInfo,
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-API-Version", info.version);
  if (info.deprecated) {
    headers.set("Deprecation", "true");
    if (info.sunset) headers.set("Sunset", info.sunset);
    headers.append(
      "Link",
      `</docs/api/v${Number(info.version) + 1}-migration>; rel="deprecation"`,
    );
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
