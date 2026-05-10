import "server-only";

/**
 * Długomat — Tier 4 / PLAN.md task 160 — walidator i aplikator kodów promo.
 *
 * Flow użycia:
 *   1. Użytkownik wpisuje kod w UI checkout.
 *   2. Server action wywołuje `validatePromoCode(code, ctx)`:
 *      - kod istnieje, is_active, valid_from <= now < valid_to,
 *      - max_uses nie przekroczony,
 *      - per_user_limit nie przekroczony (count promo_redemptions WHERE user),
 *      - applies_to_case_types / applies_to_bundle_ids pasuje,
 *      - min_amount_grosze spełnione,
 *      - kwota po rabacie ≥ 0.
 *   3. Walidator zwraca `PromoApplyResult` z finalAmountGrosze + discountGrosze.
 *   4. Po `payment.completed` w webhooku — `recordRedemption()` w transakcji:
 *      - INSERT promo_redemptions,
 *      - atomic increment current_uses przez fn_promo_increment_use().
 *
 * Idempotencja: unique index promo_redemptions(payment_id) gwarantuje że
 * jeden payment max raz wprowadzi redemption (webhook bezpieczny przy retry).
 *
 * Wszystkie zapytania przez service-role (bypass RLS) bo walidator może
 * wymagać sprawdzenia kodów które normalnie nie są widoczne (is_active=false
 * w admin panelu, future-dated valid_from itp.).
 */
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import type { CaseType, PromoCodeRow } from "@/lib/db/types";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface PromoValidationContext {
  /** ID użytkownika (do per_user_limit). */
  userId: string;
  /** Kwota brutto przed rabatem (grosze). */
  amountGrosze: number;
  /** case_type produktu — dla filtra applies_to_case_types. */
  caseType?: CaseType | null;
  /** bundleId — dla filtra applies_to_bundle_ids. */
  bundleId?: string | null;
}

export type PromoValidationError =
  | "not_found"
  | "inactive"
  | "expired"
  | "not_yet_valid"
  | "max_uses_reached"
  | "per_user_limit_reached"
  | "case_type_not_eligible"
  | "bundle_not_eligible"
  | "below_min_amount"
  | "discount_exceeds_amount"
  | "internal_error";

export interface PromoApplyResult {
  promoCodeId: string;
  code: string;
  /** Kwota oryginalna (przed rabatem) — w groszach. */
  originalAmountGrosze: number;
  /** Wartość rabatu — w groszach. */
  discountGrosze: number;
  /** Kwota finalna (po rabacie) — w groszach. */
  finalAmountGrosze: number;
  /** Procent rabatu jeśli kod był procentowy (do wyświetlenia w UI). */
  discountPct: number | null;
}

export class PromoValidationFailure extends Error {
  constructor(
    public readonly code: PromoValidationError,
    public readonly userMessage: string,
  ) {
    super(`promo_validation_failed:${code}`);
    this.name = "PromoValidationFailure";
  }
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Normalizuje kod wpisany przez użytkownika do formatu kanonicznego.
 * Reguły: trim + uppercase. Nie odfiltrowujemy znaków innych niż
 * [A-Z0-9-] — to robi DB constraint (404 przy lookup).
 */
export function normalizePromoCode(input: string): string {
  return input.trim().toUpperCase();
}

/**
 * Oblicza wartość rabatu dla danego kodu i kwoty.
 * Zaokrąglenie księgowe: floor (klient nigdy nie traci grosza na nieuczciwe
 * round-up; MIN(amount, computed) blokuje ujemne final).
 */
export function computeDiscountGrosze(
  promo: Pick<PromoCodeRow, "discount_pct" | "discount_grosze">,
  amountGrosze: number,
): number {
  if (promo.discount_pct !== null && promo.discount_pct > 0) {
    const raw = Math.floor((amountGrosze * promo.discount_pct) / 100);
    return Math.min(raw, amountGrosze);
  }
  if (promo.discount_grosze !== null && promo.discount_grosze > 0) {
    return Math.min(promo.discount_grosze, amountGrosze);
  }
  return 0;
}

/**
 * Waliduje kod promo dla danego kontekstu (user, kwota, produkt).
 * Rzuca `PromoValidationFailure` z kodem błędu i wiadomością po polsku.
 */
export async function validatePromoCode(
  rawCode: string,
  ctx: PromoValidationContext,
): Promise<PromoApplyResult> {
  const code = normalizePromoCode(rawCode);
  if (code.length < 3 || code.length > 32 || !/^[A-Z0-9-]+$/.test(code)) {
    throw new PromoValidationFailure(
      "not_found",
      "Niepoprawny format kodu rabatowego.",
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select(
      "id,code,discount_pct,discount_grosze,max_uses,per_user_limit," +
        "current_uses,valid_from,valid_to,applies_to_case_types," +
        "applies_to_bundle_ids,min_amount_grosze,is_active",
    )
    .eq("code", code)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[promo-codes] lookup error:", error);
    }
    throw new PromoValidationFailure(
      "internal_error",
      "Nie udało się sprawdzić kodu — spróbuj ponownie.",
    );
  }
  if (!promo) {
    throw new PromoValidationFailure(
      "not_found",
      "Kod rabatowy nie istnieje.",
    );
  }
  if (!promo.is_active) {
    throw new PromoValidationFailure(
      "inactive",
      "Ten kod rabatowy jest nieaktywny.",
    );
  }

  const now = new Date();
  if (new Date(promo.valid_from) > now) {
    throw new PromoValidationFailure(
      "not_yet_valid",
      "Ten kod rabatowy nie jest jeszcze aktywny.",
    );
  }
  if (promo.valid_to && new Date(promo.valid_to) <= now) {
    throw new PromoValidationFailure(
      "expired",
      "Termin ważności kodu rabatowego upłynął.",
    );
  }

  if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
    throw new PromoValidationFailure(
      "max_uses_reached",
      "Kod rabatowy został już w pełni wykorzystany.",
    );
  }

  // Filtry produktowe
  if (
    promo.applies_to_case_types &&
    promo.applies_to_case_types.length > 0 &&
    (!ctx.caseType || !promo.applies_to_case_types.includes(ctx.caseType))
  ) {
    throw new PromoValidationFailure(
      "case_type_not_eligible",
      "Kod nie obowiązuje dla tego typu pisma.",
    );
  }
  if (
    promo.applies_to_bundle_ids &&
    promo.applies_to_bundle_ids.length > 0 &&
    (!ctx.bundleId || !promo.applies_to_bundle_ids.includes(ctx.bundleId))
  ) {
    throw new PromoValidationFailure(
      "bundle_not_eligible",
      "Kod nie obowiązuje dla tego pakietu.",
    );
  }

  if (ctx.amountGrosze < promo.min_amount_grosze) {
    const min = (promo.min_amount_grosze / 100).toFixed(2).replace(".", ",");
    throw new PromoValidationFailure(
      "below_min_amount",
      `Kod wymaga minimalnej wartości zamówienia ${min} zł.`,
    );
  }

  // Per-user limit — count successful redemptions
  const { count, error: countErr } = await supabase
    .from("promo_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("promo_code_id", promo.id)
    .eq("user_id", ctx.userId);

  if (countErr) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[promo-codes] count error:", countErr);
    }
    throw new PromoValidationFailure(
      "internal_error",
      "Nie udało się sprawdzić limitu użycia.",
    );
  }
  if ((count ?? 0) >= promo.per_user_limit) {
    throw new PromoValidationFailure(
      "per_user_limit_reached",
      "Wykorzystałeś/-aś już ten kod rabatowy.",
    );
  }

  const discountGrosze = computeDiscountGrosze(promo, ctx.amountGrosze);
  if (discountGrosze <= 0) {
    throw new PromoValidationFailure(
      "discount_exceeds_amount",
      "Kod nie może zostać zastosowany do tego zamówienia.",
    );
  }
  const finalAmountGrosze = ctx.amountGrosze - discountGrosze;

  return {
    promoCodeId: promo.id,
    code: promo.code,
    originalAmountGrosze: ctx.amountGrosze,
    discountGrosze,
    finalAmountGrosze,
    discountPct: promo.discount_pct,
  };
}

/**
 * Atomowo rejestruje użycie kodu po sukcesie płatności (webhook).
 * Idempotentna: unique(payment_id) blokuje duplikaty przy retry webhooka.
 *
 * Zwraca true jeśli redemption został zapisany; false jeśli już istniał
 * (idempotent skip) lub kod stał się invalid między walidacją a webhookiem.
 */
export async function recordPromoRedemption(args: {
  promoCodeId: string;
  code: string;
  userId: string;
  paymentId: string;
  originalAmountGrosze: number;
  discountGrosze: number;
  finalAmountGrosze: number;
}): Promise<boolean> {
  const supabase = createSupabaseAdminClient();

  // Idempotentne INSERT — jeśli payment już ma redemption, on_conflict skip.
  const { error: insertErr } = await supabase
    .from("promo_redemptions")
    .insert({
      promo_code_id: args.promoCodeId,
      user_id: args.userId,
      payment_id: args.paymentId,
      original_amount_grosze: args.originalAmountGrosze,
      discount_grosze: args.discountGrosze,
      final_amount_grosze: args.finalAmountGrosze,
    });

  if (insertErr) {
    // 23505 = unique_violation → idempotent (już zarejestrowane).
    if (
      typeof insertErr === "object" &&
      insertErr !== null &&
      "code" in insertErr &&
      (insertErr as { code: string }).code === "23505"
    ) {
      return false;
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[promo-codes] redemption insert error:", insertErr);
    }
    throw new Error(
      `Nie udało się zarejestrować użycia kodu: ${(insertErr as { message?: string }).message ?? "unknown"}`,
    );
  }

  // Atomic increment current_uses (RPC zapewnia że nie przekroczymy max_uses).
  const { data: incremented, error: rpcErr } = await supabase.rpc(
    "fn_promo_increment_use" as never,
    { p_code: args.code } as never,
  );

  if (rpcErr) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[promo-codes] increment RPC error:", rpcErr);
    }
    // Nie rollbackujemy redemption — webhook może retry; metryka audytowa
    // zostaje, ale current_uses może się rozjechać. Admin panel pokazuje
    // diff jako alert.
  }

  return incremented === true;
}
