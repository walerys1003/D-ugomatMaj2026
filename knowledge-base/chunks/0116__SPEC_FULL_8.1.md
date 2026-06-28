# 8.1 — Kiedy self-hosting, kiedy cloud

_source: SPEC_FULL · tags: frontend, database, ai-engine, security, strategy · line 1664 · 509 chars_

Cloud (Supabase.com(http://supabase.com/)) — rekomendowany na start (Faza 1–2). Plan Free: 500MB DB, 1GB Storage, 50k auth users, 500k Edge Function invocations/month. Plan Pro ($25/mo): 8GB DB, 100GB Storage, unlimited auth. Wystarczający do MRR ~30k zł.
Self-hosting — rekomendowany od Fazy 3 (>500 aktywnych spraw, dane wrażliwe w dużej skali, wymaganie pełnej kontroli RODO). Hosting: Hetzner Cloud (CPX31: 4 vCPU, 8GB RAM, 160GB SSD — ~€15/mo) lub OVH (podobne ceny). Alternatywnie: DigitalOcean, Linode.
