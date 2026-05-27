# TIER-03 — Backend parity FE↔BE

**Primary agent:** AGENT-03 Backend systems
**Sandbox primary:** C
**Subsystems:** Backend (APIs), APIs (parity FE↔BE), Security
**Intent:** Implementacja 58 missing API routes + sanityzacja 133 orphan routes (kill/internal/wire). Centralizacja RBAC, idempotency keys, rate-limit gate, request ID propagation, validation zod schemas in routes.

**Severity mix:** P0 30% · P1 50% · P2 18% · P3 2%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T003-001** | BE | P0 | 6h | A03 | C | Implement missing endpoint /api/* group 1 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-002** | BE | P0 | 3h | A03 | C | API janitor pass: tag 10 orphan routes batch 1 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-003** | BE | P0 | 8h | A06 | F | OAuth provider 1 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-004** | SEC | P0 | 4h | A03 | C | Rate-limit gate enforcement for namespace group 1 | — | rate-limit hits return 429 | remove middleware |
| **T003-005** | BE | P0 | 5h | A03 | C | Idempotency-Key header support for write endpoints batch 1 | — | duplicate POST returns same result | remove key check |
| **T003-006** | BE | P0 | 4h | A03 | C | Zod schema enforcement for endpoint batch 1 | — | 400 on schema fail | remove schema |
| **T003-007** | BE | P0 | 4h | A07 | G | Request-ID propagation through Supabase RPC group 1 | — | trace appears in Sentry | remove header |
| **T003-008** | BE | P0 | 5h | A06 | F | Webhook signature verification for endpoint 1 | — | invalid signature rejected | disable check |
| **T003-009** | BE | P0 | 5h | A01 | A | Server actions migration for FE form group 1 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-010** | BE | P0 | 6h | A03 | C | Public API v1 endpoint 1 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-011** | BE | P0 | 6h | A03 | C | Implement missing endpoint /api/* group 2 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-012** | BE | P0 | 3h | A03 | C | API janitor pass: tag 10 orphan routes batch 2 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-013** | BE | P0 | 8h | A06 | F | OAuth provider 2 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-014** | SEC | P0 | 4h | A03 | C | Rate-limit gate enforcement for namespace group 2 | — | rate-limit hits return 429 | remove middleware |
| **T003-015** | BE | P0 | 5h | A03 | C | Idempotency-Key header support for write endpoints batch 2 | — | duplicate POST returns same result | remove key check |
| **T003-016** | BE | P0 | 4h | A03 | C | Zod schema enforcement for endpoint batch 2 | — | 400 on schema fail | remove schema |
| **T003-017** | BE | P0 | 4h | A07 | G | Request-ID propagation through Supabase RPC group 2 | — | trace appears in Sentry | remove header |
| **T003-018** | BE | P0 | 5h | A06 | F | Webhook signature verification for endpoint 2 | — | invalid signature rejected | disable check |
| **T003-019** | BE | P0 | 5h | A01 | A | Server actions migration for FE form group 2 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-020** | BE | P0 | 6h | A03 | C | Public API v1 endpoint 2 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-021** | BE | P0 | 6h | A03 | C | Implement missing endpoint /api/* group 3 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-022** | BE | P0 | 3h | A03 | C | API janitor pass: tag 10 orphan routes batch 3 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-023** | BE | P0 | 8h | A06 | F | OAuth provider 3 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-024** | SEC | P0 | 4h | A03 | C | Rate-limit gate enforcement for namespace group 3 | — | rate-limit hits return 429 | remove middleware |
| **T003-025** | BE | P0 | 5h | A03 | C | Idempotency-Key header support for write endpoints batch 3 | — | duplicate POST returns same result | remove key check |
| **T003-026** | BE | P0 | 4h | A03 | C | Zod schema enforcement for endpoint batch 3 | — | 400 on schema fail | remove schema |
| **T003-027** | BE | P0 | 4h | A07 | G | Request-ID propagation through Supabase RPC group 3 | — | trace appears in Sentry | remove header |
| **T003-028** | BE | P0 | 5h | A06 | F | Webhook signature verification for endpoint 3 | — | invalid signature rejected | disable check |
| **T003-029** | BE | P0 | 5h | A01 | A | Server actions migration for FE form group 3 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-030** | BE | P0 | 6h | A03 | C | Public API v1 endpoint 3 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-031** | BE | P1 | 5h | A03 | C | Implement missing endpoint /api/* group 4 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-032** | BE | P1 | 2h | A03 | C | API janitor pass: tag 10 orphan routes batch 4 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-033** | BE | P1 | 7h | A06 | F | OAuth provider 4 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-034** | SEC | P1 | 3h | A03 | C | Rate-limit gate enforcement for namespace group 4 | — | rate-limit hits return 429 | remove middleware |
| **T003-035** | BE | P1 | 4h | A03 | C | Idempotency-Key header support for write endpoints batch 4 | — | duplicate POST returns same result | remove key check |
| **T003-036** | BE | P1 | 3h | A03 | C | Zod schema enforcement for endpoint batch 4 | — | 400 on schema fail | remove schema |
| **T003-037** | BE | P1 | 3h | A07 | G | Request-ID propagation through Supabase RPC group 4 | — | trace appears in Sentry | remove header |
| **T003-038** | BE | P1 | 4h | A06 | F | Webhook signature verification for endpoint 4 | — | invalid signature rejected | disable check |
| **T003-039** | BE | P1 | 4h | A01 | A | Server actions migration for FE form group 4 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-040** | BE | P1 | 5h | A03 | C | Public API v1 endpoint 4 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-041** | BE | P1 | 5h | A03 | C | Implement missing endpoint /api/* group 5 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-042** | BE | P1 | 2h | A03 | C | API janitor pass: tag 10 orphan routes batch 5 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-043** | BE | P1 | 7h | A06 | F | OAuth provider 5 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-044** | SEC | P1 | 3h | A03 | C | Rate-limit gate enforcement for namespace group 5 | — | rate-limit hits return 429 | remove middleware |
| **T003-045** | BE | P1 | 4h | A03 | C | Idempotency-Key header support for write endpoints batch 5 | — | duplicate POST returns same result | remove key check |
| **T003-046** | BE | P1 | 3h | A03 | C | Zod schema enforcement for endpoint batch 5 | — | 400 on schema fail | remove schema |
| **T003-047** | BE | P1 | 3h | A07 | G | Request-ID propagation through Supabase RPC group 5 | — | trace appears in Sentry | remove header |
| **T003-048** | BE | P1 | 4h | A06 | F | Webhook signature verification for endpoint 5 | — | invalid signature rejected | disable check |
| **T003-049** | BE | P1 | 4h | A01 | A | Server actions migration for FE form group 5 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-050** | BE | P1 | 5h | A03 | C | Public API v1 endpoint 5 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-051** | BE | P1 | 5h | A03 | C | Implement missing endpoint /api/* group 6 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-052** | BE | P1 | 2h | A03 | C | API janitor pass: tag 10 orphan routes batch 6 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-053** | BE | P1 | 7h | A06 | F | OAuth provider 6 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-054** | SEC | P1 | 3h | A03 | C | Rate-limit gate enforcement for namespace group 6 | — | rate-limit hits return 429 | remove middleware |
| **T003-055** | BE | P1 | 4h | A03 | C | Idempotency-Key header support for write endpoints batch 6 | — | duplicate POST returns same result | remove key check |
| **T003-056** | BE | P1 | 3h | A03 | C | Zod schema enforcement for endpoint batch 6 | — | 400 on schema fail | remove schema |
| **T003-057** | BE | P1 | 3h | A07 | G | Request-ID propagation through Supabase RPC group 6 | — | trace appears in Sentry | remove header |
| **T003-058** | BE | P1 | 4h | A06 | F | Webhook signature verification for endpoint 6 | — | invalid signature rejected | disable check |
| **T003-059** | BE | P1 | 4h | A01 | A | Server actions migration for FE form group 6 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-060** | BE | P1 | 5h | A03 | C | Public API v1 endpoint 6 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-061** | BE | P1 | 5h | A03 | C | Implement missing endpoint /api/* group 7 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-062** | BE | P1 | 2h | A03 | C | API janitor pass: tag 10 orphan routes batch 7 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-063** | BE | P1 | 7h | A06 | F | OAuth provider 7 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-064** | SEC | P1 | 3h | A03 | C | Rate-limit gate enforcement for namespace group 7 | — | rate-limit hits return 429 | remove middleware |
| **T003-065** | BE | P1 | 4h | A03 | C | Idempotency-Key header support for write endpoints batch 7 | — | duplicate POST returns same result | remove key check |
| **T003-066** | BE | P1 | 3h | A03 | C | Zod schema enforcement for endpoint batch 7 | — | 400 on schema fail | remove schema |
| **T003-067** | BE | P1 | 3h | A07 | G | Request-ID propagation through Supabase RPC group 7 | — | trace appears in Sentry | remove header |
| **T003-068** | BE | P1 | 4h | A06 | F | Webhook signature verification for endpoint 7 | — | invalid signature rejected | disable check |
| **T003-069** | BE | P1 | 4h | A01 | A | Server actions migration for FE form group 7 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-070** | BE | P1 | 5h | A03 | C | Public API v1 endpoint 7 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-071** | BE | P1 | 5h | A03 | C | Implement missing endpoint /api/* group 8 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-072** | BE | P1 | 2h | A03 | C | API janitor pass: tag 10 orphan routes batch 8 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-073** | BE | P1 | 7h | A06 | F | OAuth provider 8 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-074** | SEC | P1 | 3h | A03 | C | Rate-limit gate enforcement for namespace group 8 | — | rate-limit hits return 429 | remove middleware |
| **T003-075** | BE | P1 | 4h | A03 | C | Idempotency-Key header support for write endpoints batch 8 | — | duplicate POST returns same result | remove key check |
| **T003-076** | BE | P1 | 3h | A03 | C | Zod schema enforcement for endpoint batch 8 | — | 400 on schema fail | remove schema |
| **T003-077** | BE | P1 | 3h | A07 | G | Request-ID propagation through Supabase RPC group 8 | — | trace appears in Sentry | remove header |
| **T003-078** | BE | P1 | 4h | A06 | F | Webhook signature verification for endpoint 8 | — | invalid signature rejected | disable check |
| **T003-079** | BE | P1 | 4h | A01 | A | Server actions migration for FE form group 8 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-080** | BE | P1 | 5h | A03 | C | Public API v1 endpoint 8 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-081** | BE | P2 | 4h | A03 | C | Implement missing endpoint /api/* group 9 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-082** | BE | P2 | 1h | A03 | C | API janitor pass: tag 10 orphan routes batch 9 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-083** | BE | P2 | 6h | A06 | F | OAuth provider 9 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-084** | SEC | P2 | 2h | A03 | C | Rate-limit gate enforcement for namespace group 9 | — | rate-limit hits return 429 | remove middleware |
| **T003-085** | BE | P2 | 3h | A03 | C | Idempotency-Key header support for write endpoints batch 9 | — | duplicate POST returns same result | remove key check |
| **T003-086** | BE | P2 | 2h | A03 | C | Zod schema enforcement for endpoint batch 9 | — | 400 on schema fail | remove schema |
| **T003-087** | BE | P2 | 2h | A07 | G | Request-ID propagation through Supabase RPC group 9 | — | trace appears in Sentry | remove header |
| **T003-088** | BE | P2 | 3h | A06 | F | Webhook signature verification for endpoint 9 | — | invalid signature rejected | disable check |
| **T003-089** | BE | P2 | 3h | A01 | A | Server actions migration for FE form group 9 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-090** | BE | P2 | 4h | A03 | C | Public API v1 endpoint 9 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |
| **T003-091** | BE | P2 | 4h | A03 | C | Implement missing endpoint /api/* group 10 (Supabase RPC + zod schema) | — | Playwright e2e + zod schema + auth check | delete route.ts |
| **T003-092** | BE | P2 | 1h | A03 | C | API janitor pass: tag 10 orphan routes batch 10 (label `@internal` JSDoc + remove from public OpenAPI) | — | OpenAPI diff shows internal flag | git revert |
| **T003-093** | BE | P2 | 6h | A06 | F | OAuth provider 10 (Google/MS/Notion/Slack) start+callback | — | OAuth dance e2e | delete oauth routes |
| **T003-094** | SEC | P2 | 2h | A03 | C | Rate-limit gate enforcement for namespace group 10 | — | rate-limit hits return 429 | remove middleware |
| **T003-095** | BE | P2 | 3h | A03 | C | Idempotency-Key header support for write endpoints batch 10 | — | duplicate POST returns same result | remove key check |
| **T003-096** | BE | P2 | 2h | A03 | C | Zod schema enforcement for endpoint batch 10 | — | 400 on schema fail | remove schema |
| **T003-097** | BE | P2 | 2h | A07 | G | Request-ID propagation through Supabase RPC group 10 | — | trace appears in Sentry | remove header |
| **T003-098** | BE | P2 | 3h | A06 | F | Webhook signature verification for endpoint 10 | — | invalid signature rejected | disable check |
| **T003-099** | BE | P3 | 3h | A01 | A | Server actions migration for FE form group 10 | — | FE submit calls action, no /api network round-trip | revert to /api fetch |
| **T003-100** | BE | P3 | 4h | A03 | C | Public API v1 endpoint 10 (cases/documents/billing) | — | OpenAPI valid, auth bearer works | delete /v1/* route |

> **Total tasks:** 100 · **Estimated effort:** 410h
