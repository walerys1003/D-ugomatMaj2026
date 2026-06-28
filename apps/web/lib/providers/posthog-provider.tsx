"use client";

/**
 * Tier 5 zad. 247 — PostHog analytics provider (client-side wrapper).
 *
 * Decyzja architektoniczna:
 *   - SDK `posthog-js` ŁADOWANE LENIWIE (dynamic import) — tylko gdy
 *     `NEXT_PUBLIC_POSTHOG_KEY` jest ustawione I user wyraził zgodę
 *     na cookies analityczne (Cookie Consent banner → `analytics`).
 *   - Brak hard-dependency w bundle bazowym — gdy env brak, provider
 *     to no-op i nic nie ładuje.
 *   - Po inicjalizacji wystawia `window.posthog`, którego używa już
 *     `trackEvent()` z `lib/observability/posthog-events.ts`.
 *
 * Integracja z Cookie Consent:
 *   - Czyta `document.cookie` na klucz `dlugomat-consent` (ustawiany przez
 *     CookieConsentBanner). Format: `analytics:1` lub `analytics:0`.
 *   - Jeśli user nie wyraził zgody (lub odwołał) — provider robi opt-out.
 *
 * Identify:
 *   - Po zalogowaniu (Supabase session), `identifyUser({id, email})`
 *     wiąże anon distinct_id z user_id.
 *   - Logout → `posthog.reset()` (rozłącza identity, zachowuje anon id).
 *
 * Privacy by default:
 *   - `capture_pageview: false` — robimy własny pageview po hydration,
 *     żeby uniknąć duplikatów (Next.js ma own router events).
 *   - `mask_all_text: true` w `session_recording` (gdy włączone) —
 *     RODO art. 32, zero PII w nagraniach.
 *   - `disable_session_recording: true` domyślnie. Włączane per-rola
 *     (admin/QA) jeśli zaszłaby potrzeba debugu.
 */

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/observability/posthog-events";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const CONSENT_COOKIE = "dlugomat-consent";

/* eslint-disable @typescript-eslint/no-explicit-any */
type PostHogClient = {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (name: string, props?: Record<string, unknown>) => void;
  identify: (id: string, props?: Record<string, unknown>) => void;
  reset: () => void;
  opt_out_capturing: () => void;
  opt_in_capturing: () => void;
  has_opted_out_capturing?: () => boolean;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

interface PostHogContextShape {
  ready: boolean;
  identifyUser: (input: { id: string; email?: string | null }) => void;
  resetIdentity: () => void;
  /** Manualny opt-in (np. po akceptacji consent bannera w trakcie sesji). */
  optIn: () => void;
  /** Manualny opt-out (np. user cofnął zgodę). */
  optOut: () => void;
}

const PostHogContext = React.createContext<PostHogContextShape>({
  ready: false,
  identifyUser: () => {},
  resetIdentity: () => {},
  optIn: () => {},
  optOut: () => {},
});

function readConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return false;
  const value = decodeURIComponent(raw.split("=")[1] ?? "");
  // Format: "necessary:1|analytics:1" lub samo "analytics:1"
  return /(?:^|\|)analytics:1(?:\||$)/.test(value);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const initStartedRef = React.useRef(false);

  const initIfPossible = React.useCallback(async () => {
    if (initStartedRef.current) return;
    if (!POSTHOG_KEY) return; // brak env → no-op
    if (typeof window === "undefined") return;
    if (window.posthog) {
      setReady(true);
      return;
    }
    if (!readConsentCookie()) return; // brak zgody → cisza
    initStartedRef.current = true;

    try {
      // posthog-js jest opcjonalną dependencją — jeśli paczka nie jest
      // zainstalowana, import rzuci wyjątek, a provider pozostanie no-op
      // (catch poniżej).
      const mod = await import("posthog-js");
      const posthog = (mod.default ?? mod) as PostHogClient;
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: "localStorage+cookie",
        // RODO art. 32 — żadnych ID-ów out-of-the-box.
        autocapture: false,
        disable_session_recording: true,
        loaded: (ph: PostHogClient) => {
          window.posthog = ph;
          setReady(true);
        },
      });
    } catch (err) {
      // SDK nieobecny lub błąd ładowania — provider pozostaje no-op.
      // Pozostały kod (trackEvent → console.info fallback) nadal działa.
      // eslint-disable-next-line no-console
      console.warn(
        "[posthog-provider] SDK niedostępny — fallback do structured logs.",
        err instanceof Error ? err.message : err,
      );
      initStartedRef.current = false; // pozwól na retry przy zmianie consent
    }
  }, []);

  // Mount — sprawdź env + consent → init jeśli wszystko ok.
  React.useEffect(() => {
    void initIfPossible();
  }, [initIfPossible]);

  // Reaguj na zmianę consent cookie (banner emit'uje custom event).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      if (readConsentCookie()) {
        void initIfPossible();
      } else if (window.posthog) {
        window.posthog.opt_out_capturing();
      }
    };
    window.addEventListener("dlugomat:consent-changed", handler);
    return () =>
      window.removeEventListener("dlugomat:consent-changed", handler);
  }, [initIfPossible]);

  const value = React.useMemo<PostHogContextShape>(
    () => ({
      ready,
      identifyUser: ({ id, email }) => {
        if (typeof window === "undefined" || !window.posthog) return;
        window.posthog.identify(id, email ? { email } : undefined);
      },
      resetIdentity: () => {
        if (typeof window === "undefined" || !window.posthog) return;
        window.posthog.reset();
      },
      optIn: () => {
        if (typeof window === "undefined") return;
        window.posthog?.opt_in_capturing();
        void initIfPossible();
      },
      optOut: () => {
        if (typeof window === "undefined" || !window.posthog) return;
        window.posthog.opt_out_capturing();
      },
    }),
    [ready, initIfPossible],
  );

  return (
    <PostHogContext.Provider value={value}>
      {children}
      <PageViewTracker />
    </PostHogContext.Provider>
  );
}

/**
 * Wewnętrzny tracker pageview — przy zmianie path-u lub query stringa
 * emituje `page_view` przez `trackEvent` (który użyje window.posthog
 * gdy SDK gotowy, lub structured log gdy nie).
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    if (!pathname) return;
    const path =
      pathname +
      (searchParams && searchParams.toString()
        ? `?${searchParams.toString()}`
        : "");
    trackEvent("page_view", { path });
  }, [pathname, searchParams]);
  return null;
}

export function usePostHog(): PostHogContextShape {
  return React.useContext(PostHogContext);
}
