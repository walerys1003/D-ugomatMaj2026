# 5.B.13 — Ustawienia systemowe Długomat

_source: SPEC_FULL · tags: database, ai-engine, ocr, payments, notifications, strategy · line 628 · 1556 chars_

Strona /admin/dlugomat/settings zawiera konfigurację specyficzną dla modułu:
Cennik – edycja cen per typ pisma (inline w tabeli lub bulk upload CSV). Historia zmian cen z datami i autorami. Możliwość ustawienia „promocja czasowa" (cena przecreślona + nowa, data ważności).
Feature flags – przełączniki (toggle) kontrolujące dostępność funkcji: dlugomat_chat_enabled, dlugomat_ocr_enabled, dlugomat_epuap_enabled, dlugomat_calculators_free, dlugomat_scoring_free, dlugomat_new_case_types_enabled, dlugomat_b2b_enabled. Zmiany zapisywane w admin_logs.
Limity – konfiguracja limitów per pakiet: max spraw / miesiąc (basic: 3, standard: 10, premium: unlimited), max dokumentów per sprawa, max wiadomości chat / dzień, max upload rozmiar (MB), max OCR pages / miesiąc.
CRON schedule – konfiguracja harmonogramu zadań automatycznych: sprawdzanie terminów (domyślnie co godzinę), wysyłka digest tygodniowego (piątek 10:00), czyszczenie draftów starszych niż 30 dni (raz dziennie), re-embedding bazy wiedzy (raz w tygodniu).
Logi systemowe – przeglądarka logów z tabeli admin_logs filtrowana po module Długomat: timestamp, admin (email), akcja (created / updated / deleted / config_changed / refund / block_user), zasób (typ + ID), dane przed i po (JSON diff). Paginacja, wyszukiwarka.
Integracje – statusy połączeń z zewnętrznymi serwisami: Stripe (zielony / czerwony + ostatni webhook), Resend (status API), SMSAPI (saldo + status), Fakturownia (status API), OpenAI (klucz + saldo), Anthropic Claude (klucz + rate limits). Przycisk „Test połączenia" dla każdego.
