# Długomat — Production Launch Checklist (Tier 30)

Lista kontrolna do uruchomienia produkcyjnego. Każdy punkt MUSI być zaznaczony jako spełniony przed włączeniem flag produkcyjnych.

## 1. Zmienne środowiskowe (`.env.production`)

### Wymagane (build zawiedzie jeśli ich brak — patrz `next.config.mjs`)

- [ ] `NEXT_PUBLIC_APP_URL` — np. `https://dlugomat.pl`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only!)
- [ ] `STRIPE_SECRET_KEY` (klucz `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `CRON_SECRET` (32+ bajtów losowych)

### Wymagane do pełnej funkcjonalności

- [ ] `RESEND_API_KEY` (email transactional)
- [ ] `ANTHROPIC_API_KEY` (AI generation)
- [ ] `OPENAI_API_KEY` (fallback + embeddings)
- [ ] `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`
- [ ] `HEALTH_DEEP_TOKEN` (token dla `/api/health/deep`)

### OAuth providers

- [ ] `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET`
- [ ] `MICROSOFT_OAUTH_CLIENT_ID` + `MICROSOFT_OAUTH_CLIENT_SECRET` + `MICROSOFT_TENANT_ID=common`
- [ ] `SLACK_OAUTH_CLIENT_ID` + `SLACK_OAUTH_CLIENT_SECRET`
- [ ] `NOTION_OAUTH_CLIENT_ID` + `NOTION_OAUTH_CLIENT_SECRET`

### Integracje płatne

- [ ] `FAKTUROWNIA_API_TOKEN` + `FAKTUROWNIA_DOMAIN`
- [ ] `AUTENTI_API_KEY` (e-podpis)
- [ ] `EPUAP_CERT_PATH` + `EPUAP_CERT_PASSWORD`

### Security

- [ ] `MFA_ENCRYPTION_KEY` (32-byte hex)
- [ ] `SECRET_VAULT_MASTER_KEY` (32-byte hex)
- [ ] `AUDIT_HMAC_KEY` (32-byte hex)
- [ ] `IMPERSONATION_HMAC_KEY` (32-byte hex)

## 2. Baza danych

- [ ] Wszystkie migracje zaaplikowane (`supabase migration list`)
- [ ] Połączenie do bazy z aplikacji działa (`SELECT 1`)
- [ ] RLS włączony na wszystkich tabelach z PII (`SELECT relname FROM pg_class WHERE relrowsecurity = false`)
- [ ] Indeksy zoptymalizowane (`pg_stat_user_indexes` — idx_scan > 0 dla popularnych)
- [ ] Backupy automatyczne włączone (Supabase Daily Backups + PITR)
- [ ] Cron jobs ustawione (Supabase Edge Functions / Vercel Cron)

## 3. Stripe

- [ ] Webhook endpoint zarejestrowany: `https://dlugomat.pl/api/stripe/webhook`
- [ ] Eventy: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `checkout.session.completed`
- [ ] Tax settings włączone (VAT-PL dla PL → 23%)
- [ ] Test card disabled w produkcji
- [ ] Stripe Customer Portal skonfigurowany (anulowanie / zmiana planu)

## 4. Domena + DNS

- [ ] `dlugomat.pl` → Vercel (A/CNAME)
- [ ] SSL certyfikat aktywny (Let's Encrypt via Vercel)
- [ ] DKIM/SPF/DMARC dla email transactional (Resend)
- [ ] `_dmarc.dlugomat.pl` TXT → `v=DMARC1; p=quarantine; rua=mailto:dmarc@dlugomat.pl`

## 5. Performance budgets

- [ ] Lighthouse CI: performance ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.95, SEO ≥ 0.95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TBT < 200ms
- [ ] Size budgets (`.size-limit.json`) wszystkie OK
- [ ] Bundle analyzer review (`ANALYZE=true npm run build`)

## 6. Bezpieczeństwo

- [ ] CSP report-only włączony tydzień przed produkcją (`/api/csp-report` zbiera)
- [ ] HSTS preload (after stable 6 months)
- [ ] Rate limiting na auth + write APIs (sprawdź `lib/security/rate-limit`)
- [ ] WAF / Cloudflare przed Vercel (opcjonalnie)
- [ ] Penetration test wykonany (raport w `docs/security/pentest-YYYY-MM-DD.pdf`)
- [ ] DPIA dla RODO ukończone (admin → compliance)

## 7. Monitoring

- [ ] Sentry receives events (test: `Sentry.captureException(new Error("smoke"))`)
- [ ] PostHog session replay włączone z masking
- [ ] Checkly synthetic monitors aktywne (landing, panel, /api/health/deep)
- [ ] PagerDuty escalation policy ustawiona
- [ ] Status page (`https://status.dlugomat.pl` lub `/status`) aktualizowany

## 8. SEO / Marketing

- [ ] Google Search Console — domena zweryfikowana, sitemap wysłany
- [ ] Bing Webmaster Tools — domena zweryfikowana
- [ ] Schema.org JSON-LD na każdym artykule bazy wiedzy (`Article`, `BreadcrumbList`)
- [ ] Open Graph + Twitter Card meta na każdej stronie
- [ ] hreflang dla locale `pl/en/uk/cs/ro` (jeśli włączone)
- [ ] Favicon + apple-touch-icon + manifest.json
- [ ] Robots.txt nie blokuje publicznych stron

## 9. RODO + Legal

- [ ] Polityka prywatności (`/rodo`) — aktualna
- [ ] DPA wzór (`/dpa`) — aktualny
- [ ] Cookie consent banner działa (test: czyste cookies)
- [ ] Eksport danych (art. 20 RODO) — testowy run
- [ ] Usunięcie konta (art. 17 RODO) — testowy run (z anonimizacją)
- [ ] Zgody marketingowe rozłączne od regulaminu

## 10. Smoke testy E2E

```bash
PLAYWRIGHT_BASE_URL=https://dlugomat.pl npx playwright test critical-flows
```

Wszystkie testy MUSZĄ przejść przed `git tag v1.0.0`.

## 11. Procedura rollback

W razie krytycznego bugu produkcji:

```bash
# Vercel — przywróć poprzedni deployment
vercel rollback https://dlugomat.pl

# Supabase — odtwórz z PITR (max 7 dni wstecz)
supabase db restore --timestamp "2026-05-11T12:00:00Z"

# Stripe — zatrzymaj nowe subskrypcje (manual w dashboard)
```

## 12. Post-launch (pierwsze 24h)

- [ ] Monitor Sentry dla nowych issues co 1h
- [ ] Monitor /api/health/deep co 5 min (Checkly)
- [ ] Sprawdzenie Stripe webhooks delivery rate (≥ 99%)
- [ ] Pierwsze 10 płatności manual review
- [ ] Pierwsze 5 generacji AI manual review
- [ ] Pierwsze 3 dokumenty od użytkowników — sprawdzenie poprawności prawnej

---

**Ostatnia aktualizacja**: 2026-05-11 (Tier 30 release)
**Owner**: Inżynieria produkcyjna Długomat
