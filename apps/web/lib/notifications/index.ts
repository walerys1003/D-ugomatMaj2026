/**
 * Public surface of `lib/notifications`.
 *
 * Use:
 *   import { dispatchNotification } from "@/lib/notifications";
 *
 * Internal modules (`resend-client`, `smsapi-client`, `email-templates/*`)
 * powinny być importowane tylko przez `dispatch.ts` — pozostała część
 * aplikacji używa tej fasady.
 */
export { dispatchNotification } from "./dispatch";
export type {
  DispatchInput,
  DispatchResult,
  EmailTemplateKey,
  SmsTemplateKey,
  TemplateKey,
  RenderedEmail,
  RenderedSms,
} from "./types";
export { NotificationProviderError } from "./types";
export {
  DEADLINE_KIND_LABEL,
  EMAIL_TEMPLATE_FOR_WINDOW,
  SMS_TEMPLATE_FOR_WINDOW,
  daysUntil,
  windowToSend,
  windowToColumn,
} from "./deadline-windows";
export type { DeadlineWindow } from "./deadline-windows";
export { renderEmail, EMAIL_TEMPLATES } from "./email-templates";
export { renderSms, SMS_TEMPLATES } from "./sms-templates";
export { isResendAvailable } from "./resend-client";
export { isSmsApiAvailable, normalizePolishPhone } from "./smsapi-client";
