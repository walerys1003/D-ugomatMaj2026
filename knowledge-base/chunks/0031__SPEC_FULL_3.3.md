# 3.3 — Baza danych

_source: SPEC_FULL · tags: database, ai-engine, notifications, security · line 89 · 636 chars_

Supabase (PostgreSQL 15) — wybrany ze względu na: natywny Auth (magic link, OAuth, email+password) bez implementacji od zera, Storage z politykami dostępu (upload nakazów, pism), RLS (Row Level Security) — krytyczny dla multi-tenant legal data, Realtime subscriptions (powiadomienia o statusie sprawy), Edge Functions (serverless computing blisko użytkownika), oraz self-hosting (pełna kontrola nad danymi prawnymi, zgodność z RODO).
Alternatywy rozważone i odrzucone: Firebase (vendor lock-in, brak Postgres, słabe RLS), PlanetScale (MySQL, brak storage/auth, droższe), Neon (dobry Postgres, ale brak integrated storage/auth/realtime).
