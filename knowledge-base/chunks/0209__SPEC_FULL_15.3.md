# 15.3 — Authentication Security

_source: SPEC_FULL · tags: backend, database, strategy · line 2249 · 325 chars_

Supabase Auth: bcrypt password hashing, JWT tokens (1h expiry, refresh tokens), rate limiting na auth endpoints (5 req/min). Magic link: link ważny 1h, single-use. CSRF: Supabase auth cookies z SameSite=Lax. XSS: React automatic escaping + CSP headers + sanitize user-generated content (DOMPurify na document content editor).
