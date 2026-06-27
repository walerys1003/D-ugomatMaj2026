/**
 * Długomat — Stripe webhook handler (Tier 4).
 *
 * Endpoint: POST /api/stripe/webhook
 * Konfiguracja: dodaj URL w Stripe Dashboard → Developers → Webhooks
 * Eventy które obsługujemy:
 *   - checkout.session.completed → mark payment paid, create Fakturownia invoice
 *   - checkout.session.expired   → mark payment failed
 *   - charge.refunded            → mark payment refunded
 *
 * SECURITY:
 *   - Signature verification HMAC-SHA256 (Stripe-Signature header)
 *   - Tolerance ±5 min (chroni przed replayem)
 *   - Service-role Supabase client (RLS bypass — webhook musi
 *     pisać do payments cudzych user'ów)
 *
 * Idempotency:
 *   - Stripe retry'uje webhook gdy nie dostanie 2xx w 5s
 *   - Sprawdzamy `payments.status` przed update'em (jeśli już 'completed' — skip)
 */
import { NextResponse, type NextRequest } from "next/server";

import {
  constructWebhookEvent,
  StripeWebhookSignatureError,
  StripeUnavailableError,
} from "@/lib/payments/stripe-client";
import {
  createInvoice,
  sendInvoiceByEmail,
  isFakturowniaAvailable,
  FakturowniaApiError,
} from "@/lib/payments/fakturownia/client";
import { recordPromoRedemption } from "@/lib/payments/promo-codes";
import { recordReferralConversion } from "@/lib/referrals/referral-actions";
import { dispatchNotification } from "@/lib/notifications";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimitDistributed,
} from "@/lib/security/rate-limit";
import {
  reserveIdempotency,
  completeIdempotency,
  abortIdempotency,
} from "@/lib/observability/idempotency";

export const runtime = "nodejs"; // potrzebujemy node:crypto
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 0) Rate-limit per-IP (anty-flood; webhook ma wyższy limit niż user API).
  // Stripe wysyła z kilku stałych IP — limit 60/min jest bezpieczny.
  const clientId = clientIdFromHeaders(req.headers);
  // Audyt #2 — rozproszony rate-limit; degraduje do in-memory bez Redisa.
  const rl = await rateLimitDistributed(
    `webhook:stripe:${clientId}`,
    RATE_LIMIT_PROFILES.webhook,
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rl.resetMs / 1000)),
        },
      },
    );
  }

  // 1) Verify signature
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "missing stripe-signature header" },
      { status: 400 },
    );
  }
  const rawBody = await req.text();

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = constructWebhookEvent(rawBody, sig);
  } catch (e) {
    if (e instanceof StripeWebhookSignatureError) {
      console.warn("[stripe-webhook] signature failed:", e.message);
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    if (e instanceof StripeUnavailableError) {
      // brak STRIPE_WEBHOOK_SECRET — odrzucamy z 503
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    throw e;
  }

  // 1.5) Audyt #5 — DEDUPLIKACJA po event.id (Stripe dostarcza at-least-once!).
  // Rezerwujemy klucz idempotencyjny scope="stripe.webhook" key=event.id.
  // - hit completed  → event już przetworzony, zwracamy 200 bez side-effectów.
  // - hit in_progress→ równoległa dostawa, zwracamy 200 (Stripe nie retry'uje 2xx).
  // - miss           → rezerwacja in_progress, przetwarzamy poniżej.
  const idemKeyObj = { scope: "stripe.webhook", key: event.id };
  let alreadyProcessed = false;
  try {
    const lookup = await reserveIdempotency<{ type: string }>(idemKeyObj);
    if (lookup.hit) {
      alreadyProcessed = true;
    }
  } catch (e) {
    // Jeśli dedup-store padnie — nie blokujemy płatności, ale logujemy.
    // (Best-effort: handlery i tak mają per-row status checks.)
    console.warn("[stripe-webhook] idempotency reserve failed:", e);
  }
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, deduplicated: true, type: event.type });
  }

  // 2) Dispatch event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event);
        break;
      // PLAN.md zad. 163 — payment failure recovery
      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event);
        break;
      default:
        // Ignorujemy inne eventy (Stripe wysyła ich kilkaset typów)
        break;
    }
  } catch (e) {
    console.error("[stripe-webhook] handler error:", e);
    // Audyt #5 — zwalniamy rezerwację, by retry Stripe mógł przetworzyć event.
    try {
      await abortIdempotency(idemKeyObj);
    } catch {
      /* best-effort */
    }
    // Zwracamy 500 — Stripe zretry'uje
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "handler error" },
      { status: 500 },
    );
  }

  // Audyt #5 — oznaczamy event jako przetworzony (completed).
  try {
    await completeIdempotency(idemKeyObj, { type: event.type }, 200);
  } catch {
    /* best-effort — per-row checks i tak chronią przed duplikatami */
  }

  return NextResponse.json({ received: true, type: event.type });
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------
async function handleCheckoutCompleted(event: {
  data: { object: Record<string, unknown> };
}): Promise<void> {
  const session = event.data.object as {
    id: string;
    payment_intent: string | null;
    customer: string | null;
    customer_email: string | null;
    payment_status: string;
    amount_total: number;
    metadata: Record<string, string>;
  };

  if (session.payment_status !== "paid") {
    console.warn(
      `[stripe-webhook] checkout.completed but payment_status=${session.payment_status}, skipping`,
    );
    return;
  }

  const paymentId = session.metadata?.payment_id;
  const caseId = session.metadata?.case_id;
  if (!paymentId) {
    console.warn("[stripe-webhook] missing metadata.payment_id");
    return;
  }

  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Idempotency: jeśli już 'completed' — skip
  const { data: existing, error: selErr } = await sb
    .from("payments")
    .select(
      "id, user_id, case_id, status, amount, vat_rate, product_name, customer_type, invoice_company_name, invoice_nip, invoice_address, fakturownia_invoice_id",
    )
    .eq("id", paymentId)
    .single();
  if (selErr || !existing) {
    console.warn(
      `[stripe-webhook] payment ${paymentId} not found: ${selErr?.message}`,
    );
    return;
  }
  if (existing.status === "completed") {
    return; // już zaksięgowane
  }

  // Update payments → completed
  await sb
    .from("payments")
    .update({
      status: "completed",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent,
      stripe_customer_id: session.customer,
    })
    .eq("id", paymentId);

  // Update case → status='paid'
  if (caseId) {
    await sb
      .from("cases")
      .update({ status: "paid" })
      .eq("id", caseId);

    await sb.from("case_events").insert({
      case_id: caseId,
      user_id: existing.user_id,
      actor: "payment",
      event_type: "payment_completed",
      metadata: {
        payment_id: paymentId,
        stripe_session_id: session.id,
        amount: existing.amount,
      },
    });
  }

  // PLAN.md zad. 160 — promo redemption (idempotent przez unique payment_id)
  const promoCodeId = session.metadata?.promo_code_id;
  const promoCode = session.metadata?.promo_code;
  const promoOriginal = session.metadata?.promo_original_amount_grosze;
  const promoDiscount = session.metadata?.promo_discount_grosze;
  if (promoCodeId && promoCode && promoOriginal && promoDiscount) {
    try {
      await recordPromoRedemption({
        promoCodeId,
        code: promoCode,
        userId: existing.user_id,
        paymentId,
        originalAmountGrosze: Number(promoOriginal),
        discountGrosze: Number(promoDiscount),
        finalAmountGrosze: existing.amount,
      });
    } catch (e) {
      // Best-effort — webhook nie powinien wracać 500 z tego powodu;
      // diff w current_uses widać w admin panelu.
      console.warn(
        "[stripe-webhook] recordPromoRedemption failed:",
        e instanceof Error ? e.message : e,
      );
    }
  }

  // PLAN.md zad. 246 — referral conversion (best-effort, idempotent)
  // Jeśli kupujący ma `profiles.referred_by_code`, naliczamy prowizję
  // (status='pending' do akceptacji adminem).
  try {
    await recordReferralConversion({
      refereeUserId: existing.user_id,
      paymentId,
      caseId: caseId ?? null,
      amountGrosze: existing.amount,
    });
  } catch (e) {
    // recordReferralConversion sam nie throw'uje, ale defensywnie:
    console.warn(
      "[stripe-webhook] recordReferralConversion failed:",
      e instanceof Error ? e.message : e,
    );
  }

  // Fakturownia (best-effort — nie blokuje webhooka)
  if (
    !existing.fakturownia_invoice_id &&
    isFakturowniaAvailable() &&
    session.customer_email
  ) {
    try {
      const buyerName =
        existing.customer_type === "b2b"
          ? existing.invoice_company_name || session.customer_email
          : session.customer_email;

      const invoice = await createInvoice({
        buyerName,
        buyerEmail: session.customer_email,
        buyerTaxNo:
          existing.customer_type === "b2b"
            ? existing.invoice_nip ?? undefined
            : undefined,
        buyerAddress: existing.invoice_address ?? undefined,
        productName: existing.product_name,
        grossGrosze: existing.amount,
        vatRate: Number(existing.vat_rate),
        paymentId,
        stripeSessionId: session.id,
      });

      await sb
        .from("payments")
        .update({
          fakturownia_invoice_id: invoice.id,
          fakturownia_invoice_number: invoice.number,
          fakturownia_invoice_url: invoice.view_url,
        })
        .eq("id", paymentId);

      // Wyślij PDF na email (best-effort)
      try {
        await sendInvoiceByEmail(invoice.id);
      } catch (sendErr) {
        console.warn(
          "[stripe-webhook] sendInvoiceByEmail failed:",
          sendErr instanceof Error ? sendErr.message : sendErr,
        );
      }
    } catch (e) {
      // Nie wywracamy webhooka — Fakturownia można dorobić ręcznie
      const msg =
        e instanceof FakturowniaApiError
          ? `${e.status}: ${e.message}`
          : e instanceof Error
            ? e.message
            : String(e);
      console.error("[stripe-webhook] fakturownia createInvoice failed:", msg);
    }
  }
}

async function handleCheckoutExpired(event: {
  data: { object: Record<string, unknown> };
}): Promise<void> {
  const session = event.data.object as {
    id: string;
    metadata: Record<string, string>;
  };
  const paymentId = session.metadata?.payment_id;
  if (!paymentId) return;

  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb
    .from("payments")
    .update({
      status: "failed",
      failure_reason: "checkout_session_expired",
    })
    .eq("id", paymentId)
    .eq("status", "pending");
}

async function handleChargeRefunded(event: {
  data: { object: Record<string, unknown> };
}): Promise<void> {
  const charge = event.data.object as {
    payment_intent: string;
    amount_refunded: number;
    refunds?: {
      data?: Array<{
        id: string;
        amount: number;
        currency: string;
        status: string;
        reason: string | null;
        created: number;
        metadata?: Record<string, string>;
      }>;
    };
  };
  if (!charge.payment_intent) return;

  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Pobierz powiązaną płatność (potrzebujemy payment_id + user_id do `refunds`)
  const { data: payment } = await sb
    .from("payments")
    .select("id, user_id, case_id, amount")
    .eq("stripe_payment_intent_id", charge.payment_intent)
    .maybeSingle();

  // 1) Zapisz każdy refund z eventu do `refunds` (idempotent via stripe_refund_id).
  // Stripe wysyła kompletną listę refundów dla charge'a, więc każdy może być
  // już w bazie (jeżeli admin wywołał refund przez naszą akcję) — unique
  // constraint na stripe_refund_id załatwia idempotency.
  if (payment && charge.refunds?.data) {
    for (const r of charge.refunds.data) {
      // Sprawdź czy już istnieje (idempotency dla async webhook retries)
      const { data: existing } = await sb
        .from("refunds")
        .select("id, status")
        .eq("stripe_refund_id", r.id)
        .maybeSingle();

      if (existing) {
        // Update statusu (np. pending → succeeded)
        if (existing.status !== r.status) {
          await sb
            .from("refunds")
            .update({
              status: r.status === "succeeded" ? "succeeded" : r.status,
              succeeded_at:
                r.status === "succeeded" ? new Date().toISOString() : null,
            })
            .eq("id", existing.id);
        }
      } else {
        // Insert nowego — wywołane spoza naszego admin tool (np. Dashboard Stripe)
        await sb.from("refunds").insert({
          payment_id: payment.id,
          user_id: payment.user_id,
          stripe_refund_id: r.id,
          stripe_payment_intent_id: charge.payment_intent,
          amount: r.amount,
          currency: r.currency.toLowerCase(),
          reason: r.reason,
          status: r.status === "succeeded" ? "succeeded" : "pending",
          succeeded_at:
            r.status === "succeeded" ? new Date().toISOString() : null,
        });
      }
    }
  }

  // 2) Update payments.status + refunded_at jeżeli pełna kwota zrefundowana
  const isFullRefund =
    payment && charge.amount_refunded >= payment.amount;
  await sb
    .from("payments")
    .update({
      status: isFullRefund ? "refunded" : "completed",
      refunded_at: isFullRefund ? new Date().toISOString() : null,
    })
    .eq("stripe_payment_intent_id", charge.payment_intent);

  // 3) Audit case_event
  if (payment?.case_id) {
    await sb.from("case_events").insert({
      case_id: payment.case_id,
      user_id: payment.user_id,
      actor: "payment",
      event_type: isFullRefund ? "payment_refunded_full" : "payment_refunded_partial",
      metadata: {
        payment_id: payment.id,
        stripe_payment_intent_id: charge.payment_intent,
        amount_refunded: charge.amount_refunded,
        amount_original: payment.amount,
      },
    });
  }
}

/**
 * PLAN.md zad. 163 — payment failure recovery.
 *
 * Obsługuje 2 typy eventów:
 *   - checkout.session.async_payment_failed (BLIK/P24/przelew nie doszedł)
 *   - payment_intent.payment_failed (karta odrzucona)
 *
 * Akcja:
 *   1. Mark payments.status='failed' z opisem powodu (decline_code).
 *   2. Wysyła email "payment_failed" przez dispatchNotification (idempotent
 *      dedupKey per payment_id) — zawiera linkk do /panel/sprawa/<caseId>
 *      gdzie user może spróbować ponownie.
 *
 * Idempotencja: dispatchNotification dedupKey blokuje powtórki przy retry
 * webhooka.
 */
async function handlePaymentFailed(event: {
  data: { object: Record<string, unknown> };
}): Promise<void> {
  const obj = event.data.object as {
    id: string;
    metadata?: Record<string, string>;
    last_payment_error?: { code?: string; decline_code?: string; message?: string };
    charges?: { data?: Array<{ failure_message?: string; failure_code?: string }> };
  };

  const paymentId = obj.metadata?.payment_id;
  const caseId = obj.metadata?.case_id;
  if (!paymentId) {
    console.warn("[stripe-webhook] payment_failed without metadata.payment_id");
    return;
  }

  const reason =
    obj.last_payment_error?.decline_code ||
    obj.last_payment_error?.code ||
    obj.last_payment_error?.message ||
    obj.charges?.data?.[0]?.failure_code ||
    obj.charges?.data?.[0]?.failure_message ||
    "payment_failed";

  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: payment, error: selErr } = await sb
    .from("payments")
    .select("id, user_id, case_id, status, amount, product_name")
    .eq("id", paymentId)
    .single();
  if (selErr || !payment) {
    console.warn(
      `[stripe-webhook] payment ${paymentId} not found for failure: ${selErr?.message}`,
    );
    return;
  }

  // Idempotency: jeśli już completed, ignorujemy (np. async_failed po retry'u).
  if (payment.status === "completed") return;

  // Mark failed (zachowujemy 'failed' jeśli już był, aktualizujemy reason).
  await sb
    .from("payments")
    .update({
      status: "failed",
      failure_reason: String(reason).slice(0, 500),
    })
    .eq("id", paymentId)
    .neq("status", "completed");

  // Audit
  if (payment.case_id) {
    await sb.from("case_events").insert({
      case_id: payment.case_id,
      user_id: payment.user_id,
      actor: "payment",
      event_type: "payment_failed",
      metadata: {
        payment_id: paymentId,
        reason: String(reason).slice(0, 500),
      },
    });
  }

  // Email recovery — pobiera adres z auth.users (service-role).
  const { data: userResult } = await sb.auth.admin.getUserById(
    payment.user_id,
  );
  const recipient = userResult?.user?.email;
  if (!recipient) {
    console.warn(
      `[stripe-webhook] no email for user ${payment.user_id} — skip payment_failed email`,
    );
    return;
  }

  try {
    await dispatchNotification(
      {
        userId: payment.user_id,
        caseId: payment.case_id ?? null,
        channel: "email",
        template: "payment_failed",
        recipient,
        variables: {
          productName: payment.product_name,
          amountGrosze: payment.amount,
          caseId: payment.case_id ?? "",
          reason: String(reason),
          retryUrl: payment.case_id
            ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/panel/sprawa/${payment.case_id}`
            : `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/panel`,
        },
      },
      { dedupKey: `payment_failed:${paymentId}` },
    );
  } catch (e) {
    console.error(
      "[stripe-webhook] dispatchNotification(payment_failed) failed:",
      e instanceof Error ? e.message : e,
    );
  }

  // Avoid unused-import warning when isFakturowniaAvailable not referenced
  // in this code path.
  void isFakturowniaAvailable;
}
