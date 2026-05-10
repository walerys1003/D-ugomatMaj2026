/**
 * Notifications — domain types.
 *
 * Każde powiadomienie:
 *   - Ma `template` (klucz w `EMAIL_TEMPLATES` lub `SMS_TEMPLATES`).
 *   - Ma `channel` (email | sms | push) — wybiera providera.
 *   - Ma `recipient` (snapshot adresu — user może go zmienić, my zachowujemy).
 *   - Persistuje pełny rendered subject/body w tabeli `notifications`.
 *
 * Render jest deterministyczny (template + variables → markdown/text/html),
 * więc moglibyśmy w teorii wygenerować body w runtime, ale zapisujemy
 * snapshot do compliance-trail (RODO art. 13/15) + audytu wysyłki.
 */
import type { NotificationChannel, NotificationStatus } from "@/lib/db/types";

export type EmailTemplateKey =
  | "deadline_d7_warning"      // 7 dni przed
  | "deadline_d3_warning"      // 3 dni przed
  | "deadline_d1_warning"      // 1 dzień przed
  | "deadline_d0_morning"      // dzień terminu — rano
  | "case_generated"           // dokument gotowy po generacji
  | "payment_completed"        // potwierdzenie płatności + invoice link
  | "payment_failed"           // PLAN.md zad. 163 — recovery email
  | "rodo_export_ready"        // export RODO art. 20 gotowy do pobrania
  | "rodo_account_deleted"     // potwierdzenie usunięcia (art. 17)
  | "welcome"                  // po rejestracji
  | "onboarding_day1"          // PLAN.md zad. 243 — onboarding sequence
  | "onboarding_day3"
  | "onboarding_day7"
  | "onboarding_day14"
  | "onboarding_day30";

export type SmsTemplateKey =
  | "deadline_d3_warning"
  | "deadline_d1_warning"
  | "deadline_d0_morning";

export type TemplateKey = EmailTemplateKey | SmsTemplateKey;

export interface RenderedEmail {
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface RenderedSms {
  bodyText: string;
}

export interface DispatchInput {
  channel: NotificationChannel;
  template: TemplateKey;
  /** Adres docelowy (email albo telefon w formacie +48XXXXXXXXX). */
  recipient: string;
  variables: Record<string, string | number>;
  /** Powiązania (FK) — opcjonalne. */
  userId: string;
  caseId?: string | null;
  deadlineId?: string | null;
  /** Jeżeli podane — zaplanuj na przyszłość zamiast wysłać natychmiast. */
  scheduledFor?: Date | null;
}

export interface DispatchResult {
  notificationId: string;
  status: NotificationStatus;
  providerMessageId: string | null;
  providerError: string | null;
}

export class NotificationProviderError extends Error {
  override name = "NotificationProviderError" as const;
  constructor(
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${provider}] ${message}`);
  }
}
