# Edge Caching Strategy (Tier 5 zad. 219)

> Dokumentacja strategii cachowania na CDN edge (Vercel) dla wszystkich
> publicznych stron Długomatu. Cel: < 200ms TTFB w PL/EU dla strony
> głównej i wszystkich landing pages, jednocześnie zachowując możliwość
> szybkiej propagacji zmian (regulamin, polityki).

## TL;DR — która strona, jaki cache?

| Route | `max-age` (browser) | `s-maxage` (edge) | `stale-while-revalidate` | Powód |
|---|---|---|---|---|
| `/` | 5 min | 1 h | 24 h | Landing — szybka świeża treść po deployu, długi edge cache |
| `/jak-to-dziala`, `/cennik`, `/o-nas`, `/moduly`, `/kontakt`, `/baza-wiedzy/**` | 10 min | 6 h | 7 dni | Marketing static — rzadkie zmiany |
| `/regulamin`, `/rodo`, `/dpa`, `/polityka-prywatnosci` | 10 min | 24 h | 1 h | Prawo — przy zmianie szybko revalidate |
| `/skaner-nakazu`, `/kalkulatory/**` | 5 min | 1 h | 24 h | Interaktywne ale publiczne |
| `/changelog`, `/status`, `/program-partnerski` | 1 min | 5 min | 1 h | Częste zmiany |
| `/_next/image/**` | 30 dni | (Next handles) | 1 dzień | Zoptymalizowane obrazy — long-term cache |
| `/static/**` | 1 rok (`immutable`) | – | – | Hashed assets, nigdy się nie zmieniają |
| `/robots.txt`, `/sitemap.xml` | 1 h | 24 h | – | Boty respektują |
| `/panel/**`, `/admin/**`, `/auth/**` | – | – | – | `private, no-store` |
| `/api/**` | – | – | – | `private, no-store` (per-route override) |

## Strategia: dlaczego SWR?

Stale-while-revalidate to wzorzec, w którym CDN serwuje **stary** content
od razu (≈ 0ms latency), a w tle pobiera **świeży** wariant z origin.

```
Browser ─────► CDN edge (cached) ──────► Browser  ✓ 5ms
                  │
                  └─► Origin (background) ─► refresh cache for next req
```

Korzyści dla Długomatu:

- **TTFB ~10ms** w PL/EU dla strony głównej (vs. ~200ms gdy origin = US-East)
- **Brak kosztu billowania** Next.js Server Components dla cached requestów
- **Resilience**: jeśli origin pada (deploy, Supabase down), CDN dalej serwuje stale content
- **Safe revalidation**: po publikacji nowego regulaminu — `revalidatePath('/regulamin')` w Server Action triggeruje invalidation

## Co NIE jest cache'owane

1. **Routy z user contextem** (`/panel/**`, `/admin/**`) — `private, no-store`
   bo zawierają dane sesyjne (Supabase auth cookie).
2. **Server Actions / mutacje** — Next.js automatycznie ustawia `no-store`.
3. **API routes z user-specific content** — `/api/documents/[id]/download`,
   `/api/rodo/export`, etc.
4. **Stripe webhook** (`/api/stripe/webhook`) — zawsze fresh, brak cache.

## Vary headers

Dla landing/marketing zwracamy `Vary: Accept-Encoding`. Vercel domyślnie
także `Vary: Cookie` dla stron z dynamic content — w naszym przypadku
publiczne marketing pages nie mają cookies-zależnej treści.

> **Uwaga**: jeśli kiedyś wprowadzimy A/B test po cookie, dodamy
> `Vary: Cookie` lub przeniesiemy do middleware z explicit cache key.

## Revalidation — jak odświeżyć po deployu?

1. **On-demand revalidation** (preferowane):
   ```ts
   // Server Action, np. po update'cie regulaminu w admin/cms:
   import { revalidatePath } from "next/cache";
   revalidatePath("/regulamin");
   ```

2. **Time-based** (default ISR):
   ```ts
   // app/(marketing)/cennik/page.tsx
   export const revalidate = 3600; // 1h
   ```

3. **Hard-flush** (po deployu Vercel automatycznie purguje cache dla
   zmienionych route'ów na podstawie diff buildu).

## Monitoring efektywności

**Cache hit ratio** (cel ≥ 85% dla marketing):

- Vercel Analytics → Edge Requests → "Cache Status" (HIT / MISS / STALE / BYPASS)
- PostHog property `cache_hit` (jeśli zaimplementowane przez middleware sample)

**Alerts**:

- HIT ratio < 70% przez 30 min → notify `#perf` (możliwa regresja)
- TTFB p95 > 500ms PL → notify `#perf`

## Limity / pułapki

1. **CSP nonce-per-request** — strony z dynamic CSP nie mogą być cache'owane na edge.
   Sprawdź `apps/web/middleware.ts` — public routes (`/`, `/jak-to-dziala`)
   muszą używać statycznego CSP albo nonce-less header.
2. **Cookie-based personalization** — żaden marketing route nie może czytać
   `cookies()` bezpośrednio, bo to opt-out z static rendering.
3. **Search params** — `/baza-wiedzy?tag=foo` — Next.js domyślnie nie
   cache'uje route'ów z `searchParams`. Workaround: prerender popularnych tagów
   albo użycie `?` jako klucza cache.

## Jak testować lokalnie?

```bash
cd apps/web && npm run build
npm run start
# Otwórz curl -I http://localhost:3000/cennik
# Spodziewaj się:
#   Cache-Control: public, max-age=600, s-maxage=21600, stale-while-revalidate=604800
#   Vary: Accept-Encoding
```

Na Vercel: `curl -I https://dlugomat.pl/cennik | grep -E '(cache|x-vercel)'`.
Header `x-vercel-cache: HIT` = sukces.

---

**Last updated**: 2026-05-10
**Owner**: perf@dlugomat.pl
**Related**: `next.config.mjs` (headers), `docs/RUNBOOK.md` §3 (monitoring)
