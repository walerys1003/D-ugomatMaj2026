# Długomat — Disaster Recovery Playbook

**Tier 34-2 — RTO/RPO documentation, failover procedures, post-mortem template.**

Wersja: 1.0 (2026-05-11)
Owner: Platform / SRE
Status: PRODUCTION

---

## 1. Cele biznesowe

| Parametr | Cel | Pomiar |
|---|---|---|
| **RTO** (Recovery Time Objective) | **≤ 30 min** dla critical path | Czas od detekcji do przywrócenia ruchu |
| **RPO** (Recovery Point Objective) | **≤ 5 min** dla DB (PITR) | Wiek ostatniego konsystentnego snapshot |
| **MTTR** | ≤ 60 min (cel) | Mean Time To Resolve |
| **MTBF** | ≥ 720h (30 dni) | Mean Time Between Failures |
| **Dostępność roczna** | ≥ 99.9% (8.76h budżetu/rok) | Status page uptime |

---

## 2. Klasyfikacja incydentów

| Severity | Definicja | Eskalacja |
|---|---|---|
| **SEV-1** | Pełny outage / utrata danych | On-call lead + CEO ≤ 15 min |
| **SEV-2** | Częściowy outage (jeden moduł D1–D8) | On-call lead ≤ 30 min |
| **SEV-3** | Degradacja perf, brak utraty funkcji | Tylko on-call, info do zespołu |
| **SEV-4** | Drobne (1 user) | Ticket support |

---

## 3. Architektura HA

```
                     ┌──────────────────────┐
                     │  Cloudflare (DNS+CDN)│
                     │  GeoSteering         │
                     └──────────┬───────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
            ┌─────▼─────┐               ┌─────▼─────┐
            │ Vercel    │   primary     │ Vercel    │ failover
            │ fra1      │◀─── health ──▶│ cdg1      │
            └─────┬─────┘               └─────┬─────┘
                  │                           │
            ┌─────▼─────────────────────┐ ┌──▼─────────┐
            │ Supabase eu-central-1     │ │ replica    │
            │ Postgres + Storage        │─│ eu-west-3  │
            │ PITR retention: 7d        │ │ (read-only)│
            └───────────────────────────┘ └────────────┘
```

---

## 4. Scenariusze awarii i runbooki

### 4.1 Vercel primary region down (`fra1` 5xx > 5%)

**Detekcja**: Status checks `/api/health/extended` co 30s. Alert do PagerDuty po 3 kolejnych fail (90s).

**Runbook** (RTO target: 5 min):
1. `vercel inspect <deployment-url>` — potwierdzenie problemu
2. Jeśli problem regionalny → DNS Cloudflare: zmień geosteering rule (FRA → CDG)
3. `vercel deployments` → upewnij się że `cdg1` ma aktualny build
4. Update [status.dlugomat.pl](https://status.dlugomat.pl) → "investigating"
5. Po stabilizacji → revert geosteering + post-mortem

### 4.2 Supabase Postgres unavailable

**Detekcja**: `/api/health/extended` → `database.status = "fail"`. Alert: PagerDuty SEV-1.

**Runbook** (RTO target: 15 min):
1. Sprawdź [supabase.com/status](https://status.supabase.com)
2. Jeśli outage regionalny:
   - **Read traffic**: przełącz na replica (`SUPABASE_REPLICA_URL`) — UPDATE env var w Vercel → redeploy edge
   - **Write traffic**: ENABLE `MAINTENANCE_MODE=true` (read-only banner) do recovery
3. Jeśli korupcja danych:
   - PITR restore: Supabase Dashboard → Database → Backups → Point in Time
   - Wybierz timestamp przed incydentem (RPO budżet: 5 min)
   - Po restore → walidacja: `npm run check:data-integrity`
4. Update status page → "major-outage"
5. Comm: tweet + status page + email do affected users

### 4.3 Supabase Storage (R2/S3) unavailable

**Impact**: brak uploadu skanów D1, brak downloadu PDFów. Czytanie z cache działa.

**Runbook**:
1. Włącz fallback: nowe uploady → tmp w Vercel Blob, kolejka retry do Supabase po recovery
2. Banner w UI: "Tymczasowo nie zapisujemy plików, generowanie pism działa"
3. Po recovery → drain queue `npm run job:storage-drain`

### 4.4 OpenAI/Anthropic API down

**Impact**: brak generowania pism. D1 OCR i D2-D8 niedostępne.

**Runbook**:
1. Sprawdź status providerów
2. AI router → fallback: Anthropic→OpenAI→Google (configured in `lib/ai/router.ts`)
3. Jeśli wszyscy down → UI banner "AI tymczasowo niedostępne, formularze działają"
4. Sprawy idą do kolejki `pending_ai` — auto-retry co 10 min

### 4.5 Wyciek sekretów (rotation incident)

**SEV-1 zawsze.** Runbook w [SECRETS_ROTATION.md](./SECRETS_ROTATION.md).

Kolejność:
1. **Revoke** wycieczone klucze (Stripe → Dashboard, Anthropic/OpenAI → consoles)
2. Rotate Supabase service_role + JWT secret
3. Force re-auth wszystkich userów: `UPDATE auth.users SET aud='reauth'` + invalidate sessions
4. Audit log review: kto miał dostęp do leaked secret w ostatnich 90 dniach
5. Post-mortem + raport do RODO inspektora w 72h (jeśli dotyczy dane osobowe)

---

## 5. Backupy

| Zasób | Strategia | Retencja | Test recovery |
|---|---|---|---|
| Postgres | PITR (Supabase) | 7 dni | Tygodniowo: `npm run dr:test-restore` |
| Storage | Daily snapshot + cross-region replication | 30 dni | Miesięcznie |
| Sekrety | Vercel env + 1Password vault | indefinitely | Kwartalnie |
| Audit log | Append-only HMAC chain → S3 Glacier | 7 lat (RODO) | Kwartalnie |

**Test odtworzenia**: każdy backup musi być raz w miesiącu odtworzony do staging. Failed test = SEV-2 incident.

---

## 6. Komunikacja w trakcie incydentu

| Kanał | Kiedy | Treść |
|---|---|---|
| status.dlugomat.pl | Natychmiast (≤ 5 min) | Severity + scope + ETA |
| Twitter @dlugomat | SEV-1 / SEV-2 | Krótko + link do status |
| Email do affected | SEV-1 (po stabilizacji) | Szczegóły + co dalej |
| In-app banner | SEV-2+ | "Praca nad incydentem" |
| RODO inspektor | Jeśli dane osobowe | ≤ 72h zgodnie z art. 33 RODO |

---

## 7. Post-mortem template

Każdy incydent SEV-1/SEV-2 → blameless post-mortem w ciągu 5 dni roboczych.

```markdown
# Post-Mortem: [tytuł incydentu]
Data incydentu: YYYY-MM-DD HH:MM
Severity: SEV-X
Czas trwania: X min
Owner: @osoba

## Co się stało (TL;DR)
[1-2 zdania]

## Timeline (UTC)
- HH:MM — detekcja przez [alert/user report]
- HH:MM — first response
- HH:MM — root cause zidentyfikowany
- HH:MM — fix deployed
- HH:MM — recovery confirmed

## Impact
- Liczba dotkniętych userów:
- Liczba straconych spraw/pism:
- Revenue impact (PLN):
- SLA breach: TAK/NIE

## Root cause
[5-Why analysis]

## Co zadziałało
- ...

## Co NIE zadziałało
- ...

## Action items (z deadline + owner)
- [ ] AI-1: ... — @owner, do YYYY-MM-DD
- [ ] AI-2: ... — @owner, do YYYY-MM-DD
```

---

## 8. Drill schedule

| Drill | Częstotliwość | Cel |
|---|---|---|
| Region failover (fra1→cdg1) | Kwartalnie | RTO ≤ 5 min |
| DB PITR restore na staging | Miesięcznie | RPO ≤ 5 min |
| Secret rotation game-day | Półrocznie | Full revoke + rotate ≤ 30 min |
| Tabletop exercise (SEV-1 scenario) | Kwartalnie | Decision making + comm |

---

## 9. On-call rotation

- Primary: rotacja tygodniowa
- Secondary (escalation): rotacja miesięczna
- Lead (final escalation): CTO
- PagerDuty SLA: ack ≤ 5 min, response ≤ 15 min

---

## 10. Referencje

- `apps/web/lib/observability/health-detailed.ts` — extended health checks
- `apps/web/lib/infra/multi-region.ts` — region config + failover routing
- `docs/SECRETS_ROTATION.md` — secret rotation procedures
- `apps/web/app/(marketing)/status/page.tsx` — public status page
