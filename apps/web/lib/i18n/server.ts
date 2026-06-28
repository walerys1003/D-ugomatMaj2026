// Tier 16 — server-side locale resolution.
// Bridges incoming requests to Tier 9 locales (pl/cs/sk/hu/ro/en) using
// cookies, Accept-Language header, and falls back to DEFAULT_LOCALE.

import { cookies, headers } from "next/headers";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "./locales";
import { isLocale } from "./tier16-mobile";

const COOKIE_NAME = "dlk_locale";

function parseAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const entries = header
    .split(",")
    .map((s) => {
      const [tag, qPart] = s.trim().split(";");
      const q = qPart ? parseFloat(qPart.replace("q=", "")) : 1.0;
      return { tag: tag.toLowerCase().split("-")[0], q };
    })
    .sort((a, b) => b.q - a.q);
  for (const e of entries) {
    if (SUPPORTED_LOCALES.includes(e.tag as Locale)) return e.tag as Locale;
  }
  return DEFAULT_LOCALE;
}

export function resolveServerLocale(): Locale {
  try {
    const c = cookies().get(COOKIE_NAME)?.value;
    if (c && isLocale(c)) return c;
  } catch {
    /* outside request scope */
  }
  try {
    const h = headers().get("accept-language");
    return parseAcceptLanguage(h);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function setServerLocaleCookie(locale: Locale, response: Response): Response {
  const responseHeaders = new Headers(response.headers);
  responseHeaders.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
  );
  return new Response(response.body, { status: response.status, headers: responseHeaders });
}
