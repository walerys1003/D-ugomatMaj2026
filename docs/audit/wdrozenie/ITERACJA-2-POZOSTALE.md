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

---

## Iteracja 4 — domknięcie #6 (payments) + scaffold #16

### ✅ Zaimplementowane
- **#6 (payments — KOMPLET)** Usunięto **ostatnie 2** rzutowania `const sb = supabase as any`
  w `lib/payments/promo-codes.ts` (`validatePromoCode` + `recordPromoRedemption`).
  Tabele `promo_codes`/`promo_redemptions` są już w typowanej `Database`.
  - **REALNY BUG (latentny):** `.select()` budowane przez **konkatenację stringów**
    degradowało się do `GenericStringError` w Supabase → typed-select tracił inferencję
    kolumn (TS2339). Zamieniono na pojedynczy **literał string** → statyczne parsowanie
    kolumn działa.
  - To domyka **wszystkie 15** rzutowań `as any` w warstwie płatności
    (subscription-lifecycle 10 + stripe webhook 4 + promo-codes 2 — iteracje 2+4).
- **#16 (scaffold NIEDESTRUKCYJNY)** Migracja `20260627020000_audit_referral_consolidation_plan.sql`
  tworzy widok diagnostyczny `referral_systems_overlap` (read-only,
  `referral_codes` v1 FULL OUTER JOIN `referral_codes_v2` v2) do oceny nakładania
  systemów **na żywych danych** przed cutover. Udokumentowany 4-krokowy plan cutover.
  **Brak merge/DROP danych** — semantyka v1 (reward_pct/revenue, afiliacja)
  ≠ v2 (uses/credit). Pełny cutover = osobny PR z dostępem do DB + decyzja właściciela.

### 📊 Stan walidacji (iteracja 4)
- `tsc --noEmit` → **EXIT 0**
- `next lint` → **EXIT 0** (376 warnings, 0 errors)

### ⏳ Nadal otwarte (poza zasięgiem sandboksa)
- **#6 reszta** — pełna regeneracja typów `npm run gen:types` (wymaga łączności z Supabase).
  Pozostałe ~358 `as any` (admin-actions/queries, affiliate, family-company, …) dotyczą
  tabel spoza lokalnej `Database` — wymagają albo gen:types, albo ręcznego typowania
  każdej tabeli z migracji.
- **#16 cutover**, **#15 org↔tenant merge danych** — wymagają DB + decyzji produktowej.

---

## Iteracja 5 — #6 deadlines + REALNY BUG kolizji schematu tabeli

### 🐛 Wykryty realny bug (krytyczny, latentny)
Podczas usuwania `as any` z `lib/deadlines/deadline-tracker.ts` odkryto, że
istnieją **DWIE** migracje `create table if not exists public.deadlines` o
**sprzecznych** schematach:
- `20260510130400` (Tier 2): `description`, `deadline_date`, `notif_d*_sent`,
  `is_completed`; `kind` = enum `deadline_kind` (`sprzeciw_14dni`…)
- `20260521000000` (Tier 18): `title`, `end_date`, `effective_end_date`,
  `legal_basis`, `snoozed_until`, `reminders_sent text[]`; `kind` = text CHECK
  (`sprzeciw_epu`…)

Przez `if not exists` **wygrywa Tier 2** (uruchamiana wcześniej), a Tier 18
jest po cichu pomijana. Tymczasem **cały kod** (`deadline-tracker.ts`,
`deadline-engine.ts`) używa schematu Tier 18 → na realnej bazie te zapytania
**padają w runtime** (brak kolumn / niedozwolona wartość enuma). `as any`
maskowało to całkowicie. Dodatkowo `case-repository.ts` + `panel/page.tsx`
+ `case-actions.ts` używały **starego** schematu wprost — czyli aplikacja była
wewnętrznie niespójna (część kodu Tier 2, część Tier 18).

### ✅ Naprawa
- **Nowa migracja** `20260627030000_audit_reconcile_deadlines_schema.sql` —
  idempotentne pogodzenie tabeli do schematu Tier 18 (`ALTER ... ADD COLUMN
  IF NOT EXISTS` + backfill: `description→title`, `deadline_date→end/effective_
  end_date`, `notif_d*_sent→reminders_sent[]`, `is_completed→completed_at`)
  + indeksy + RLS. Bezpieczna na świeżej i na starej bazie.
- `lib/db/types.ts` — `deadlines` Row/Insert przepisane na schemat Tier 18.
- `lib/deadlines/deadline-tracker.ts` — usunięto **6** `as any`.
- `lib/cases/case-repository.ts` — `listDeadlinesForCurrentUser`,
  `createDeadline`, `markDeadlineCompleted` dostosowane (completed_at /
  effective_end_date / title).
- `lib/cases/case-actions.ts` + `app/(panel)/panel/page.tsx` —
  `description→title`, `deadline_date→effective_end_date`.

### 📊 Walidacja
- `tsc --noEmit` → **EXIT 0** (0 błędów; zmiana typu ujawniła 5 ukrytych błędów
  w konsumentach starego schematu — wszystkie naprawione)
- `next lint` → **0 errors** (376 warnings)
- `as any`: **346 → 338**
