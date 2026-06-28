/**
 * Długomat — Tier 9 (zad. 401-450) — i18n + CEE expansion.
 *
 * Wspierane języki:
 *  - pl (default) — Polska, market 1
 *  - cs — Czechy (Q2 2026)
 *  - sk — Słowacja (Q2 2026)
 *  - hu — Węgry (Q3 2026)
 *  - ro — Rumunia (Q3 2026)
 *  - en — fallback dla expat-ów + EU customers
 *
 * Każdy język ma osobne pliki tłumaczeń + osobny zestaw case_types (D9-D16
 * dotyczy tylko PL; CZ ma swoje moduły jak "exekuční řízení", "oddlužení").
 *
 * Architektura:
 *  - URL prefix /cs/, /sk/, /hu/, /ro/ (PL bez prefixu, default)
 *  - Domain-based routing: dlugomat.cz, dlugomat.sk, dlugomat.hu, dlugomat.ro
 *    (z fallback na /xx/ path)
 *  - Stripe currencies: PLN (PL), CZK (CZ), EUR (SK/HU/RO)
 *  - Lokalne VAT: PL 23%, CZ 21%, SK 23%, HU 27%, RO 19%
 */

export type Locale = "pl" | "cs" | "sk" | "hu" | "ro" | "en";

export const DEFAULT_LOCALE: Locale = "pl";
export const SUPPORTED_LOCALES: Locale[] = ["pl", "cs", "sk", "hu", "ro", "en"];

export interface LocaleMetadata {
  code: Locale;
  name: string;
  nativeName: string;
  countryCode: string;
  currency: "PLN" | "CZK" | "EUR";
  vatRate: number;
  /** Czy market jest LIVE (vs coming-soon). */
  live: boolean;
  /** Domena produkcyjna (fallback na /[locale]/ jeśli null). */
  domain: string | null;
  /** Numer telefoniczny supportu. */
  supportPhone: string | null;
  /** Email supportu. */
  supportEmail: string;
  /** ISO-31166-2 timezone (np. "Europe/Warsaw"). */
  timezone: string;
  /** Format daty (lokalny). */
  dateFormat: string;
  /** Separator dziesiętny dla kwot. */
  decimalSeparator: "," | ".";
  /** Symbol waluty (przed/po liczbie). */
  currencyFormat: (amount: number) => string;
}

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  pl: {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    countryCode: "PL",
    currency: "PLN",
    vatRate: 23,
    live: true,
    domain: "dlugomat.pl",
    supportPhone: "+48 22 123 45 67",
    supportEmail: "kontakt@dlugomat.pl",
    timezone: "Europe/Warsaw",
    dateFormat: "DD.MM.YYYY",
    decimalSeparator: ",",
    currencyFormat: (a) => `${a.toFixed(2).replace(".", ",")} zł`,
  },
  cs: {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    countryCode: "CZ",
    currency: "CZK",
    vatRate: 21,
    live: false,
    domain: "dlugomat.cz",
    supportPhone: null,
    supportEmail: "podpora@dlugomat.cz",
    timezone: "Europe/Prague",
    dateFormat: "DD.MM.YYYY",
    decimalSeparator: ",",
    currencyFormat: (a) => `${a.toFixed(2).replace(".", ",")} Kč`,
  },
  sk: {
    code: "sk",
    name: "Slovak",
    nativeName: "Slovenčina",
    countryCode: "SK",
    currency: "EUR",
    vatRate: 23,
    live: false,
    domain: "dlugomat.sk",
    supportPhone: null,
    supportEmail: "podpora@dlugomat.sk",
    timezone: "Europe/Bratislava",
    dateFormat: "DD.MM.YYYY",
    decimalSeparator: ",",
    currencyFormat: (a) => `${a.toFixed(2).replace(".", ",")} €`,
  },
  hu: {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    countryCode: "HU",
    currency: "EUR",
    vatRate: 27,
    live: false,
    domain: "dlugomat.hu",
    supportPhone: null,
    supportEmail: "tamogatas@dlugomat.hu",
    timezone: "Europe/Budapest",
    dateFormat: "YYYY.MM.DD.",
    decimalSeparator: ",",
    currencyFormat: (a) => `${a.toFixed(2).replace(".", ",")} €`,
  },
  ro: {
    code: "ro",
    name: "Romanian",
    nativeName: "Română",
    countryCode: "RO",
    currency: "EUR",
    vatRate: 19,
    live: false,
    domain: "dlugomat.ro",
    supportPhone: null,
    supportEmail: "suport@dlugomat.ro",
    timezone: "Europe/Bucharest",
    dateFormat: "DD.MM.YYYY",
    decimalSeparator: ",",
    currencyFormat: (a) => `${a.toFixed(2).replace(".", ",")} €`,
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    countryCode: "GB",
    currency: "EUR",
    vatRate: 0,
    live: true,
    domain: null,
    supportPhone: null,
    supportEmail: "support@dlugomat.pl",
    timezone: "Europe/London",
    dateFormat: "YYYY-MM-DD",
    decimalSeparator: ".",
    currencyFormat: (a) => `€${a.toFixed(2)}`,
  },
};

export function isLiveLocale(locale: Locale): boolean {
  return localeMetadata[locale]?.live ?? false;
}

export function getLocaleMeta(locale: Locale): LocaleMetadata {
  return localeMetadata[locale] ?? localeMetadata[DEFAULT_LOCALE];
}

/**
 * Detects locale from URL pathname.
 * Examples:
 *  - /                → pl (default)
 *  - /cs/cennik       → cs
 *  - /sk/             → sk
 */
export function detectLocaleFromPath(pathname: string): { locale: Locale; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] as Locale | undefined;
  if (first && SUPPORTED_LOCALES.includes(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, rest: "/" + segments.slice(1).join("/") };
  }
  return { locale: DEFAULT_LOCALE, rest: pathname };
}

/**
 * Detects locale from Accept-Language header (BCP47).
 * Pick first supported language; fallback DEFAULT_LOCALE.
 */
export function detectLocaleFromHeader(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const parts = acceptLanguage
    .split(",")
    .map((p) => p.split(";")[0].trim().toLowerCase().slice(0, 2));
  for (const p of parts) {
    if (SUPPORTED_LOCALES.includes(p as Locale)) return p as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Builds canonical URL for a path in a given locale.
 */
export function localizedPath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith("/") ? path : "/" + path;
  if (locale === DEFAULT_LOCALE) return cleanPath;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
