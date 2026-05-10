# Długomat — Post-launch Handover (Tier 5 zad. 250)

> **Audience**: nowy zespół utrzymania, on-call inżynier, CTO/PM przejmujący produkt po launchu.
>
> **Cel**: w ≤ 2 godziny czytania nowy człowiek wie GDZIE WSZYSTKO JEST,
> JAK COŚ NAPRAWIĆ i DO KOGO PISAĆ. Ten dokument NIE zawiera wszystkiego —
> linkuje do operacyjnego runbooka i specyfikacji.

## TL;DR — pierwszy dzień (1 godzina)

1. Przeczytaj **`docs/RUNBOOK.md`** sekcje 1–4 (architektura, deploy, monitoring, runbooks).
2. Dostań dostępy (sekcja 4 niżej).
3. Uruchom lokalnie: `cd apps/web && npm install && npm run dev`.
4. Uruchom smoke test produkcji: `./scripts/smoke-test.sh https://dlugomat.pl`.
5. Przejdź flow E2E manualnie: rejestracja → skaner-nakazu → wizard D2 → checkout (test mode) → PDF.

## 1. Mapa repozytorium

```
.
├── apps/web/                    Next.js 14 App Router (jedyna apka)
│   ├── app/
│   │   ├── (marketing)/         publiczne strony (landing, cennik, baza-wiedzy)
│   │   ├── (auth)/              login + magic-link (Supabase)
│   │   ├── (panel)/panel/       zalogowany user (sprawy, kalkulatory, RODO)
│   │   ├── admin/               panel admin (RBAC: role='admin')
│   │   ├── api/                 route handlers
│   │   ├── r/[code]/            referral redirect
│   │   ├── status/              public status page
│   │   ├── layout.tsx           root layout + JSON-LD globalny
│   │   ├── instrumentation.ts   Sentry init hook (Tier 5 zad. 248)
│   │   └── sentry.{client,server,edge}.config.ts
│   ├── components/              React komponenty (UI + feature)
│   ├── lib/                     biznes + integracje
│   │   ├── ai/                  Claude (APIPod)
│   │   ├── cases/               CRUD spraw (server actions)
│   │   ├── db/                  Supabase clients
│   │   ├── documents/           generowanie PDF
│   │   ├── notifications/       Email (Resend), SMS (SMSAPI)
│   │   ├── observability/       PostHog events, Sentry config, error reporter
│   │   ├── ocr/                 Tesseract + Textract fallback
│   │   ├── payments/            Stripe + Fakturownia
│   │   ├── providers/           React providers (theme, posthog)
│   │   ├── referrals/           affiliate
│   │   ├── rodo/                eksport + delete
│   │   ├── security/            CSRF, CSP, rate-limit, server-action-guard
│   │   ├── seo/                 JSON-LD helpers
│   │   └── wizard/              auto-save, state machine
│   ├── styles/                  Tailwind + globals
│   ├── tests/                   unit testy (Jest)
│   ├── middleware.ts            Edge: CSP nonce + rate-limit + auth refresh
│   └── next.config.mjs          headers, edge caching, instrumentation
├── supabase/
│   └── migrations/              20 plików SQL — porządek wg timestampów
├── scripts/
│   ├── smoke-test.sh            production smoke (Tier 5 zad. 249)
│   ├── embed-knowledge.ts       backfill embeddingów (RAG)
│   ├── build_kb.py              Python → JSON dla legal_knowledge
│   └── kb_query.py              quick query CLI
├── docs/
│   ├── PLAN.md                  250-task masterplan (Tier 1–5)
│   ├── RUNBOOK.md               operacyjny runbook (deploy, monitoring, DR)
│   ├── HANDOVER.md              ten dokument
│   ├── pen-test-checklist.md    coroczny pen-test (Tier 5 zad. 215)
│   ├── edge-caching.md          strategia CDN cache (Tier 5 zad. 219)
│   └── spec/                    specyfikacja modułów D1–D8
└── .github/workflows/
    ├── ci.yml                   lint + test + build + migration-lint
    ├── lighthouse.yml           Perf + a11y CI (Tier 5 zad. 220)
    └── backup-postgres.yml      nightly pg_dump → S3 (Tier 5 zad. 208)
```

## 2. Architektura — 30 sekund

Pełny diagram: **`docs/RUNBOOK.md` §1**.

W skrócie:

- **Frontend + Backend**: Next.js 14 App Router (RSC + Server Actions) na Vercel
- **DB + Auth + Storage**: Supabase (Postgres 15 z RLS FORCE, Auth magic-link, pgvector, pgcrypto)
- **AI**: APIPod → Claude Sonnet 4.5 (główny) / Haiku 4.5 (validator) / Opus 4.5 (escalation)
- **Płatności**: Stripe Checkout + Fakturownia (faktury VAT)
- **Komunikacja**: Resend (e-mail) + SMSAPI (SMS)
- **OCR**: Tesseract.js (PWA) → fallback AWS Textract
- **Observability**: PostHog (analytics) + Sentry (errors) + custom `/api/observability/*` endpoints
- **CI/CD**: GitHub Actions → Vercel (auto-deploy z `main`)

## 3. Kluczowe decyzje techniczne (i dlaczego tak)

| Decyzja | Powód |
|---|---|
| RLS FORCE na wszystkich tabelach | Zero-trust — nawet jeśli service_role wycieknie, RLS warstwuje ochronę |
| Encryption-at-rest dla PESEL/NIP/OCR | RODO art. 32 + ochrona przed dump leakiem |
| Server Actions zamiast `/api/*` REST | mniej boilerplate, automatyczny CSRF (double-submit cookie) |
| pgvector vs. zewnętrzny vector DB | jeden klaster — mniejszy ops, RAG-quality wystarczająca dla legal-knowledge |
| Tesseract.js w przeglądarce | OCR bez kosztu serwera, zero-PII na backend (preview tylko) |
| 17 case_type ENUM zamiast tabeli | typesafety w TS + RLS policy może indeksować po wartości |
| Magic-link zamiast hasła | mniejszy attack surface, brak password reset infra |
| brak password reset infra |
| Jedna apka zamiast monorepo | < 5 deweloperów = monorepo to overhead |

## 4. Dostępy potrzebne nowemu inżynierowi

Wnioskuj u **tech-lead@dlugomat.pl** (lub osoby z sekcji 7).

| System | Co dokładnie | Priorytet |
|---|---|---|
| GitHub `walerys1003/D-ugomatMaj2026` | write + PR review | krytyczny |
| Vercel team | dev + preview deploy + env vars | krytyczny |
| Supabase project | studio access (NIE service_role do logowania) | krytyczny |
| 1Password / vault | sekrety produkcyjne (`APP_ENCRYPTION_KEY`, `BACKUP_ENC_KEY`) | krytyczny |
| Stripe Dashboard | view + test webhook replay | wysoki |
| PostHog | view + dashboards + edit | wysoki |
| Sentry | view issues + assign | wysoki |
| Resend / SMSAPI / Fakturownia | view logs (dla debugu wysyłek) | średni |
| AWS Console (S3 backups) | read-only na `dlugomat-prod-backups` | średni |
| Slack `#engineering`, `#incidents`, `#perf` | dołączyć | krytyczny |

## 5. Workflow developerski

### 5.1 Dev loop

```bash
git checkout -b feat/short-description main
cd apps/web && npm run dev    # http://localhost:3000

# Edycja kodu...
npm run lint && npm run typecheck && npm run test
npm run build                  # weryfikacja prod build

git add -p && git commit -m "feat(scope): krótko"
git push origin feat/...
# Otwórz PR → main, czekaj na CI green + review
```

### 5.2 CI gate (`.github/workflows/ci.yml`)

PR nie merguje się jeśli któreś z **4 jobów** zawiedzie:

1. **lint-typecheck** — ESLint strict + `tsc --noEmit`
2. **unit-tests** — Jest (apps/web/tests)
3. **build** — `next build` ze stub Supabase env (sanity)
4. **migration-lint** — sprawdza nazwę plików w `supabase/migrations/` (`YYYYMMDDHHMMSS_name.sql`) + duplikaty timestampów

### 5.3 Deploy

- **Preview**: każdy PR → unique URL (Vercel auto)
- **Produkcja**: merge do `main` → automatyczny deploy
- **Rollback**: Vercel → Deployments → poprzedni SHA → "Promote to Production"

## 6. Najważniejsze runbooki

Pełna lista incydentów: **`docs/RUNBOOK.md` §4**.

Skrót:

| Symptom | Co zrobić w 1 minutę |
|---|---|
| `/api/health` zwraca 5xx | Vercel logs → sprawdź Supabase. Status page: `/status` |
| Stripe webhook nie dochodzi | Stripe Dashboard → Webhooks → "Recent Deliveries" → resend |
| AI generuje błędne pisma | Rollback prompta w `/admin/prompty` (poprzednia wersja `is_active=true`) |
| OCR nagle bardzo niski confidence | env: `OCR_FORCE_TEXTRACT=1` na Vercel + redeploy |
| Cała baza padła | RUNBOOK §5.4 (PITR < 7 dni) lub §5.5 (S3 restore > 7 dni) |
| Refund spike | Admin → /admin/promocje → query `referral_clicks` po `ip_hash` |

## 7. Kontakty (UZUPEŁNIJ przed launchem)

> Lista placeholderów — pierwsze zadanie tech-leada PO launchu: zastąpić TBD realnymi danymi.

| Rola | Osoba | Kontakt |
|---|---|---|
| Tech Lead | TBD | tech-lead@dlugomat.pl |
| On-call (24/7) | TBD | +48 ___ ___ ___ (PagerDuty) |
| IOD (RODO) | TBD | rodo@dlugomat.pl |
| Security | TBD | security@dlugomat.pl |
| Product Owner | TBD | po@dlugomat.pl |
| CEO / Founder | TBD | TBD |

**Vendor escalation**:

| Vendor | Kanał | SLA |
|---|---|---|
| Supabase | support@supabase.io (Pro plan) | 24h |
| Vercel | Enterprise email | 4h |
| Stripe | dashboard ticket | 1 dzień roboczy |
| APIPod | support@apipod.ai | 24h |
| AWS (S3) | support case | wg planu (Business+) |

## 8. Co NIE jest skończone (Tier 6 backlog)

Pełna lista: **`docs/RUNBOOK.md` §10**.

Najbardziej krytyczne (do zrobienia w pierwszych 90 dniach po launchu):

- [ ] **`@sentry/nextjs` dependency** — config files są (Tier 5 zad. 248), brak `npm i`. Po `npm i @sentry/nextjs` Sentry zacznie zbierać błędy.
- [ ] **`posthog-js` dependency** — provider gotowy (Tier 5 zad. 247), brak `npm i`. Po instalacji + `NEXT_PUBLIC_POSTHOG_KEY` analytics ruszą.
- [ ] **D9 — Wymówki dla wierzyciela** (jeśli zatwierdzony przez biznes)
- [ ] **D10 — Subskrypcja monitoring komornik / BIK** (schema już w spec, code TBD)
- [ ] **`MAINTENANCE_MODE` flag + banner** (na czas Supabase PITR)
- [ ] **Cron `/api/cron/rodo-purge`** (hard-delete soft-deleted accounts po 30 dniach)
- [ ] **Visual regression** (Playwright snapshots)
- [ ] **Load test** 200 RPS (k6)
- [ ] **Sentry release tracking** w pipeline (po instalacji SDK)
- [ ] **DPA PDF generator** (template w `app/(marketing)/dpa/page.tsx` jako szablon)

## 9. Status zadań Tier 1–5

| Tier | Zakres | Status |
|---|---|---|
| Tier 1 (1–50) | Foundation: Next.js, Supabase, brand | ✅ 50/50 |
| Tier 2 (51–100) | Auth, panel, sprawy CRUD, OCR base | ✅ 50/50 |
| Tier 3 (101–150) | AI, generowanie, Stripe, Fakturownia | ✅ 50/50 |
| Tier 4 (151–200) | D1–D8 wizards, kalkulatory, panel admin | ✅ 50/50 |
| Tier 5 (201–250) | Production hardening, observability, RODO, marketing polish | ✅ 50/50 |
| **Razem** | | **✅ 250/250** |

## 10. Pierwszy tydzień nowego inżyniera — checklist

- [ ] Dzień 1: dostępy (sekcja 4) + lokalny dev environment
- [ ] Dzień 1: przeczytaj `RUNBOOK.md` (1h) + ten dokument (30 min)
- [ ] Dzień 2: wykonaj smoke test produkcji + sprawdź monitoring (PostHog + Sentry + Vercel logs)
- [ ] Dzień 2: zrób manualny E2E flow użytkownika (skaner → płatność testowa → PDF)
- [ ] Dzień 3: pierwszy bugfix lub small feature (small PR — pick "good first issue" w GitHub)
- [ ] Dzień 4: pair-programming z senior dev nad zadaniem z Tier 6 backlog
- [ ] Dzień 5: review + retrospektywa onboardingu — zaktualizuj ten dokument o braki

## 11. Filozofia kodu (przeczytaj zanim napiszesz pierwszy PR)

1. **TypeScript strict** — `any` to red flag w review.
2. **Server Actions > REST** — chyba że potrzebujesz raw HTTP (Stripe webhook).
3. **RLS jest twoim przyjacielem** — zawsze testuj jako anon + as authenticated user.
4. **CSRF na każdym mutate** — wzorzec: `useCsrfToken()` na kliencie + `assertCsrfFromFormData()` na serwerze.
5. **Brak PII w logach** — używaj `scrubPiiString()` z `lib/observability/sentry-config.ts`.
6. **Każda zmiana w DB → migracja** — nigdy nie edytuj prod schema z Supabase Studio.
7. **Każda zmiana w prompcie → nowa wersja** — `prompt_versions` tabela, `is_active=true` na nowej.
8. **Tarcza brand voice** — spokojny, konkretny, autorytatywny. Bez paniki, bez prawniczego żargonu.

---

**Last updated**: 2026-05-10
**Prepared by**: GenSpark AI Developer
**Reviewed by**: TBD (uzupełnij po pierwszym przeglądzie)
**Next review**: 30 dni po pierwszym launchu produkcyjnym
