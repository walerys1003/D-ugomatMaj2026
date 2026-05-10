# 5.A.9 — Spójność z Mandatomatem

_source: SPEC_FULL · tags: frontend, backend, database, ocr, payments, notifications, modules, brand, strategy · line 490 · 1278 chars_

Moduł Długomat współdzieli z Mandatomatem następujące elementy:
Komponenty UI – DynamicForm, DocumentPreview, ScoringGauge, DeadlineWidget, TimelineActivity, RecommendationCard, StyleSelector, PaymentFlow (Stripe Checkout), OCRUploader – wszystkie importowane z components/shared/.
Backend – wspólne API routes (/api/ai/generate-document, /api/ai/scoring, /api/ai/chat, /api/billing/*, /api/deadlines/*), wspólna tabela cases (rozróżnienie po category enum), wspólne documents, payments, events.
Baza danych – ta sama instancja Supabase; Długomat dodaje wartości do istniejących enumów (case_category: 'windykacja', 'egzekucja', 'dlug_bankowy', 'dlug_publiczny', 'restrukturyzacja') i nowe typy do case_type enum.
Design system – ta sama paleta kolorowa, typografia, zaokrąglenia, cienie. Długomat otrzymuje własne kolory kategorii: windykacja #E11D48 (rose-600), egzekucja #DC2626 (red-600), restrukturyzacja #059669 (emerald-600), długi bankowe #7C3AED (violet-600), długi publicznoprawne #D97706 (amber-600).
Nawigacja – użytkownik przełącza się między produktami (Mandatomat / Długomat / Rozwodomat) za pomocą przełącznika w topbarze lub sidebarze (komponent ProductSwitcher). Każdy produkt ma własny zestaw pozycji w sidebarze, ale layout, topbar i footer są współdzielone.
