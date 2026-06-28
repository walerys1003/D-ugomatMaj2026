/**
 * Tier 5 zad. 246 — Public referral redirect endpoint.
 *
 * GET /r/<code>?to=<path>
 *
 * Flow:
 *   1) Walidacja kodu (regex)
 *   2) Set cookie 'dlugomat-ref' (90d, lax) — używany przy sign-up
 *   3) Async insert do referral_clicks (best-effort, nie blokuje redirectu)
 *   4) Redirect 302 do `?to=<path>` (sanityzowane do same-origin) lub `/`.
 *
 * Anty-spam:
 *   - rate-limit per-IP (60/min) z `RATE_LIMIT_PROFILES.api` — chroni
 *     przed flood (atakujący nie nadmuchuje liczników).
 *   - landing path zawsze same-origin (no open redirect).
 */
import { NextResponse, type NextRequest } from "next/server";

import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
} from "@/lib/security/rate-limit";
import {
  logReferralClick,
  setReferralCookie,
} from "@/lib/referrals/referral-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODE_REGEX = /^[a-zA-Z0-9_-]{6,24}$/;
// Same-origin redirect targets — whitelist'a.
const ALLOWED_TARGETS = new Set([
  "/",
  "/skaner-nakazu",
  "/cennik",
  "/jak-to-dziala",
  "/moduly",
  "/sign-up",
]);

function safeTarget(rawTo: string | null): string {
  if (!rawTo) return "/";
  // Tylko ścieżki, nie absolute URLs (anty open-redirect).
  if (!rawTo.startsWith("/")) return "/";
  // Odetnij query/fragment przy whitelist check
  const path = rawTo.split("?")[0]?.split("#")[0] ?? "/";
  if (ALLOWED_TARGETS.has(path)) return rawTo;
  // Pozwól też na /moduly/<slug> (whitelist prefiksu)
  if (/^\/moduly\/[a-z0-9-]{1,64}$/.test(path)) return rawTo;
  if (/^\/baza-wiedzy\/[a-z0-9-]{1,64}$/.test(path)) return rawTo;
  return "/";
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
): Promise<NextResponse> {
  const ip = clientIdFromHeaders(request.headers);
  const rl = rateLimit(`r:redirect:${ip}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return new NextResponse("rate_limited", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) },
    });
  }

  const rawCode = params.code?.trim();
  const codeUpper = rawCode?.toUpperCase();
  // Niepoprawny kod → redirect na /, ale BEZ ustawiania cookie.
  if (!codeUpper || !CODE_REGEX.test(codeUpper)) {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }

  // Cookie + best-effort log click. Nie czekamy na log error.
  setReferralCookie(codeUpper);

  const target = safeTarget(request.nextUrl.searchParams.get("to"));
  const utm = {
    utmSource: request.nextUrl.searchParams.get("utm_source"),
    utmMedium: request.nextUrl.searchParams.get("utm_medium"),
    utmCampaign: request.nextUrl.searchParams.get("utm_campaign"),
  };
  const httpReferrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  // Best-effort — fire-and-forget.
  void logReferralClick(codeUpper, {
    ip,
    userAgent,
    landingPath: target,
    httpReferrer,
    ...utm,
  });

  return NextResponse.redirect(new URL(target, request.url), { status: 302 });
}
