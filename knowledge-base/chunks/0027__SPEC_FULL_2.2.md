# 2.2 — Zasady architektoniczne

_source: SPEC_FULL · tags: database, ai-engine, security · line 77 · 595 chars_

Separation of Concerns: każda warstwa (prezentacja, logika, dane, AI) jest izolowana i komunikuje się przez zdefiniowane interfejsy. Fail-safe AI: jeśli Claude nie odpowiada lub odpowiedź jest nieadekwatna, system wyświetla fallback (predefiniowany szablon + ostrzeżenie), nigdy nie generuje pustego lub błędnego pisma. Security-first: dane prawne są wrażliwe — szyfrowanie at-rest (AES-256), in-transit (TLS 1.3), RLS na poziomie bazy, RBAC na poziomie API. Mobile-first responsive: 70%+ użytkowników Długomatu będzie korzystać z telefonu — interfejs musi być perfekcyjny na ekranach 375–428px.
