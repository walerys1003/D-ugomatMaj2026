# 12.1 — Stripe Integration

_source: SPEC_FULL · tags: frontend, backend, payments, notifications · line 2207 · 1043 chars_

Stripe Checkout (hosted page) — wybrany zamiast Stripe Elements (embedded) ze względu na: szybszą implementację, compliance PCI DSS bez dodatkowej pracy, obsługę BLIK, Przelewy24, karty, Apple Pay, Google Pay out-of-the-box (po aktywacji w dashboard Stripe), oraz responsywny UI bez budowania własnego.
Stripe Products & Prices: każdy moduł/tier to osobny Stripe Product z Price. Np.: prod_sprzeciw_epu → price_sprzeciw_basic (15900 groszy), price_sprzeciw_premium (19900 groszy). Waluta: PLN. Mode: payment (jednorazowy, nie subscription — z wyjątkiem D10).
Stripe Webhook handling: endpoint /api/payments/webhook, weryfikacja podpisu (stripe-signature header), obsługa eventów checkout.session.completed (oznacz document jako paid, wyślij email, generuj fakturę), checkout.session.expired (oznacz jako expired, wyślij reminder), charge.refunded (oznacz jako refunded, zablokuj PDF).
Metadata w sesji Stripe: user_id, case_id, document_id, product_type, pricing_tier, utm_source, utm_medium, utm_campaign. Umożliwia pełne śledzenie konwersji.
