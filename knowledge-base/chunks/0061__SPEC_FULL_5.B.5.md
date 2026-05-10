# 5.B.5 — Zarządzanie sprawami Długomat

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr, payments, notifications, strategy · line 564 · 1850 chars_

Strona /admin/dlugomat/cases wyświetla wszystkie sprawy modułu:
Tabela spraw – kolumny: ID sprawy (link), użytkownik (email, link do profilu), kategoria (badge kolorowy), typ pisma, status (badge: draft, form_in_progress, ai_generating, ai_validating, pending_payment, paid, document_ready, sent_epuap, completed, expired, cancelled), kwota roszczenia (PLN), scoring przedawnienia (badge: przedawnione / nieprzedawnione / graniczne), data utworzenia, data ostatniej modyfikacji. Filtry wielokrotne po: statusie, kategorii, typie pisma, scoringu, zakresie kwot, zakresie dat. Sortowanie po każdej kolumnie. Eksport CSV/XLSX.
Widok szczegółowy sprawy (/admin/dlugomat/cases/[id]) – pełne dane sprawy widoczne w trybie read-only z możliwością ręcznej zmiany statusu (dropdown z potwierdzeniem). Sekcje:
Sekcja Formularz – renderowany JSON formularza z danymi wejściowymi użytkownika, z podświetleniem pól branching.
Sekcja Dokument AI – wygenerowany markdown, informacje o modelu, wersji promptu, tokenach, koszcie, źródłach RAG. Przycisk „Regeneruj" (uruchamia ponowne generowanie z logowaniem w admin_logs).
Sekcja Walidacja – wynik walidacji Haiku: completeness_score, legal_accuracy_score, recommendation_score, uwagi, czerwone flagi. Przycisk „Wymuś ponowną walidację".
Sekcja Scoring przedawnienia – pełny wynik algorytmu z datami, podstawą prawną, przerwaniami biegu, statusem.
Sekcja OCR – jeśli użytkownik uploadował dokumenty: podgląd oryginalnych skanów, wyekstrahowany tekst, confidence score, status.
Sekcja Płatność – dane transakcji Stripe, status, kwota, promo kod, link do Stripe Dashboard.
Sekcja Terminy – lista terminów procesowych z datami, statusami powiadomień, logami wysyłki.
Sekcja Rekomendacje AI – wygenerowane sugestie następnych kroków z priorytetami.
Sekcja Historia zdarzeń – pełna timeline event sourcing dla tej sprawy.
