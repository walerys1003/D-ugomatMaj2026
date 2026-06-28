# Długomat — Production Runbook & Handover (Tier 5 zad. 250)

> Ten dokument jest **operacyjnym handoverem** — opisuje, jak system jest
> zbudowany, jak go uruchomić, co monitorować i co robić, gdy coś się
> psuje. Adresat: zespół utrzymania, on-call inżynier, nowy developer.

## 1. Architektura — przegląd 30 sekund

```
┌────────────────────────────────────────────────────────────────────┐
│  Vercel Edge (CDN + middleware)                                    │
│   ├─ CSP nonce per request   ├─ Rate-limit per IP (120/min)        │
│   ├─ Supabase session refresh                                      │
│   └─ Route guards (/panel, /auth)                                  │
├────────────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router, RSC)                                      │
│   apps/web                                                         │
│    ├─ (marketing)/    public landing + SEO                         │
│    ├─ (auth)/         Supabase magic-link + email/pw               │
│    ├─ (panel)/        zalogowany użytkownik (sprawy, kalkulatory)  │
│    ├─ admin/          panel admina (RBAC: role='admin')            │
│    └─ api/            route handlers (Stripe, AI, RODO, cron)      │
├────────────────────────────────────────────────────────────────────┤
│  Supabase (Postgres 15 + RLS FORCE)                                │
│   ├─ Auth (magic-link, OAuth)                                      │
│   ├─ Storage (uploads, generated, internal)                        │
│   ├─ pgvector (legal_knowledge — RAG)                              │
│   └─ pgcrypto (encryption at rest dla PESEL/NIP/OCR)               │
├────────────────────────────────────────────────────────────────────┤
│  External                                                          │
│   ├─ APIPod → Claude Sonnet 4.5 / Haiku 4.5 / Opus 4.5             │
│   ├─ Stripe (Checkout + webhook)                                   │
│   ├─ Fakturownia (faktury VAT)                                     │
│   ├─ Resend (e-mail)                                               │
│   ├─ SMSAPI.pl (SMS)                                               │
│   ├─ AWS Textract (OCR fallback gdy Tesseract <70% confidence)     │
│   └─ ClamAV (skan plików — opcjonalny, REQUIRE_CLAMAV=1 w prod)   │
└────────────────────────────────────────────────────────────────────┘
```

## 2. Pierwszy deploy — checklist

### 2.1 Supabase

```bash
# 1) Utwórz nowy projekt na supabase.com
# 2) Połącz CLI
supabase link --project-ref <project-ref>

# 3) Push wszystkich migracji (kolejność wg numerów timestampów)
supabase db push

# 4) Sprawdź że są wszystkie tabele
psql "$SUPABASE_DB_URL" -c "\dt public.*"
# Oczekiwane: profiles, cases, documents, document_versions,
#             case_events, deadlines, notifications, payments,
#             invoices, ocr_results, legal_knowledge, prompt_templates,
#             prompt_versions, validation_runs, promo_codes,
#             promo_redemptions, referral_codes, referral_clicks,
#             referral_conversions
```

### 2.2 Środowiska / sekrety (Vercel)

Ustaw w Vercel → Settings → Environment Variables. **WSZYSTKIE poniżej są wymagane do działania w produkcji.**

| Klucz | Skąd | Środowisko |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | wszystkie |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | jw. | wszystkie |
| `SUPABASE_SERVICE_ROLE_KEY` | jw. | **prod + preview** |
| `APP_ENCRYPTION_KEY` | wygeneruj 32+ znaków: `openssl rand -base64 48` | **prod** |
| `APIPOD_API_KEY` | apipod.ai dashboard | prod |
| `APIPOD_BASE_URL` | `https://api.apipod.ai/v1` | prod |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | prod |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint signing secret | prod |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | prod |
| `FAKTUROWNIA_API_TOKEN` | fakturownia.pl | prod |
| `FAKTUROWNIA_DOMAIN` | `<your>.fakturownia.pl` | prod |
| `RESEND_API_KEY` | resend.com | prod |
| `RESEND_FROM_EMAIL` | `Długomat <kontakt@dlugomat.pl>` | prod |
| `SMSAPI_OAUTH_TOKEN` | smsapi.pl | prod |
| `SMSAPI_SENDER` | nadawca (max 11 znaków, np. "Dlugomat") | prod |
| `CRON_SECRET` | wygeneruj `openssl rand -hex 32` | prod |
| `REFERRAL_IP_SALT` | wygeneruj `openssl rand -hex 16` | prod |
| `CLAMAV_HOST` | host clamd (jeśli używasz) | prod (opt) |
| `CLAMAV_PORT` | `3310` | prod (opt) |
| `REQUIRE_CLAMAV` | `1` w prod jeśli host ustawiony | prod |
| `NEXT_PUBLIC_APP_URL` | `https://dlugomat.pl` | prod |
| `NEXT_PUBLIC_APP_VERSION` | `0.5.0` | prod |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (opcjonalne) GA4 | prod |
| `NEXT_PUBLIC_SENTRY_DSN` | (opcjonalne) Sentry | prod |

### 2.3 Stripe — webhooks

Stripe Dashboard → Developers → Webhooks → Add endpoint:

* URL: `https://dlugomat.pl/api/stripe/webhook`
* Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `invoice.payment_failed`
* Skopiuj `Signing secret` → `STRIPE_WEBHOOK_SECRET`

### 2.4 Vercel Cron

`vercel.json` definiuje cron `/api/cron/onboarding` (co godzinę). Po deployu zweryfikuj:

* Vercel → Project → Cron Jobs → status "Active"
* Sprawdź pierwszy run: Project → Logs → filter `cron`

### 2.5 Backfill embeddings (RAG)

```bash
# Po pierwszym deployu — wgraj embeddingi do legal_knowledge.
cd /home/user/webapp
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
APIPOD_API_KEY=... \
npx tsx scripts/embed-knowledge.ts
# Oczekiwane: ~50–100 chunków z embeddingiem 1536-dim.
```

### 2.6 Smoke test po deploy

```bash
./scripts/smoke-test.sh https://dlugomat.pl
# Exit 0 → green light, 1 → blok mergowania.
```

## 3. Monitoring — co i gdzie patrzeć

| Metryka | Źródło | Próg alarmu |
|---|---|---|
| `/api/health` 200 | Vercel Function Logs | brak 200 przez 2 min |
| `/api/status` overall | manualnie + Status Page | `down` przez 5 min |
| Supabase CPU / connections | Supabase Dashboard → Database | CPU > 80%, conn > 80% |
| AI cost / dzień | admin/pulpit (KPI tile) | dziennie > 200 zł |
| Failure rate Haiku validatora | admin/notyfikacje | > 25% / 1h |
| Czas pierwszej generacji | PostHog `ai_generation_completed.duration_ms` | p95 > 12 s |
| Płatności failed | admin/promocje (gdy spike) | > 5 / 30 min |
| Vercel error rate (5xx) | Vercel Analytics | > 1% / 5 min |
| Web Vitals (LCP/INP) | `/api/observability/vitals` logi | LCP p75 > 4 s |

## 4. Runbooks — najczęstsze incydenty

### 4.1 Stripe webhook nie dochodzi → faktury nie powstają

1. Stripe Dashboard → Webhooks → endpoint → "Recent Deliveries"
2. Jeśli 4xx: sprawdź signature secret (rotacja po refundach jest wymagana)
3. Jeśli 5xx: sprawdź Vercel Function Logs `/api/stripe/webhook` — szukaj exception
4. Manual replay: Stripe Dashboard → wybrane event → "Resend"
5. Manual repair: w bazie sprawdź `payments` (status `pending` >24h?), uruchom `node scripts/repair-payment.ts <session_id>`

### 4.2 AI generuje błędne pisma (validation_score < 0.5 dla > 10% spraw)

1. Sprawdź `validation_runs` w bazie — który checklist item failuje?
2. Otwórz admin → /admin/prompty → ostatnia wersja prompta dla case_type
3. Jeśli regresja: rollback do poprzedniej wersji (`prompt_versions.is_active`)
4. Jeśli to nowy regulamin / orzecznictwo: dodaj chunki do `legal_knowledge`, uruchom `embed-knowledge.ts`
5. Jeśli nadal źle: temporary fail-over → `AI_FORCE_OPUS=1` w env (drożej, ale lepsza jakość)

### 4.3 OCR nagle ma niski confidence → klienci skarżą się na błędy

1. PostHog → `ocr_low_confidence` rate (alert id `ocr_low_confidence_rate`)
2. Sprawdź czy to konkretny parser (Nakaz / Komornik / BIK) — `ocr_results.parser_id`
3. Włącz Textract fallback dla wszystkich (env: `OCR_FORCE_TEXTRACT=1`)
4. Otwórz ticket: `apps/web/lib/ocr/parsers/<parser>.ts` regex-y mogły zardzewieć

### 4.4 Supabase down → cała aplikacja down

1. Status Page Supabase: status.supabase.com
2. `/api/status` powinno pokazać `down` na komponencie "Supabase Postgres"
3. Wyświetl użytkownikom banner "Trwa konserwacja" — flag `MAINTENANCE_MODE=1` w env (jeśli implementowany; default: zostaw 5xx)
4. Po restorze: cron `/api/cron/onboarding` może mieć backlog 1–2h, ale rozjedzie się sam (idempotent)

### 4.5 Fraudulent referral spike

1. Admin → /admin/promocje (jeśli spike kuponami) lub query `referral_clicks` po `ip_hash` w SQL
2. Jeśli widzisz N kliknięć z 1 `ip_hash` → bot. Zmień `REFERRAL_IP_SALT` (rotacja zhashuje stary IP innym hashem) i `is_active=false` na podejrzany kod
3. Jeśli konwersje są fałszywe: `referral_conversions.status='rejected'` z `rejection_reason='fraud_suspected'`

## 5. Backup / disaster recovery (zad. 208–209)

### 5.1 Strategia 3-2-1

* **Source 1 — Supabase managed PITR**: nightly automatic + Point-in-Time Recovery 7 dni (Pro plan).
* **Source 2 — Off-site S3 (zad. 208)**: GitHub Actions workflow `.github/workflows/backup-postgres.yml`
  uruchamia `pg_dump` codziennie o 02:30 UTC, kompresuje gzip-9, szyfruje AES-256-CBC (PBKDF2, 100k iteracji)
  i wysyła do `s3://${BACKUP_BUCKET}/postgres/YYYY/MM/dlugomat-<stamp>.sql.gz.enc`.
  Retencja: 30 dni przez S3 Lifecycle policy.
* **Source 3 — kod**: GitHub repo + Vercel deployment history (każdy SHA jest natychmiast promotable).

### 5.2 RTO / RPO

| Scenariusz | RTO | RPO | Procedura |
|---|---|---|---|
| Bug w deploy | 5 min | 0 | Vercel rollback (`Promote to Production` na poprzednim SHA) |
| Korupcja danych < 7 dni | 1 h | 1 h | Supabase PITR (sekcja 5.4) |
| Korupcja danych > 7 dni / utrata projektu Supabase | 4 h | 24 h | Restore z S3 (sekcja 5.5) |
| Region AWS down (S3 niedostępny) | 8 h | 24 h | Cross-region S3 replikacja (TODO Tier 6) — fallback: GitHub Actions retrigger backupu z najświeższego dump-a |

### 5.3 Wymagane sekrety GitHub Actions (workflow backup)

W repo Settings → Secrets and variables → Actions:

| Sekret | Skąd / format |
|---|---|
| `SUPABASE_DB_HOST` | Supabase Dashboard → Project Settings → Database → Host (np. `db.<ref>.supabase.co`) |
| `SUPABASE_DB_PORT` | `5432` (lub `6543` dla pgbouncer — **dla pg_dump używaj 5432**) |
| `SUPABASE_DB_USER` | `postgres` |
| `SUPABASE_DB_NAME` | `postgres` |
| `SUPABASE_DB_PASSWORD` | hasło z reset password w Database settings |
| `BACKUP_AWS_ACCESS_KEY_ID` | IAM user z policy: `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` na `BACKUP_BUCKET` |
| `BACKUP_AWS_SECRET_ACCESS_KEY` | jw. |
| `BACKUP_AWS_REGION` | np. `eu-central-1` (Frankfurt — bliżej PL i RODO-friendly) |
| `BACKUP_S3_BUCKET` | nazwa bucketu (np. `dlugomat-prod-backups`) |
| `BACKUP_ENC_KEY` | passphrase: `openssl rand -base64 64` — **zachowaj w 1Password / vault, BEZ niej restore niemożliwy** |

### 5.4 Procedura: PITR < 7 dni

1. Wykryj incydent (mail, alert, ticket) → określ przybliżony timestamp UTC **przed** problemem.
2. Vercel → Project → Settings → Environment → włącz `MAINTENANCE_MODE=1` (jeśli zaimplementowany)
   lub po prostu zatrzymaj produkcyjny domain alias.
3. Supabase Dashboard → Database → **Point in Time Recovery** → wybierz timestamp.
4. Poczekaj na completion (kilka–kilkanaście minut zależnie od rozmiaru).
5. Smoke test: `./scripts/smoke-test.sh https://dlugomat.pl` — exit 0 = OK.
6. Wyłącz `MAINTENANCE_MODE`, ogłoś post-mortem w `#incidents`.

### 5.5 Procedura: Restore z S3 (DR > 7 dni / utrata projektu)

```bash
# === Krok 1: pobierz najświeższy szyfrowany dump z S3 ===
export AWS_ACCESS_KEY_ID="<...>"
export AWS_SECRET_ACCESS_KEY="<...>"
export AWS_DEFAULT_REGION="eu-central-1"
export BUCKET="dlugomat-prod-backups"

# Lista 5 najnowszych dumpów
aws s3 ls "s3://$BUCKET/postgres/" --recursive | sort | tail -5

# Pobierz wybrany
aws s3 cp "s3://$BUCKET/postgres/2026/05/dlugomat-2026-05-09T02-30-00Z.sql.gz.enc" .

# === Krok 2: deszyfracja ===
export BACKUP_ENC_KEY="<wartość z vault>"
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in dlugomat-2026-05-09T02-30-00Z.sql.gz.enc \
  -out dlugomat.sql.gz \
  -pass pass:"$BACKUP_ENC_KEY"

gunzip dlugomat.sql.gz
# → dlugomat.sql (plain SQL, ~kilkadziesiąt MB)

# === Krok 3: utwórz nowy projekt Supabase (jeśli stary stracony) ===
# supabase.com → New Project → zapisz nowy ref + hasło DB

# === Krok 4: restore ===
# UWAGA: dump zawiera --clean --if-exists, więc nadpisuje schema.
# Wykonaj na ŚWIEŻYM projekcie lub po --confirmation jeśli na istniejącym.
psql "postgresql://postgres:<password>@db.<new-ref>.supabase.co:5432/postgres" \
  -v ON_ERROR_STOP=1 \
  -f dlugomat.sql

# === Krok 5: weryfikacja ===
psql "$URL" -c "SELECT count(*) FROM cases;"
psql "$URL" -c "SELECT count(*) FROM profiles;"
psql "$URL" -c "SELECT max(created_at) FROM case_events;"
# → spodziewaj się utraty max 24h najnowszych danych (RPO)

# === Krok 6: przepnij Vercel env ===
# NEXT_PUBLIC_SUPABASE_URL → nowy URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY → z nowego projektu
# SUPABASE_SERVICE_ROLE_KEY → z nowego projektu
# Vercel → Redeploy bez cache.

# === Krok 7: backfill embeddings + smoke ===
npx tsx scripts/embed-knowledge.ts
./scripts/smoke-test.sh https://dlugomat.pl
```

### 5.6 Drill (ćwiczenie DR)

Co kwartał (Q1/Q2/Q3/Q4) zespół wykonuje **DR drill**:

1. Trigger workflow `backup-postgres.yml` ręcznie (`workflow_dispatch`).
2. Pobierz świeży dump na maszynę inżyniera.
3. Restore na lokalny Postgres 15 (`docker run postgres:15`).
4. Wykonaj 5 query-sanity (count tabel, sample row z każdej kluczowej).
5. Wpisz wynik do `docs/dr-drills.md` (data, czas trwania, problemy).

**Cel**: udowodnić że dump jest realnie restorowalny — backup bez sprawdzonego restore = brak backupu.

## 6. RODO — operations

### 6.1 Wniosek o eksport danych
* Klient → /panel/ustawienia/rodo → przycisk "Pobierz moje dane"
* Endpoint: `/api/rodo/export` (zwraca ZIP z JSON-em wszystkich tabel)
* SLA: 30 dni (RODO art. 12.3); my realizujemy < 5 minut (synchroniczny)

### 6.2 Wniosek o usunięcie konta
* Klient → /panel/ustawienia/rodo → "Usuń konto"
* Soft delete: `profiles.deleted_at = now()`, blokada loginów
* Po 30 dniach: hard delete + cascade (profiles → cases → documents)
* Cron `/api/cron/rodo-purge` (TODO: do dodania w Tier 6) realizuje hard-delete

### 6.3 Wniosek z e-maila (manualnie)
* Email na `rodo@dlugomat.pl` → potwierdź tożsamość → wykonaj wniosek z poziomu `admin`
* Loguj w `case_events` (action='rodo_request', performed_by_admin=...)

## 7. Sekrety — rotacja

| Sekret | Częstotliwość | Procedura |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | po każdym refund flow | Stripe Dashboard → Roll secret → update Vercel env → redeploy |
| `SUPABASE_SERVICE_ROLE_KEY` | co 90 dni | Supabase Dashboard → API → "Reset service_role" → update Vercel env → redeploy |
| `APP_ENCRYPTION_KEY` | **NIGDY** (rotacja wymaga re-encryption migration) | osobny runbook (TODO Tier 6) |
| `CRON_SECRET` | co 90 dni | wygeneruj nowy → update Vercel env → update vercel.json (jeśli inline) |
| `REFERRAL_IP_SALT` | co 30 dni (anty-fraud) | wygeneruj nowy → update env → stare ip_hash przestają być porównywalne |

## 8. Performance budget

| Metryka | Budget | Mierzone |
|---|---|---|
| LCP (landing) | < 2.5s na 3G Fast | Lighthouse CI (`lighthouserc.json`) |
| INP | < 200ms | web-vitals beacon |
| CLS | < 0.1 | web-vitals beacon |
| AI generation p95 | < 12s | PostHog `ai_generation_completed.duration_ms` |
| OCR Tesseract p50 | < 5s | `ocr_results.duration_ms` |
| Bundle size (route /panel) | < 400 KB JS | `next build` output |

## 9. Kontakty (handover)

> **Wypełnij przed wdrożeniem produkcyjnym.** Te pola są placeholderami.

* **Tech lead / on-call**: TBD
* **Security / RODO IOD**: rodo@dlugomat.pl
* **Vendor escalation**:
  * Supabase: support@supabase.io (Pro plan SLA 24h)
  * Stripe: dashboard ticket
  * Vercel: Enterprise support email
  * APIPod: support@apipod.ai

## 10. Rzeczy odłożone na Tier 6

* [ ] Off-site backup script (S3 + object-lock)
* [ ] `MAINTENANCE_MODE` flag + banner
* [ ] Cron `/api/cron/rodo-purge` (hard-delete soft-deleted accounts)
* [ ] Sentry SDK setup (helper `sentry-config.ts` już istnieje, brak `npm i`)
* [ ] PostHog SDK setup (taxonomy `posthog-events.ts` już istnieje)
* [ ] D9 — moduł "Wymówki dla wierzyciela" (jeśli zatwierdzony przez biznes)
* [ ] D10 — subskrypcja monitoring komornik / BIK (schema już w spec, code TBD)
* [ ] Visual regression tests (Playwright snapshots)
* [ ] Load test 200 RPS (k6 / Locust)

---

**Last updated**: 2026-05-10
**Prepared by**: GenSpark AI Developer
**Reviewed by**: TBD
