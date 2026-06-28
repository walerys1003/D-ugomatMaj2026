# WAF Rules — Cloudflare Configuration

**Tier 6 zad. 283** — Web Application Firewall rules for Długomat.

## Managed Rules (włącz wszystkie)

| Rule Set | Action | Notes |
|----------|--------|-------|
| Cloudflare Managed Ruleset | Block | OWASP Top-10 baseline |
| Cloudflare OWASP Core | Challenge | Score ≥ 60 |
| Cloudflare Exposed Credentials Check | Block | Login endpoints |
| Cloudflare Sensitive Data Detection | Log | PII leak detection |

## Custom Rules

### 1. Block known bad UAs on AI endpoints
```
Expression:
  (http.request.uri.path matches "^/api/ai/" and
   not http.user_agent contains "Mozilla" and
   not cf.client.bot)
Action: block
```

### 2. Rate-limit /api/ai/generate per IP
```
Expression: http.request.uri.path eq "/api/ai/generate"
Action: block
Rate: 10 requests / 60 seconds / IP
```

### 3. Geo-block (optional — only if EU-only customers)
```
Expression: not (ip.geoip.country in {"PL" "DE" "AT" "CZ" "SK" "LT" "LV" "EE" "GB" "IE" "NL" "BE" "FR" "IT" "ES" "PT" "FI" "SE" "DK" "NO" "HU" "RO" "BG"})
Action: js_challenge
```

### 4. Block requests without Accept-Language (likely bots)
```
Expression: (http.request.uri.path eq "/api/auth/signup" and
             not any(http.request.headers["accept-language"][*] != ""))
Action: managed_challenge
```

### 5. Protect /admin/* — only allow office IPs
```
Expression: (http.request.uri.path matches "^/admin/" and
             not ip.src in {OFFICE_CIDR_1 OFFICE_CIDR_2})
Action: block
```

### 6. Block SQL injection patterns (defense-in-depth)
```
Expression: (http.request.uri.query contains "UNION SELECT" or
             http.request.uri.query contains "' OR '1'='1" or
             http.request.body.raw contains "DROP TABLE")
Action: block
Notes: Supabase RLS już chroni — to dodatkowa warstwa.
```

### 7. Block path traversal
```
Expression: http.request.uri.path contains "../"
Action: block
```

### 8. Idempotency-Key abuse — reject very long values
```
Expression: any(http.request.headers["idempotency-key"][*]) and
           len(http.request.headers["idempotency-key"][0]) > 128
Action: block
```

## Bot Management

- **Bot Fight Mode**: ON (free plan) / **Super Bot Fight Mode**: ON (Pro+)
- **Verified Bots**: ALLOW (Googlebot, Bingbot — niezbędne dla SEO)
- **Definitely Automated**: CHALLENGE
- **Likely Automated**: LOG (monitoring 30 dni, potem CHALLENGE)
- **Static Resource Protection**: OFF (zbyt agresywne dla /_next/static)

## Rate Limiting (osobno od WAF)

| Endpoint | Limit | Action |
|----------|-------|--------|
| `/api/auth/signup` | 5 / hour / IP | challenge |
| `/api/auth/login` | 10 / 10 min / IP | challenge |
| `/api/auth/reset-password` | 3 / hour / IP | block |
| `/api/ai/generate` | 30 / hour / IP | block (overrides app-level) |
| `/api/contact` | 5 / day / IP | challenge |
| `/api/csp-report` | 1000 / minute / IP | log only |
| `/api/stripe/webhook` | unlimited (verified by signature) | n/a |

## Page Rules

- `https://dlugomat.pl/api/*` — Cache: Bypass, SSL: Strict
- `https://dlugomat.pl/_next/static/*` — Cache: Cache Everything, TTL 1 year
- `https://dlugomat.pl/baza-wiedzy/*` — Cache: Standard, TTL 1 hour
- `https://staging.dlugomat.pl/*` — Cache: Bypass, password protect via Cloudflare Access

## Logging & Monitoring

- Logpush → S3 bucket `dlugomat-waf-logs/` (90 dni retention)
- Alert: SecOps Slack `#security` gdy:
  - WAF blocks > 1000/h
  - Single IP triggers > 50 rules / day
  - New attack pattern in top-10

## Quarterly review checklist

- [ ] Review top-20 blocked IPs — any false positives?
- [ ] Review top-10 blocked rules — any new attack vectors?
- [ ] Check CF Security Events dashboard for trends
- [ ] Verify Verified Bots list is current (Google etc.)
- [ ] Test all custom rules against `/api/csp-report` (should NOT block)
