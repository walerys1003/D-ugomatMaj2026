# Iteracja 2 — pozostałe zadania audytu (status)

## ✅ Zaimplementowane w tej iteracji
- **#12** Usunięto `_legacy` (95 plików: 74 `app/_legacy`, 21 `components/_legacy`). 0 importerów potwierdzone. Robots disallow `/_legacy/` zachowany.
- **#21** Codemod aliasów Supabase: `createServerSupabase` → `createSupabaseServerClient` (90 plików), usunięto aliasy z `lib/db/supabase-server.ts`, usunięto shim `lib/supabase/server.ts` (0 importerów). Dodano lint-rule `no-restricted-imports` blokujący `createSupabaseAdminClient` poza cron/webhook/admin.
- **#17** Prawdziwy per-token streaming: dodano `runGenerationPipelineStreaming()` (faza generatora przez `completeStreaming`, walidacja+eskalacja po streamie, fallback do non-streaming zachowany). Route `/api/ai/generate` używa go z `onDelta`.
- **#6 (częściowo)** Dodano kanoniczne typy `subscriptions` + `refunds` do `Database` (źródło: migracje). Usunięto 13 z 15 `as any` w płatnościach (10 w subscription-lifecycle, 3 w webhook). Naprawiono **realny latentny bug**: `platnosci/page.tsx` pytało o nieistniejące kolumny `plan_key`/`cycle`/`amount_grosze` (zamaskowane przez `as any`) → poprawiono na `plan_code`. Zmapowano status refundu Stripe→enum.

## ⏳ Pozostaje (wymaga dostępu do DB / decyzji produktowych)
- **#6 (reszta)** Pełna regeneracja typów: `npx supabase gen types typescript --project-id <id> > lib/db/types.ts`. Wymaga połączenia z Supabase (brak w sandboksie). 2 `as any` w `promo-codes.ts` pozostawione (tabele promo o zmiennym schemacie).
- **#9** Scheduler jobów (`scheduled_job_runs`, `warehouse_export_runs`): decyzja DROP vs implementacja. Rekomendacja: jeśli brak feature → DROP w migracji; jeśli planowane → centralny manager (Vercel Cron + queue table). Wymaga decyzji właściciela.
- **#15** Konsolidacja org vs tenant: wybrać jeden model (`org_memberships` vs `tenant_members`), zmigrować dane, usunąć drugi. Wymaga migracji danych + decyzji.
- **#16** Referral v1/v2: audyt danych, migracja do v2, DROP v1. Wymaga dostępu do danych produkcyjnych.
- **#22** 22 martwe tabele: per-tabela DROP/implement; priorytet weryfikacja `rag_chunks` (używana przez RPC!) i `user_preferences`. Wymaga dostępu do DB by sprawdzić realne użycie.
- **#20** Cleanup nieużywanych zmiennych: stopniowe włączanie `noUnusedLocals`. Niskie ryzyko, ale duży zakres — osobny PR.

> Zadania #9/#15/#16/#22 to operacje na schemacie/danych DB. Bezpieczne wykonanie wymaga połączenia z instancją Supabase (niedostępne w środowisku sandbox) oraz decyzji produktowych — dlatego dostarczone jako udokumentowane rekomendacje zamiast spekulacyjnych migracji, które mogłyby uszkodzić dane.

---

## Iteracja 3 — domknięcie zadań DB + cleanup

### ✅ Zaimplementowane
- **#15 (REALNY BUG)** `lib/rbac/index.ts` pytało o **nieistniejącą** tabelę `org_members` zamiast kanonicznej `org_memberships`. Efekt: `resolveOrgRole` zawsze zwracało `null` (błąd maskowany przez `if (error) return null`) → **org-scoped RBAC był po cichu wyłączony**. Naprawiono + dodano normalizację roli (DB `admin` → kod `org_admin`).
- **#22 (podzbiór)** Migracja `20260627010000_audit_drop_dead_tables_22_09.sql` — DROP CASCADE (idempotentnie) tabel z jednoznaczną rekomendacją „DROP" i potwierdzonym 0 odwołań: `lighthouse_scorecards`, `performance_snapshots`, `rum_samples`, `mobile_sessions`, `wizard_branch_log`.
- **#9** Ta sama migracja dropuje `scheduled_job_runs` + `warehouse_export_runs` (scheduler niezaimplementowany, 0 writerów/readerów).
- **#20** Usunięto **274 nieużywanych importów** w 67 plikach (skrypt + weryfikacja tsc). Lint warnings **664 → 376**.

### 🛡️ Weryfikacja bezpieczeństwa (ŚWIADOMIE NIE dropnięte)
- **`rag_chunks`** — POTWIERDZONE użycie przez RPC `rag_bm25_search`/`rag_vector_search` (`hybrid-retriever.ts`). DROP zepsułby RAG. Audyt słusznie oznaczył „weryfikacja KRYTYCZNA".
- **`user_preferences`, `metric_snapshots`** — na listach RODO (`data-export.ts`, `right-to-erasure.ts`).
- **`rate_limit_window`** — odczytywane w panelu admina.
- Tabele „weryfikacja"/„DROP lub implementacja" (accessibility_reports, ai_eval_runs, cee_*, circuit_breaker_log, invoice_*, krs_cache, locale_pricing, ocr_review_queue, rate_limit_log, sdk_clients, translations_overrides) — pozostawione do decyzji produktowej.

### ⏳ Nadal wymaga dostępu do żywej DB / decyzji
- **#16 referral v1/v2** — analiza wykazała, że **OBA systemy są żywe w kodzie**: `referral_codes` (v1, 5 użyć) i `referral_codes_v2`/`referral_credits_v2`/`referral_redemptions_v2` (v2) + osobny `affiliate_*`. Konsolidacja wymaga migracji danych + przepisania call-site'ów v1→v2 z walidacją na danych prod. Zbyt ryzykowne „na ślepo" — plan: (1) audyt danych, (2) backfill v1→v2, (3) codemod call-sitów, (4) DROP v1. Osobny PR z dostępem do DB.
- **#6 reszta** — `npm run gen:types` (wymaga połączenia z Supabase).
