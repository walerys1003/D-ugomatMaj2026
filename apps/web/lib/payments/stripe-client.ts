import "server-only";

/**
 * Stripe HTTP client — minimalna warstwa bez `stripe` SDK.
 *
 * Pattern zgodny z `apipod-client.ts` (Tier 3.1):
 *   - czysty fetch do https://api.stripe.com/v1
 *   - Basic Auth: `STRIPE_SECRET_KEY` jako username, hasło puste
 *   - form-urlencoded body (Stripe legacy convention)
 *   - własne typy zamiast 50 kB SDK w bundle'u
 *
 * Zakres Tier 4:
 *   - createCheckoutSession (mode=payment, currency=pln)
 *   - retrieveCheckoutSession (status confirmation)
 *   - constructWebhookEvent (HMAC-SHA256 verification)
 *
 * Fallback: gdy `STRIPE_SECRET_KEY` brak → `StripeUnavailableError`.
 * Caller pokazuje user'owi UI „płatność niedostępna w trybie demo".
 */
import { createHmac, timingSafeEqual } from "node:crypto";

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------
export class StripeUnavailableError extends Error {
  constructor(reason: string) {
    super(`Stripe niedostępny: ${reason}`);
    this.name = "StripeUnavailableError";
  }
}

export class StripeApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly type: string,
    message: string,
  ) {
    super(message);
    this.name = "StripeApiError";
  }
}

export class StripeWebhookSignatureError extends Error {
  constructor(reason: string) {
    super(`Niepoprawny podpis webhooka Stripe: ${reason}`);
    this.name = "StripeWebhookSignatureError";
  }
}

// -----------------------------------------------------------------------------
// Types — subset, tylko to z czego korzystamy
// -----------------------------------------------------------------------------
export interface CheckoutSessionCreateParams {
  /** URL do którego Stripe przekieruje po sukcesie. */
  successUrl: string;
  /** URL do którego Stripe przekieruje po anulowaniu. */
  cancelUrl: string;
  /** Email klienta — Stripe nie pyta o niego ponownie. */
  customerEmail: string;
  /** Kwota brutto w **groszach** (PLN) — już po rabacie jeśli promo aktywne. */
  amountGrosze: number;
  /** Nazwa produktu pokazywana w Checkout. */
  productName: string;
  /** Wewnętrzny payment_id (UUID) — przekazujemy w metadata. */
  paymentId: string;
  /** Wewnętrzny case_id — przekazujemy w metadata. */
  caseId: string;
  /** Wewnętrzny user_id — przekazujemy w metadata. */
  userId: string;
  /** Tier 4 / PLAN.md zad. 160 — promo code metadata (opcjonalne). */
  promoCodeId?: string;
  promoCode?: string;
  /** Kwota oryginalna PRZED rabatem (audit + recordRedemption w webhook). */
  promoOriginalAmountGrosze?: number;
  /** Wartość rabatu w groszach. */
  promoDiscountGrosze?: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
  payment_intent: string | null;
  customer: string | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired";
  amount_total: number;
  currency: string;
  customer_email: string | null;
  metadata: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Internal — config & request helper
// -----------------------------------------------------------------------------
function readKey(): string {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new StripeUnavailableError("brak STRIPE_SECRET_KEY w env");
  return k;
}

function readWebhookSecret(): string {
  const s = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s) throw new StripeUnavailableError("brak STRIPE_WEBHOOK_SECRET w env");
  return s;
}

const STRIPE_BASE = "https://api.stripe.com/v1";

/**
 * Stripe oczekuje form-urlencoded — zagłębione obiekty serializujemy
 * w stylu `parent[child]=value`.
 */
function encodeForm(
  obj: Record<string, unknown>,
  prefix = "",
): URLSearchParams {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const sub = encodeForm(value as Record<string, unknown>, fullKey);
      sub.forEach((v, k) => out.append(k, v));
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === "object" && item !== null) {
          const sub = encodeForm(
            item as Record<string, unknown>,
            `${fullKey}[${idx}]`,
          );
          sub.forEach((v, k) => out.append(k, v));
        } else {
          out.append(`${fullKey}[${idx}]`, String(item));
        }
      });
    } else {
      out.append(fullKey, String(value));
    }
  }
  return out;
}

async function stripeRequest<T>(
  path: string,
  init: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const key = readKey();
  const headers: Record<string, string> = {
    Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
    "Stripe-Version": "2024-09-30.acacia",
  };

  let body: string | undefined;
  if (init.body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = encodeForm(init.body).toString();
  }

  const resp = await fetch(`${STRIPE_BASE}${path}`, {
    method: init.method ?? "POST",
    headers,
    body,
    cache: "no-store",
  });

  const json = (await resp.json().catch(() => ({}))) as Record<string, unknown>;

  if (!resp.ok) {
    const err = (json.error ?? {}) as Record<string, unknown>;
    throw new StripeApiError(
      resp.status,
      String(err.type ?? "api_error"),
      String(err.message ?? `HTTP ${resp.status}`),
    );
  }

  return json as T;
}

// -----------------------------------------------------------------------------
// Public — Checkout Session
// -----------------------------------------------------------------------------
export async function createCheckoutSession(
  params: CheckoutSessionCreateParams,
): Promise<CheckoutSession> {
  // Stripe metadata: tylko stringi, max 50 par, max 500 znaków każda.
  // Promo metadata trafia do session.metadata i payment_intent.metadata
  // żeby webhook (checkout.session.completed) miał komplet danych do
  // wywołania recordPromoRedemption().
  const metadata: Record<string, string> = {
    payment_id: params.paymentId,
    case_id: params.caseId,
    user_id: params.userId,
  };
  if (params.promoCodeId) metadata.promo_code_id = params.promoCodeId;
  if (params.promoCode) metadata.promo_code = params.promoCode;
  if (params.promoOriginalAmountGrosze !== undefined) {
    metadata.promo_original_amount_grosze = String(
      params.promoOriginalAmountGrosze,
    );
  }
  if (params.promoDiscountGrosze !== undefined) {
    metadata.promo_discount_grosze = String(params.promoDiscountGrosze);
  }

  return stripeRequest<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    body: {
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      payment_method_types: ["card", "blik", "p24"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            unit_amount: params.amountGrosze,
            product_data: {
              name: params.productName,
            },
          },
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data: { metadata },
    },
  });
}

export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(`/checkout/sessions/${sessionId}`, {
    method: "GET",
  });
}

// -----------------------------------------------------------------------------
// Public — Webhook signature verification (Stripe-Signature header)
// -----------------------------------------------------------------------------
/**
 * Weryfikuje podpis webhooka Stripe.
 *
 * Format `Stripe-Signature`:
 *   t=1738080000,v1=<hex>,v0=<deprecated>
 *
 * Zwraca surowy event jako JSON; rzuca `StripeWebhookSignatureError`
 * jeśli HMAC SHA-256(`<t>.<rawBody>`) ≠ v1 lub timestamp > tolerancji.
 */
export function constructWebhookEvent(
  rawBody: string,
  signatureHeader: string,
  toleranceSeconds = 300,
): { id: string; type: string; data: { object: Record<string, unknown> } } {
  const secret = readWebhookSecret();

  const parts = signatureHeader.split(",").reduce<Record<string, string>>(
    (acc, p) => {
      const [k, v] = p.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    },
    {},
  );

  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) throw new StripeWebhookSignatureError("brak t/v1 w nagłówku");

  // Tolerancja czasowa — chroni przed replayem
  const ageSec = Math.abs(Date.now() / 1000 - Number(ts));
  if (ageSec > toleranceSeconds) {
    throw new StripeWebhookSignatureError(
      `timestamp poza tolerancją (${ageSec.toFixed(0)}s > ${toleranceSeconds}s)`,
    );
  }

  const expected = createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`, "utf8")
    .digest("hex");

  // timingSafeEqual chroni przed timing attack
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new StripeWebhookSignatureError("HMAC mismatch");
  }

  return JSON.parse(rawBody) as {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };
}

/** Util — czy klucz Stripe jest w ogóle skonfigurowany. */
export function isStripeAvailable(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
