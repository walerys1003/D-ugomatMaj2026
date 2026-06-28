/**
 * Tier 5 zad. 247 — PostHog event tracking helpers + funnel definitions.
 *
 * Decyzja: PostHog SDK NIE jest dependencją (na MVP). Ten plik definiuje:
 *
 *   1) Stabilny **event taxonomy** — nazwy eventów + payload schema,
 *      używany TERAZ przez `console.info` (logi w stdout, scrapowane
 *      w Vercel) oraz docelowo przez `posthog-js` (klient) lub
 *      `posthog-node` (serwer) gdy zespół zdecyduje się dodać SDK.
 *   2) **Funnel definitions** — kanonicznych 4 lejków (acquisition,
 *      activation, conversion, retention) opisanych eventami z taxonomy.
 *      Te definicje są skopiowalne 1:1 do panelu PostHog.
 *
 * Wzorzec użycia:
 *
 *   // Klient lub serwer:
 *   import { trackEvent } from "@/lib/observability/posthog-events";
 *   trackEvent("case_created", { case_type: "sprzeciw_epu", source: "wizard" });
 *
 * Po dodaniu PostHog SDK: zmieniamy implementację w `dispatchEvent()`,
 * call-sites zostają nietknięte.
 */

/* ─────────────────────────────────────────────────────────────────────
   Event taxonomy — single source of truth.
   Nazwy: snake_case, czas-przeszły lub teraźniejszy ("page_view").
   Każdy event ma typed payload (helper TS doprecyzuje przy użyciu).
   ───────────────────────────────────────────────────────────────────── */

export type EventName =
  // Acquisition (marketing)
  | "page_view"
  | "cta_clicked"
  | "scanner_landing_view"
  | "module_card_clicked"
  | "pricing_view"
  | "referral_click"
  // Activation (sign-up + first action)
  | "signup_started"
  | "signup_completed"
  | "magic_link_sent"
  | "email_verified"
  | "first_login"
  | "onboarding_email_sent"
  // Core product
  | "case_created"
  | "case_status_changed"
  | "wizard_step_completed"
  | "wizard_step_back"
  | "wizard_abandoned"
  | "ocr_uploaded"
  | "ocr_completed"
  | "ocr_low_confidence"
  | "ai_generation_started"
  | "ai_generation_completed"
  | "ai_validation_failed"
  | "ai_escalation_to_opus"
  | "document_downloaded"
  | "document_emailed"
  // Conversion (payment)
  | "checkout_started"
  | "promo_code_applied"
  | "payment_completed"
  | "payment_failed"
  | "invoice_downloaded"
  | "refund_requested"
  // Retention
  | "deadline_notification_sent"
  | "deadline_acknowledged"
  | "second_case_created"
  // RODO / security
  | "data_export_requested"
  | "account_delete_requested"
  | "consent_updated"
  // Referrals
  | "referral_share_initiated"
  | "referral_conversion_recorded";

export interface EventCommonProps {
  /** ID użytkownika (jeśli zalogowany). Anon → null. */
  user_id?: string | null;
  /** Anon distinct_id z PostHog (cookie ph_*). */
  distinct_id?: string | null;
  /** Bieżąca ścieżka. */
  path?: string | null;
  /** Bieżący case (gdy applicable). */
  case_id?: string | null;
}

/**
 * Główna funkcja tracking. Bezpieczna do wywołania z dowolnego kontekstu
 * (Edge / Node / RSC / klient). Nigdy nie throw.
 *
 * Implementacja TODO:
 *  - dziś: console.info JSON do stdout (Vercel/Datadog scrapuje)
 *  - jutro: window.posthog?.capture(name, props)  // klient
 *  - jutro: posthog-node Client.capture(...)       // serwer
 */
export function trackEvent(
  name: EventName,
  props: Record<string, unknown> = {},
): void {
  try {
    const payload = {
      event: name,
      properties: { ...props, $lib: "dlugomat-internal", $lib_version: "0.5.0" },
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      // Klient — preferuj posthog-js gdy dostępny.
      const ph = (
        window as unknown as {
          posthog?: { capture: (name: string, props?: Record<string, unknown>) => void };
        }
      ).posthog;
      if (ph && typeof ph.capture === "function") {
        ph.capture(name, props);
        return;
      }
    }

    // Fallback (server albo klient bez SDK): structured log.
    // Server-side trafia do Vercel/Datadog; klient → konsola tylko w dev.
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "production"
    ) {
      // eslint-disable-next-line no-console
      console.info(JSON.stringify({ source: "analytics", ...payload }));
    }
  } catch {
    /* ignore — analytics never breaks UX */
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Funnel definitions — kopiuj 1:1 do PostHog → Insights → Funnels.
   Nazwy stepów odpowiadają eventom z taxonomy.
   ───────────────────────────────────────────────────────────────────── */

export interface FunnelDef {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    event: EventName;
    label: string;
    /** Property filter — np. case_type === "sprzeciw_epu". */
    filter?: Record<string, unknown>;
  }>;
}

export const FUNNELS: ReadonlyArray<FunnelDef> = [
  {
    id: "acquisition_to_signup",
    name: "Akwizycja → Rejestracja",
    description:
      "Od pierwszego klika na CTA do założenia konta i pierwszego logowania.",
    steps: [
      { event: "page_view", label: "Wejście na landing" },
      { event: "cta_clicked", label: "Kliknięcie CTA" },
      { event: "signup_started", label: "Rozpoczęta rejestracja" },
      { event: "signup_completed", label: "Konto utworzone" },
      { event: "first_login", label: "Pierwsze logowanie" },
    ],
  },
  {
    id: "scanner_to_paid",
    name: "Skaner Nakazu (D1) → płatne (D2)",
    description:
      "Bezpłatny skan → upsell na pełne pismo (sprzeciw EPU). Główny lejek monetizacji.",
    steps: [
      { event: "scanner_landing_view", label: "Odwiedził /skaner-nakazu" },
      { event: "ocr_uploaded", label: "Załadował skan" },
      { event: "ocr_completed", label: "OCR zakończony" },
      { event: "case_created", label: "Sprawa utworzona" },
      { event: "checkout_started", label: "Rozpoczęty checkout" },
      { event: "payment_completed", label: "Płatność zakończona" },
    ],
  },
  {
    id: "wizard_completion",
    name: "Wizard — od startu do PDF",
    description:
      "Konwersja w wizardzie (drop-off na poszczególnych krokach).",
    steps: [
      { event: "case_created", label: "Sprawa utworzona" },
      { event: "wizard_step_completed", label: "Krok 1 ukończony" },
      { event: "ai_generation_started", label: "Generacja rozpoczęta" },
      { event: "ai_generation_completed", label: "Generacja zakończona" },
      { event: "document_downloaded", label: "PDF pobrany" },
    ],
  },
  {
    id: "retention_30d",
    name: "Retencja 30-dniowa",
    description:
      "Procent użytkowników, którzy wracają po pierwszej sprawie (próg: druga sprawa lub kalkulator).",
    steps: [
      { event: "first_login", label: "Pierwsze logowanie" },
      { event: "case_created", label: "Pierwsza sprawa" },
      { event: "second_case_created", label: "Druga sprawa (retencja)" },
    ],
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────
   Alerty — proponowane reguły dla PostHog Alerts.
   Każdy alert: trigger query + kanał (Slack / e-mail).
   ───────────────────────────────────────────────────────────────────── */

export interface AlertDef {
  id: string;
  name: string;
  description: string;
  /** SQL-like opis triggera (manual setup w PostHog UI). */
  trigger: string;
  channel: "email" | "slack" | "both";
  severity: "info" | "warn" | "critical";
}

export const ALERTS: ReadonlyArray<AlertDef> = [
  {
    id: "payment_fail_spike",
    name: "Spike nieudanych płatności",
    description:
      "Więcej niż 5 `payment_failed` w ciągu 30 minut → możliwy problem ze Stripe lub fraud-watchdog.",
    trigger: "count(payment_failed) > 5 over 30m",
    channel: "both",
    severity: "critical",
  },
  {
    id: "ai_validation_failure_rate",
    name: "Wysoki failure rate walidatora Haiku",
    description:
      "Odsetek `ai_validation_failed` / `ai_generation_completed` > 25% w ciągu 1h.",
    trigger:
      "ai_validation_failed / ai_generation_completed > 0.25 over 1h",
    channel: "slack",
    severity: "warn",
  },
  {
    id: "ocr_low_confidence_rate",
    name: "OCR — wzrost low-confidence",
    description:
      "ocr_low_confidence > 30% wszystkich uploadów — możliwa regresja preprocessingu.",
    trigger: "ocr_low_confidence / ocr_uploaded > 0.30 over 1h",
    channel: "slack",
    severity: "warn",
  },
  {
    id: "signup_drop",
    name: "Spadek rejestracji",
    description:
      "Liczba `signup_completed` w ostatniej godzinie < 50% średniej z ostatnich 7 dni o tej porze.",
    trigger:
      "signup_completed_last_hour < 0.5 * weekly_avg_same_hour",
    channel: "email",
    severity: "info",
  },
  {
    id: "checkout_abandonment",
    name: "Wzrost porzuceń checkout",
    description:
      "checkout_started bez payment_completed w 30 min → spike powyżej 70%.",
    trigger:
      "(checkout_started - payment_completed) / checkout_started > 0.70 over 1h",
    channel: "both",
    severity: "warn",
  },
] as const;
