"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Cookie consent banner — RODO/ePrivacy compliant opt-in z Google Consent Mode v2.
 *
 * Persystuje decyzję w localStorage pod kluczem `dlugomat:cookie-consent`.
 *
 * Granularne kategorie (zgodnie z TCF / Consent Mode v2):
 *   - necessary    — zawsze true, niezbędne (sesja, motyw, sam consent)
 *   - analytics    — opt-in, GA / mierzenie wydajności (analytics_storage)
 *   - marketing    — opt-in, reklama / remarketing (ad_storage, ad_user_data, ad_personalization)
 *   - functional   — opt-in, zapamiętywanie preferencji (functionality_storage,
 *                    personalization_storage)
 *
 * Zgodnie z Polityką Prywatności § 9: cookies analityczne i marketingowe
 * uruchamiane są wyłącznie po wyrażeniu jednoznacznej zgody (opt-in).
 *
 * Zgodnie z Google Consent Mode v2 (wymagany od marca 2024 dla EOG): przed
 * jakąkolwiek decyzją użytkownika ustawiamy `default` na `denied` dla wszystkich
 * sygnałów reklamowych/analitycznych, a po wyborze emitujemy `update`.
 *
 * Backward-compat: zachowujemy `Consent = "necessary" | "all"` dla dotychczasowych
 * konsumentów — wartość pochodna z kategorii (`all` jeśli wszystkie opcjonalne true,
 * w przeciwnym razie `necessary`).
 */

const STORAGE_KEY = "dlugomat:cookie-consent";
const STORAGE_VERSION_KEY = "dlugomat:cookie-consent:version";
// Wersja 2: rozszerzony format (kategorie). v1 (necessary | all) jest wstecznie odczytywany.
const CURRENT_VERSION = "2";
const CONSENT_EVENT = "dlugomat:cookie-consent";

export type ConsentCategory =
  | "necessary"
  | "analytics"
  | "marketing"
  | "functional";

/** Backward-compat: pochodna wartość binarna. */
export type Consent = "necessary" | "all";

export interface ConsentCategories {
  /** Zawsze true — niezbędne do działania serwisu. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentRecord {
  /** Backward-compat (necessary | all). */
  value: Consent;
  categories: ConsentCategories;
  timestamp: number;
  version: string;
}

const ALL_DENIED: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const ALL_GRANTED: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true,
};

/* ------------------------------------------------------------------ */
/* Google Consent Mode v2 — gtag bridge                                */
/* ------------------------------------------------------------------ */

type GtagConsentState = "granted" | "denied";
interface GtagConsentParams {
  ad_storage: GtagConsentState;
  ad_user_data: GtagConsentState;
  ad_personalization: GtagConsentState;
  analytics_storage: GtagConsentState;
  functionality_storage: GtagConsentState;
  personalization_storage: GtagConsentState;
  security_storage: GtagConsentState;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Zapewnia, że `dataLayer` i shim `gtag()` istnieją zanim jakikolwiek tag
 * Google się załaduje. Należy wywołać JAK NAJWCZEŚNIEJ — robimy to przy
 * pierwszym mount banera oraz w `applyConsentMode()` defensywnie.
 */
function ensureGtagShim(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag !== "function") {
    // gtag pushuje argumenty do dataLayer; poprawne podejście wg dokumentacji Google.
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
}

function categoriesToConsentMode(c: ConsentCategories): GtagConsentParams {
  const ad: GtagConsentState = c.marketing ? "granted" : "denied";
  const analytics: GtagConsentState = c.analytics ? "granted" : "denied";
  const functional: GtagConsentState = c.functional ? "granted" : "denied";
  return {
    ad_storage: ad,
    ad_user_data: ad,
    ad_personalization: ad,
    analytics_storage: analytics,
    functionality_storage: functional,
    personalization_storage: functional,
    // security_storage = niezbędne, zawsze granted
    security_storage: "granted",
  };
}

/**
 * Ustawia domyślny stan Consent Mode v2 (wszystko `denied` poza
 * `security_storage`). Powinno być wywołane przed banerem; idempotentne.
 */
export function setDefaultConsentMode(): void {
  if (typeof window === "undefined") return;
  ensureGtagShim();
  const params: GtagConsentParams & { wait_for_update: number } = {
    ...categoriesToConsentMode(ALL_DENIED),
    // Daj 500 ms na rozstrzygnięcie zgody przez użytkownika zanim Google
    // zacznie wysyłać redacted pings — zalecenie z dokumentacji Consent Mode.
    wait_for_update: 500,
  };
  window.gtag!("consent", "default", params);
}

/**
 * Aktualizuje Consent Mode v2 na podstawie wyboru użytkownika.
 */
export function applyConsentMode(c: ConsentCategories): void {
  if (typeof window === "undefined") return;
  ensureGtagShim();
  window.gtag!("consent", "update", categoriesToConsentMode(c));
}

/* ------------------------------------------------------------------ */
/* localStorage                                                         */
/* ------------------------------------------------------------------ */

function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const version = window.localStorage.getItem(STORAGE_VERSION_KEY);
    const parsed = JSON.parse(raw) as Partial<ConsentRecord> & {
      value?: unknown;
    };

    // v1 → v2 migracja w locie (niezgodne wersje wymagają ponownej zgody —
    // ale „wszystko / nic" mapujemy by nie pokazywać banera dwa razy).
    if (version !== CURRENT_VERSION) {
      const legacyValue = parsed?.value;
      if (legacyValue === "all") {
        return {
          value: "all",
          categories: { ...ALL_GRANTED },
          timestamp:
            typeof parsed?.timestamp === "number" ? parsed.timestamp : Date.now(),
          version: CURRENT_VERSION,
        };
      }
      if (legacyValue === "necessary") {
        return {
          value: "necessary",
          categories: { ...ALL_DENIED },
          timestamp:
            typeof parsed?.timestamp === "number" ? parsed.timestamp : Date.now(),
          version: CURRENT_VERSION,
        };
      }
      return null;
    }

    if (
      parsed.value !== "necessary" &&
      parsed.value !== "all"
    ) {
      return null;
    }
    const cats = parsed.categories;
    if (
      !cats ||
      typeof cats.analytics !== "boolean" ||
      typeof cats.marketing !== "boolean" ||
      typeof cats.functional !== "boolean"
    ) {
      return null;
    }
    return {
      value: parsed.value,
      categories: {
        necessary: true,
        analytics: cats.analytics,
        marketing: cats.marketing,
        functional: cats.functional,
      },
      timestamp:
        typeof parsed.timestamp === "number" ? parsed.timestamp : Date.now(),
      version: CURRENT_VERSION,
    };
  } catch {
    return null;
  }
}

function deriveValue(c: ConsentCategories): Consent {
  return c.analytics && c.marketing && c.functional ? "all" : "necessary";
}

function writeConsent(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = {
    value: deriveValue(categories),
    categories,
    timestamp: Date.now(),
    version: CURRENT_VERSION,
  };
  if (typeof window === "undefined") return record;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  } catch {
    /* localStorage disabled — graceful degradation */
  }
  // Aktualizuj Google Consent Mode v2.
  applyConsentMode(categories);
  // Emit event — analytics / loadery skryptów reagują bez page reloadu.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ConsentRecord>(CONSENT_EVENT, { detail: record }),
    );
  }
  return record;
}

/* ------------------------------------------------------------------ */
/* React component                                                      */
/* ------------------------------------------------------------------ */

export function CookieConsentBanner() {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [draft, setDraft] = React.useState<ConsentCategories>(ALL_DENIED);

  React.useEffect(() => {
    setMounted(true);
    // Defensywnie: ustaw default Consent Mode v2 przed dowolną interakcją.
    // (Optymalnie wywoływane też w <head> przed loadem GTM.)
    setDefaultConsentMode();

    const existing = readConsent();
    if (existing) {
      // Już mamy zgodę — zsynchronizuj Consent Mode (np. po hard-refresh przed GTM).
      applyConsentMode(existing.categories);
      setVisible(false);
      setDraft(existing.categories);
    } else {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = React.useCallback(() => {
    writeConsent(ALL_GRANTED);
    setVisible(false);
  }, []);

  const handleNecessaryOnly = React.useCallback(() => {
    writeConsent(ALL_DENIED);
    setVisible(false);
  }, []);

  const handleSavePreferences = React.useCallback(() => {
    writeConsent(draft);
    setVisible(false);
  }, [draft]);

  const toggle = React.useCallback(
    (cat: Exclude<ConsentCategory, "necessary">) =>
      setDraft((d) => ({ ...d, [cat]: !d[cat] })),
    [],
  );

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-ink-200 bg-white/95 p-5 shadow-xl backdrop-blur dark:border-dlugomat-800 dark:bg-dlugomat-950/95 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2
              id="cookie-consent-title"
              className="font-serif text-fluid-lg font-semibold text-ink-900 dark:text-white"
            >
              Twoja prywatność
            </h2>
            <p
              id="cookie-consent-desc"
              className="mt-2 text-fluid-sm text-ink-600 dark:text-ink-300"
            >
              Używamy plików cookies <strong>niezbędnych</strong> do działania
              serwisu (sesja, motyw). Cookies <strong>analityczne</strong>,{" "}
              <strong>marketingowe</strong> i <strong>funkcjonalne</strong>{" "}
              są opcjonalne — uruchamiamy je dopiero po Twojej zgodzie.
              Decyzję możesz zmienić w każdej chwili.{" "}
              <Link
                href="/polityka-prywatnosci#cookies"
                className="font-semibold text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-300"
              >
                Polityka prywatności
              </Link>
              .
            </p>
          </div>

          {showDetails ? (
            <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-4 text-fluid-xs text-ink-700 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-ink-200">
              <ul className="space-y-3">
                <li className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">
                      Niezbędne
                    </p>
                    <p>
                      Sesja, motyw, zapis Twojego wyboru zgody.{" "}
                      <code>sb-access-token</code>,{" "}
                      <code>sb-refresh-token</code>,{" "}
                      <code>dlugomat:theme</code>,{" "}
                      <code>dlugomat:cookie-consent</code>.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-ink-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-700 dark:bg-dlugomat-800 dark:text-ink-200">
                    Zawsze włączone
                  </span>
                </li>

                <li className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">
                      Analityczne
                    </p>
                    <p>
                      Mierzą wydajność i sposób korzystania z serwisu w sposób
                      zagregowany (Google Analytics).
                    </p>
                  </div>
                  <ConsentToggle
                    label="Analityczne"
                    checked={draft.analytics}
                    onChange={() => toggle("analytics")}
                  />
                </li>

                <li className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">
                      Marketingowe
                    </p>
                    <p>
                      Reklama, remarketing, pomiar konwersji (Google Ads / Meta).
                      Obecnie opcjonalne — możesz pozostawić wyłączone.
                    </p>
                  </div>
                  <ConsentToggle
                    label="Marketingowe"
                    checked={draft.marketing}
                    onChange={() => toggle("marketing")}
                  />
                </li>

                <li className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">
                      Funkcjonalne
                    </p>
                    <p>
                      Zapamiętywanie preferencji (np. wybranego oddziału sądu,
                      ostatnio użytego kalkulatora) — wygodniejsza praca.
                    </p>
                  </div>
                  <ConsentToggle
                    label="Funkcjonalne"
                    checked={draft.functional}
                    onChange={() => toggle("functional")}
                  />
                </li>
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowDetails((s) => !s)}
              className="text-fluid-xs font-medium text-ink-500 underline-offset-2 hover:underline dark:text-ink-400"
            >
              {showDetails ? "Ukryj szczegóły" : "Dostosuj ustawienia"}
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              {showDetails ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSavePreferences}
                >
                  Zapisz wybór
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleNecessaryOnly}
                >
                  Tylko niezbędne
                </Button>
              )}
              <Button type="button" onClick={handleAcceptAll}>
                Akceptuję wszystkie
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentToggle(props: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex shrink-0 cursor-pointer items-center gap-2">
      <span className="sr-only">{props.label}</span>
      <span
        className={[
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          props.checked
            ? "bg-dlugomat-600"
            : "bg-ink-300 dark:bg-dlugomat-800",
        ].join(" ")}
        aria-hidden="true"
      >
        <span
          className={[
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
            props.checked ? "translate-x-4" : "translate-x-1",
          ].join(" ")}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={props.checked}
        onChange={props.onChange}
        aria-label={props.label}
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Hook do odczytu aktualnej zgody (wartość binarna `necessary | all`) —
 * np. przed warunkowym załadowaniem skryptu analitycznego.
 * Reaguje na event `dlugomat:cookie-consent`.
 */
export function useCookieConsent(): Consent | null {
  const [consent, setConsent] = React.useState<Consent | null>(null);

  React.useEffect(() => {
    const initial = readConsent();
    setConsent(initial?.value ?? null);

    function handler(event: Event) {
      const detail = (event as CustomEvent<ConsentRecord>).detail;
      if (detail) setConsent(detail.value);
    }

    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  return consent;
}

/**
 * Hook do odczytu granularnych kategorii zgody. Pozwala warunkowo ładować
 * np. tylko Google Ads (marketing) bez Analytics.
 */
export function useCookieCategories(): ConsentCategories | null {
  const [cats, setCats] = React.useState<ConsentCategories | null>(null);

  React.useEffect(() => {
    const initial = readConsent();
    setCats(initial?.categories ?? null);

    function handler(event: Event) {
      const detail = (event as CustomEvent<ConsentRecord>).detail;
      if (detail) setCats(detail.categories);
    }

    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  return cats;
}

/**
 * Synchroniczny snippet Consent Mode v2 do umieszczenia w <head> PRZED
 * dowolnym tagiem Google (GTM, Analytics, Ads). Czyta zapisaną zgodę z
 * localStorage (jeśli istnieje) — w przeciwnym razie ustawia wszystko
 * `denied` z `wait_for_update: 500`. Dzięki temu nawet pierwsze tagi po
 * hydratacji są zgodne z RODO/Consent Mode v2.
 *
 * Format ESM-safe: zwykły string IIFE; bez zależności od React/runtime.
 */
export const consentModeBootstrapScript: string = `
(function(){
  try {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    var raw = null, ver = null;
    try {
      raw = window.localStorage.getItem('${STORAGE_KEY}');
      ver = window.localStorage.getItem('${STORAGE_VERSION_KEY}');
    } catch (e) { /* localStorage zablokowane */ }

    var ad = 'denied', an = 'denied', fn = 'denied';
    if (raw) {
      try {
        var rec = JSON.parse(raw);
        // v2 — granularne kategorie
        if (ver === '${CURRENT_VERSION}' && rec && rec.categories) {
          ad = rec.categories.marketing ? 'granted' : 'denied';
          an = rec.categories.analytics ? 'granted' : 'denied';
          fn = rec.categories.functional ? 'granted' : 'denied';
        } else if (rec && rec.value === 'all') {
          // v1 backward-compat — 'all' = wszystko granted
          ad = 'granted'; an = 'granted'; fn = 'granted';
        }
      } catch (e) { /* parse error — pozostań denied */ }
    }

    var hasStored = !!raw;
    var defaults = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500
    };
    window.gtag('consent', 'default', defaults);

    if (hasStored) {
      window.gtag('consent', 'update', {
        ad_storage: ad,
        ad_user_data: ad,
        ad_personalization: ad,
        analytics_storage: an,
        functionality_storage: fn,
        personalization_storage: fn,
        security_storage: 'granted'
      });
    }
  } catch (e) { /* never crash */ }
})();
`;

/**
 * Imperatywny otwieracz banera — np. przycisk „Ustawienia cookies" w stopce.
 * Czyści zapisaną zgodę i emituje event, aby UI ponownie pokazał baner.
 *
 * UWAGA: w tej implementacji baner czyta `readConsent()` tylko na mount.
 * Aby ponowne otwarcie zadziałało, ten helper przeładowuje baner przez
 * wymuszenie `null` w storage + dispatch eventu (komponent nasłuchuje na nim
 * i samo-resetuje stan w przyszłej iteracji). Na razie najprostsze podejście:
 * wyczyść storage i przeładuj stronę.
 */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_VERSION_KEY);
  } catch {
    /* noop */
  }
  // Najprostsze i najbardziej niezawodne — strona jest tania w reload.
  window.location.reload();
}
