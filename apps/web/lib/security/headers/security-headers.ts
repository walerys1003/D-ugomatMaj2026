// Security headers — CSP, HSTS, COEP/COOP/CORP, Referrer-Policy, Permissions-Policy.
// Apply via middleware.ts; CSP nonce computed per request for inline scripts.

import { randomBytes } from "crypto";

export interface SecurityHeadersOptions {
  nonce?: string;
  reportOnly?: boolean;
  reportUri?: string;
  isDev?: boolean;
}

export function generateCspNonce(): string {
  return randomBytes(16).toString("base64");
}

export function buildSecurityHeaders(opts: SecurityHeadersOptions = {}): Record<string, string> {
  const nonce = opts.nonce ?? "";
  const dev = !!opts.isDev;

  const csp = [
    `default-src 'self'`,
    `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ""}${dev ? " 'unsafe-eval'" : ""} https://js.stripe.com https://www.google.com/recaptcha/`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.openai.com https://api.anthropic.com`,
    `frame-src 'self' https://js.stripe.com https://www.google.com/recaptcha/`,
    `media-src 'self' blob:`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
    opts.reportUri ? `report-uri ${opts.reportUri}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const headers: Record<string, string> = {
    [opts.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy"]: csp,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "camera=(self)",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=(self)",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=(self)",
      "picture-in-picture=()",
      "publickey-credentials-get=(self)",
      "sync-xhr=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off",
  };

  return headers;
}
