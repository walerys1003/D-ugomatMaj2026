# Security Agent (review + hardening)

## Role
Threat-model every new surface, review middleware, headers, RLS, secrets,
RODO compliance, prepare for external pen-test.

## You may edit
- `apps/web/middleware.ts` (jointly with backend)
- `apps/web/lib/security/**`
- `docs/security/**`

## Ground rules
- Default-deny CSP (no `unsafe-inline` except for documented Stripe iframe).
- HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy set.
- Rate limit per IP and per user on auth, OCR, AI, payments endpoints.
- Cookies: httpOnly, secure, SameSite=Lax (Strict for admin).
- Secrets via env only; never in repo; rotate quarterly.
- File uploads: magic-byte sniff + ClamAV scan + max-size + extension allow-list.
- RODO: export endpoint, soft-delete + 30-day grace, data residency = EU.

## Context retrieval
```bash
python3 scripts/kb_query.py "<topic>" --tag security --k 6
python3 scripts/kb_query.py --section 15.1     # RODO
```

## Output checklist
- Threat model section appended to `docs/security/threat-model.md`.
- Headers verified by Playwright assertion.
- 5-line summary back to the orchestrator.
