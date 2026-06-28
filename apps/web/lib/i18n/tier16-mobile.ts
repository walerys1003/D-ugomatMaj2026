// Tier 16 — Mobile-focused i18n extensions on top of Tier 9 locales.
// Adds a compact mobile UI bundle (nav, CTAs, errors) plus formatting helpers
// that fall back gracefully when a locale is not yet listed in Tier 9.

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "./locales";

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(x);
}

// Compact mobile bundle (pl/en first-class; cs/sk/hu/ro fall back to en).
type MobileBundle = Record<string, string>;

const PL: MobileBundle = {
  "nav.dashboard": "Pulpit",
  "nav.cases": "Sprawy",
  "nav.scan": "Skanuj",
  "nav.deadlines": "Terminy",
  "nav.settings": "Ustawienia",
  "nav.logout": "Wyloguj",
  "cta.new_case": "Nowa sprawa",
  "cta.upload": "Wgraj dokument",
  "cta.save": "Zapisz",
  "cta.cancel": "Anuluj",
  "cta.install_app": "Zainstaluj aplikację",
  "status.loading": "Ładowanie…",
  "status.offline": "Brak połączenia — działasz offline",
  "status.synced": "Zsynchronizowano",
  "error.generic": "Coś poszło nie tak. Spróbuj ponownie.",
  "error.network": "Problem z połączeniem internetowym.",
  "deadline.urgent": "Pilne",
  "deadline.today": "Dziś",
  "deadline.tomorrow": "Jutro",
};

const EN: MobileBundle = {
  "nav.dashboard": "Dashboard",
  "nav.cases": "Cases",
  "nav.scan": "Scan",
  "nav.deadlines": "Deadlines",
  "nav.settings": "Settings",
  "nav.logout": "Log out",
  "cta.new_case": "New case",
  "cta.upload": "Upload document",
  "cta.save": "Save",
  "cta.cancel": "Cancel",
  "cta.install_app": "Install app",
  "status.loading": "Loading…",
  "status.offline": "Offline — working in offline mode",
  "status.synced": "Synced",
  "error.generic": "Something went wrong. Please try again.",
  "error.network": "Network connection problem.",
  "deadline.urgent": "Urgent",
  "deadline.today": "Today",
  "deadline.tomorrow": "Tomorrow",
};

const CS: MobileBundle = {
  "nav.dashboard": "Přehled",
  "nav.cases": "Případy",
  "nav.scan": "Skenovat",
  "nav.deadlines": "Termíny",
  "nav.settings": "Nastavení",
  "nav.logout": "Odhlásit",
  "cta.new_case": "Nový případ",
  "cta.upload": "Nahrát dokument",
  "cta.save": "Uložit",
  "cta.cancel": "Zrušit",
  "cta.install_app": "Nainstalovat aplikaci",
  "status.loading": "Načítání…",
  "status.offline": "Bez připojení — režim offline",
  "status.synced": "Synchronizováno",
  "error.generic": "Něco se pokazilo. Zkuste to znovu.",
  "error.network": "Problém se sítí.",
  "deadline.urgent": "Naléhavé",
  "deadline.today": "Dnes",
  "deadline.tomorrow": "Zítra",
};

export const MOBILE_BUNDLES: Partial<Record<Locale, MobileBundle>> = {
  pl: PL,
  en: EN,
  cs: CS,
};

export function mobileT(locale: Locale, key: string, fallback?: string): string {
  return (
    MOBILE_BUNDLES[locale]?.[key] ??
    MOBILE_BUNDLES.en?.[key] ??
    MOBILE_BUNDLES.pl?.[key] ??
    fallback ??
    key
  );
}

// CLDR-style pluralization (Slavic three-form for pl/cs/sk; two-form fallback).
export function pluralize(
  locale: Locale,
  n: number,
  forms: { one: string; few?: string; many?: string; other: string },
): string {
  if (locale === "en" || locale === "hu" || locale === "ro") return n === 1 ? forms.one : forms.other;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1) return forms.one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few ?? forms.other;
  return forms.many ?? forms.other;
}

// Locale-aware relative time (uses Intl.RelativeTimeFormat under the hood).
const INTL_TAG: Record<Locale, string> = {
  pl: "pl-PL",
  cs: "cs-CZ",
  sk: "sk-SK",
  hu: "hu-HU",
  ro: "ro-RO",
  en: "en-GB",
};

export function formatRelativeTime(d: Date | string, locale: Locale = DEFAULT_LOCALE): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  try {
    const rtf = new Intl.RelativeTimeFormat(INTL_TAG[locale], { numeric: "auto" });
    if (abs < 60) return rtf.format(diffSec, "second");
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
    return rtf.format(Math.round(diffSec / 86400), "day");
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
