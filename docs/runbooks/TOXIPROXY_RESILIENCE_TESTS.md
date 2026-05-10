# Toxiproxy Resilience Tests

**Tier 6 zad. 289–291** — Symulacja awarii zewnętrznych zależności w
środowisku staging za pomocą Toxiproxy.

## Cel

Testować, czy aplikacja gracefully degrades gdy:
- Stripe API odpowiada z 30s latency (timeout)
- Anthropic API zwraca 503 (circuit breaker)
- Resend wykonuje connection reset (retry)
- Supabase pool jest saturated (queue)

Wymaga uruchomionego Toxiproxy: `docker run -p 8474:8474 -p 26379:26379 ghcr.io/shopify/toxiproxy`.

## Setup

```bash
# 1. Uruchom Toxiproxy
docker compose -f docker-compose.toxiproxy.yml up -d

# 2. Skonfiguruj proxies (wszystkie 4 external services)
./scripts/toxiproxy-setup.sh

# 3. Eksportuj env vars w staging
export STRIPE_API_BASE="http://toxiproxy:8081"
export ANTHROPIC_API_BASE="http://toxiproxy:8082"
export RESEND_API_BASE="http://toxiproxy:8083"
export SUPABASE_URL="http://toxiproxy:8084"
```

## Scenariusze

### Scenariusz 1 — Stripe slow (latency 5s)
```bash
curl -X POST http://localhost:8474/proxies/stripe/toxics \
  -d '{"type":"latency","attributes":{"latency":5000,"jitter":1000}}'
```

**Oczekiwany rezultat:**
- `/api/stripe/checkout` zwraca w < 8s (z 30s retry budget)
- Po 3 fail circuit się otwiera → 503 z `Retry-After: 30`
- `/admin/sli` pokazuje `stripe.errors=3`, circuit=`open`

### Scenariusz 2 — Anthropic 100% errors
```bash
curl -X POST http://localhost:8474/proxies/anthropic/toxics \
  -d '{"type":"timeout","attributes":{"timeout":1}}'
```

**Oczekiwany rezultat:**
- `/api/ai/generate` SSE wysyła `event: error` z `code=ai_unavailable`
- Frontend pokazuje fallback CTA "Pobierz statyczny szablon"
- Circuit breaker open dla 30s, potem half-open trial

### Scenariusz 3 — Network partition (50% packet loss)
```bash
curl -X POST http://localhost:8474/proxies/supabase/toxics \
  -d '{"type":"limit_data","attributes":{"bytes":1024}}'
```

**Oczekiwany rezultat:**
- `/api/health/deep` zwraca 503
- Cron jobs zatrzymują się (lock w `cron_locks`)
- Webhook dispatcher retry'uje z exponential backoff

### Scenariusz 4 — Slow connection drain (slowloris-like)
```bash
curl -X POST http://localhost:8474/proxies/resend/toxics \
  -d '{"type":"slow_close","attributes":{"delay":10000}}'
```

**Oczekiwany rezultat:**
- Email retry'uje 3x z 1s/2s/4s backoff
- Po 3 fail → DLQ status w `notifications`
- `/admin/dlq` pokazuje nowy wpis

## Cleanup

```bash
# Usuń wszystkie toxics
./scripts/toxiproxy-cleanup.sh

# Lub reset proxies
curl -X POST http://localhost:8474/reset
```

## CI integration (deferred to Tier 8)

W ramach Tier 8 (Performance & Quality) planujemy uruchamiać te scenariusze
w GitHub Actions jako "chaos regression test" przed każdym deploy do prod.

## Pass criteria (per scenariusz)

- [ ] Brak crashu aplikacji (proces nie umiera)
- [ ] Error rate dla zdrowych endpointów < 1%
- [ ] Circuit breakers działają zgodnie z spec (5 fail → open na 30s)
- [ ] Logi zawierają correlation_id na całej ścieżce
- [ ] User-facing UI pokazuje meaningful fallback (nie biały ekran)
