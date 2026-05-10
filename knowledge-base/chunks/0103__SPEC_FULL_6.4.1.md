# 6.4.1 — Cykl życia sprawy (Case Lifecycle)

_source: SPEC_FULL · tags: backend, database, ocr, payments, strategy · line 948 · 1297 chars_

┌──────────┐
                 │  DRAFT   │ ← użytkownik tworzy sprawę
                 └────┬─────┘
                      │ (wypełnienie formularza + OCR)
                      ▼
                 ┌──────────┐
                 │ ANALYSIS │ ← AI analizuje dokumenty
                 └────┬─────┘
                      │ (generowanie pisma)
                      ▼
                 ┌──────────┐
                 │ GENERATED│ ← pismo wygenerowane, podgląd
                 └────┬─────┘
                      │ (płatność Stripe)
                      ▼
                 ┌──────────┐
                 │   PAID   │ ← PDF odblokowany
                 └────┬─────┘
                      │ (pobranie PDF)
                      ▼
                 ┌──────────┐
                 │DOWNLOADED│ ← użytkownik pobrał pismo
                 └────┬─────┘
                      │ (po terminie lub ręcznie)
                      ▼
                 ┌──────────┐
                 │ COMPLETED│ ← sprawa zamknięta
                 └────┬─────┘
                      │ (po 30 dniach)
                      ▼
                 ┌──────────┐
                 │ ARCHIVED │ ← dane zanonimizowane
                 └──────────┘

Każda zmiana statusu logowana w tabeli case_events z timestampem i aktorem (user, system, ai, payment).
