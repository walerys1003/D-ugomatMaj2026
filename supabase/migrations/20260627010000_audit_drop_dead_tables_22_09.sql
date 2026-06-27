-- =============================================================================
-- Długomat — Audyt 2026-06-27 — DROP martwych tabel (#22) + martwej infry jobów (#9)
-- =============================================================================
-- Usuwamy WYŁĄCZNIE tabele z jednoznaczną rekomendacją "DROP" w audycie §5.3
-- ORAZ potwierdzonym 0 odwołań w kodzie (`.from()`, nazwa, RPC, funkcje DB).
--
-- ŚWIADOMIE POMINIĘTE (NIE wolno dropować — zweryfikowane jako żywe):
--   - rag_chunks            → używane przez RPC rag_bm25_search / rag_vector_search
--                             (lib/ai/rag/hybrid/hybrid-retriever.ts) — RAG by się zepsuł
--   - user_preferences      → na liście RODO (data-export.ts / right-to-erasure.ts)
--   - metric_snapshots      → na liście RODO (right-to-erasure.ts)
--   - rate_limit_window     → odczytywane w panelu admina (admin/rate-limits/page.tsx)
--
-- POMINIĘTE jako niejednoznaczne ("weryfikacja" / "DROP lub implementacja" w audycie)
-- — wymagają decyzji produktowej i dostępu do danych prod (osobny PR):
--   accessibility_reports, ai_eval_runs, cee_cases, cee_documents,
--   circuit_breaker_log, invoice_lines, invoice_sequence, krs_cache,
--   locale_pricing, ocr_review_queue, rate_limit_log, sdk_clients,
--   translations_overrides
--
-- CASCADE usuwa powiązane polityki RLS, indeksy i triggery. IF EXISTS czyni
-- migrację idempotentną (bezpieczne ponowne uruchomienie).
-- =============================================================================

-- #22 — tabele z jednoznaczną rekomendacją "DROP" (telemetria/UX, 0 ref.) -------
drop table if exists public.lighthouse_scorecards cascade;   -- Lighthouse CI raportuje poza DB
drop table if exists public.performance_snapshots cascade;   -- duplikat metric_snapshots (telemetria)
drop table if exists public.rum_samples cascade;             -- RUM idzie do web_vitals
drop table if exists public.mobile_sessions cascade;         -- używamy mobile_devices, nie sessions
drop table if exists public.wizard_branch_log cascade;       -- wizard nie loguje branchy

-- #9 — martwa infrastruktura jobów (scheduler niezaimplementowany, 0 ref.) ------
-- Audyt: "DROP jeśli zbędne". Brak centralnego managera jobów; te tabele nie
-- mają ani writerów, ani readerów w kodzie. Gdy scheduler powstanie, schemat
-- należy odtworzyć razem z implementacją (a nie trzymać pusty "na zapas").
drop table if exists public.scheduled_job_runs cascade;
drop table if exists public.warehouse_export_runs cascade;
