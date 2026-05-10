# 8.4 — Alternatywy do Supabase self-hosting

_source: SPEC_FULL · tags: database, ai-engine, security · line 1854 · 623 chars_

Jeśli self-hosting Supabase okaże się zbyt złożony dla solo-foundera, rozważyć: Supabase Cloud Pro ($25/mo) — najprostsza opcja, full managed, EU region available. Neon + Clerk + Uploadthing — PostgreSQL (Neon, serverless, auto-scale) + Auth (Clerk, lepszy UX auth niż Supabase) + File upload (Uploadthing) — łączny koszt ~$30-40/mo, ale więcej integracji do utrzymania. PocketBase — single binary, SQLite, auth, storage, realtime — idealny do MVP, ale brak pgvector i skalowania.
Rekomendacja: start na Supabase Cloud Free → migracja na Pro przy MRR > 2k zł → self-hosting przy MRR > 15k zł lub gdy wymaga tego audyt RODO.
