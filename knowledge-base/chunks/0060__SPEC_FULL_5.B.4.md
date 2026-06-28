# 5.B.4 — Zarządzanie użytkownikami Długomat

_source: SPEC_FULL · tags: frontend, database, ai-engine, payments, strategy · line 554 · 1506 chars_

Strona /admin/dlugomat/users wyświetla listę użytkowników, którzy mają co najmniej jedną sprawę w module Długomat:
Tabela główna – kolumny: ID (skrócone UUID), e-mail, imię i nazwisko, data rejestracji, pakiet (badge: basic / standard / premium), liczba spraw Długomat, łączna wartość płatności Długomat (PLN), ostatnia aktywność (relative time), status konta (aktywny / zablokowany / usunięty). Sortowanie po każdej kolumnie, wyszukiwarka pełnotekstowa, filtry po pakiecie, statusie, dacie rejestracji, wartości płatności.
Widok szczegółowy użytkownika (/admin/dlugomat/users/[id]) – nagłówek z danymi użytkownika, badgem pakietu i przyciskami akcji (zablokuj, usuń, wyślij e-mail, zmień pakiet, nadaj promo kod). Zakładki:
Zakładka Sprawy – lista spraw Długomat z podglądem statusu, kategorii, kwoty, scoringu przedawnienia. Kliknięcie otwiera podgląd sprawy admina.
Zakładka Płatności – historia transakcji Stripe z kwotami, statusami, linkami do Stripe Dashboard. Przycisk „Zwrot" uruchamia partial/full refund via /api/admin/payments/refund.
Zakładka Dokumenty – lista wygenerowanych pism z wersjami, podglądem PDF, informacją o modelu AI i kosztach tokenów.
Zakładka Aktywność – timeline zdarzeń z event sourcing: logowania, formularze, płatności, pobrania, chaty AI.
Zakładka AI Chat – podgląd historii konwersacji z AI asystentem (read-only), z informacją o modelu, tokenach, źródłach RAG użytych w odpowiedziach.
Zakładka Kalkulatory – historia użycia kalkulatorów z danymi wejściowymi i wynikami.
