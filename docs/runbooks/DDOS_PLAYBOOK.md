# DDoS Playbook — Długomat

**Tier 6 zad. 284** — Runbook reagowania na ataki DDoS / volumetric traffic.

**SLA reakcji**: Detection → Mitigation < 15 minut (godziny biznesowe), < 30 min (off-hours).
**Owner**: SRE on-call (rotacja tygodniowa).

---

## 1. Wykrycie (Detection)

### 1.1 Sygnały automatyczne
- **PagerDuty alert** z Vercel/Cloudflare gdy:
  - RPS > 5000/min na pojedynczym route
  - Error rate (5xx) > 5% przez 3 minuty
  - p95 latency > 5s przez 5 minut
- **Sentry "Issue alert"**: spike `429 rate_limit_exceeded` >100/min
- **Supabase**: connection pool saturation (>80%)

### 1.2 Sygnały manualne
- Skargi userów na Twitter/email "strona nie działa"
- Status page (`status.dlugomat.pl`) downgrade

### 1.3 Triage (pierwsze 5 minut)
1. Otwórz `/admin/sli` — sprawdź burn-rate (>14x = serious)
2. Otwórz Cloudflare Dashboard → Analytics → Security
3. Zidentyfikuj wzorzec:
   - **L3/L4 (volumetric)**: dziesiątki Gbps, packet flood
   - **L7 (application)**: GET /api/ai/generate × 1000 RPS
   - **Slowloris**: dużo open connections, brak ruchu
   - **Credential stuffing**: POST /auth/login z różnymi userami

---

## 2. Mitigacja — Decision Tree

```
Czy attack > 10k RPS?
├── TAK → Cloudflare "Under Attack Mode" (UAM): JS challenge dla każdego visitor
│         + Page Rule: cache_level=cache_everything for static
│         → Skip do sekcji 3
└── NIE → Czy attack na konkretne route?
          ├── TAK → Rate-limit rule w Cloudflare (5 RPS / IP / route)
          │         + WAF rule: blokuj UA bota
          └── NIE → Monitor 10 min; eskaluj jeśli wzrasta
```

### 2.1 Cloudflare Under Attack Mode (UAM)
```bash
# Via Cloudflare API
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"under_attack"}'
```
Effect: każdy nowy visitor dostaje 5s JS challenge. Real users prze szed, boty padają.

### 2.2 Per-route rate-limit (Cloudflare WAF)
```
Expression: (http.request.uri.path eq "/api/ai/generate" and http.request.method eq "POST")
Action: block
Rate: 5 requests per 60 seconds per IP
```

### 2.3 Block ASN / kraj
Jeśli wszystkie złe requesty z jednego ASN (np. AS14061 DigitalOcean):
```
Expression: ip.geoip.asnum eq 14061
Action: js_challenge
```

### 2.4 Aplikacja — Chaos kill-switch
Jeśli L7 attack przeszedł przez CF i overwhelmuje aplikację:
```bash
# Disable AI temporarily (zwraca 503 + Retry-After)
vercel env add DLUGOMAT_AI_DEGRADE production
# value: true
# scope: production
vercel --prod deploy
```
Tier 6 zad. 260 chaos flag — natywnie wspiera ten use-case.

### 2.5 Supabase — Scale up
W Supabase Dashboard → Settings → Compute size → upgrade temporarily.
Albo: rotuj `DATABASE_URL` na replica read-only dla GET endpoints.

---

## 3. Komunikacja

### 3.1 Status Page
- Aktualizuj `https://status.dlugomat.pl` z incydentem
- Severity: `degraded_performance` lub `partial_outage`
- Update co 30 minut do resolution

### 3.2 Wewnętrznie
- Slack `#incidents`: "[INCIDENT] DDoS — UAM enabled, monitoring"
- Tag CEO + CTO jeśli > 1h downtime
- Customer Success: szablon emaila do PRO/ENTERPRISE klientów

### 3.3 Zewnętrznie
- Twitter `@dlugomat_pl`: "Trwają prace techniczne, przepraszamy"
- Email do ENTERPRISE klientów (template w `/docs/email-templates/incident.md`)

---

## 4. Eskalacja

| Level | When | Who |
|-------|------|-----|
| L1 | Attack < 30 min, < 5% błędów | SRE on-call |
| L2 | Attack > 30 min OR > 20% błędów | + SRE Lead, CTO |
| L3 | Attack > 2h OR full outage | + CEO, Legal (RODO breach?) |

---

## 5. Post-Incident

### 5.1 Rollback UAM
Po 30 min spokoju:
```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  --data '{"value":"medium"}'
```

### 5.2 Disable chaos flag
```bash
vercel env rm DLUGOMAT_AI_DEGRADE production
vercel --prod deploy
```

### 5.3 Post-mortem (do 5 dni roboczych)
Template: `/docs/runbooks/POST_MORTEM_TEMPLATE.md`
- Timeline
- Root cause (5 Whys)
- Impact (users affected, revenue lost)
- Action items (z owner + due date)

### 5.4 Trwałe wzmocnienia
- Czy potrzebujemy bardziej rygorystycznych WAF rules?
- Czy Cloudflare plan Pro/Business wystarczy?
- Czy potrzebujemy DDoS-protection-as-a-service (AWS Shield Advanced)?

---

## 6. Prevention checklist (audytowane kwartalnie)

- [ ] Cloudflare WAF managed rules: ON
- [ ] Bot Fight Mode: ON (Cloudflare → Security → Bots)
- [ ] Rate limiting per-route (5 najgorszych): konfigured
- [ ] Application-level rate limits (`/lib/security/rate-limit.ts`): tested
- [ ] `DLUGOMAT_AI_DEGRADE` chaos flag: documented, smoke-tested
- [ ] Circuit breakers (Stripe/Anthropic/Resend/SMSAPI): healthy
- [ ] Supabase backup-restore: drilled w ostatnie 90 dni

---

## 7. Kontakty awaryjne

- Cloudflare Enterprise support: +1-xxx (jeśli mamy plan Enterprise)
- Vercel emergency: support@vercel.com (Pro plan → 1h SLA)
- Supabase paid support: ticket via dashboard (4h SLA na Pro)
- AWS Shield Response Team: jeśli używamy AWS Shield Advanced
