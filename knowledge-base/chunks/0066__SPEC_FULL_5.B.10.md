# 5.B.10 — Zarządzanie płatnościami

_source: SPEC_FULL · tags: frontend, database, payments · line 606 · 1496 chars_

Strona /admin/dlugomat/payments to centralny hub finansowy modułu:
Lista transakcji – tabela: ID, Stripe Payment Intent ID (link do Stripe Dashboard), użytkownik, sprawa, typ produktu (pismo / kalkulator / chat / pakiet / upsell), kwota brutto (PLN), kwota netto, VAT, status (succeeded / pending / failed / refunded / partially_refunded), promo kod (jeśli użyty), data. Filtry po statusie, typie, zakresie kwot, zakresie dat. Eksport CSV.
Szczegóły transakcji – pełne dane Stripe: metoda płatności, IP, country, risk score, timeline zdarzeń Stripe (payment_intent.created → charge.succeeded → …), powiązane logi webhook. Przyciski: pełny zwrot, częściowy zwrot (modal z kwotą), wyślij fakturę ponownie.
Kody promocyjne – CRUD: kod (tekst, auto-generowany lub ręczny), typ rabatu (procent / kwota stała), wartość, minimum zamówienia, data ważności (od–do), limit użyć (łączny i per-user), produkty objęte (select multi: typy pism lub „wszystkie"), status (aktywny / wygasły / wyłączony). Statystyki użycia: ile razy użyty, łączna wartość rabatów, konwersja z kodem vs bez.
Podsumowanie finansowe – karty: przychód brutto dziś / 7d / 30d / YTD, średnia transakcja, liczba transakcji, zwroty (% i PLN), MRR, ARR. Wykresy: przychód dzienny (bar), przychód per kategoria (donut), przychód per typ produktu (stacked bar), zwroty (linia).
Faktury – integracja z Fakturownia API. Lista wystawionych faktur z podglądem PDF. Przycisk „Wystaw ręcznie" (modal z danymi). Status synchronizacji z Fakturownia.
