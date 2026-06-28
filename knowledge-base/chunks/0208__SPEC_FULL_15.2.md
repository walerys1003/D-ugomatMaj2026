# 15.2 — Szyfrowanie

_source: SPEC_FULL · tags: database, security, devops · line 2247 · 386 chars_

At-rest: Supabase Cloud automatyczne szyfrowanie (AES-256). Self-hosted: LUKS encryption na volume. Dane wrażliwe (PESEL): dodatkowe szyfrowanie na poziomie kolumny (pgcrypto encrypt()/decrypt() z server-side key). In-transit: TLS 1.3 (Vercel automatic, self-hosted via Nginx + Let’s Encrypt). API keys: nigdy w kodzie — env variables, Vercel encrypted env, self-hosted: Docker secrets.
