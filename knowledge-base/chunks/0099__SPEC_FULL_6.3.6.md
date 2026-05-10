# 6.3.6 — Payments (/api/payments/)

_source: SPEC_FULL · tags: frontend, database, payments · line 937 · 748 chars_

POST /api/payments/create-session — tworzenie sesji Stripe Checkout. Body: { document_id, product_type, pricing_tier }. Stripe session z success_url (redirect na stronę pobrania) i cancel_url (redirect na podgląd). Metadata: { user_id, case_id, document_id, product_type }.
POST /api/payments/webhook — Stripe webhook. Obsługiwane eventy: checkout.session.completed (oznacz dokument jako paid, odblokuj PDF, wyślij e-mail z potwierdzeniem i fakturą), checkout.session.expired (oznacz jako payment_expired, wyślij reminder), charge.refunded (oznacz dokument jako refunded, zablokuj PDF). Webhook secret weryfikowany przez stripe.webhooks.constructEvent().
GET /api/payments/status/[id] — status płatności. Polling z frontendu po redirect z Checkout.
