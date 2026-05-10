import "server-only";

/**
 * SMSAPI (smsapi.pl) HTTP client — zadanie 88.
 *
 * Polski lider SMS marketingu (zgodne z UKE / RODO, dane w PL).
 * REST API: https://api.smsapi.pl/sms.do?...
 *
 * Konfiguracja przez ENV:
 *   - SMSAPI_OAUTH_TOKEN  — Bearer token wygenerowany w panelu SMSAPI
 *   - SMSAPI_SENDER       — np. "Dlugomat" (3-11 znaków, zarejestrowany pole nadawcy)
 *
 * Format numeru:
 *   - "+48XXXXXXXXX" lub "48XXXXXXXXX"  (E.164 bez "+")
 *   - "XXXXXXXXX" (9 cyfr) — uzupełniamy "48"
 *
 * Tryb:
 *   - format=json → response: { count, list: [{ id, points, number, status }] }
 *   - error response: { error, message }
 *
 * Idempotency:
 *   - SMSAPI honoruje param `idx` jako idempotency key (max 36 znaków).
 */
import { NotificationProviderError } from "./types";

export interface SendSmsInput {
  /** Numer odbiorcy — akceptujemy "+48", "48", lub same 9 cyfr. */
  to: string;
  body: string;
  /** Idempotency key (idx) — opcjonalny, domyślnie generujemy crypto.randomUUID. */
  idempotencyKey?: string;
  /** Test mode (smsapi nie obciąży konta, tylko zwróci sukces). */
  test?: boolean;
}

export interface SendSmsResult {
  id: string;
  points: number;
  number: string;
  status: string;
}

export class SmsProviderUnavailableError extends NotificationProviderError {
  constructor(message: string, cause?: unknown) {
    super("smsapi", message, cause);
  }
}

const SMSAPI_URL = "https://api.smsapi.pl/sms.do";
const REQUEST_TIMEOUT_MS = 15_000;

export function isSmsApiAvailable(): boolean {
  return Boolean(process.env.SMSAPI_OAUTH_TOKEN && process.env.SMSAPI_SENDER);
}

export function normalizePolishPhone(input: string): string {
  // Usuń wszystko poza cyframi i +
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 9) return `48${digits}`;
  if (digits.length === 11 && digits.startsWith("48")) return digits;
  if (digits.length === 12 && digits.startsWith("0048")) return digits.slice(2);
  // Fallback — przekaż dalej (SMSAPI sam odrzuci jeśli źle)
  return digits;
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const token = process.env.SMSAPI_OAUTH_TOKEN;
  const sender = process.env.SMSAPI_SENDER;
  if (!token || !sender) {
    throw new SmsProviderUnavailableError(
      "SMSAPI_OAUTH_TOKEN / SMSAPI_SENDER nie są ustawione.",
    );
  }

  const phone = normalizePolishPhone(input.to);
  if (!/^48\d{9}$/.test(phone)) {
    throw new SmsProviderUnavailableError(
      `Niepoprawny numer telefonu: ${input.to} → ${phone}`,
    );
  }

  const idx = input.idempotencyKey ?? cryptoRandomId();

  // application/x-www-form-urlencoded
  const params = new URLSearchParams({
    to: phone,
    message: input.body,
    from: sender,
    format: "json",
    encoding: "utf-8",
    idx,
    ...(input.test ? { test: "1" } : {}),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(SMSAPI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Bearer ${token}`,
      },
      body: params.toString(),
    });
  } catch (e) {
    clearTimeout(timer);
    throw new SmsProviderUnavailableError(
      `Brak łączności z SMSAPI: ${e instanceof Error ? e.message : String(e)}`,
      e,
    );
  }
  clearTimeout(timer);

  const text = await response.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new SmsProviderUnavailableError(
      `SMSAPI zwrócił nieparowalny JSON (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  // Error shape: { error: number, message: string }
  if (typeof json === "object" && json !== null && "error" in json) {
    const e = json as { error: number; message?: string };
    throw new SmsProviderUnavailableError(
      `SMSAPI error ${e.error}: ${e.message ?? "(no message)"}`,
    );
  }

  // Success shape: { count, list: [{ id, points, number, status }] }
  if (
    typeof json === "object" &&
    json !== null &&
    "list" in json &&
    Array.isArray((json as { list: unknown[] }).list) &&
    (json as { list: unknown[] }).list.length > 0
  ) {
    const item = (json as { list: SendSmsResult[] }).list[0];
    return {
      id: String(item.id),
      points: Number(item.points ?? 0),
      number: String(item.number),
      status: String(item.status ?? "QUEUE"),
    };
  }

  throw new SmsProviderUnavailableError(
    `SMSAPI zwrócił nieoczekiwany kształt: ${text.slice(0, 200)}`,
  );
}

function cryptoRandomId(): string {
  // crypto.randomUUID działa w edge runtime (Web Crypto)
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
