/**
 * Długomat — typy domeny płatności (Tier 4).
 *
 * Spójne typy dla:
 *  - Stripe Checkout (creation + webhook events),
 *  - Fakturownia (faktura + status),
 *  - Wewnętrznego rekordu `payments` (mapowane do `PaymentRow`).
 *
 * Konwencja kwot: integer w **groszach** (1/100 PLN). VAT 23% (próg PL).
 */
import type { PaymentRow } from "@/lib/db/types";

export type CustomerType = "b2c" | "b2b";

export interface PriceBreakdown {
  /** Kwota brutto w groszach (to user płaci). */
  grossGrosze: number;
  /** Stawka VAT w %, np. 23. */
  vatRate: number;
  /** Kwota VAT w groszach (zaokrąglona zgodnie z PL księgowymi). */
  vatGrosze: number;
  /** Kwota netto w groszach. */
  netGrosze: number;
}

export interface CheckoutInput {
  caseId: string;
  documentId?: string;
  productType: string; // case_type lub kod pakietu
  productName: string; // tytuł widoczny w Stripe Checkout
  grossGrosze: number;
  customerType: CustomerType;
  customerEmail: string;
  /** Wymagane gdy customerType = 'b2b'. */
  invoiceCompanyName?: string;
  invoiceNip?: string;
  invoiceAddress?: string;
}

export interface CheckoutResult {
  paymentId: string;
  stripeSessionId: string;
  /** URL Stripe Checkout (redirect target). */
  checkoutUrl: string;
}

/** Surowy event z webhooka Stripe (subset, którego używamy). */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

/** Mapping od case_type / pakiet → produkt płatności. */
export interface ProductDefinition {
  productType: string;
  productName: string;
  /** Cena bazowa B2C w groszach. */
  grossGrosze: number;
  vatRate: number;
}

export type PaymentRecord = PaymentRow;
