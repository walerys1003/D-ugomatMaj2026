# Disaster Recovery Exercise

**Tier 6 zad. 292** — Kwartalny drill DR/BCP dla Długomat.

## Cele

- **RTO** (Recovery Time Objective): < 4 godziny dla critical path (login + checkout + AI)
- **RPO** (Recovery Point Objective): < 1 godzina utraty danych
- **MTTR** (Mean Time To Recovery): < 1 godzina dla single-service failure

## Scenariusze do przećwiczenia (rotacja kwartalna)

### Q1 — Supabase regional outage
**Symulacja:** zatrzymaj Supabase project (Dashboard → Pause).
**Oczekiwane działania:**
1. Status page update w < 5 min
2. Sprawdzić ostatni daily backup (`pg_dump` w S3 `dlugomat-backups/`)
3. Restore backup do nowego Supabase project (cold standby)
4. Update `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` w Vercel
5. Vercel redeploy
6. Smoke test: login, list cases, generate doc
7. DNS update jeśli używamy custom domain

**Pass criteria:** Critical path działa < 4h. Dane utracone < 1h.

### Q2 — Stripe webhook signing key rotation
**Symulacja:** rotuj `STRIPE_WEBHOOK_SECRET` w Vercel.
**Oczekiwane działania:**
1. Dual-secret window: zapisać OLD do `STRIPE_WEBHOOK_SECRET_PREVIOUS`
2. Zapisać NEW do `STRIPE_WEBHOOK_SECRET`
3. Aktualizować webhook endpoint w Stripe Dashboard
4. Monitor `/api/stripe/webhook` przez 1h — czy signatures pass z OLD i NEW
5. Po 24h usunąć `_PREVIOUS`

**Pass criteria:** zero failed webhooks w trakcie rotacji. (Tier 6 zad. 285 helper `validateAgainstBoth`.)

### Q3 — Anthropic API permanent unavailability (provider switch)
**Symulacja:** rzeczywiście Anthropic miało outage 1h w 2024-Q4.
**Oczekiwane działania:**
1. Circuit breaker auto-open (po 5 fail w 30s) — UI pokazuje degradację
2. Fallback do statycznego template'a (`/api/cases/<id>/generate-static`)
3. Komunikat na status page: "AI generacja niedostępna, używamy szablonów"
4. Decision: czy włączyć backup model (OpenAI gpt-4o przez APIPod)?
   - Tak: rotuj `AI_BACKEND_PROVIDER=openai` w Vercel
   - Nie: czekaj na Anthropic resolution

**Pass criteria:** użytkownicy widzą meaningful UI, nie biały ekran. Zero error logs spam.

### Q4 — Full Vercel deployment rollback
**Symulacja:** zdeployuj broken commit do production.
**Oczekiwane działania:**
1. Detection: Sentry alert lub `/api/health/deep` 503
2. Rollback w Vercel Dashboard → Deployments → poprzedni deployment → Promote
3. Verify smoke tests pass
4. Post-mortem dlaczego CI nie złapał

**Pass criteria:** rollback w < 5 min. Zero data loss (rollback = code-only, DB nie tknięty).

## Backup verification (miesięcznie)

```bash
# Lista ostatnich backupów Supabase
aws s3 ls s3://dlugomat-backups/daily/ | tail -30

# Pobierz najnowszy
aws s3 cp s3://dlugomat-backups/daily/$(date -u +%Y-%m-%d).sql.gz /tmp/
gunzip /tmp/$(date -u +%Y-%m-%d).sql.gz

# Restore do test database
psql "$TEST_DB_URL" < /tmp/$(date -u +%Y-%m-%d).sql

# Verify row counts vs production (delta < 1%)
psql "$TEST_DB_URL" -c "SELECT count(*) FROM auth.users;"
psql "$TEST_DB_URL" -c "SELECT count(*) FROM cases;"
psql "$TEST_DB_URL" -c "SELECT count(*) FROM ai_generation_runs;"
```

**Pass criteria:**
- [ ] Backup file istnieje i ma > 1 MB
- [ ] gunzip działa bez błędów
- [ ] Restore kończy się bez błędów
- [ ] Row counts ± 1% od produkcji
- [ ] Wybrany losowy user może się zalogować w klonie (RLS works)

## Communication template (do użycia w trakcie incydentu)

```
[INCIDENT] {date} — {severity: P1/P2/P3} {short title}

Status: investigating | identified | monitoring | resolved
Impact: {who is affected, what features down}
Workaround: {if any}
Next update: {time}

Updates:
- {time} — investigating reports of {symptom}
- {time} — root cause identified: {RCA}
- {time} — mitigation deployed: {what}
- {time} — monitoring; no new errors in 30 min
- {time} — incident resolved. Post-mortem in 5 days.
```

## Owner

- DR drill owner: SRE Lead
- Frequency: kwartalnie (kalendarz: marzec, czerwiec, wrzesień, grudzień)
- Documentation update: po każdym drill'u
- Post-drill review: w retro po incydencie
