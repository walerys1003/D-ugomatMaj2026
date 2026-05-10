import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { applySecurityHeaders, generateNonce } from "@/lib/security/csp";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
} from "@/lib/security/rate-limit";

// Tier 6 zad. 251 — correlation_id helper (edge-safe).
// We can't import the Node-only AsyncLocalStorage logger here, so we
// generate the id inline and propagate it via `x-request-id`.
function edgeCorrelationId(headers: Headers): string {
  const incoming = headers.get("x-request-id") || headers.get("x-correlation-id");
  if (incoming && /^[A-Za-z0-9_-]{8,64}$/.test(incoming)) return incoming;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = (globalThis as any).crypto;
    if (c?.randomUUID) return (c.randomUUID() as string).replace(/-/g, "").slice(0, 16);
  } catch {
    // fallthrough
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-8);
}

/**
 * Edge middleware — odpowiada za:
 *
 *  1) Refresh sesji Supabase (rotacja access tokenu, jeśli wygasł).
 *  2) Route-guard: redirect /panel/* dla anonimowych, /auth/* dla zalogowanych.
 *  3) Edge rate-limit per-IP (defense in depth — NIE zastępuje rate-limitów
 *     w API routes, które używają konkretnych profili).
 *  4) CSP nonce — generowany per-request, eksponowany przez nagłówek
 *     `x-nonce` (czytany w `app/layout.tsx`) i wpinany do CSP.
 *  5) Pełne security headers (CSP, HSTS, COOP, X-Frame, Referrer, Permissions).
 *
 * Dlaczego nie używamy `createSupabaseServerClient()`:
 *   middleware działa na Edge i wymaga `NextRequest.cookies` zamiast
 *   `next/headers` cookies — adapter poniżej.
 */
export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";

  // -------------------------------------------------------------------
  // 1) Edge rate-limit (per IP, 120 / min) — wcześnie, by chronić Supabase
  // -------------------------------------------------------------------
  const clientId = clientIdFromHeaders(request.headers);
  const rl = rateLimit(`edge:${clientId}`, RATE_LIMIT_PROFILES.edge);
  if (!rl.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Zbyt wiele żądań — spróbuj ponownie za chwilę.",
        retryAfterMs: rl.resetMs,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": String(Math.ceil(rl.resetMs / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // -------------------------------------------------------------------
  // 2) Nonce + correlation_id — przekażemy do app/layout przez request header
  // -------------------------------------------------------------------
  const nonce = generateNonce();
  const requestId = edgeCorrelationId(request.headers);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-request-id", requestId);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // -------------------------------------------------------------------
  // 3) Supabase session refresh
  // -------------------------------------------------------------------
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let userPresent = false;

  if (url && anon && !url.includes("stub.supabase")) {
    const supabase = createServerClient(url, anon, {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options: CookieOptions) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    });

    // Touching `getUser()` rotates the access token if it expired.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userPresent = user !== null;
  }

  // -------------------------------------------------------------------
  // 4) Route guards
  // -------------------------------------------------------------------
  const guardResponse = enforceRouteGuards(request, response, userPresent);

  // Rate-limit + nonce headers (info-only)
  guardResponse.headers.set(
    "X-RateLimit-Remaining",
    String(rl.remaining),
  );

  // Tier 6 zad. 251 — expose correlation_id w response, by klient mógł
  // dołączyć go do raportów błędów. NIE jest sekretem.
  guardResponse.headers.set("x-request-id", requestId);

  // -------------------------------------------------------------------
  // 5) Security headers — applikujemy NA KOŃCU, żeby nie zostały
  //    nadpisane przez Supabase / Next.
  // -------------------------------------------------------------------
  applySecurityHeaders(guardResponse.headers, { nonce, isDev });

  return guardResponse;
}

function enforceRouteGuards(
  request: NextRequest,
  response: NextResponse,
  userPresent: boolean,
) {
  const path = request.nextUrl.pathname;

  // Protect /panel/* — push to /auth/sign-in with `?next=` so the user
  // returns to the page they wanted after logging in.
  if (path.startsWith("/panel") && !userPresent) {
    const redirect = new URL("/auth/sign-in", request.url);
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // Already-logged-in users should not see auth screens (except /sign-out).
  if (
    userPresent &&
    path.startsWith("/auth") &&
    !path.startsWith("/auth/sign-out")
  ) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return response;
}

export const config = {
  // Run on every route except Next assets, image optimisation, and the
  // static files we don't want to bother (favicons, robots, sitemap).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)",
  ],
};
