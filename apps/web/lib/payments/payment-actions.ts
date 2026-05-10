"use server";

/**
 * Długomat — server actions dla płatności (Tier 4).
 *
 * Tier 5 zad. 203 — każda mutacja chroniona CSRF.
 *
 * Flow:
 *   1. createCheckoutForCaseAction(caseId, customerType, billing?)
 *      - Wstawia rekord `payments` (status='pending')
 *      - Tworzy Stripe Checkout Session (mode=payment)
 *      - Zwraca { checkoutUrl }
 *   2. (webhook) checkout.session.completed
 *      - Aktualizuje payments.status='completed', paid_at=now()
 *      - Tworzy fakturę w Fakturownia (jeżeli skonfigurowana)
 *      - Wysyła fakturę na email
 *      - Aktualizuje case.status='paid'
 *      - Loguje case_event
 *
 * Fallback: gdy Stripe niedostępny → action rzuca błąd, UI pokazuje
 * komunikat „Płatności są tymczasowo niedostępne — spróbuj za chwilę".
 */
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getCaseById, logCaseEvent } from "@/lib/cases/case-repository";
import {
  revalidateCase,
  revalidatePayments,
} from "@/lib/cache/revalidation";
import {
  createCheckoutSession,
  isStripeAvailable,
  StripeUnavailableError,
} from "./stripe-client";
import { computeBreakdown, productForCaseType, getBundle } from "./pricing";
import {
  validatePromoCode,
  PromoValidationFailure,
  type PromoApplyResult,
} from "./promo-codes";
import type { CheckoutResult, CustomerType } from "./types";
import { assertCsrfFromFormData } from "@/lib/security/csrf";

export interface CreateCheckoutInput {
  caseId: string;
  documentId?: string;
  customerType: CustomerType;
  /** Wymagane dla B2B. */
  invoiceCompanyName?: string;
  invoiceNip?: string;
  invoiceAddress?: string;
  /** Opcjonalny bundle (np. komornik_pakiet) — nadpisuje cenę z case_type. */
  bundleId?: string;
  /** Opcjonalny kod promo (Tier 4 / PLAN.md zad. 160). */
  promoCode?: string;
  /** Tier 5 zad. 203 — CSRF token z cookie (`document.cookie['dlugomat-csrf']`). */
  csrf: string;
}

export async function createCheckoutForCaseAction(
  input: CreateCheckoutInput,
): Promise<CheckoutResult> {
  // Tier 5 zad. 203 — CSRF check przed wszystkim (przed Stripe, przed DB).
  await assertCsrfFromFormData({ csrf: input.csrf });

  if (!isStripeAvailable()) {
    throw new StripeUnavailableError(
      "STRIPE_SECRET_KEY nie jest ustawiony — płatności wyłączone",
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Sesja wygasła — zaloguj się ponownie.");
  }
  const user = userResult.user;
  const userEmail = user.email ?? "";
  if (!userEmail) {
    throw new Error("Brak adresu email w sesji — uzupełnij profil.");
  }

  const caseRow = await getCaseById(input.caseId);
  if (!caseRow) throw new Error("Sprawa nie została znaleziona.");
  if (caseRow.user_id !== user.id) {
    throw new Error("Brak uprawnień do tej sprawy.");
  }

  // Walidacja B2B
  if (input.customerType === "b2b") {
    if (!input.invoiceCompanyName || !input.invoiceNip) {
      throw new Error("Dla faktury B2B podaj nazwę firmy i NIP.");
    }
    if (!/^\d{10}$/.test(input.invoiceNip.replace(/[\s-]/g, ""))) {
      throw new Error("NIP składa się z 10 cyfr.");
    }
  }

  // Cena: bundle albo bazowa case_type
  const product = input.bundleId
    ? (() => {
        const b = getBundle(input.bundleId);
        if (!b) throw new Error(`Nieznany pakiet: ${input.bundleId}`);
        return {
          productType: b.bundleId,
          productName: b.productName,
          grossGrosze: b.grossGrosze,
          vatRate: b.vatRate,
        };
      })()
    : productForCaseType(caseRow.type);

  if (product.grossGrosze <= 0) {
    throw new Error("Ten dokument jest darmowy — nie wymaga płatności.");
  }

  // 0) Promo code (opcjonalny) — walidator zwraca finalAmountGrosze
  let promoApply: PromoApplyResult | null = null;
  if (input.promoCode && input.promoCode.trim().length > 0) {
    try {
      promoApply = await validatePromoCode(input.promoCode, {
        userId: user.id,
        amountGrosze: product.grossGrosze,
        caseType: caseRow.type,
        bundleId: input.bundleId ?? null,
      });
    } catch (err) {
      if (err instanceof PromoValidationFailure) {
        throw new Error(err.userMessage);
      }
      throw err;
    }
  }

  const finalAmountGrosze = promoApply
    ? promoApply.finalAmountGrosze
    : product.grossGrosze;
  const breakdown = computeBreakdown(finalAmountGrosze, product.vatRate);

  // 1) Insert payment row (status=pending)
  const { data: paymentRow, error: insErr } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      case_id: input.caseId,
      document_id: input.documentId ?? null,
      amount: finalAmountGrosze,
      currency: "pln",
      vat_rate: product.vatRate,
      vat_amount: breakdown.vatGrosze,
      product_type: product.productType,
      product_name: product.productName,
      customer_type: input.customerType,
      invoice_company_name: input.invoiceCompanyName ?? null,
      invoice_nip: input.invoiceNip ?? null,
      invoice_address: input.invoiceAddress ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (insErr || !paymentRow) {
    throw new Error(
      `Nie udało się utworzyć płatności: ${insErr?.message ?? "nieznany błąd"}`,
    );
  }
  const paymentId = paymentRow.id;

  // 2) Stripe Checkout Session — używamy finalAmountGrosze + metadata
  // z promoCodeId żeby webhook mógł zarejestrować redemption.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const productNameWithDiscount = promoApply
    ? `${product.productName} (kod ${promoApply.code} −${(promoApply.discountGrosze / 100).toFixed(2).replace(".", ",")} zł)`
    : product.productName;
  const session = await createCheckoutSession({
    successUrl: `${baseUrl}/panel/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/panel/platnosc/anulowane?case_id=${input.caseId}`,
    customerEmail: userEmail,
    amountGrosze: finalAmountGrosze,
    productName: productNameWithDiscount,
    paymentId,
    caseId: input.caseId,
    userId: user.id,
    promoCodeId: promoApply?.promoCodeId,
    promoCode: promoApply?.code,
    promoOriginalAmountGrosze: promoApply?.originalAmountGrosze,
    promoDiscountGrosze: promoApply?.discountGrosze,
  });

  // 3) Update payments z stripe_session_id
  await supabase
    .from("payments")
    .update({ stripe_session_id: session.id })
    .eq("id", paymentId);

  // 4) Audit
  await logCaseEvent(input.caseId, "payment_created", {
    payment_id: paymentId,
    stripe_session_id: session.id,
    amount: finalAmountGrosze,
    customer_type: input.customerType,
    promo_code: promoApply?.code ?? null,
    promo_discount_grosze: promoApply?.discountGrosze ?? 0,
  });

  // Tier 5.3 — tag-based invalidation (case + user payments list).
  revalidateCase(input.caseId, user.id);
  revalidatePayments(user.id);

  return {
    paymentId,
    stripeSessionId: session.id,
    checkoutUrl: session.url,
  };
}

/**
 * Akcja używana po powrocie z Stripe Checkout (success URL).
 * Nie polegamy na niej dla potwierdzenia płatności (to robi webhook),
 * tylko na re-validację UI.
 */
export async function refreshPaymentStatusAction(
  paymentId: string,
  csrfToken: string,
): Promise<{ status: string; caseId: string | null }> {
  // Tier 5 zad. 203 — CSRF check (read-mostly, ale revaliduje cache → trzymamy).
  await assertCsrfFromFormData({ csrf: csrfToken });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("status, case_id")
    .eq("id", paymentId)
    .single();
  if (error || !data) {
    throw new Error(`Nie udało się odczytać płatności: ${error?.message}`);
  }
  if (data.case_id) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      revalidateCase(data.case_id, userData.user.id);
      revalidatePayments(userData.user.id);
    } else {
      revalidatePath(`/panel/sprawa/${data.case_id}`);
    }
  }
  return { status: data.status, caseId: data.case_id };
}
