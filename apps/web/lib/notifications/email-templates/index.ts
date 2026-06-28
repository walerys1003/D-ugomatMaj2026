/**
 * Email templates registry — zadania 87, 162, 163.
 *
 * Każdy template:
 *   - Subject (plain text)
 *   - bodyText (plaintext fallback dla klientów, które blokują HTML)
 *   - bodyHtml (zoptymalizowany pod email — inline style, max 600 px,
 *     bez external CSS/JS)
 *
 * Tone: brand "Tarcza" — Calm Authority.
 *   - Bez paniki ("ALERT! UWAGA!")
 *   - Bez wykrzykników w temacie
 *   - Konkretne: liczba dni / kwota / sygnatura
 *   - Zawsze CTA na konkretną akcję ("Zobacz w panelu")
 */
import type { EmailTemplateKey, RenderedEmail } from "../types";

import { renderDeadlineD7 } from "./deadline-d7";
import { renderDeadlineD3 } from "./deadline-d3";
import { renderDeadlineD1 } from "./deadline-d1";
import { renderDeadlineD0Morning } from "./deadline-d0";
import { renderCaseGenerated } from "./case-generated";
import { renderPaymentCompleted } from "./payment-completed";
import { renderPaymentFailed } from "./payment-failed";
import { renderRodoExportReady } from "./rodo-export-ready";
import { renderRodoAccountDeleted } from "./rodo-account-deleted";
import { renderWelcome } from "./welcome";
import {
  renderOnboardingDay1,
  renderOnboardingDay3,
  renderOnboardingDay7,
  renderOnboardingDay14,
  renderOnboardingDay30,
} from "./onboarding";

export type EmailRenderer = (
  variables: Record<string, string | number>,
) => RenderedEmail;

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailRenderer> = {
  deadline_d7_warning:    renderDeadlineD7,
  deadline_d3_warning:    renderDeadlineD3,
  deadline_d1_warning:    renderDeadlineD1,
  deadline_d0_morning:    renderDeadlineD0Morning,
  case_generated:         renderCaseGenerated,
  payment_completed:      renderPaymentCompleted,
  payment_failed:         renderPaymentFailed,
  rodo_export_ready:      renderRodoExportReady,
  rodo_account_deleted:   renderRodoAccountDeleted,
  welcome:                renderWelcome,
  onboarding_day1:        renderOnboardingDay1,
  onboarding_day3:        renderOnboardingDay3,
  onboarding_day7:        renderOnboardingDay7,
  onboarding_day14:       renderOnboardingDay14,
  onboarding_day30:       renderOnboardingDay30,
};

export function renderEmail(
  template: EmailTemplateKey,
  variables: Record<string, string | number>,
): RenderedEmail {
  const renderer = EMAIL_TEMPLATES[template];
  if (!renderer) {
    throw new Error(`Unknown email template: ${template}`);
  }
  return renderer(variables);
}
