/**
 * Długomat — Tier 9 — i18n middleware helper.
 *
 * Logika routingu w middleware.ts:
 *  1. Jeśli URL ma /cs/, /sk/, /hu/, /ro/, /en/ → użyj tego locale.
 *  2. Jeśli URL bez prefiksu → sprawdź cookie `dlk_locale` → użyj jeśli ustawione.
 *  3. Inaczej → detect z Accept-Language → set cookie + (opcjonalnie) redirect.
 *  4. PL → bez prefiksu (default).
 *
 * Domain-based routing (production):
 *  - dlugomat.cz → locale=cs (force, ignore cookie)
 *  - dlugomat.sk → locale=sk
 *  - dlugomat.hu → locale=hu
 *  - dlugomat.ro → locale=ro
 */
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocaleFromHeader,
  type Locale,
} from "./locales";

export const LOCALE_COOKIE = "dlk_locale";
export const LOCALE_COOKIE_TTL_DAYS = 365;

const DOMAIN_LOCALE_MAP: Record<string, Locale> = {
  "dlugomat.cz": "cs",
  "dlugomat.sk": "sk",
  "dlugomat.hu": "hu",
  "dlugomat.ro": "ro",
};

export interface LocaleResolution {
  locale: Locale;
  source: "domain" | "path" | "cookie" | "header" | "default";
  shouldRedirect: boolean;
  redirectPath: string | null;
}

export function resolveLocale(input: {
  hostname: string;
  pathname: string;
  cookieValue: string | null;
  acceptLanguage: string | null;
}): LocaleResolution {
  // 1. Domain-based (highest priority)
  const baseDomain = stripWww(input.hostname);
  if (DOMAIN_LOCALE_MAP[baseDomain]) {
    return {
      locale: DOMAIN_LOCALE_MAP[baseDomain],
      source: "domain",
      shouldRedirect: false,
      redirectPath: null,
    };
  }

  // 2. Path-based
  const segments = input.pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && SUPPORTED_LOCALES.includes(first as Locale)) {
    return {
      locale: first as Locale,
      source: "path",
      shouldRedirect: false,
      redirectPath: null,
    };
  }

  // 3. Cookie
  if (input.cookieValue && SUPPORTED_LOCALES.includes(input.cookieValue as Locale)) {
    const cookieLocale = input.cookieValue as Locale;
    if (cookieLocale !== DEFAULT_LOCALE) {
      // Redirect to /xx/ for non-default cookie
      return {
        locale: cookieLocale,
        source: "cookie",
        shouldRedirect: true,
        redirectPath: `/${cookieLocale}${input.pathname}`,
      };
    }
    return {
      locale: cookieLocale,
      source: "cookie",
      shouldRedirect: false,
      redirectPath: null,
    };
  }

  // 4. Accept-Language header
  const headerLocale = detectLocaleFromHeader(input.acceptLanguage);
  if (headerLocale !== DEFAULT_LOCALE) {
    return {
      locale: headerLocale,
      source: "header",
      shouldRedirect: false, // Set cookie but don't force redirect (good UX)
      redirectPath: null,
    };
  }

  // 5. Default
  return {
    locale: DEFAULT_LOCALE,
    source: "default",
    shouldRedirect: false,
    redirectPath: null,
  };
}

function stripWww(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}
