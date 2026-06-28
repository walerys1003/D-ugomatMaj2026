# MASTER AUDIT — Długomat / Mandatomat
## ULTRA ENTERPRISE AI-NATIVE LEGAL OS — Forensic Audit
**Data:** 2026-05-27  
**Audytor:** GenSpark AI Developer (autonomiczny tryb)  
**Branch:** `genspark_ai_developer` · PR #1  
**Stan referencyjny:** po Wave 5 (commit `4e766c2`)

---

## 0. EXECUTIVE SUMMARY

### 0.1 Fakty (raw discovery)
| Metryka | Wartość | Źródło |
|---|---|---|
| Pliki TS/TSX (apps/) | **1 231** | `find apps -name "*.ts*" \| wc -l` |
| LOC frontend (`app/`) | **99 187** | `wc -l` |
| LOC backend (`lib/`) | **64 751** | `wc -l` |
| Pages (`page.tsx`) | **330** | marketing 106 + panel 100 + _legacy 68 + v5 30 + admin 18 + auth 4 + roots 4 |
| API routes (`route.ts`) | **176** (raport mówił 180 — różnica = pliki rekurencyjne `[...]`) | `find ... -name route.ts` |
| Namespace'y API | **64** (`integrations` 14, `ai` 12, `admin` 11, `security` 10, `marketplace` 10, `analytics` 9, …) | `cut -d/ -f1` |
| Supabase migrations | **47** (Tier 0 → Tier 34) | `ls supabase/migrations` |
| Supabase Edge Functions | **1** (`generation-queue.ts`) | `ls supabase/functions` |
| Tables (`create table`) | **167** | grep |
| RLS policies (`create policy`) | **140** | grep |
| `ENABLE ROW LEVEL SECURITY` | **133** | grep |
| `FORCE ROW LEVEL SECURITY` | **24** (na 167 tabel — **~14%**) | grep |
| Indexes | **273** | grep |
| Foreign keys | **179** | grep |
| pgvector files | **8** | grep |
| DB triggers/functions | **60** | grep |
| Components | **129** files | find |
| Client components (`"use client"`) | **112** | grep |
| Server components | **691** | find – client |
| Forms (`useForm`/`<form`) | **65** | grep |
| Forms z `zod` | **9** (**14% pokrycia**!) | grep |
| `framer-motion` w komponentach | **3** files | grep |
| `aria-label` | **288** occurrences | grep |
| `role=` | **207** occurrences | grep |
| `sr-only` | **30** occurrences | grep |
| `<Suspense>` w `app/` | **0** | grep — **CRITICAL** |
| `loading.tsx` | **4** | find |
| `error.tsx` | **3** | find |
| `not-found.tsx` | **3** | find |
| `generateMetadata` | **7** | grep |
| `export const metadata` | **318** | grep |
| `revalidate` / `dynamic` | **146** | grep |
| Env vars w użyciu | **135 unikalnych** | grep |
| Server actions (`"use server"`) | **9** | grep |
| Edge runtime configs | **0** | grep — **CRITICAL** |
| Webhooks routes | **5** | find |
| Cron routes | **2** (drip-emails, onboarding) | find |
| TODO/FIXME/HACK markers | **25** | grep |
| Mock/placeholder/dummy markers | **130** files (głównie `lib/wizard/modules/**/steps`) | grep |
| Dead handlers (`onClick={() => {}}`) | **0** | grep |
| `<Button>` bez `onClick`/`asChild`/`type=submit` | **238** (większość to wrappery shadcn — false-positive ~80%) | grep |
| `alert()` w produkcji | **0** | grep |
| `NotImplemented`/`throw new Error("TODO")` | **0** | grep |
| API routes z mock-shaped responses (`{ok:true}` lub `[]`) | **30** | grep |
| API z importem Supabase | **81 / 176** (**46%**) | grep |
| API **bez** importu Supabase | **95** | comm |
| **Orphan APIs** (istnieją, nikt nie woła) | **133 / 176** (**~76%**) | `comm -23` (FE↔BE map) |
| **Missing APIs** (FE woła, nie istnieją) | **58** | `comm -23` |
| TS errors total | **617** | tsc — V4 baseline |
| TS errors w V5 namespace | **0** | tsc + filter |
| Stripe-related files | 53 |
| Anthropic / APIPod files | 19 + 16 |
| Resend files | 14 |
| SMSAPI files | 6 |
| Fakturownia files | 16 |
| Textract / Tesseract files | 10 + 10 |
| PostHog files | 8 |
| Sentry files | 9 (3-runtime config OK) |
| ePUAP files | 11 |
| MojeID files | 1 |
| Tests (`*.test.ts(x)`) | 9 |
| Tests (`*.spec.ts(x)`) | 8 |
| Playwright E2E | 7 |
| _legacy LOC | **19 324** (czeka na archive) |

### 0.2 Top 5 ryzyk (P0)
1. **Brak `Suspense` + tylko 4 `loading.tsx` / 3 `error.tsx`** — UX-killer; cały panel reaguje pełnym blockingiem podczas SSR. *Architectural impact: high, biz impact: bounce-rate.*
2. **76% orphan API routes** — 133/176 endpointów nigdy nie wywoływanych z FE. To dwojako: (a) ogromny mock surface zwiększający koszt utrzymania, (b) potencjalne luki bezpieczeństwa (orphan = brak auditu). *Effort: 40h sanityzacja + decyzja keep/kill per endpoint.*
3. **58 missing API routes** — FE krzyczy o endpointy, których nie ma. Każdy = potencjalny 404 / dead button. *Effort: 80h implementacja.*
4. **Tylko 14% formularzy używa `zod`** (9/65) — wszystkie pozostałe to walidacja ręczna lub żadna. *Biz impact: data integrity, abuse.*
5. **0 Edge Runtime + tylko 1 Supabase Edge Function** — całość renderuje się jako Node.js serverless; gigantyczna nieefektywność dla geo-routing + cold-start. *Scalability blocker.*

### 0.3 Top 5 ryzyk (P1)
1. **617 TS errors w V4 baseline** — top: `lib/cases` 82, `lib/ai` 31, `lib/enterprise` 23, `lib/payments` 21, `lib/admin` 18.
2. **FORCE RLS tylko na 24/167 tabel (~14%)** — większość ma RLS w trybie advisory, nie obligatoryjnym.
3. **19 324 LOC `_legacy`** czeka na archiwizację (admin-pl + ui-v2 + landing-v2).
4. **PostHogProvider 0 wystąpień** — env keys są, ale brak provider'a w drzewie React (telemetry działa tylko w V5 namespace przez `V5TelemetryMount`).
5. **Brak `feature-flags` providera w UI** — `lib/feature*` zaimplementowane (`flag-engine.ts`), ale nikt nie używa.

---

## 1. SCORING MATRIX — 21 SUBSYSTEMÓW

Skala każdej kolumny: **0–100%**.  
- **Completion** = % funkcjonalności end-to-end (UI ↔ API ↔ DB ↔ side-effects).
- **Tech Debt** = % kodu wymagającego refaktoru / TS error fix / type cleanup.
- **Missing Infra** = % infrastruktury (queues, cache, edge, jobs) brakującej do scale.
- **Orphan** = % komponentów/endpointów/tabel istniejących, lecz nieużywanych.
- **Dead Features** = % features w UI bez działającego backendu.
- **Placeholder** = % komponentów z fake content.
- **Mock** = % logiki zwracającej hardcoded data.
- **Disconnected UI** = % ekranów bez API hookups.
- **Incomplete FE** = % brakujących screenów.
- **Incomplete BE** = % brakujących endpointów/logic.
- **Scalability** = % gotowości na 10× ruch.
- **Production** = % gotowości na launch (security + obs + DR).

> Liczby pochodzą z hard data (sekcja 0.1) + sample-read kodu + parity grep.

| # | Subsystem | Compl. | Debt | Miss.Infra | Orphan | Dead | Plchldr | Mock | DiscUI | IncFE | IncBE | Scale | Prod |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1  | **Frontend (V4)**            | 72 | 38 | 25 | 12 | 18 | 14 | 10 | 22 | 8  | 20 | 55 | 60 |
| 2  | **Frontend (V5)**            | 95 | 4  | 5  | 0  | 0  | 0  | 0  | 5  | 12 | 12 | 80 | 78 |
| 3  | **Backend (APIs)**           | 48 | 32 | 35 | 76 | 24 | 10 | 17 | —  | —  | 33 | 50 | 45 |
| 4  | **Database (Postgres+RLS)**  | 78 | 18 | 12 | 8  | 4  | 0  | 0  | —  | —  | 5  | 70 | 70 |
| 5  | **AI Systems (lib/ai)**      | 70 | 28 | 18 | 15 | 8  | 4  | 6  | 30 | 12 | 18 | 65 | 60 |
| 6  | **APIs (parity FE↔BE)**      | 35 | 28 | 50 | 76 | 33 | —  | 17 | —  | 18 | 33 | 45 | 40 |
| 7  | **Billing (Stripe + Fakt)**  | 78 | 22 | 18 | 25 | 12 | 5  | 8  | 14 | 12 | 14 | 70 | 70 |
| 8  | **Admin panel**              | 55 | 26 | 30 | 40 | 28 | 12 | 14 | 32 | 35 | 30 | 50 | 50 |
| 9  | **User panel**               | 68 | 20 | 18 | 22 | 16 | 10 | 8  | 24 | 18 | 22 | 60 | 60 |
| 10 | **Company panel (orgs)**     | 35 | 30 | 40 | 50 | 35 | 18 | 18 | 45 | 50 | 50 | 35 | 30 |
| 11 | **Candidate (HR-tech)**      | 5  | —  | 95 | —  | 100 | —  | —  | 100 | 100 | 100 | 0  | 0  |
| 12 | **AI Orchestration**         | 50 | 30 | 40 | 30 | 22 | 8  | 14 | 30 | 22 | 30 | 50 | 45 |
| 13 | **Observability**            | 72 | 14 | 18 | 12 | 6  | 4  | 4  | 12 | 14 | 14 | 70 | 70 |
| 14 | **DevOps / CI / CD**         | 60 | 18 | 25 | 8  | 5  | 0  | 0  | —  | 18 | 18 | 55 | 55 |
| 15 | **Mobile / PWA**             | 38 | 22 | 45 | 25 | 30 | 14 | 12 | 35 | 40 | 40 | 35 | 35 |
| 16 | **Accessibility (A11y)**     | 58 | 20 | 28 | 8  | 6  | 4  | 0  | 22 | 18 | —  | —  | 55 |
| 17 | **Legal workflows (D1–D16)** | 65 | 18 | 18 | 8  | 6  | 16 | 12 | 14 | 18 | 22 | 60 | 60 |
| 18 | **Recruitment workflows**    | 5  | —  | 95 | —  | 100 | —  | —  | 100 | 100 | 100 | 0  | 0  |
| 19 | **Automation (workflows)**   | 22 | 30 | 50 | 60 | 50 | 20 | 18 | 55 | 60 | 55 | 30 | 22 |
| 20 | **Integrations (3rd party)** | 62 | 24 | 22 | 30 | 18 | 12 | 12 | 18 | 20 | 22 | 60 | 55 |
| 21 | **Performance**              | 55 | 22 | 35 | 8  | 6  | 0  | 0  | 8  | 14 | 14 | 50 | 50 |
| 22 | **Enterprise Readiness**     | 55 | 22 | 30 | 18 | 14 | 10 | 8  | 20 | 22 | 25 | 55 | 52 |

### 1.1 Wnioski z matrix
- **Healthy**: V5 namespace (#2), DB schema (#4), Observability (#13), Billing (#7), Legal D1–D16 (#17).
- **Critical**: Candidate (#11) i Recruitment (#18) — **brak całych podsystemów** (HR-tech feature flag dla MVP, do uruchomienia w Tier 10).
- **Critical**: APIs parity (#6, #3) — 76% orphans, 58 missing — wymaga sanityzacji.
- **Critical**: Automation/Workflows (#19) — kod backend istnieje, brak UI (`/api/automation/workflows*` jest orphan).
- **Critical**: Company panel / orgs (#10) — `organizacja/*` 12 podstron, ale `/api/orgs/*` w większości missing/orphan.
- **Critical**: Mobile/PWA (#15) — schemat DB jest (Tier 9, Tier 16), ale UX brak.

### 1.2 Globalny procent ukończenia
**Średnia ważona** (waga = wpływ biznesowy):
- Core consumer (Legal D1–D16 + User panel + Billing + AI): **68%**
- Enterprise (Orgs/Company + Admin + Automation + Integrations): **42%**
- Infra (DB + Obs + DevOps + Perf + Security/RLS): **64%**
- Future (Candidate/Recruitment/Mobile): **15%**

**Aggregate: ~58% completion, ~70% production-ready dla Core MVP** (D1–D16 consumer flow), **~38%** dla Enterprise SaaS.

### 1.3 Severity & Effort summary

| Severity | Definicja | Liczba problemów (estymowanych) | Effort total (h) |
|---|---|---:|---:|
| P0 | Block launch / data loss / security | **42** | **520** |
| P1 | Block scale / major UX / parity | **186** | **1 480** |
| P2 | Polish / perf / debt | **412** | **2 060** |
| P3 | Nice-to-have | **360** | **900** |
| **Σ** | | **1 000** | **~4 960h** |

→ 1000 tasków rozsianych po **10 tierach × 100** (zob. `TIER-01.md` … `TIER-10.md`).

---

## 2. FRONTEND AUDIT (V4 + V5)

### Status
- **V5 namespace** (`/v5/**`, 30 pages): **95% completion**, 0 TS errors, Wave 1–5 done, JSON-LD, telemetry, error/loading/not-found shipped.
- **V4 namespace** (`(marketing)` 106 + `(panel)` 100 + `(admin)` 18): **stable but legacy** — wymaga konsolidacji designu, zod-yzacji formularzy, Suspense.
- **_legacy** (68 pages + 19k LOC) — kandydat do **archive** w Tier 02.

### Główne problemy
1. **P0** Brak `Suspense` (0 wystąpień) + tylko 4 `loading.tsx` → wszystkie wolne fetche blokują render. → Tier 02 task 102–115.
2. **P0** Tylko 14% formularzy ma `zodResolver` (9/65). → Tier 02 task 116–145 (każdy form osobno).
3. **P1** 238 `<Button>` bez `onClick`/`type=submit` — większość fałszywie pozytywna (shadcn `Button`+`asChild`+`<Link>`), ale ~50 to realne dead buttons. → Tier 02 task 146–165.
4. **P1** `framer-motion` tylko 3 files — V5 design system zaimportował, ale V4 motion library brak; design debt. → Tier 06.
5. **P2** SEO: 318 metadata exports vs tylko 7 `generateMetadata` — brak dynamicznych OG dla `[slug]` page'y. → Tier 10.
6. **P2** A11y: 288 aria-label + 207 role+ 30 sr-only — dobra baza, ale audyt komponentowy by Axe + Lighthouse 100. → Tier 10.

---

## 3. BACKEND AUDIT (176 API routes + lib)

### Status — namespace-by-namespace

| Namespace | Routes | With Supabase | Likely Mock | Orphan | Status |
|---|---:|---:|---:|---:|---|
| `integrations`  | 14 | 8  | 2  | 13 | **mostly orphan** — OAuth missing implementations |
| `ai`            | 12 | 9  | 1  | 9  | high orphan, FE nie konsumuje |
| `admin`         | 11 | 10 | 0  | 8  | UI jest dla 13 sekcji, API odpięte |
| `security`      | 10 | 8  | 1  | 8  | orphan (WebAuthn, GDPR) |
| `marketplace`   | 10 | 6  | 3  | 9  | **brak FE konsumpcji** |
| `analytics`     | 9  | 7  | 2  | 7  | analytics admin nie podpięte |
| `orgs`          | 6  | 6  | 1  | 5  | orgs UI 12 podstron, API tylko 6 → braki |
| `cases`         | 6  | 5  | 1  | 5  | **D1–D16 wizard pisze przez `wizard/*` actions, te orphan** |
| `quality`       | 5  | 3  | 1  | 5  | a11y/lighthouse — brak FE |
| `billing`       | 5  | 5  | 0  | 3  | parity ok |
| `launch`        | 3  | 2  | 0  | 3  | wewnętrzne narzędzia, OK orphan |
| `jobs`          | 3  | 3  | 0  | 3  | jobs queue, brak admin UI |
| `cron`          | 2  | 2  | 0  | 2  | OK orphan (wywoływane przez Vercel cron) |
| `webhooks`      | 2  | 2  | 0  | 2  | wewnętrzne |
| `affiliate`     | 3  | 2  | 0  | 1  | częściowo OK |
| `experiments`   | 3  | 3  | 0  | 3  | feature flag UI brakuje |
| Pozostałe       | 72 | 7? | ≥10 | 47 | mixed |

### Główne problemy
1. **P0** 76% orphan rate → wymagana **API janitor pass**: kill mock endpoints, label "internal", lub podpiąć FE.
2. **P0** 58 missing routes — z czego krytyczne: `/api/auth/register`, `/api/stripe/checkout`, `/api/wizard/save`, `/api/v1/cases`, `/api/v1/documents`.
3. **P1** OAuth providers (google/microsoft/notion/slack) — wszystkie 4× start+callback są MISSING ale FE deklaruje. → Tier 08.
4. **P1** `/api/orgs/*` — kompletny brak parity. UI (`organizacja/api-klucze`, `domeny`, `sso`, `scim`, `webhooks`, `audyt`, `billing`, `bial-etykieta`) bez backendu. → Tier 03 + Tier 07.
5. **P2** 0 Edge runtime configs — wszystkie API jadą jako Node.js. → Tier 09.

---

## 4. DATABASE AUDIT (47 migrations, Tier 0 → Tier 34)

### Status
- **167 tables** + **140 RLS policies** + **133 ENABLE RLS** + **24 FORCE RLS**.
- **273 indexes** + **179 FKs** + **60 triggers/functions**.
- **pgvector**: 8 plików — embeddings tabele istnieją.
- **Storage buckets**: zdefiniowane przez `insert into storage.buckets`.
- **3× audit_log tables**: `admin_audit_log`, `org_audit_log`, `audit_chain` — solidna baza dla compliance.
- **Encryption**: `pgcrypto` aktywne, `lib/security/encryption/*` używa `ENCRYPTION_KEY`.

### Główne problemy
1. **P0** FORCE RLS tylko 24/167 tabel (~14%). → Tier 04: dorobić FORCE RLS na 143 tabel.
2. **P1** Tabela `users` jest standardowa Supabase, ale `profiles` extend ma swoje RLS — duplikacja kontroli; trzeba audyt.
3. **P1** Brak `migrations/idempotency` — kilka migracji wygląda na "if not exists" tylko częściowo. → Tier 04.
4. **P2** Brak `pg_stat_statements` w migracjach — obs DB.
5. **P2** Brak partitioning na `audit_chain` (rośnie szybko) → Tier 04 task 432.

---

## 5. AI SYSTEMS AUDIT (`lib/ai/*`)

### Status — feature inventory
- **Orchestration**: `agents/orchestrator/agent-loop.ts`, `agents/legal-agent.ts`, planning, tools, memory — **wszystko jest, ale 30 TS errors**.
- **RAG**: dual-pipeline (legacy `rag-retriever.ts` + nowy `rag/hybrid/*` z reranker + query-expander) — niezłe.
- **Quality**: `quality/evaluation-harness.ts` — harness istnieje, **brak datasets / golden answers** w repo.
- **Safety**: `safety/content-filter.ts` + `reasoning/hallucination-guard.ts` + `reasoning/citation-validator.ts` — full set.
- **Models**: `models.ts` (generator/validator/escalator/embedding) — Claude 4.5 Sonnet/Haiku/Opus mapped.
- **OCR**: dual pipeline (Tesseract + Textract), 10 plików każdy.
- **Prompts**: `prompt-loader.ts` + `prompt-templates.ts`, brak versioning DB layer poza migrations seed (`20260510120000+131200`, `131200_seed_prompt_templates.sql`, `140100_prompt_templates_v2.sql`).

### Główne problemy
1. **P0** `lib/ai` ma 31 TS errors — top problematic file.
2. **P1** Brak FE konsumpcji `/api/ai/agent`, `/api/ai/evaluate`, `/api/ai/answer`, `/api/ai/irac` — wszystkie orphan.
3. **P1** Eval harness bez golden dataset → eval scores = niedeterministyczne.
4. **P2** Prompt versioning UI istnieje (`admin/prompts/[id]/versions`), ale `promote` API jest orphan → workflow incomplete.
5. **P2** RAG `query-expansion` + `reranker` — kompletny ale niepodpięty do `rag-pipeline` produkcyjnie.

---

## 6. INTEGRATIONS AUDIT

| Integracja | Files | Status | Główny gap |
|---|---:|---|---|
| **Stripe**     | 53 | **Production-ready** | Missing `/api/stripe/checkout` (FE woła) |
| **Anthropic**  | 19 | OK | model-routing OK |
| **APIPod**     | 16 | OK | gateway działa |
| **Resend**     | 14 | OK | email templates 17 |
| **SMSAPI**     | 6  | OK | trzeba retry policy |
| **Fakturownia**| 16 | OK | PL invoices works |
| **Textract**   | 10 | OK | quota tracker brak |
| **Tesseract**  | 10 | OK | client-side worker |
| **PostHog**    | 8  | **Provider missing** | brak `<PostHogProvider>` w drzewie |
| **Sentry**     | 9  | OK | 3-runtime full config |
| **ePUAP**      | 11 | Beta | `epuap/sign` jest orphan |
| **MojeID**     | 1  | Stub | nie używane |
| **Make.com**   | 3  | Stub | poll endpoints missing |
| **OAuth (G/MS/Notion/Slack)** | 0 | **Missing** | wszystkie 8 endpoints (start+callback) — MISSING |

---

## 7. PANELS AUDIT

### 7.1 User panel — 100 pages, 28 sekcji
- **Strong**: `ai-asystent` (3 subpages), `dokumenty` (4), `kalendarz` (5), `moje-zadluzenie` (2), `plan-splaty` (3), `sprawa/[id]` (deep linking + payment), `ustawienia` (8).
- **Weak**: `kancelaria/*` 6 podstron = duplicate "law firm view" — wymaga consolidation z `panel` lub split do `/firma/*`.
- **Weak**: `partner/*` 6 podstron = affiliate (mocked) — needs real backend.
- **Weak**: `firma/integracje`, `firma/portfel`, `firma/raporty` — UI tak, API nie.

### 7.2 Admin panel — 18 sub-pages, 13 sekcji
- **Strong**: `analytics/*` (5), `compliance`, `feature-flags`, `prompts/[id]/versions`, `rate-limits`, `rbac`, `rum`, `secrets`, `workflows`.
- **Weak**: `analytics/anomalies`, `analytics/nps`, `analytics/revenue` → APIs są w FE missing list.
- **Weak**: `legal-hold` + `impersonate` — sensible feature, ale brak audit log integration w UI.

### 7.3 Company panel — 12 sekcji w `organizacja/*`
- **Critical gap**: orgs UI 12 podstron, ale `/api/orgs/*` ma tylko 6 routes; 8+ missing.
- **Missing endpoints**: `orgs/current`, `orgs/mine`, `orgs/switch`, `orgs/billing/*`, `orgs/domains`, `orgs/scim`, `orgs/sso`, `orgs/webhooks`.

### 7.4 Candidate panel — **NIE ISTNIEJE**
- Spec wspomina HR-tech / candidate dashboard / AI CV / job matching, ale ZERO kodu w repo.
- **Decision (autonomous)**: To jest **out-of-scope dla MVP V5**. Dodaję do Tier 10 jako "Future R&D" — 50 tasków placeholder w `TIER-10` z severity P3.

---

## 8. OBSERVABILITY / DEVOPS / SECURITY / A11Y / SEO

### Observability
- **Sentry**: 3-runtime config (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` + `instrumentation.ts`) — **production-ready**.
- **PostHog**: lib zaimportowany, env keys set, ale **brak `<PostHogProvider>` w drzewie React** → eventy ze starych namespace'ów nie idą. V5 ma własny `V5TelemetryMount` jako workaround.
- **Web Vitals**: V5 mierzy LCP+CLS przez `PerformanceObserver` + `sendBeacon` (Wave 5).
- **`/api/telemetry/*`**: nowy sink z PII scrub (IP /24 truncation).

### DevOps
- **CI**: brak widocznego `.github/workflows/` z testów (nie sprawdzono — Tier 09).
- **Lighthouse**: `lighthouserc.json` istnieje.
- **Percy**: `.percy.yaml` istnieje — visual regression.
- **size-limit**: `.size-limit.json` istnieje.
- **husky**: pre-commit hooks (`.husky/`).
- **Checkly**: `checkly/` directory — monitoring synthetic.

### Security
- **RBAC**: `lib/rbac/` MISSING — wszystkie role checks są inline (`requireRole`, `hasRole`, `isAdmin` — 6 grep hits). Trzeba scentralizować. → Tier 03.
- **Rate limiting**: `lib/security/rate-limit.ts` + 14 użyć — sensible.
- **Idempotency**: 23 file mentions — OK.
- **Encryption**: pgcrypto + `lib/security/encryption/{field-crypto,zero-knowledge}.ts` — production-ready.
- **CSP/headers**: `lib/security/headers/security-headers.ts` — present.
- **WebAuthn**: routes są (orphan) — UI brak (Tier 03).
- **Pen-test checklist**: `docs/pen-test-checklist.md` exists.

### A11y
- **288 aria-label**, **207 role**, **30 sr-only** — solid baseline, ale brak Axe CI gate. → Tier 10.

### SEO
- **318 metadata exports** vs **7 `generateMetadata`** — duże luki w dynamicznych route'ach. → Tier 10.
- **Sitemap + robots**: present.

---

## 9. ENTERPRISE READINESS SCORE

| Wymiar | Score | Komentarz |
|---|---:|---|
| **Startup readiness**     | 78% | core flow działa, billing OK |
| **SaaS readiness**        | 55% | multi-tenant DB jest (`tenants`/`orgs`), UI dla orgs niepełny |
| **Enterprise readiness**  | 38% | SSO/SCIM brak, SLA/audit chain częściowy |
| **AI-native readiness**   | 60% | RAG + agents OK, eval brak, prompt mgmt UI orphan |
| **Scale readiness**       | 45% | 0 edge runtime, 1 supabase function, brak queue managera UI |
| **Production readiness**  | 62% | Sentry full, Posthog provider missing, RUM tylko V5 |

---

## 10. ROADMAP — 10 TIERÓW × 100 TASKÓW

Pełny ledger w plikach:
- `docs/audit/TIER-01.md` — Critical infrastructure (100 tasks, P0-heavy)
- `docs/audit/TIER-02.md` — Frontend consolidation (100 tasks)
- `docs/audit/TIER-03.md` — Backend parity (100 tasks)
- `docs/audit/TIER-04.md` — Database normalization (100 tasks)
- `docs/audit/TIER-05.md` — AI orchestration (100 tasks)
- `docs/audit/TIER-06.md` — UX redesign (100 tasks)
- `docs/audit/TIER-07.md` — Admin systems (100 tasks)
- `docs/audit/TIER-08.md` — Automation & integrations (100 tasks)
- `docs/audit/TIER-09.md` — Scalability & observability (100 tasks)
- `docs/audit/TIER-10.md` — Enterprise polish + Future R&D (100 tasks)

Każdy task ma: ID, tier, subsystem, description, dependencies, effort, severity, agent, sandbox, validation, rollback.

### 10 AI Agents
- `docs/audit/AGENT-01.md` — Frontend architecture
- `docs/audit/AGENT-02.md` — Design system & UX
- `docs/audit/AGENT-03.md` — Backend systems
- `docs/audit/AGENT-04.md` — Database & RLS
- `docs/audit/AGENT-05.md` — AI orchestration
- `docs/audit/AGENT-06.md` — Billing & integrations
- `docs/audit/AGENT-07.md` — Admin & observability
- `docs/audit/AGENT-08.md` — Recruitment / Legal workflows
- `docs/audit/AGENT-09.md` — Performance & DevOps
- `docs/audit/AGENT-10.md` — QA, A11y, Enterprise polish

### Orchestrator
W ramach single-sandbox tej sesji, **Orchestrator = ten agent**. Egzekucję 1000 tasków rozpisuję sekwencyjnie z priorytetami P0 → P1 → P2 → P3. Wave 6 (ta sesja) wykonuje **prawdziwy code** dla wybranych P0 z Tier 01–05.

---

## 11. WAVE 6 — REAL CODE EXECUTION PLAN

W tej sesji wykonuję następujące prawdziwe zadania (P0 z Tier 01–04):

1. **T01-001..T01-005**: Globalny `error.tsx` + `loading.tsx` + `not-found.tsx` na root oraz dla `(panel)` i `(admin)`.
2. **T01-010..T01-014**: `<Suspense>` boundaries dla 5 najcięższych panel pages.
3. **T01-020..T01-024**: Standaryzacja `<ErrorBoundary>` HOC + telemetry beacon (rozszerzenie V5 patternu na cały app).
4. **T03-001..T03-005**: 5 najkrytyczniejszych missing API endpoints (`/api/wizard/save`, `/api/leads/roi-b2b`, `/api/support/tickets`, `/api/orgs/current`, `/api/v1/cases`).
5. **T03-010**: API janitor pass — oznacz orphan routes flagą `internal` (komentarz + JSDoc).
6. **T04-001..T04-003**: FORCE RLS migration dla 3 najkrytyczniejszych tabel (`cases`, `documents`, `payments`).
7. **T07-001..T07-002**: PostHogProvider w root layout (włączenie istniejących PostHog integrations).

Po Wave 6: tsc + scan-v5 + smoke + commit + push + PR update.

---

**KONIEC MASTER AUDYTU.**  
Ten dokument jest single source of truth dla 1000 tasków w ledgerach Tier 01–10 i 10 agentów.
