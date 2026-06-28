import "server-only";

/**
 * Resend HTTP client — minimalna warstwa bez `resend` SDK.
 *
 * Resend (https://resend.com) — wybrany jako primary email provider:
 *   - REST API JSON (zero deps, edge-runtime safe)
 *   - DKIM/SPF/DMARC out-of-the-box dla custom domain
 *   - Sandbox mode + production w jednym kluczu
 *
 * Konfiguracja przez ENV:
 *   - RESEND_API_KEY      — bearer token
 *   - RESEND_FROM_EMAIL   — np. "Długomat <powiadomienia@dlugomat.pl>"
 *   - RESEND_REPLY_TO     — opcjonalnie (domyślnie pomoc@dlugomat.pl)
 *
 * Brak ENV → throw `EmailProviderUnavailableError` — caller decyduje
 * czy fallback do logu / alternatywnego providera.
 */
import { NotificationProviderError } from "./types";

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  /** Idempotency key — Resend deduplikuje requesty z tym samym key w 24h. */
  idempotencyKey?: string;
}

export interface SendEmailResult {
  /** Resend message ID — używamy do statusu / unsubscribe. */
  id: string;
}

export class EmailProviderUnavailableError extends NotificationProviderError {
  constructor(message: string, cause?: unknown) {
    super("resend", message, cause);
  }
}

const RESEND_API = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 15_000;

export function isResendAvailable(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new EmailProviderUnavailableError(
      "RESEND_API_KEY / RESEND_FROM_EMAIL nie są ustawione.",
    );
  }

  const replyTo = input.replyTo ?? process.env.RESEND_REPLY_TO ?? "pomoc@dlugomat.pl";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    const { resendCircuit, CircuitOpenError } = await import(
      "@/lib/observability/circuit-breaker"
    );
    const { withRetry } = await import("@/lib/observability/retry");
    try {
      response = await resendCircuit.run(() =>
        withRetry(
          () =>
            fetch(RESEND_API, {
              method: "POST",
              signal: controller.signal,
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${apiKey}`,
                ...(input.idempotencyKey
                  ? { "idempotency-key": input.idempotencyKey }
                  : {}),
              },
              body: JSON.stringify({
                from,
                to: [input.to],
                subject: input.subject,
                text: input.text,
                html: input.html,
                reply_to: replyTo,
              }),
            }),
          {
            opName: "resend.send",
            maxAttempts: 3,
            classify: (err) => {
              if (err && typeof err === "object" && "status" in err) {
                const s = Number((err as { status?: number }).status);
                if (s === 429 || s >= 500) return "retry";
                if (s >= 400) return "fail";
              }
              return "retry";
            },
          },
        ),
      );
    } catch (inner) {
      if (inner instanceof CircuitOpenError) {
        throw new EmailProviderUnavailableError("Resend: circuit open", inner);
      }
      throw inner;
    }
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof EmailProviderUnavailableError) throw e;
    throw new EmailProviderUnavailableError(
      `Brak łączności z Resend: ${e instanceof Error ? e.message : String(e)}`,
      e,
    );
  }
  clearTimeout(timer);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new EmailProviderUnavailableError(
      `Resend ${response.status}: ${text.slice(0, 240)}`,
    );
  }

  const json = (await response.json()) as { id?: string };
  if (!json.id) {
    throw new EmailProviderUnavailableError("Resend nie zwrócił ID wiadomości.");
  }
  return { id: json.id };
}
