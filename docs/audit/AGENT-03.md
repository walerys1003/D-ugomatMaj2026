# AGENT-03 — Backend systems

**Focus:** 176 API routes parity, RBAC central, idempotency, rate-limit gating, server actions migration, public API v1.
**Sandbox:** C

**Total tasks owned:** 80
**Total effort:** 323h
**Severity breakdown:** P0 28 · P1 37 · P2 14 · P3 1

## Tasks owned

| ID | Tier | Sub | Sev | Effort | Description |
|---|---|---|---|---:|---|
| **T001-006** | T01 | BE | P0 | 6h | Missing route /api endpoint group 1 (auth/wizard/orgs critical) |
| **T001-007** | T01 | SEC | P0 | 5h | Centralize RBAC helper in lib/rbac/index.ts adapter 1 |
| **T001-016** | T01 | BE | P0 | 6h | Missing route /api endpoint group 2 (auth/wizard/orgs critical) |
| **T001-017** | T01 | SEC | P0 | 5h | Centralize RBAC helper in lib/rbac/index.ts adapter 2 |
| **T001-026** | T01 | BE | P0 | 6h | Missing route /api endpoint group 3 (auth/wizard/orgs critical) |
| **T001-027** | T01 | SEC | P0 | 5h | Centralize RBAC helper in lib/rbac/index.ts adapter 3 |
| **T001-036** | T01 | BE | P0 | 6h | Missing route /api endpoint group 4 (auth/wizard/orgs critical) |
| **T001-037** | T01 | SEC | P0 | 5h | Centralize RBAC helper in lib/rbac/index.ts adapter 4 |
| **T001-046** | T01 | BE | P0 | 6h | Missing route /api endpoint group 5 (auth/wizard/orgs critical) |
| **T001-047** | T01 | SEC | P0 | 5h | Centralize RBAC helper in lib/rbac/index.ts adapter 5 |
| **T001-056** | T01 | BE | P1 | 5h | Missing route /api endpoint group 6 (auth/wizard/orgs critical) |
| **T001-057** | T01 | SEC | P1 | 4h | Centralize RBAC helper in lib/rbac/index.ts adapter 6 |
| **T001-066** | T01 | BE | P1 | 5h | Missing route /api endpoint group 7 (auth/wizard/orgs critical) |
| **T001-067** | T01 | SEC | P1 | 4h | Centralize RBAC helper in lib/rbac/index.ts adapter 7 |
| **T001-076** | T01 | BE | P1 | 5h | Missing route /api endpoint group 8 (auth/wizard/orgs critical) |
| **T001-077** | T01 | SEC | P1 | 4h | Centralize RBAC helper in lib/rbac/index.ts adapter 8 |
| **T001-086** | T01 | BE | P1 | 5h | Missing route /api endpoint group 9 (auth/wizard/orgs critical) |
| **T001-087** | T01 | SEC | P2 | 3h | Centralize RBAC helper in lib/rbac/index.ts adapter 9 |
| **T001-096** | T01 | BE | P2 | 4h | Missing route /api endpoint group 10 (auth/wizard/orgs critical) |
| **T001-097** | T01 | SEC | P2 | 3h | Centralize RBAC helper in lib/rbac/index.ts adapter 10 |
| **T003-001** | T03 | BE | P0 | 6h | Implement missing endpoint /api/* group 1 (Supabase RPC + zod schema) |
| **T003-002** | T03 | BE | P0 | 3h | API janitor pass: tag 10 orphan routes batch 1 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-004** | T03 | SEC | P0 | 4h | Rate-limit gate enforcement for namespace group 1 |
| **T003-005** | T03 | BE | P0 | 5h | Idempotency-Key header support for write endpoints batch 1 |
| **T003-006** | T03 | BE | P0 | 4h | Zod schema enforcement for endpoint batch 1 |
| **T003-010** | T03 | BE | P0 | 6h | Public API v1 endpoint 1 (cases/documents/billing) |
| **T003-011** | T03 | BE | P0 | 6h | Implement missing endpoint /api/* group 2 (Supabase RPC + zod schema) |
| **T003-012** | T03 | BE | P0 | 3h | API janitor pass: tag 10 orphan routes batch 2 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-014** | T03 | SEC | P0 | 4h | Rate-limit gate enforcement for namespace group 2 |
| **T003-015** | T03 | BE | P0 | 5h | Idempotency-Key header support for write endpoints batch 2 |
| **T003-016** | T03 | BE | P0 | 4h | Zod schema enforcement for endpoint batch 2 |
| **T003-020** | T03 | BE | P0 | 6h | Public API v1 endpoint 2 (cases/documents/billing) |
| **T003-021** | T03 | BE | P0 | 6h | Implement missing endpoint /api/* group 3 (Supabase RPC + zod schema) |
| **T003-022** | T03 | BE | P0 | 3h | API janitor pass: tag 10 orphan routes batch 3 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-024** | T03 | SEC | P0 | 4h | Rate-limit gate enforcement for namespace group 3 |
| **T003-025** | T03 | BE | P0 | 5h | Idempotency-Key header support for write endpoints batch 3 |
| **T003-026** | T03 | BE | P0 | 4h | Zod schema enforcement for endpoint batch 3 |
| **T003-030** | T03 | BE | P0 | 6h | Public API v1 endpoint 3 (cases/documents/billing) |
| **T003-031** | T03 | BE | P1 | 5h | Implement missing endpoint /api/* group 4 (Supabase RPC + zod schema) |
| **T003-032** | T03 | BE | P1 | 2h | API janitor pass: tag 10 orphan routes batch 4 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-034** | T03 | SEC | P1 | 3h | Rate-limit gate enforcement for namespace group 4 |
| **T003-035** | T03 | BE | P1 | 4h | Idempotency-Key header support for write endpoints batch 4 |
| **T003-036** | T03 | BE | P1 | 3h | Zod schema enforcement for endpoint batch 4 |
| **T003-040** | T03 | BE | P1 | 5h | Public API v1 endpoint 4 (cases/documents/billing) |
| **T003-041** | T03 | BE | P1 | 5h | Implement missing endpoint /api/* group 5 (Supabase RPC + zod schema) |
| **T003-042** | T03 | BE | P1 | 2h | API janitor pass: tag 10 orphan routes batch 5 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-044** | T03 | SEC | P1 | 3h | Rate-limit gate enforcement for namespace group 5 |
| **T003-045** | T03 | BE | P1 | 4h | Idempotency-Key header support for write endpoints batch 5 |
| **T003-046** | T03 | BE | P1 | 3h | Zod schema enforcement for endpoint batch 5 |
| **T003-050** | T03 | BE | P1 | 5h | Public API v1 endpoint 5 (cases/documents/billing) |
| **T003-051** | T03 | BE | P1 | 5h | Implement missing endpoint /api/* group 6 (Supabase RPC + zod schema) |
| **T003-052** | T03 | BE | P1 | 2h | API janitor pass: tag 10 orphan routes batch 6 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-054** | T03 | SEC | P1 | 3h | Rate-limit gate enforcement for namespace group 6 |
| **T003-055** | T03 | BE | P1 | 4h | Idempotency-Key header support for write endpoints batch 6 |
| **T003-056** | T03 | BE | P1 | 3h | Zod schema enforcement for endpoint batch 6 |
| **T003-060** | T03 | BE | P1 | 5h | Public API v1 endpoint 6 (cases/documents/billing) |
| **T003-061** | T03 | BE | P1 | 5h | Implement missing endpoint /api/* group 7 (Supabase RPC + zod schema) |
| **T003-062** | T03 | BE | P1 | 2h | API janitor pass: tag 10 orphan routes batch 7 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-064** | T03 | SEC | P1 | 3h | Rate-limit gate enforcement for namespace group 7 |
| **T003-065** | T03 | BE | P1 | 4h | Idempotency-Key header support for write endpoints batch 7 |
| **T003-066** | T03 | BE | P1 | 3h | Zod schema enforcement for endpoint batch 7 |
| **T003-070** | T03 | BE | P1 | 5h | Public API v1 endpoint 7 (cases/documents/billing) |
| **T003-071** | T03 | BE | P1 | 5h | Implement missing endpoint /api/* group 8 (Supabase RPC + zod schema) |
| **T003-072** | T03 | BE | P1 | 2h | API janitor pass: tag 10 orphan routes batch 8 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-074** | T03 | SEC | P1 | 3h | Rate-limit gate enforcement for namespace group 8 |
| **T003-075** | T03 | BE | P1 | 4h | Idempotency-Key header support for write endpoints batch 8 |
| **T003-076** | T03 | BE | P1 | 3h | Zod schema enforcement for endpoint batch 8 |
| **T003-080** | T03 | BE | P1 | 5h | Public API v1 endpoint 8 (cases/documents/billing) |
| **T003-081** | T03 | BE | P2 | 4h | Implement missing endpoint /api/* group 9 (Supabase RPC + zod schema) |
| **T003-082** | T03 | BE | P2 | 1h | API janitor pass: tag 10 orphan routes batch 9 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-084** | T03 | SEC | P2 | 2h | Rate-limit gate enforcement for namespace group 9 |
| **T003-085** | T03 | BE | P2 | 3h | Idempotency-Key header support for write endpoints batch 9 |
| **T003-086** | T03 | BE | P2 | 2h | Zod schema enforcement for endpoint batch 9 |
| **T003-090** | T03 | BE | P2 | 4h | Public API v1 endpoint 9 (cases/documents/billing) |
| **T003-091** | T03 | BE | P2 | 4h | Implement missing endpoint /api/* group 10 (Supabase RPC + zod schema) |
| **T003-092** | T03 | BE | P2 | 1h | API janitor pass: tag 10 orphan routes batch 10 (label `@internal` JSDoc + remove from public OpenAPI) |
| **T003-094** | T03 | SEC | P2 | 2h | Rate-limit gate enforcement for namespace group 10 |
| **T003-095** | T03 | BE | P2 | 3h | Idempotency-Key header support for write endpoints batch 10 |
| **T003-096** | T03 | BE | P2 | 2h | Zod schema enforcement for endpoint batch 10 |
| **T003-100** | T03 | BE | P3 | 4h | Public API v1 endpoint 10 (cases/documents/billing) |

## Dependency graph (high-level)

- Depends on:
  - AGENT-04 (DB schema), AGENT-07 (RBAC central).
- Blocks:
  - AGENT-05, AGENT-06, AGENT-07, AGENT-08.
