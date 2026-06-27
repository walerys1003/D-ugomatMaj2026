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

---

## Iteracja 6 — #6 billing/subscriptions + REALNY BUG kolizji schematu subscriptions

### 🐛 Wykryty realny bug (krytyczny, latentny) — analogiczny do deadlines
Istnieją **DWIE** migracje `create table if not exists public.subscriptions`
o **sprzecznych** schematach:
- `20260513100000` (Tier 8): `plan_id` (`free/starter/pro/family/company`),
  `cycle` (`monthly/annual`), `tenant_id` + `subscription_usage` + RPC
  `fn_increment_subscription_usage`
- `20260522000000` (Tier 19): `plan_code` (`free/lite/pro/business/enterprise`),
  `org_id`, `paused_at/until`, `past_due_retries`, `pending_plan_change`,
  `pending_effective_at`, `metadata`

`if not exists` → wygrywa Tier 8. Ale **kod jest podzielony**:
- `lib/billing/*` → Tier 8 (`plan_id/cycle`)
- `lib/payments/subscription/*` + `panel/.../platnosci` → Tier 19 (`plan_code/org_id`)

Połowa zapytań padałaby na żywej bazie. `as any` maskowało rozbieżność.
(W iter. 2 wpisałem do typu tylko wariant Tier 19 — przez co strona Tier 8
była nietypowana i wymagała `as any`.)

### ✅ Naprawa (SUPERSET, niedestrukcyjny)
- **Nowa migracja** `20260627040000_audit_reconcile_subscriptions_schema.sql` —
  idempotentny superset tabeli (`ADD COLUMN IF NOT EXISTS` dla kolumn OBU
  schematów) + best-effort mapping `plan_id↔plan_code` + indeksy + RLS.
  Obie ścieżki kodu działają bez utraty danych.
- `lib/db/types.ts` — `subscriptions` Row/Insert jako **superset**; dodano typ
  `subscription_usage`; dotypowano RPC `fn_increment_subscription_usage`
  (+ indeks `[fn: string]` dla pozostałych 19 RPC → kompatybilność).
- `lib/billing/subscriptions.ts` — usunięto **4** `sb=supabase as any` + **2**
  `(data as any)` (pozostawiono 3 legalne `(Stripe as any)` z dynamic-import).

### 📊 Walidacja
- `tsc --noEmit` → **EXIT 0** (typowanie ujawniło i naprawiono 2 błędy: RPC
  args + kolizja typu RPC dla `match_legal_knowledge`)
- `next lint` → **0 errors** (374 warnings)
- `as any`: **338 → 332**

### ⏳ Pozostaje (decyzja produktowa)
Konsolidacja modelu planów (jeden zestaw: `plan_id` LUB `plan_code` z jasnym
mapowaniem `starter↔lite`, `family/company↔business`) — osobny PR, bo wymaga
ustalenia kanonicznej taksonomii planów i przepisania jednej z dwóch gałęzi kodu.

## Iteracja 7 (równolegle, #6 as-any) — ZAKOŃCZONA

Rodziny przerobione równolegle (per grupa tabel DB):

- **A. affiliate_*** — wpisano 5 typów tabel + 2 RPC; usunięto 10 castów. (commit a82e471)
- **B. coupons** — wpisano 2 typy tabel; usunięto 4 casty. (commit a82e471)
- **C. bulk-ops** — REALNY BUG: 5 brakujących kolumn (cases.archived_at/purge_at/tags,
  documents.tags, deadlines.assignee_id) + bug case_type→type w kodzie.
  Migracja 20260627050000 (additive), typy, usunięto 12 castów. (commit 676dae0)
- **D. admin-queries** — usunięto 11 castów sb; ujawniło 4 REALNE BUGI nieistniejących kolumn:
  payments.completed_at→paid_at (×2), legal_knowledge.case_type→category
  (getKnowledgeStats zwracało zera), promo_codes.uses_count→current_uses,
  promo_redemptions.code→promo_code_id (mapa codeById). (commit 7811bbc)

Stan: tsc 0 błędów, lint 0 błędów (tylko ostrzeżenia).
Postęp `as any`: 366 → ~295.

Potwierdzony wzorzec: usuwanie castów rodzina-po-rodzinie ujawnia realne latentne bugi,
które `as any` maskował (zapytania do nieistniejących kolumn, kolizje schematów migracji).

### Pozostałe rodziny (do dalszych iteracji)
workflow-engine (~8), job-queue (~7), ediscovery (~6), drip-campaigns (~5) i in. (~295 łącznie).
Pełna regeneracja typów (`npm run gen:types`) wymaga połączenia z Supabase (poza sandboxem).

## Iteracje 8–10 (równolegle, #6 as-any) — ZAKOŃCZONE

Dotypowano w lib/db/types.ts kolejne tabele (źródła z migracji):
  - Tier 8: referral_codes_v2, referral_redemptions_v2, referral_credits_v2,
            email_campaign_enrollments, email_send_log
  - Tier 7: generation_jobs
  - Tier 22: automation_workflows, automation_runs
  - Tier 20: job_queue
  - Tier 23: legal_holds, ediscovery_queries, audit_chain, secret_vault

Rodziny przerobione:
  - referrals/program-v2 (−8), queue/generation-queue (−8),
    automation/workflow-engine (−7) — commit 4f97bc6
  - jobs/job-queue (−7) — commit b35725c
  - compliance/ediscovery (−6), email/drip-campaigns (−5),
    security/audit-signing/audit-chain (−5) — commit 37fecfd
  - security/secret-vault/vault (−6) — commit c0c3bdd

REALNE BUGI ujawnione (maskowane przez as any):
  1. workflow-engine create_deadline: insert nieistniejących kolumn
     rule_id/due_at/note (schemat Tier 2) -> Tier 18 kind/title/...; akcja
     crashowała w runtime.
  2. ediscovery CASES: select nieistniejących signature/description ->
     sygnatura/title; sprawy NIGDY nie trafiały do wyników e-discovery.
  3. ediscovery DOCUMENTS: select nieistniejących name/mime_type ->
     type/status; dokumenty NIGDY nie trafiały do wyników e-discovery.
  4. secret-vault: .eq('organization_id', null) nie matchuje NULL w PostgREST;
     sekrety osobiste NIGDY nie były znajdowane -> .is(...). Dotyczy 4 funkcji.

Stan: tsc 0 błędów, lint 0 błędów. Postęp as any: 310 -> 262.

## Iteracje 11–17 (kolejna tura „kontynuuj paralelnie")

Dotypowane tabele (lib/db/types.ts):
  - Tier 17: consent_ledger, erasure_requests, mfa_secrets
  - Tier 14: metric_snapshots
  - Tier 23: compliance_evidence, impersonation_sessions
  - Tier 6: idempotency_records
  - Tier 20: crdt_updates, crdt_awareness
  - Tier 7: marketplace_templates, marketplace_template_ratings, tenants,
    tenant_members, tenant_invitations
  - Tier 10: admin_audit_log
  - Tier 21: presence_state
  - Tier 9: mobile_devices

Rodziny przerobione:
  - compliance/reports/compliance-reports (−5) — commit 2b16613
  - api/documents/[id]/revise + observability/idempotency (−10) — commit c0ca871
  - realtime/crdt/y-doc-store (−7) — commit 3a49b17
  - marketplace/templates (−5) — commit 91e4728
  - tenants/family-company (−5) — commit 94711f7
  - security/impersonation/impersonation (−5) — commit 23291a8
  - realtime/presence/presence-tracker (−5) — commit 1190190
  - mobile/device-registration (−5) — commit 2a333d3

REALNE BUGI ujawnione (maskowane przez as any):
  5. compliance-reports generateDpia: select nieistniejących kolumn
     consent_ledger.revoked_at/granted_at -> granted/recorded_at; erasure_requests
     deadline_at/completed_at -> scheduled_for/executed_at; podsumowania DPIA
     zawsze puste.
  6. compliance-reports generateSoc2Evidence: tabela slo_metrics NIE ISTNIEJE
     w migracjach (zweryfikowane) -> metric_snapshots; sekcja availability
     zawsze pusta.
  7. compliance-reports listComplianceReports: .eq('organization_id', null)
     nie matchuje NULL -> .is(...).
  8. api/documents/[id]/revise: embedded join select nieistniejących
     cases.case_type/cases.facts -> type/metadata; endpoint revise ZAWSZE
     zwracał 404.
  9. revise idempotency: (lookup as any).reservation_id nie istnieje w
     IdempotencyLookup -> zawsze null => completeIdempotency/abortIdempotency
     NIGDY się nie wykonywały (rekordy in_progress wisiały do TTL).
  10. y-doc-store AwarenessState: interfejs camelCase docId/userId/clientId vs
      kolumny snake_case crdt_awareness -> odczyty zawsze undefined.
  11. tenants inviteToTenant: role: TenantRole (z 'owner') vs CHECK constraint
      tenant_invitations role IN (admin/member/viewer/lawyer) BEZ 'owner';
      zaproszenie z rolą 'owner' wywalało się na constraint w runtime ->
      nowy typ InvitableRole.
  12. impersonation: 3x .then().catch() na typowanym query builderze (brak
      .catch()) -> try/await/catch.

Stan: tsc 0 błędów, lint 0 błędów. Postęp as any: 262 -> 210.

### Pozostałe rodziny (do dalszych iteracji, ~210)
sharing/lawyer-share (4), security/rbac-fine/policy-engine (4),
ocr/ocr-actions (4), experiments/ab* (8), cases/case-actions (4),
ai/suggestions (4), admin/admin-actions (4) oraz liczne pliki po 2–3 casty
(notifications, invoices, growth, versioning, public-api, app/api/security/*,
app/api/marketplace/partners).
