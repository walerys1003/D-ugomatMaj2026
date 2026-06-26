# ETAP 3 — Integracje zewnętrzne (płatności, faktury, powiadomienia, monitoring, bezpieczeństwo)

> **Cel:** podpiąć wszystkie usługi zewnętrzne, których wymaga produkcja: Stripe, Fakturownia,
> Resend, SMSAPI, Sentry, ClamAV oraz klucze szyfrujące / CRON.
> **Czas:** ~1 dzień. **Trudność:** średnia (głównie konfiguracja kont + klucze).

⬅️ [ETAP 2](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md) · [Indeks](./README.md) · Następny → [ETAP 4: Hosting Vercel](./04-ETAP-4-HOSTING-VERCEL.md)

> To największy obszar braków w projekcie (gotowość integracji ~40%). Wszystkie zmienne są już
> udokumentowane w `apps/web/.env.example` — ta sekcja prowadzi Cię przez **każdą** z nich.

---

## 3.1. Stripe — płatności (Tier 4.1+4.2)

Kod używa SDK `stripe` (dodane w [ETAP 0](./00-ETAP-0-ODBLOKOWANIE-BUILDU.md)). Pliki:
`apps/web/lib/billing/*.ts`, `apps/web/lib/coupons/coupon-engine.ts`,
endpoint webhooka: `apps/web/app/api/stripe/webhook/route.ts` (sprawdź ścieżkę: `grep -rn "stripe/webhook" apps/web/app`).

### ZADANIE 3.1 — Konto + klucze
1. Załóż konto na <https://dashboard.stripe.com> (firma PL, VAT 23%).
2. **Developers → API keys** → skopiuj `Secret key` i `Publishable key`.
3. Ustaw w env:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...            # SEKRET
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

### ZADANIE 3.2 — Webhook
1. **Developers → Webhooks → Add endpoint**
   - URL: `https://dlugomat.pl/api/stripe/webhook`
   - Events (z `.env.example`):
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `charge.refunded`, `payment_intent.payment_failed`
2. Skopiuj **Signing secret**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...          # SEKRET
   ```

> ℹ️ Cennik jest w `apps/web/lib/payments/pricing.ts` (single source of truth). Checkout używa
> inline `price_data` — **nie** potrzebujesz Stripe Price IDs.

### Test
- Tryb **test** (`sk_test_`): zrób testową płatność kartą `4242 4242 4242 4242`.
- Zweryfikuj, że webhook dotarł (Stripe Dashboard → Webhooks → Recent deliveries = 200).

---

## 3.2. Fakturownia — faktury VAT PL (Tier 4.3)

Generowanie PDF korzysta z `pdf-lib` (ETAP 0). Pliki: `apps/web/lib/invoices/invoice-generator.ts`.

### ZADANIE 3.3
1. Załóż konto <https://app.fakturownia.pl>.
2. **Ustawienia → API** → wygeneruj token.
3. Domena = subdomena Twojego konta (np. `dlugomat` dla `dlugomat.fakturownia.pl`).
4. Env:
   ```bash
   FAKTUROWNIA_API_TOKEN=...                # SEKRET
   FAKTUROWNIA_DOMAIN=dlugomat
   SELLER_NIP=<NIP sprzedawcy>              # opcjonalne, ale zalecane
   ```

### Test
- Po testowej płatności Stripe sprawdź, czy faktura VAT 23% powstała w panelu Fakturowni.

---

## 3.3. Resend — e-mail transakcyjny (Tier 5.4)

### ZADANIE 3.4
1. Konto <https://resend.com>.
2. **Domain** → dodaj `dlugomat.pl`, ustaw **SPF / DKIM / DMARC** w DNS (krytyczne dla dostarczalności).
3. **API Keys** → osobny klucz dla prod i staging.
4. Env:
   ```bash
   RESEND_API_KEY=re_...                    # SEKRET
   RESEND_FROM_EMAIL=Długomat <powiadomienia@dlugomat.pl>
   RESEND_REPLY_TO=pomoc@dlugomat.pl
   ```

### Test
- Wyślij testowe powiadomienie (np. potwierdzenie rejestracji). Sprawdź dostarczalność (nie SPAM).

---

## 3.4. SMSAPI.pl — SMS (Tier 5.4)

> RODO-compliant, dane w PL. Używane do przypomnień o terminach D3/D1/D0.

### ZADANIE 3.5
1. Konto <https://smsapi.pl>.
2. **Ustawienia → API → OAuth2** → wygeneruj długi token (zalecane bez expiry).
3. Zarejestruj pole nadawcy (3–11 znaków, np. `Dlugomat`).
4. Env:
   ```bash
   SMSAPI_OAUTH_TOKEN=...                   # SEKRET
   SMSAPI_SENDER=Dlugomat
   ```

---

## 3.5. CRON / Edge Functions (Tier 5.4)

Funkcje brzegowe są w `supabase/functions/` (`deadline-cron`, `image-resize`, `push-fanout`, `scheduled-cleanup`).
`deadline-cron` woła `POST /api/notifications/dispatch` z nagłówkiem `Authorization: Bearer <CRON_SECRET>`.

### ZADANIE 3.6
1. Wygeneruj sekret:
   ```bash
   openssl rand -hex 32
   ```
2. Env:
   ```bash
   CRON_SECRET=<wygenerowany sekret>        # SEKRET
   ```
3. Wdróż funkcje brzegowe:
   ```bash
   supabase functions deploy deadline-cron
   supabase functions deploy scheduled-cleanup
   # itd. dla pozostałych
   ```
4. Ustaw harmonogram (Supabase → **Database → Cron** lub `pg_cron`) wywołujący `deadline-cron`.

---

## 3.6. Szyfrowanie at-rest — APP_ENCRYPTION_KEY (Tier 5 zad. 207)

Migracja `20260510160000_pgcrypto_encryption.sql` używa pgcrypto (AES-256) do szyfrowania danych wrażliwych.

### ZADANIE 3.7
1. Wygeneruj klucz (≥32 znaki):
   ```bash
   openssl rand -base64 48
   ```
2. Env:
   ```bash
   APP_ENCRYPTION_KEY=<wygenerowany klucz>  # SEKRET — rotacja wymaga re-encryption migration
   ```

> ⚠️ **Rotacja klucza** wymaga osobnej migracji re-encryption — patrz `docs/RUNBOOK.md` i
> `docs/SECRETS_ROTATION.md`. **Nie zmieniaj** klucza po wdrożeniu bez tej procedury — utracisz dostęp do danych.

---

## 3.7. ClamAV — skanowanie plików (Tier 5 zad. 205)

Skanuje uploadowane pliki (skany pism, dowody) antywirusowo (INSTREAM).

### ZADANIE 3.8
1. Postaw ClamAV (np. kontener `clamav/clamav`) dostępny dla aplikacji.
2. Env:
   ```bash
   CLAMAV_HOST=<host clamd>
   CLAMAV_PORT=3310
   REQUIRE_CLAMAV=1   # 🔴 fail-closed na produkcji: odrzuć upload, gdy ClamAV niedostępny (ZALECANE)
   ```

> 🔴 Na produkcji ustaw `REQUIRE_CLAMAV=1`. Inaczej przy awarii skanera pliki przejdą bez kontroli.

---

## 3.8. Sentry — monitoring błędów (Tier 5 zad. 248)

Pakiet `@sentry/nextjs` jest już w zależnościach.

### ZADANIE 3.9
1. Konto/projekt <https://sentry.io>.
2. Env:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=<public DSN>      # pusty → Sentry wyłączony
   SENTRY_AUTH_TOKEN=...                    # SEKRET — tylko build-time (upload sourcemaps)
   SENTRY_ORG=<org>
   SENTRY_PROJECT=<project>
   ```

### Test
- Wywołaj kontrolowany błąd i sprawdź, czy pojawił się w Sentry (z source mapami).

---

## 3.9. Referrals — anty-fraud (Tier 5 zad. 246)

### ZADANIE 3.10
```bash
openssl rand -hex 16
```
```bash
REFERRAL_IP_SALT=<wygenerowany salt>       # rotuj co 30 dni (anty-fraud, RODO: hash IP)
```

---

## 3.10. Tabela kontrolna sekretów (skrót)

| Zmienna | Usługa | Sekret? | Gdzie zdobyć |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe | 🔴 | Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe | 🔴 | Webhooks → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | nie | API keys |
| `FAKTUROWNIA_API_TOKEN` | Fakturownia | 🔴 | Ustawienia → API |
| `FAKTUROWNIA_DOMAIN` | Fakturownia | nie | subdomena konta |
| `RESEND_API_KEY` | Resend | 🔴 | API Keys |
| `SMSAPI_OAUTH_TOKEN` | SMSAPI | 🔴 | API → OAuth2 |
| `CRON_SECRET` | wewn. | 🔴 | `openssl rand -hex 32` |
| `APP_ENCRYPTION_KEY` | pgcrypto | 🔴 | `openssl rand -base64 48` |
| `CLAMAV_HOST/PORT` | ClamAV | nie | własny host |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | nie | projekt Sentry |
| `SENTRY_AUTH_TOKEN` | Sentry | 🔴 | Sentry → Auth Tokens |
| `REFERRAL_IP_SALT` | wewn. | 🔴 | `openssl rand -hex 16` |

> 🔴 **Sekretów NIGDY nie commituj.** `.env.local` jest w `.gitignore`. Na produkcji wpisz je
> jako Environment Variables w Vercel ([ETAP 4](./04-ETAP-4-HOSTING-VERCEL.md)).

---

## 3.11. Definition of Done — ETAP 3

- [ ] Stripe: klucze + webhook (200 na delivery) + płatność testowa OK.
- [ ] Fakturownia: token + domena, faktura VAT powstaje po płatności.
- [ ] Resend: domena z SPF/DKIM/DMARC, e-mail dostarczany (nie SPAM).
- [ ] SMSAPI: token + sender, SMS testowy dochodzi.
- [ ] CRON: `CRON_SECRET` ustawiony, funkcje brzegowe wdrożone + harmonogram.
- [ ] `APP_ENCRYPTION_KEY` ustawiony (i udokumentowana procedura rotacji).
- [ ] ClamAV: skaner działa, `REQUIRE_CLAMAV=1` na prod.
- [ ] Sentry: DSN + auth token, błąd testowy widoczny.
- [ ] `REFERRAL_IP_SALT` ustawiony.

✅ Po odhaczeniu → **[ETAP 4: Hosting Vercel](./04-ETAP-4-HOSTING-VERCEL.md)**.
