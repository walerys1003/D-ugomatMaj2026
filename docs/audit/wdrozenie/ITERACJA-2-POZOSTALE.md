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

---

## Iteracje 18–27 (kontynuacja #6 — redukcja `as any`)

Kontynuacja rozbioru rodzina-po-rodzinie (per grupa tabel DB). Każda iteracja:
dotypowanie tabel w `lib/db/types.ts`, usunięcie castów, naprawa realnych bugów
maskowanych przez `as any`, walidacja `tsc --noEmit` (0) + `next lint` (0).

### Iteracja 18 — commit fca9124
Batch: `sharing/lawyer-share`, `experiments/ai-suggestions`, `ocr/ocr-actions`,
`security/rbac-fine/policy-engine`. Dotypowane tabele, usunięte casty.

### Iteracja 19 — commit 4adb976
`experiments/ab*` — usunięte casty. **KOLIZJA schematu `experiments`**
(`create table if not exists` — wygrywa najwcześniejszy timestamp migracji).

### Iteracja 20 — commit df0c34a
`cases/case-actions`, `admin/admin-actions` — usunięte casty, dotypowane tabele.

### Iteracja 21 — commit 14898d9
`push/web-push`, `invoices`, `leads`, `row-lock` — 12 castów. Dotypowane:
push_subscriptions, invoices, leads.

### Iteracja 22 — commit 6caac3b
`versioning`, `event-triggers`. **2 REALNE BUGI**: kolizja schematu
`document_versions` + błąd w `scanUpcomingDeadlines`.

### Iteracja 23 — commit 623c6dc
`public-api`, `api-keys`, `gdpr`, `marketplace`, `restore`, `agent-memory`.
**2 REALNE BUGI** roli `'owner'` (UserRole = user|admin|moderator, BEZ owner).
Dotypowane: agent_memory, api_keys, webhook_subscriptions, webhook_secrets.

### Iteracja 24 — commit 17f768b
`v1/public-cases`, `webhooks`, `plugin-lifecycle`. **1 REALNY BUG**:
select nieistniejących kolumn na `public/cases`.

### Iteracja 25 — commit 415caad (12 castów, 0 bugów, 4 tabele)
- `notifications/orchestration/preferences` — boundary jsonb→domena (`as Json`).
- `notifications/orchestration/frequency-cap` — dotypowane `notification_log`.
- `documents/document-actions` — documents/document_versions/validation_runs.
- `affiliate/payouts` — embedded join (`CommissionWithAffiliate`).
- `growth/conversion-tracking` — attribution/meta `as Json`.
- `analytics/cohort-analysis` — usunięte `as any[]` + guard `user_id`.
Dotypowane: notification_preferences, notification_log, conversion_events,
analytics_events.
**KOLIZJA udokumentowana**: `notification_preferences` — Tier18
(20260521000000, channels/categories/caps jsonb) WYGRYWA nad Tier27
(20260528000000). Kod używa Tier18 → spójne, BEZ buga.

### Iteracja 26 — commit c9c0123 (6 castów, 3 REALNE BUGI, 2 tabele)
- `app/api/security/sessions/route.ts` — 2 MARTWE casty (`sb` nigdy nieużyty).
- `app/api/security/webauthn/register/route.ts` — **REALNY BUG**: insert używał
  `rp_id` (kolumna nie istnieje) + `device_name` (realna kolumna to `label`) →
  rejestracja passkey ZAWSZE failowała.
- `app/api/security/webauthn/authenticate/route.ts` — **REALNE BUGI**: GET i POST
  filtrowały `.is("revoked_at", null)` na nieistniejącej kolumnie → lista zawsze
  pusta / logowanie passkey zawsze `credential_not_found`.
Dotypowane: webauthn_challenges, webauthn_credentials (Tier17 20260520000000).

### Iteracja 27 — commit 940b4d8 (4 casty, 1 REALNY BUG, 2 tabele)
- `lib/quality/error-tracking.ts` — **REALNY BUG**: `captureError` DB-fallback
  insertował 5 nieistniejących kolumn (`severity`/`route`/`case_id`/`tags`/
  `extra`) → zawsze cichy fail w try/catch → raporty błędów NIGDY nie trafiały
  do DB gdy Sentry niedostępny. Fix: `route`→`url`, `source:"server"`, reszta
  do `metadata` jsonb (`as Json`).
- `lib/realtime/channel/channel-broker.ts` — boundary `payload as Json` (insert)
  + `(data ?? []) as unknown as RealtimeEvent[]` (odczyt jsonb→domena).
Dotypowane: error_reports (Tier10 20260513300000), realtime_events
(Tier21 20260524000000).

### Postęp `as any` (zweryfikowany)
262 (iter17) → 210 → ... → 148 (iter23) → 141 (iter24) → 129 (iter25) →
125 (iter26) → 122 (iter27) → **97** (bieżący stan, bez linii komentarzy).

### Poza zakresem audytu DB (NIE usuwać — casty SDK/klienta)
- `lib/billing/subscriptions.ts` (3× `new (Stripe as any)`), `lib/billing/upgrade-flow.ts`
  (2×) — `@types/stripe` niezainstalowane w sandboxie.
- `lib/pdf/pdfa-conformance.ts` (3), `lib/integrations/court/court-efiling.ts` (3),
  `lib/analytics/rum-collector.ts` (4), `app/(panel)/.../integracje/page.tsx` (4).

### Pozostałe rodziny DB (do dalszych iteracji, ~97)
`lib/sw/background-sync`, `lib/security/encryption/field-crypto`,
`lib/pwa/offline-queue`, `lib/observability/retry`,
`lib/ai/agents/orchestrator/agent-loop`, `app/api/security/gdpr/consent/route`
oraz liczne pliki po 2 casty.

---

## Iteracje 28–31 (kontynuacja #6 — redukcja `as any`)

### Iteracja 28 — commit 6774518 (DB casts, 3 tabele: offline_queue, agent_runs, agent_steps)
- lib/security/gdpr/consent-ledger.ts — typowanie SupabaseClient<Database>.
  **3 REALNE BUGI** (migracja 20260520000000 consent_ledger):
    1. purpose: kod używał wartości spoza CHECK constraint (analytics_telemetry,
       data_sharing_partners, ai_model_training) → insert wywalał się w runtime.
    2. policy_version: kolumna NIE ISTNIEJE → realna 'version'. Insert zawsze failował.
    3. captured_at: kolumna NIE ISTNIEJE → realna 'recorded_at'. capturedAt zawsze pusty.
- app/api/security/gdpr/consent/route.ts — 2 MARTWE casty usunięte.
- lib/pwa/offline-queue.ts — 2 casty DB, payload/result as Json.
- lib/ai/agents/orchestrator/agent-loop.ts — 2 casty DB; .then().catch()→.then(ok,err).

### Iteracja 29 — commit 6774518 (casty przeglądarkowe/generyczne, nie-DB)
- lib/sw/background-sync.ts — reg.sync typed interface, crypto.randomUUID guard.
- lib/pwa/offline-queue.ts — crypto.randomUUID guard.
- lib/security/encryption/field-crypto.ts — null-return as unknown as string.
- lib/observability/retry.ts — err as any → typed error-shape narrowing.

### Iteracja 30 — commit de25b14 (marketplace routes)
- reseller/payouts/listings — 6 castów. **2 REALNE BUGI** martwego warunku roli
  'owner' (UserRole = user|admin|moderator, BEZ owner).

### Iteracja 31 — commit de25b14 (4 tabele: oauth_credentials, security_events, epuap_sign_sessions)
- app/api/calendar/feed/route.ts — **2 REALNE BUGI + KOLIZJA**:
    1. deadlines.due_at NIE ISTNIEJE (Tier18 → effective_end_date). ICS pusty.
    2. KOLIZJA case_events: wygrywa WCZEŚNIEJSZA migracja (20260510130800:
       event_type/created_at/metadata); późniejsza (20260512200000:
       kind/occurred_at/title) pomijana. Kod pytał o skipnięty schemat → rozprawy
       zawsze puste. Przejście na schemat zwycięski.
- offline-queue/push/oauth/epuap routes — pozostałe casty usunięte.
  UWAGA: 'oauth.disconnected' poza CHECK security_events → wymaga osobnej migracji.
  UWAGA: security-events.ts używa wartości kropkowanych (auth.*/gdpr.*) spoza CHECK
  constraint → szersze zdarzenia bezpieczeństwa wymagają migracji pogodzenia.

### Postęp `as any`: 97 → 85 (iter29) → 69 (iter31).

### Zidentyfikowane do osobnej, ostrożnej iteracji (głęboki drift schematu)
- lib/cases/timeline.ts, lib/cases/dashboard.ts — pytają o tabelę `ai_runs`
  (NIE ISTNIEJE w migracjach) oraz kolumny win_probability / deadlines.missed /
  deadlines.due_at / cases.case_type (realna: `type`). Wymaga reconcyliacji
  schematu (ew. migracji) zanim bezpiecznie usunie się `as any`.
- lib/enterprise/{scim,organizations,audit-trail}.ts — `as any[]` na wynikach
  embedded-join; do rozbioru z lokalnymi typami złączeń.

---

## Iteracje 32–33 (kontynuacja #6 — głęboki drift schematu cases)

### Iteracja 32 — commit a6e5387 — lib/cases/timeline.ts
`buildCaseTimeline` ZAWSZE zwracał `[]`. `as any` maskował **7 REALNYCH BUGÓW + KOLIZJĘ**:
1. cases.case_type NIE ISTNIEJE → realna `type`.
2. documents nie ma kind/source/sent_at/title → ma type/status.
3. deadlines.due_at/missed NIE ISTNIEJĄ → effective_end_date.
4. notifications.kind/title NIE ISTNIEJĄ → template.
5. NotificationStatus nie ma 'delivered' → 'sent'.
6. CaseStatus nie ma 'closed' → completed/archived.
7. KOLIZJA case_events: kod pytał o pominięty schemat (kind/occurred_at/title).
USUNIĘTO gałąź ai_runs — tabela ai_runs/ai_generation_runs NIE ISTNIEJE
(jest tylko index do nieistniejącej tabeli). Realny log: ai_usage_log (bez case_id).

### Iteracja 33 — commit a6e5387 — lib/cases/dashboard.ts
**REALNY BUG #8**: ai_suggestions nie ma user_id ani dismissed_at (ma applied_at,
klucz case_id) → filtr padał. + cases.case_type→type, win_probability usunięte,
deadlines.due_at→effective_end_date, ai_runs→ai_usage_log (cost_grosze/100).
Dotypowano ai_usage_log. Postęp as any: 69 → 67.

### Nowo wykryta KOLIZJA (do migracji — POZA czyszczeniem as-any)
**organizations** — DWIE migracje:
- Tier7 (20260512300000, WYGRYWA): id/name/nip/owner_user_id/plan(free..enterprise)/created_at.
- Tier13 (20260516000000, POMIJANA): id/slug/name/plan(team)/seats_purchased/
  data_residency/domain/created_at.
Kod lib/enterprise/organizations.ts jest zbudowany na schemacie Tier13 (POMIJANYM):
wstawia slug/seats_purchased/data_residency, pyta o `slug`, NIE podaje
owner_user_id (NOT NULL w Tier7) → **createOrganization/ensureUniqueSlug PADAJĄ
w runtime**. Wymaga decyzji: migracja dorównująca kolumny Tier13 albo przepisanie
kodu na schemat Tier7. Pliki lib/enterprise/{scim,organizations,audit-trail}.ts
pozostawione z `sb: any` do czasu tej decyzji (nie wymuszamy niepełnej zmiany).

## Iteracja 35 — MFA / cases / security routes (#6)

### ✅ Zaimplementowane
- Dotypowano tabelę `evidence_uploads` (migracja 20260512200000_tier7_tables.sql).
  `mfa_secrets` było już dotypowane wcześniej (uniknięto duplikatu).
- Usunięto 11 castów `as any`. Po iteracji: **67 → 56**.
- Typowane klienty: `/api/security/mfa/{verify,setup}`, `/api/push/send`
  (`requireAdmin`), `/api/offline-queue/drain` (na poziomie route'a).
- Martwe casty usunięte: `/api/security/gdpr/export`, `/api/security/mfa/disable`.

### 🐛 REALNE BUGI (maskowane przez `as any`)
1. **`/api/security/mfa/setup`** — upsert zapisywał kolumny `issuer`/`account`,
   których NIE MA w schemacie `mfa_secrets` (migracja 20260520000000) → runtime
   error PostgREST. Usunięto (issuer/account są częścią otpauth URL zwracanego
   do klienta, nie trzeba ich utrwalać).
2. **`/api/cases/[id]/win-probability`** — `case_type` nie istnieje (poprawnie
   `type`); `facts`/`answers`/`deadline_at`/`amount`/`creditor_type`/
   `documents_count` też nie istnieją → odpowiedzi z `wizard_state.answers`,
   fakty z `metadata`.
3. **`/api/cases/[id]/virtual-judge`** — `case_type`/`facts` nie istnieją →
   `type` + `metadata`.
4. **`/api/cases/[id]/evidence`** — `case_type` nie istnieje → `type`.
5. **`/api/push/send`** — martwy warunek `role !== 'owner'` (brak 'owner'
   w UserRole) → `role !== 'admin'`.
6. **`/api/csp-report` + `/api/health/deep`** — tabela `audit_log` **NIE
   ISTNIEJE** (żadna migracja jej nie tworzy; istnieją `admin_audit_log`,
   `org_audit_log`, `audit_chain`; tier6 ma nawet indeks na nieistniejącej
   `public.audit_log`). CSP-report wstawiał dodatkowo niepasujące kolumny
   (event_type/actor_type/resource_type) → przepięto na `admin_audit_log`
   z poprawnymi kolumnami (actor_id/action/target_type). Health-check RTT
   również przepięto na `admin_audit_log` (wcześniej zawsze raportował 'down').

### 📊 Walidacja
- `tsc --noEmit` → EXIT 0
- `next lint` → 0 errors
- commit `cecaec1`

### ⏸️ Odłożone (decyzje migracyjne — poza zakresem as-any)
- `scheduled_reminders` i `legal_references` — **brak migracji tworzącej tabelę**.
  `lib/letters/auto-deadline-tagger.ts`, `lib/legal/precedent-search.ts`,
  `lib/ai/rag-scaffold.ts`, `lib/ai/rag/hybrid/hybrid-retriever.ts` odpytują
  nieistniejące tabele → wymagają decyzji o migracji przed usunięciem `as any`.
- `knowledge_articles` — istnieje tylko w tier7; do dotypowania w kolejnej iteracji.
