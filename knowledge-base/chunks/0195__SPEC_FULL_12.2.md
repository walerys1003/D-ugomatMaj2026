# 12.2 — Fakturowanie

_source: SPEC_FULL · tags: payments · line 2212 · 342 chars_

Integracja z Fakturownia (fakturownia.pl(http://fakturownia.pl/)) — polską platformą do faktur. API: po płatności Stripe → automatyczne wystawienie faktury VAT → PDF → wysyłka na e-mail użytkownika. Dane do faktury: z profilu użytkownika (NIP opcjonalnie, jeśli firma). Faktura pro-forma przed płatnością nie jest wystawiana (upraszcza flow).
