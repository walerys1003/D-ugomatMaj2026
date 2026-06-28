# 6.3.2 — Cases — sprawy (/api/cases/)

_source: SPEC_FULL · tags: database, ai-engine, ocr, payments, notifications, modules, strategy · line 893 · 1023 chars_

GET /api/cases — lista spraw użytkownika. Query params: status (draft, active, completed, archived), type (sprzeciw_epu, komornik_shield, bik_fix, cesja_check, ugodo_mat, upadlosc_lite, potracenia_stop), sort (created_at, deadline, updated_at), order (asc, desc), page, perPage. Zwraca paginowaną listę z deadline countdown.
POST /api/cases — tworzenie nowej sprawy. Body: { type, title?, metadata? }. Automatycznie ustawia status: 'draft', created_at, oblicza wstępny deadline (jeśli typ ma termin procesowy).
GET /api/cases/[id] — szczegóły sprawy z powiązanymi dokumentami, terminami i historią płatności. RLS: tylko właściciel.
PATCH /api/cases/[id] — aktualizacja sprawy (metadata, status, dane formularza). Walidacja Zod per typ sprawy.
DELETE /api/cases/[id] — soft delete (ustawia deleted_at). Dane przechowywane 30 dni, potem hard delete przez CRON.
GET /api/cases/[id]/timeline — historia zdarzeń sprawy (utworzenie, OCR, generowanie, płatność, pobranie, powiadomienia) — w formacie timeline do wyświetlenia w UI.
