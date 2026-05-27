/**
 * Tier 4 zad. 164 — Stripe webhook E2E (test-mode).
 *
 * Cel:
 *   1) Zweryfikować że signature verification działa (HMAC SHA-256).
 *   2) Zweryfikować że tolerancja czasowa odrzuca stare eventy (replay).
 *   3) Zweryfikować że pricing.computeBreakdown jest zgodny z Stripe
 *      amount_total (brutto = netto + VAT, w groszach).
 *   4) Zweryfikować VAT decision logic dla B2C/B2B (Tier 4 zad. 157).
 *
 * Nie testujemy tu samego POST /api/stripe/webhook end-to-end — to wymaga
 * Stripe CLI (`stripe trigger ...`) + Supabase test instance, co jest częścią
 * smoke-test.sh (Tier 5 zad. 249). Tutaj weryfikujemy primitive'y, na których
 * webhook handler się opiera.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";

import {
  constructWebhookEvent,
  StripeWebhookSignatureError,
} from "@/lib/payments/stripe-client";
import {
  computeBreakdown,
  decideVat,
  isValidNip,
  normalizeNip,
} from "@/lib/payments/pricing";

// ─── Helpers: faked Stripe signature header ───────────────────────────────

function signStripeEvent(rawBody: string, secret: string, ts?: number): string {
  const timestamp = ts ?? Math.floor(Date.now() / 1000);
  const hmac = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  return `t=${timestamp},v1=${hmac}`;
}

const SECRET = "whsec_test_dlugomat_stripe_e2e_zad164";

describe("Stripe webhook signature (Tier 4 zad. 164)", () => {
  // Ustawiamy env przed każdym testem — constructWebhookEvent czyta przez readWebhookSecret()
  const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;

  beforeAll(() => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  });

  afterAll(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
  });

  it("akceptuje poprawnie podpisany event", () => {
    const body = JSON.stringify({
      id: "evt_test_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_a1b2c3",
          payment_intent: "pi_test_xyz",
          payment_status: "paid",
          amount_total: 15900,
          metadata: { payment_id: "uuid-x", case_id: "uuid-y" },
        },
      },
    });
    const sig = signStripeEvent(body, SECRET);

    const event = constructWebhookEvent(body, sig);
    expect(event.id).toBe("evt_test_1");
    expect(event.type).toBe("checkout.session.completed");
    expect(event.data.object.payment_status).toBe("paid");
  });

  it("odrzuca event z błędnym HMAC (timing-safe)", () => {
    const body = JSON.stringify({ id: "evt_x", type: "noop", data: { object: {} } });
    const sig = signStripeEvent(body, "wrong_secret_for_testing");

    expect(() => constructWebhookEvent(body, sig)).toThrow(
      StripeWebhookSignatureError,
    );
  });

  it("odrzuca replay starszy niż 5 minut (tolerancja)", () => {
    const body = JSON.stringify({ id: "evt_old", type: "noop", data: { object: {} } });
    const oldTs = Math.floor(Date.now() / 1000) - 600; // 10 min ago
    const sig = signStripeEvent(body, SECRET, oldTs);

    expect(() => constructWebhookEvent(body, sig)).toThrow(
      /tolerancj/i,
    );
  });

  it("odrzuca event bez sekcji t=/v1=", () => {
    const body = JSON.stringify({ id: "evt_x", type: "noop", data: { object: {} } });
    expect(() => constructWebhookEvent(body, "malformed_signature")).toThrow(
      /brak t\/v1/i,
    );
  });
});

describe("computeBreakdown — VAT math (idempotent z Stripe amount_total)", () => {
  it("rozkłada 159.00 PLN brutto z VAT 23% poprawnie", () => {
    const br = computeBreakdown(15_900, 23);
    // 15900 / 1.23 ≈ 12926.83 → round = 12927
    expect(br.grossGrosze).toBe(15_900);
    expect(br.netGrosze).toBe(12_927);
    expect(br.vatGrosze).toBe(2_973);
    expect(br.vatRate).toBe(23);
    // Sanity: brutto = netto + VAT
    expect(br.netGrosze + br.vatGrosze).toBe(br.grossGrosze);
  });

  it("rozkłada cenę pakietu komornik (199.00 PLN brutto)", () => {
    const br = computeBreakdown(19_900, 23);
    expect(br.netGrosze + br.vatGrosze).toBe(19_900);
  });

  it("akceptuje stawkę 0% (reverse charge UE — Tier 6)", () => {
    const br = computeBreakdown(15_900, 0);
    expect(br.netGrosze).toBe(15_900);
    expect(br.vatGrosze).toBe(0);
  });
});

describe("NIP walidacja (Tier 4 zad. 157)", () => {
  it("akceptuje poprawne NIP-y z czcecksum mod 11", () => {
    // Generowane wg algorytmu: 525-21-52-828 = Microsoft Polska
    expect(isValidNip("5252152828")).toBe(true);
    expect(isValidNip("525-21-52-828")).toBe(true); // z myślnikami
  });

  it("odrzuca niepoprawne NIP-y (zła suma kontrolna)", () => {
    expect(isValidNip("1234567890")).toBe(false);
    expect(isValidNip("0000000000")).toBe(false);
  });

  it("odrzuca za krótkie / za długie", () => {
    expect(isValidNip("12345")).toBe(false);
    expect(isValidNip("12345678901")).toBe(false);
    expect(isValidNip("")).toBe(false);
  });

  it("normalizuje do formatu PL... dla Stripe metadata", () => {
    expect(normalizeNip("5252152828")).toBe("PL5252152828");
    expect(normalizeNip("525-21-52-828")).toBe("PL5252152828");
    expect(normalizeNip("invalid")).toBeNull();
  });
});

describe("decideVat — B2C/B2B logic (Tier 4 zad. 157)", () => {
  it("B2C — zawsze 23% bez taxId", () => {
    const d = decideVat({ customerType: "b2c" });
    expect(d.vatRate).toBe(23);
    expect(d.reverseCharge).toBe(false);
    expect(d.taxId).toBeNull();
  });

  it("B2B PL z ważnym NIP — 23% + taxId z prefiksem PL", () => {
    const d = decideVat({
      customerType: "b2b",
      nip: "5252152828",
      countryCode: "PL",
    });
    expect(d.vatRate).toBe(23);
    expect(d.taxId).toBe("PL5252152828");
    expect(d.reverseCharge).toBe(false);
  });

  it("B2B PL bez NIP — fallback na 23% i taxId=null", () => {
    const d = decideVat({ customerType: "b2b", countryCode: "PL" });
    expect(d.vatRate).toBe(23);
    expect(d.taxId).toBeNull();
    expect(d.reason).toMatch(/bez ważnego NIP/i);
  });

  it("B2B UE — flagowany jako poza-MVP scope (Tier 6 wdroży VIES)", () => {
    const d = decideVat({
      customerType: "b2b",
      nip: "DE123456789",
      countryCode: "DE",
    });
    // MVP: 23% z reason explaining
    expect(d.vatRate).toBe(23);
    expect(d.reason).toMatch(/VIES/);
  });
});
