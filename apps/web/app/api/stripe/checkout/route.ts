/**
 * Wave 7 / T003-101 — POST /api/stripe/checkout
 *
 * Tworzy Stripe Checkout Session dla zalogowanego użytkownika.
 * Używa istniejącego `lib/payments/stripe-client.createCheckoutSession`.
 *
 * Body schema:
 *   {
 *     paymentId: string (uuid),
 *     caseId: string (uuid),
 *     productName: string,
 *     amountGrosze: number,
 *     promoCode?: string,
 *     successUrl?: string,
 *     cancelUrl?: string,
 *   }
 *
 * Returns: { url: string, sessionId: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/payments/stripe-client";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  paymentId: z.string().uuid(),
  caseId: z.string().uuid(),
  productName: z.string().min(2).max(160),
  amountGrosze: z.number().int().min(100).max(100_000_00),
  promoCode: z.string().trim().max(40).optional(),
  promoCodeId: z.string().uuid().optional(),
  promoOriginalAmountGrosze: z.number().int().min(0).optional(),
  promoDiscountGrosze: z.number().int().min(0).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const origin = new URL(req.url).origin;
  const successUrl =
    data.successUrl ??
    `${origin}/panel/sprawa/${data.caseId}/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl =
    data.cancelUrl ??
    `${origin}/panel/sprawa/${data.caseId}/platnosc/anulowano`;

  try {
    const session = await createCheckoutSession({
      paymentId: data.paymentId,
      caseId: data.caseId,
      userId: user.id,
      productName: data.productName,
      amountGrosze: data.amountGrosze,
      customerEmail: user.email ?? `${user.id}@users.dlugomat.local`,
      promoCode: data.promoCode,
      promoCodeId: data.promoCodeId,
      promoOriginalAmountGrosze: data.promoOriginalAmountGrosze,
      promoDiscountGrosze: data.promoDiscountGrosze,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(
      { url: session.url, sessionId: session.id },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe_error";
    return NextResponse.json(
      { error: "checkout_failed", details: message },
      { status: 502 },
    );
  }
}
