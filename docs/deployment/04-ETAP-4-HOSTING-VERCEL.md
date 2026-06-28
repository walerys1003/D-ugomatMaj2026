# ETAP 4 — Hosting na Vercel (produkcja „w sieci")

> **Cel:** wdrożyć aplikację na Vercel, podpiąć domenę `dlugomat.pl` + SSL, ustawić wszystkie
> zmienne środowiskowe produkcyjne, **wyłączyć DEV-PREVIEW** i potwierdzić, że całość działa online.
> **Czas:** 2–3 h. **Trudność:** średnia.

⬅️ [ETAP 3](./03-ETAP-3-INTEGRACJE-ZEWNETRZNE.md) · [Indeks](./README.md) · Dodatki → [Matryca modeli](./05-MATRYCA-ROUTINGU-MODELI.md) · [Architektura/ryzyka](./06-ARCHITEKTURA-AI-I-RYZYKA.md)

---

## 4.1. Założenia

- Aplikacja to Next.js 14 (App Router, **SSR**) → Vercel jest naturalnym hostem.
- Repo to **monorepo** (npm workspaces); aplikacja siedzi w `apps/web`.
- Skrypty (`apps/web/package.json`): `build = next build`, `start = next start -p 3000`.

---

## 4.2. ZADANIE 4.1 — Import projektu do Vercel

1. <https://vercel.com> → **Add New → Project** → zaimportuj repo z GitHub
   (`walerys1003/D-ugomatMaj2026`).
2. **Root Directory:** ustaw `apps/web` (bo to monorepo!).
3. **Framework Preset:** Next.js (auto-detect).
4. **Build Command:** `next build` (domyślnie).
5. **Install Command:** Vercel wykryje workspaces; jeśli nie — `npm install`.
6. **Node.js Version:** 20.x (Project Settings → General).

> Alternatywa przez CLI:
> ```bash
> npm i -g vercel
> cd apps/web
> vercel link
> vercel --prod
> ```

---

## 4.3. ZADANIE 4.2 — Zmienne środowiskowe produkcyjne

W **Project Settings → Environment Variables** (scope: **Production**) wpisz **wszystkie** klucze
zebrane w ETAPACH 1–3. Pełna lista wynika z `apps/web/.env.example`. Minimalny komplet:

```bash
# Aplikacja
NEXT_PUBLIC_APP_URL=https://dlugomat.pl

# Supabase (ETAP 1)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI — Featherless + Claude (ETAP 2)
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
ANTHROPIC_API_KEY=...
# (opcjonalnie gateway APIPod — patrz .env.example)
APIPOD_API_KEY=...
APIPOD_BASE_URL=https://gateway.apipod.ai/anthropic

# Stripe (ETAP 3)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# Fakturownia (ETAP 3)
FAKTUROWNIA_API_TOKEN=...
FAKTUROWNIA_DOMAIN=dlugomat
SELLER_NIP=...

# Resend + SMS (ETAP 3)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Długomat <powiadomienia@dlugomat.pl>
RESEND_REPLY_TO=pomoc@dlugomat.pl
SMSAPI_OAUTH_TOKEN=...
SMSAPI_SENDER=Dlugomat

# Bezpieczeństwo / CRON (ETAP 3)
CRON_SECRET=...
APP_ENCRYPTION_KEY=...
CLAMAV_HOST=...
CLAMAV_PORT=3310
REQUIRE_CLAMAV=1
REFERRAL_IP_SALT=...

# Monitoring (ETAP 3)
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# Radca prawny (opcjonalne — patrz docs/RADCA_CONSENT_CHECKLIST.md)
NEXT_PUBLIC_RADCA_ENABLED=false
```

> 🔴 Zwróć uwagę na scope: klucze `NEXT_PUBLIC_*` są widoczne w przeglądarce — to OK dla
> publishable/DSN, **NIGDY** nie dawaj tam sekretów (service_role, secret keys).

---

## 4.4. ZADANIE 4.3 — 🔴 Wyłączyć DEV-PREVIEW na produkcji

DEV-PREVIEW (`apps/web/lib/dev/preview.ts`) pozwala podglądać panele bez Supabase. Ma **podwójny
bezpiecznik**:

```ts
// apps/web/lib/dev/preview.ts:23
export const DEV_PREVIEW_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_PREVIEW === "1";
```

Czyli na Vercel (gdzie `NODE_ENV=production`) jest **automatycznie wyłączony** — nawet gdyby ktoś
przypadkiem ustawił flagę. Mimo to, dla pewności:

- [ ] **NIE** dodawaj `NEXT_PUBLIC_DEV_PREVIEW` do zmiennych Production w Vercel.
- [ ] Upewnij się, że `apps/web/.env.local` (z `NEXT_PUBLIC_DEV_PREVIEW=1`) **nie** jest commitowany
      (jest w `.gitignore` — zweryfikuj: `git check-ignore apps/web/.env.local`).

---

## 4.5. ZADANIE 4.4 — Domena + SSL

1. **Project Settings → Domains** → dodaj `dlugomat.pl` i `www.dlugomat.pl`.
2. W DNS rejestratora ustaw rekordy wskazane przez Vercel (A/CNAME).
3. SSL (Let's Encrypt) Vercel wystawi automatycznie po propagacji DNS.
4. Ustaw przekierowanie `www` → apex (lub odwrotnie) wg preferencji.
5. Zaktualizuj URL-e zależne od domeny:
   - [ ] Stripe webhook → `https://dlugomat.pl/api/stripe/webhook`
   - [ ] Resend domena + SPF/DKIM/DMARC dla `dlugomat.pl`
   - [ ] `NEXT_PUBLIC_APP_URL=https://dlugomat.pl`

---

## 4.6. ZADANIE 4.5 — Deploy + weryfikacja produkcyjna

```bash
# deploy produkcyjny (jeśli przez CLI)
cd apps/web && vercel --prod
```

**Checklista po deployu (smoke test produkcji):**
- [ ] `https://dlugomat.pl` ładuje się, SSL zielony.
- [ ] Rejestracja + logowanie (Supabase Auth) działa.
- [ ] Generacja testowego pisma E2E (Featherless → weryfikacja cytatów → ewentualny fallback Claude).
- [ ] Płatność testowa Stripe → webhook 200 → faktura Fakturownia → e-mail Resend.
- [ ] SMS przypomnienia (CRON/`deadline-cron`) wysyłają się.
- [ ] Sentry zbiera błędy (wywołaj kontrolowany błąd).
- [ ] RLS: drugi użytkownik nie widzi cudzych danych (test izolacji z ETAPU 1).
- [ ] DEV-PREVIEW **wyłączony** (panele wymagają realnego logowania).

---

## 4.7. ZADANIE 4.6 — Po wdrożeniu (operacje)

- [ ] Ustaw **alerty** w Sentry (błędy krytyczne → Slack/e-mail).
- [ ] Zaplanuj **rotację sekretów** wg `docs/SECRETS_ROTATION.md`.
- [ ] Skonfiguruj **backupy** bazy Supabase (Point-in-Time Recovery na płatnym planie).
- [ ] Przejrzyj `docs/RUNBOOK.md` i `docs/DR_PLAYBOOK.md` (procedury awaryjne).
- [ ] Włącz monitoring kosztów AI (token-tracker → dashboard).

---

## 4.8. Definition of Done — ETAP 4 (i całego wdrożenia)

- [ ] Aplikacja dostępna pod `https://dlugomat.pl`, SSL OK.
- [ ] Wszystkie zmienne Production ustawione w Vercel.
- [ ] DEV-PREVIEW wyłączony na produkcji (potwierdzone).
- [ ] Pełny przepływ biznesowy działa E2E (auth → pismo → płatność → faktura → powiadomienia).
- [ ] Sentry zbiera błędy; backupy i alerty skonfigurowane.
- [ ] Wszystkie zmiany na `genspark_ai_developer`, PR #1 zaktualizowany.

🎉 **Po odhaczeniu — Długomat jest w sieci.**
