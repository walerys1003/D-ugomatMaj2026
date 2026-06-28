# 6.1 — Middleware (Next.js Middleware)

_source: SPEC_FULL · tags: backend, database, ocr, payments · line 859 · 1249 chars_

Middleware uruchamia się na edge (przed SSR) i obsługuje następujące zadania:
Autoryzacja sesji: odczyt tokena sesji Supabase z cookie, weryfikacja ważności, refresh jeśli wygasa w ciągu 10 minut. Trasy /panel/* i /api/* (z wyjątkiem /api/auth/* i /api/payments/webhook) wymagają aktywnej sesji — brak sesji → redirect na /login?redirect={original_path}.
Rate limiting: token bucket per IP na edge. Limity: /api/ai/generate — 10 req/min (zapobiega abuse generowania), /api/ocr/upload — 20 req/min, /api/auth/* — 5 req/min (brute force protection), pozostałe API — 60 req/min. Przekroczenie → HTTP 429 z nagłówkiem Retry-After.
Geolokalizacja: header x-vercel-ip-country. Jeśli ≠ PL, wyświetl banner „Długomat jest przeznaczony dla polskiego systemu prawnego". Nie blokuj dostępu (Polacy za granicą).
Security headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=(), CSP z whitelistą domen (Supabase, Stripe, APIPod, PostHog, fonts.googleapis.com(http://fonts.googleapis.com/)).
Bot detection: user-agent filtering — blokuj znane scrapery na trasach /api/ai/*. Honeypot: ukryte pole formularza — wypełnienie = bot → silent reject.
