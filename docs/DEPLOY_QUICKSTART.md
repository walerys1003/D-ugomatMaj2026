# Długomat — Deploy Quickstart (Vercel + Supabase)

Najszybsza ścieżka z zera do działającej produkcji. Czas: **~2–4 h**.
Stack: **baza = Supabase**, **hosting = Vercel**, monorepo (`apps/web`).

> Pełna lista kontrolna pre-launch: [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)
> Szczegółowe etapy: [`docs/deployment/`](./deployment/)
> Skrypt prowadzący: [`scripts/deploy.sh`](../scripts/deploy.sh)

---

## TL;DR — kolejność komend

```bash
# 0. Narzędzia (raz)
npm i -g vercel supabase

# 1. Skrypt prowadzący krok-po-kroku (zalecane)
bash scripts/deploy.sh

# ...albo ręcznie:

# 2. Baza danych — Supabase
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push                      # uruchamia 57 migracji z supabase/migrations/

# 3. Hosting — Vercel
vercel link                           # Root Directory = apps/web (WAŻNE w monorepo)
#   → dodaj zmienne ENV (sekcja niżej)
vercel --prod                         # deploy produkcyjny
```

---

## Krok 1 — Supabase (baza danych)

1. Utwórz projekt: https://supabase.com/dashboard → **New project** (region: `eu-central-1` / Frankfurt — RODO).
2. Skopiuj dane z **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (sekret!) → `SUPABASE_SERVICE_ROLE_KEY`
   - Reference ID (Settings → General) → `<PROJECT_REF>`
3. Uruchom migracje:
   ```bash
   supabase login
   supabase link --project-ref <PROJECT_REF>
   supabase db push
   ```
   To utworzy cały schemat (profiles, cases, documents, ocr_results, subscriptions, deadlines, support_tickets, ...).
4. (Opcjonalnie) Edge Functions:
   ```bash
   supabase functions deploy deadline-cron image-resize push-fanout scheduled-cleanup
   ```
5. (Opcjonalnie) wygeneruj świeże typy TS:
   ```bash
   cd apps/web && SUPABASE_PROJECT_ID=<PROJECT_REF> npm run gen:types
   ```

---

## Krok 2 — Vercel (hosting)

1. `vercel link` → wybierz/utwórz projekt.
2. **W panelu Vercel: Settings → General → Root Directory = `apps/web`** (monorepo!).
3. Framework Preset: **Next.js** (autodetekcja). Build: `next build`. Install: `npm install` (root).
4. Dodaj zmienne ENV (poniżej), potem `vercel --prod`.
5. Domena: Settings → Domains → dodaj `dlugomat.pl` i ustaw DNS wg instrukcji Vercel.

---

## Krok 3 — Zmienne środowiskowe (ENV)

### 🔴 WYMAGANE — serwer produkcyjny **NIE WSTANIE** bez nich
**Źródło prawdy: [`apps/web/lib/env.ts`](../apps/web/lib/env.ts)** (`assertEnv()` w instrumentation hook
rzuca błąd na starcie w `NODE_ENV=production`). Potwierdzone runtime — `next start`
bez tych zmiennych kończy się `[env] Walidacja środowiska nie powiodła się`.

| Zmienna | Skąd wziąć |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (sekret) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks (`whsec_...`) |
| `CRON_SECRET` | `openssl rand -hex 32` (chroni `/api/cron/*`) |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` (**min. 32 znaki**) |
| **Backend AI** — JEDEN z dwóch: | |
| → `ANTHROPIC_API_KEY` | Anthropic Console (bezpośrednio) |
| → **albo** `APIPOD_API_KEY` + `APIPOD_BASE_URL` | Gateway APIPod (rate-limit/retry) |

> Reguła krzyżowa z `lib/env.ts`: musi istnieć **przynajmniej jeden** backend AI
> (`ANTHROPIC_API_KEY` **lub** komplet `APIPOD_API_KEY`+`APIPOD_BASE_URL`),
> inaczej build/boot rzuci: „Brak skonfigurowanego backendu AI".

`NEXT_PUBLIC_APP_URL` jest opcjonalne (domyślnie `http://localhost:3000`), ale na
produkcji **ustaw je** na `https://dlugomat.pl` (poprawne linki w mailach, OG, sitemap).

### 🟡 ZALECANE — brak = ostrzeżenie (deploy przejdzie), ale ryzyko

| Zmienna | Konsekwencja braku |
|---|---|
| `AI_USAGE_DAILY_CAP_USD` | **brak dziennego limitu kosztów AI** (soft-warn z env.ts) |
| `AI_USAGE_CASE_CAP_USD` | brak limitu kosztu AI na sprawę |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | rate-limit in-memory (nieskuteczny przy >1 instancji — Vercel skaluje!) |

### 🟢 WAŻNE dla pełnej funkcjonalności (brak = dana funkcja wyłączona)

| Zmienna | Funkcja gdy brak |
|---|---|
| `AWS_REGION` `AWS_ACCESS_KEY_ID` `AWS_SECRET_ACCESS_KEY` | Textract — OCR PDF fallback (obrazki/Tesseract działają bez tego) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Checkout (frontend) |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | E-maile transakcyjne / przypomnienia |
| `SMSAPI_OAUTH_TOKEN` + `SMSAPI_SENDER` | SMS D3/D1/D0 |
| `FAKTUROWNIA_API_TOKEN` + `FAKTUROWNIA_DOMAIN` | Automatyczne faktury VAT |
| `REFERRAL_IP_SALT` | Anty-fraud poleceń — `openssl rand -hex 16` |

### 🔵 OPCJONALNE — monitoring / dodatki

| Zmienna | Funkcja |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` `SENTRY_AUTH_TOKEN` `SENTRY_ORG` `SENTRY_PROJECT` | Monitoring błędów |
| `CLAMAV_HOST` `CLAMAV_PORT` `REQUIRE_CLAMAV` | Antywirus uploadów |
| `NEXT_PUBLIC_RADCA_ENABLED` + dane radcy | Sekcja radcy prawnego (domyślnie off) |

### Dodawanie ENV na Vercel

Interaktywnie:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```
Hurtowo z lokalnego `.env.production`:
```bash
while IFS='=' read -r k v; do
  [[ "$k" =~ ^[A-Z] ]] && echo "$v" | vercel env add "$k" production
done < .env.production
```

---

## Krok 4 — Stripe webhook (po deployu)

Stripe → Developers → Webhooks → **Add endpoint**:
- URL: `https://dlugomat.pl/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`, `payment_intent.payment_failed`
- Skopiuj `whsec_...` → ustaw `STRIPE_WEBHOOK_SECRET` i redeploy.

---

## Krok 5 — Smoke test po deployu

```bash
curl https://dlugomat.pl/api/health          # → {"ok":true,"service":"..."}
```
Ręcznie w przeglądarce:
- `/sign-up` → rejestracja, `/sign-in` → logowanie (Supabase Auth, grupa tras `(auth)`)
- `/panel/skaner` → upload zdjęcia/PDF → OCR → wynik
- `/panel/moje-zadluzenie/kreator` → wygenerowanie pisma
- `/panel/dokumenty` → odczyt/pobranie

---

## Najczęstsze pułapki

| Objaw | Przyczyna | Rozwiązanie |
|---|---|---|
| Build na Vercel: „Brakujące zmienne środowiskowe" | brak 1 z 7 wymaganych | dodaj ENV w panelu Vercel |
| 404 na wszystkich stronach | zły Root Directory | ustaw `apps/web` |
| Logowanie nie działa | zły Supabase URL/anon | sprawdź ENV + Auth → URL Configuration (dodaj domenę do Redirect URLs) |
| OCR PDF nie działa | brak AWS Textract | dodaj `AWS_*` (obrazki działają bez tego) |
| Płatność nie potwierdza | brak/zły webhook | popraw `STRIPE_WEBHOOK_SECRET` + endpoint |
| Puste dane mimo logowania | migracje nie uruchomione | `supabase db push` |
