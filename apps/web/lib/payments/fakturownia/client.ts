import "server-only";

/**
 * Fakturownia HTTP client — minimalna warstwa REST (bez SDK).
 *
 * Endpointy:
 *   - POST  /invoices.json                — utwórz fakturę
 *   - GET   /invoices/{id}.json           — pobierz fakturę
 *   - POST  /invoices/{id}/send_by_email.json  — wyślij PDF na email
 *
 * Konfiguracja:
 *   FAKTUROWNIA_DOMAIN     (np. "dlugomat" → https://dlugomat.fakturownia.pl)
 *   FAKTUROWNIA_API_TOKEN  (token API z panelu Fakturownia)
 *
 * Konwencja kwot:
 *  - Fakturownia używa **groszy** dla `price_net` jeśli `price_kind='net'`
 *    lub **złotych** jako stringów ("159.00") jeśli przesyłamy gotowe brutto.
 *    My wysyłamy **złote (string z 2 miejscami)** dla zgodności z UI.
 */

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------
export class FakturowniaUnavailableError extends Error {
  constructor(reason: string) {
    super(`Fakturownia niedostępna: ${reason}`);
    this.name = "FakturowniaUnavailableError";
  }
}

export class FakturowniaApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "FakturowniaApiError";
  }
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface InvoiceCreateParams {
  /** Pełna nazwa płatnika (B2C: imię i nazwisko, B2B: firma). */
  buyerName: string;
  /** Email — dla wysyłki faktury w PDF. */
  buyerEmail: string;
  /** B2B: NIP. B2C: pomiń. */
  buyerTaxNo?: string;
  /** Adres odbiorcy (jednoliniowy). */
  buyerAddress?: string;
  /** Pozycja faktury — pojedyncza usługa Długomat. */
  productName: string;
  /** Kwota brutto w **groszach**. */
  grossGrosze: number;
  /** Stawka VAT w %, np. 23. */
  vatRate: number;
  /** Wewnętrzny payment_id (UUID) — w polu `additional_info`. */
  paymentId: string;
  /** Numer sesji Stripe — w polu `oid` (own id). */
  stripeSessionId: string;
}

export interface InvoiceCreateResponse {
  id: number;
  number: string;
  view_url: string;
  /** Kind = "vat" zwykle. */
  kind: string;
  buyer_name: string;
  total_price_gross: string; // np. "159.00"
}

// -----------------------------------------------------------------------------
// Internal — config
// -----------------------------------------------------------------------------
function readConfig(): { baseUrl: string; token: string } {
  const domain = process.env.FAKTUROWNIA_DOMAIN;
  const token = process.env.FAKTUROWNIA_API_TOKEN;
  if (!domain) {
    throw new FakturowniaUnavailableError("brak FAKTUROWNIA_DOMAIN w env");
  }
  if (!token) {
    throw new FakturowniaUnavailableError("brak FAKTUROWNIA_API_TOKEN w env");
  }
  return {
    baseUrl: `https://${domain}.fakturownia.pl`,
    token,
  };
}

async function fakturowniaRequest<T>(
  path: string,
  init: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const { baseUrl, token } = readConfig();

  const url = new URL(`${baseUrl}${path}`);
  // Fakturownia akceptuje api_token w query lub body — używamy query
  url.searchParams.set("api_token", token);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  let body: string | undefined;
  if (init.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }

  const resp = await fetch(url.toString(), {
    method: init.method ?? "POST",
    headers,
    body,
    cache: "no-store",
  });

  const text = await resp.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // ignore — Fakturownia zwykle zwraca JSON, ale fallback na text
  }

  if (!resp.ok) {
    const errMsg =
      typeof json === "object" && json !== null && "message" in json
        ? String((json as Record<string, unknown>).message)
        : `HTTP ${resp.status}: ${text.slice(0, 200)}`;
    throw new FakturowniaApiError(resp.status, errMsg);
  }

  return json as T;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
/** 15900 (grosze) → "159.00" (PLN string). */
function groszeToString(grosze: number): string {
  return (grosze / 100).toFixed(2);
}

// -----------------------------------------------------------------------------
// Public — invoice operations
// -----------------------------------------------------------------------------
export async function createInvoice(
  params: InvoiceCreateParams,
): Promise<InvoiceCreateResponse> {
  const grossPln = groszeToString(params.grossGrosze);

  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    invoice: {
      kind: "vat",
      number: null, // auto-numeracja Fakturownia
      sell_date: today,
      issue_date: today,
      payment_to: today, // płatnicze "do" (zapłacono z góry)
      seller_name: "Długomat sp. z o.o.",
      seller_tax_no: process.env.SELLER_NIP ?? "",
      buyer_name: params.buyerName,
      buyer_email: params.buyerEmail,
      buyer_tax_no: params.buyerTaxNo ?? "",
      buyer_post_code: "",
      buyer_city: "",
      buyer_street: params.buyerAddress ?? "",
      buyer_country: "PL",
      currency: "PLN",
      lang: "pl",
      paid: grossPln, // zapłacone w całości (Stripe Checkout)
      payment_type: "card",
      status: "paid",
      oid: params.stripeSessionId, // własny identyfikator (Stripe session)
      additional_info: `payment_id=${params.paymentId}`,
      positions: [
        {
          name: params.productName,
          tax: params.vatRate,
          total_price_gross: grossPln,
          quantity: 1,
        },
      ],
    },
  };

  return fakturowniaRequest<InvoiceCreateResponse>("/invoices.json", {
    method: "POST",
    body: payload,
  });
}

export async function sendInvoiceByEmail(invoiceId: number): Promise<void> {
  await fakturowniaRequest<unknown>(
    `/invoices/${invoiceId}/send_by_email.json`,
    { method: "POST" },
  );
}

/** Util — czy Fakturownia jest skonfigurowana. */
export function isFakturowniaAvailable(): boolean {
  return Boolean(
    process.env.FAKTUROWNIA_DOMAIN && process.env.FAKTUROWNIA_API_TOKEN,
  );
}
