# TIER-01 — Critical infrastructure

**Primary agent:** AGENT-01 Frontend architecture
**Sandbox primary:** A
**Subsystems:** Frontend (V4), Frontend (V5), Observability, Database (RLS), Performance
**Intent:** Unlock production launch: Suspense, error boundaries, missing global root primitives, FORCE RLS on top tables, PostHog provider wiring, edge runtime baseline.

**Severity mix:** P0 55% · P1 30% · P2 13% · P3 2%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T001-001** | FE | P0 | 4h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 1) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-002** | FE | P0 | 4h | A01 | A | Suspense boundary for panel/* heavy route #1 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-003** | FE | P0 | 5h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 1 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-004** | OBS | P0 | 4h | A07 | G | PostHogProvider wire-up for (panel) section 1 | — | PostHog dashboard shows events | comment out provider |
| **T001-005** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 1/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-006** | BE | P0 | 6h | A03 | C | Missing route /api endpoint group 1 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-007** | SEC | P0 | 5h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 1 | — | rbac unit tests pass | restore inline checks |
| **T001-008** | PERF | P0 | 3h | A09 | I | Add ISR / revalidate to marketing page bucket 1 | — | build manifest shows ISR | remove revalidate |
| **T001-009** | OBS | P0 | 3h | A07 | G | Sentry breadcrumb taxonomy for module group 1 | — | test event lands with breadcrumb | git revert |
| **T001-010** | FE | P0 | 3h | A01 | A | Skeleton shimmer primitive (variant 1) for top route group | — | visual scan equality | remove skeleton |
| **T001-011** | FE | P0 | 4h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 2) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-012** | FE | P0 | 4h | A01 | A | Suspense boundary for panel/* heavy route #2 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-013** | FE | P0 | 5h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 2 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-014** | OBS | P0 | 4h | A07 | G | PostHogProvider wire-up for (panel) section 2 | — | PostHog dashboard shows events | comment out provider |
| **T001-015** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 2/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-016** | BE | P0 | 6h | A03 | C | Missing route /api endpoint group 2 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-017** | SEC | P0 | 5h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 2 | — | rbac unit tests pass | restore inline checks |
| **T001-018** | PERF | P0 | 3h | A09 | I | Add ISR / revalidate to marketing page bucket 2 | — | build manifest shows ISR | remove revalidate |
| **T001-019** | OBS | P0 | 3h | A07 | G | Sentry breadcrumb taxonomy for module group 2 | — | test event lands with breadcrumb | git revert |
| **T001-020** | FE | P0 | 3h | A01 | A | Skeleton shimmer primitive (variant 2) for top route group | — | visual scan equality | remove skeleton |
| **T001-021** | FE | P0 | 4h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 3) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-022** | FE | P0 | 4h | A01 | A | Suspense boundary for panel/* heavy route #3 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-023** | FE | P0 | 5h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 3 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-024** | OBS | P0 | 4h | A07 | G | PostHogProvider wire-up for (panel) section 3 | — | PostHog dashboard shows events | comment out provider |
| **T001-025** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 3/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-026** | BE | P0 | 6h | A03 | C | Missing route /api endpoint group 3 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-027** | SEC | P0 | 5h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 3 | — | rbac unit tests pass | restore inline checks |
| **T001-028** | PERF | P0 | 3h | A09 | I | Add ISR / revalidate to marketing page bucket 3 | — | build manifest shows ISR | remove revalidate |
| **T001-029** | OBS | P0 | 3h | A07 | G | Sentry breadcrumb taxonomy for module group 3 | — | test event lands with breadcrumb | git revert |
| **T001-030** | FE | P0 | 3h | A01 | A | Skeleton shimmer primitive (variant 3) for top route group | — | visual scan equality | remove skeleton |
| **T001-031** | FE | P0 | 4h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 4) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-032** | FE | P0 | 4h | A01 | A | Suspense boundary for panel/* heavy route #4 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-033** | FE | P0 | 5h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 4 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-034** | OBS | P0 | 4h | A07 | G | PostHogProvider wire-up for (panel) section 4 | — | PostHog dashboard shows events | comment out provider |
| **T001-035** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 4/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-036** | BE | P0 | 6h | A03 | C | Missing route /api endpoint group 4 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-037** | SEC | P0 | 5h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 4 | — | rbac unit tests pass | restore inline checks |
| **T001-038** | PERF | P0 | 3h | A09 | I | Add ISR / revalidate to marketing page bucket 4 | — | build manifest shows ISR | remove revalidate |
| **T001-039** | OBS | P0 | 3h | A07 | G | Sentry breadcrumb taxonomy for module group 4 | — | test event lands with breadcrumb | git revert |
| **T001-040** | FE | P0 | 3h | A01 | A | Skeleton shimmer primitive (variant 4) for top route group | — | visual scan equality | remove skeleton |
| **T001-041** | FE | P0 | 4h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 5) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-042** | FE | P0 | 4h | A01 | A | Suspense boundary for panel/* heavy route #5 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-043** | FE | P0 | 5h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 5 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-044** | OBS | P0 | 4h | A07 | G | PostHogProvider wire-up for (panel) section 5 | — | PostHog dashboard shows events | comment out provider |
| **T001-045** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 5/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-046** | BE | P0 | 6h | A03 | C | Missing route /api endpoint group 5 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-047** | SEC | P0 | 5h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 5 | — | rbac unit tests pass | restore inline checks |
| **T001-048** | PERF | P0 | 3h | A09 | I | Add ISR / revalidate to marketing page bucket 5 | — | build manifest shows ISR | remove revalidate |
| **T001-049** | OBS | P0 | 3h | A07 | G | Sentry breadcrumb taxonomy for module group 5 | — | test event lands with breadcrumb | git revert |
| **T001-050** | FE | P0 | 3h | A01 | A | Skeleton shimmer primitive (variant 5) for top route group | — | visual scan equality | remove skeleton |
| **T001-051** | FE | P0 | 4h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 6) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-052** | FE | P0 | 4h | A01 | A | Suspense boundary for panel/* heavy route #6 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-053** | FE | P0 | 5h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 6 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-054** | OBS | P0 | 4h | A07 | G | PostHogProvider wire-up for (panel) section 6 | — | PostHog dashboard shows events | comment out provider |
| **T001-055** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 6/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-056** | BE | P1 | 5h | A03 | C | Missing route /api endpoint group 6 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-057** | SEC | P1 | 4h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 6 | — | rbac unit tests pass | restore inline checks |
| **T001-058** | PERF | P1 | 2h | A09 | I | Add ISR / revalidate to marketing page bucket 6 | — | build manifest shows ISR | remove revalidate |
| **T001-059** | OBS | P1 | 2h | A07 | G | Sentry breadcrumb taxonomy for module group 6 | — | test event lands with breadcrumb | git revert |
| **T001-060** | FE | P1 | 2h | A01 | A | Skeleton shimmer primitive (variant 6) for top route group | — | visual scan equality | remove skeleton |
| **T001-061** | FE | P1 | 3h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 7) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-062** | FE | P1 | 3h | A01 | A | Suspense boundary for panel/* heavy route #7 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-063** | FE | P1 | 4h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 7 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-064** | OBS | P1 | 3h | A07 | G | PostHogProvider wire-up for (panel) section 7 | — | PostHog dashboard shows events | comment out provider |
| **T001-065** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 7/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-066** | BE | P1 | 5h | A03 | C | Missing route /api endpoint group 7 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-067** | SEC | P1 | 4h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 7 | — | rbac unit tests pass | restore inline checks |
| **T001-068** | PERF | P1 | 2h | A09 | I | Add ISR / revalidate to marketing page bucket 7 | — | build manifest shows ISR | remove revalidate |
| **T001-069** | OBS | P1 | 2h | A07 | G | Sentry breadcrumb taxonomy for module group 7 | — | test event lands with breadcrumb | git revert |
| **T001-070** | FE | P1 | 2h | A01 | A | Skeleton shimmer primitive (variant 7) for top route group | — | visual scan equality | remove skeleton |
| **T001-071** | FE | P1 | 3h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 8) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-072** | FE | P1 | 3h | A01 | A | Suspense boundary for panel/* heavy route #8 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-073** | FE | P1 | 4h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 8 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-074** | OBS | P1 | 3h | A07 | G | PostHogProvider wire-up for (panel) section 8 | — | PostHog dashboard shows events | comment out provider |
| **T001-075** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 8/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-076** | BE | P1 | 5h | A03 | C | Missing route /api endpoint group 8 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-077** | SEC | P1 | 4h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 8 | — | rbac unit tests pass | restore inline checks |
| **T001-078** | PERF | P1 | 2h | A09 | I | Add ISR / revalidate to marketing page bucket 8 | — | build manifest shows ISR | remove revalidate |
| **T001-079** | OBS | P1 | 2h | A07 | G | Sentry breadcrumb taxonomy for module group 8 | — | test event lands with breadcrumb | git revert |
| **T001-080** | FE | P1 | 2h | A01 | A | Skeleton shimmer primitive (variant 8) for top route group | — | visual scan equality | remove skeleton |
| **T001-081** | FE | P1 | 3h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 9) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-082** | FE | P1 | 3h | A01 | A | Suspense boundary for panel/* heavy route #9 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-083** | FE | P1 | 4h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 9 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-084** | OBS | P1 | 3h | A07 | G | PostHogProvider wire-up for (panel) section 9 | — | PostHog dashboard shows events | comment out provider |
| **T001-085** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 9/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-086** | BE | P1 | 5h | A03 | C | Missing route /api endpoint group 9 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-087** | SEC | P2 | 3h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 9 | — | rbac unit tests pass | restore inline checks |
| **T001-088** | PERF | P2 | 1h | A09 | I | Add ISR / revalidate to marketing page bucket 9 | — | build manifest shows ISR | remove revalidate |
| **T001-089** | OBS | P2 | 1h | A07 | G | Sentry breadcrumb taxonomy for module group 9 | — | test event lands with breadcrumb | git revert |
| **T001-090** | FE | P2 | 1h | A01 | A | Skeleton shimmer primitive (variant 9) for top route group | — | visual scan equality | remove skeleton |
| **T001-091** | FE | P2 | 2h | A01 | A | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 10) | — | pnpm build OK + manual 404/error trigger | git revert |
| **T001-092** | FE | P2 | 2h | A01 | A | Suspense boundary for panel/* heavy route #10 | — | Lighthouse TBT < 200ms | remove <Suspense> |
| **T001-093** | FE | P2 | 3h | A01 | A | ErrorBoundary HOC with telemetry beacon variant 10 | T001-001 | Sentry receives test error | revert wrapper |
| **T001-094** | OBS | P2 | 2h | A07 | G | PostHogProvider wire-up for (panel) section 10 | — | PostHog dashboard shows events | comment out provider |
| **T001-095** | DB | P2 | 2h | A04 | D | FORCE RLS migration batch 10/29 (5 tables/batch) | — | supabase test passes; orphan-table assertion | down migration |
| **T001-096** | BE | P2 | 4h | A03 | C | Missing route /api endpoint group 10 (auth/wizard/orgs critical) | — | Playwright e2e + zod schema | delete route.ts |
| **T001-097** | SEC | P2 | 3h | A03 | C | Centralize RBAC helper in lib/rbac/index.ts adapter 10 | — | rbac unit tests pass | restore inline checks |
| **T001-098** | PERF | P2 | 1h | A09 | I | Add ISR / revalidate to marketing page bucket 10 | — | build manifest shows ISR | remove revalidate |
| **T001-099** | OBS | P2 | 1h | A07 | G | Sentry breadcrumb taxonomy for module group 10 | — | test event lands with breadcrumb | git revert |
| **T001-100** | FE | P3 | 1h | A01 | A | Skeleton shimmer primitive (variant 10) for top route group | — | visual scan equality | remove skeleton |

> **Total tasks:** 100 · **Estimated effort:** 351h
