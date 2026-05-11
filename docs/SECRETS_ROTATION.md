# Długomat — Secrets Rotation Runbook (Tier 30)

Procedury rotacji sekretów produkcyjnych. Każdy sekret ma określony okres rotacji.

## Macierz rotacji

| Sekret | Okres | Wpływ rotacji | Notice required |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | 365d | wszystkie API | NIE (rotation rolling) |
| `STRIPE_SECRET_KEY` | 365d | płatności | 24h advance |
| `STRIPE_WEBHOOK_SECRET` | 180d | webhook dispatch | NIE (2 sekrety naraz) |
| `CRON_SECRET` | 90d | cron jobs | NIE (re-deploy) |
| `MFA_ENCRYPTION_KEY` | NIGDY | re-encrypt all MFA | 7 dni |
| `SECRET_VAULT_MASTER_KEY` | NIGDY | re-encrypt all secrets | 7 dni |
| `AUDIT_HMAC_KEY` | 365d (z keeping old) | weryfikacja audit chain | NIE |
| `IMPERSONATION_HMAC_KEY` | 90d | active impersonation tokens | 24h (revoke all sessions) |
| OAuth client secrets | 365d | re-link integracji | 7 dni przed |
| `HEALTH_DEEP_TOKEN` | 90d | Checkly monitors | NIE |

## Procedura rotacji — Supabase Service Role Key

1. Wejdź na https://app.supabase.com → Project → Settings → API
2. Kliknij "Roll Service Role Key"
3. Skopiuj nowy klucz
4. Vercel → Settings → Environment Variables → edytuj `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy (Vercel re-deploy z nową wartością)
6. Test: `curl https://dlugomat.pl/api/health/deep | jq`
7. Stary klucz wygasa po 5 min — sprawdź czy nie ma żadnych runtime errors w Sentry

## Procedura rotacji — Stripe Secret Key

1. Stripe Dashboard → Developers → API keys → "Roll key"
2. Notice: aktywne webhooks działają nadal dopóki używasz starego klucza w `STRIPE_WEBHOOK_SECRET`
3. Vercel env → update `STRIPE_SECRET_KEY` (`sk_live_NEW`)
4. Deploy + smoke test (jeden test checkout)
5. Po 1h aktywności: revoke stary klucz w Stripe

## Procedura rotacji — Webhook Secret (zero-downtime)

1. Stripe → Webhooks → wybierz endpoint → "Roll signing secret"
2. Stripe pozwala na dwa aktywne sekrety przez 24h
3. Vercel env → update `STRIPE_WEBHOOK_SECRET=whsec_NEW`
4. Deploy. Aplikacja powinna walidować PIERWSZY zarejestrowany sekret, ale dla zero-downtime można w kodzie sprawdzać oba przez 24h:
   ```ts
   const valid = verifyStripeSignature(body, sig, NEW) ||
                 verifyStripeSignature(body, sig, OLD);
   ```
5. Po 24h: usuń stary sekret w Stripe + zostaw tylko NEW w env

## Procedura rotacji — MFA Encryption Key

⚠️ **CRITICAL** — nieprawidłowa rotacja zablokuje wszystkie konta z MFA.

1. Backup tabeli `mfa_secrets` (Supabase → SQL → `pg_dump mfa_secrets`)
2. Wygeneruj nowy klucz: `openssl rand -hex 32`
3. Uruchom skrypt re-encryption (off-peak hours):
   ```bash
   cd /home/user/webapp/apps/web
   node scripts/rotate-mfa-key.mjs --old=$OLD_KEY --new=$NEW_KEY
   ```
4. Verify: spróbuj zalogować się testowym kontem z aktywnym MFA
5. Update Vercel env `MFA_ENCRYPTION_KEY`
6. Deploy
7. Monitor Sentry 48h pod kątem `MfaDecryptError`

## Procedura rotacji — OAuth Client Secrets

1. Provider dashboard (Google Cloud / Azure AD / Slack / Notion) → roll client secret
2. **Notice 7 dni przed** — wszystkie istniejące tokeny dostępu pozostają ważne do TTL (zazwyczaj 1h refresh, 90d-no-expiry)
3. Update Vercel env: `*_OAUTH_CLIENT_SECRET`
4. Deploy
5. Test: nowe połączenie OAuth (`/api/integrations/oauth/google/start`)
6. Old refresh tokens przestaną działać po wygaśnięciu — userzy będą musieli reconnect (komunikat w UI)

## Procedura w razie wycieku (incident response)

### Stage 1 — natychmiast (T+0)

1. **Revoke** wszystkie aktywne tokeny / klucze
2. Vercel env → zmień natychmiast (deployment minimum 1-2 min)
3. Włącz "maintenance mode" jeśli to klucz krytyczny (Supabase service role / Stripe live)
4. Notify CTO + Security Officer

### Stage 2 — w ciągu 1h

1. Audit log review — kto miał dostęp w okresie podejrzenia
2. Sprawdź anomalie w aktywności (np. dziwne IPv4, geo)
3. Force logout wszystkich userów: `DELETE FROM auth.sessions`
4. Force MFA re-verify: `UPDATE mfa_secrets SET verified = false WHERE ...`

### Stage 3 — w ciągu 24h

1. RODO notification do UODO (jeśli incydent dotyczy PII): https://uodo.gov.pl/zgloszenia
2. Notification do affected users (email + in-app banner)
3. Post-mortem report w `docs/incidents/YYYY-MM-DD-leak.md`

---

**Ostatnia aktualizacja**: 2026-05-11 (Tier 30 release)
**Owner**: Security Officer + DevOps Lead
