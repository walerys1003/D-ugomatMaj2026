# AGENT-01 — Frontend architecture

**Focus:** Next.js App Router primitives, Suspense, error/loading boundaries, route groups, server vs client components, shadcn primitives, form architecture.
**Sandbox:** A

**Total tasks owned:** 100
**Total effort:** 302h
**Severity breakdown:** P0 31 · P1 40 · P2 25 · P3 4

## Tasks owned

| ID | Tier | Sub | Sev | Effort | Description |
|---|---|---|---|---:|---|
| **T001-001** | T01 | FE | P0 | 4h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 1) |
| **T001-002** | T01 | FE | P0 | 4h | Suspense boundary for panel/* heavy route #1 |
| **T001-003** | T01 | FE | P0 | 5h | ErrorBoundary HOC with telemetry beacon variant 1 |
| **T001-010** | T01 | FE | P0 | 3h | Skeleton shimmer primitive (variant 1) for top route group |
| **T001-011** | T01 | FE | P0 | 4h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 2) |
| **T001-012** | T01 | FE | P0 | 4h | Suspense boundary for panel/* heavy route #2 |
| **T001-013** | T01 | FE | P0 | 5h | ErrorBoundary HOC with telemetry beacon variant 2 |
| **T001-020** | T01 | FE | P0 | 3h | Skeleton shimmer primitive (variant 2) for top route group |
| **T001-021** | T01 | FE | P0 | 4h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 3) |
| **T001-022** | T01 | FE | P0 | 4h | Suspense boundary for panel/* heavy route #3 |
| **T001-023** | T01 | FE | P0 | 5h | ErrorBoundary HOC with telemetry beacon variant 3 |
| **T001-030** | T01 | FE | P0 | 3h | Skeleton shimmer primitive (variant 3) for top route group |
| **T001-031** | T01 | FE | P0 | 4h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 4) |
| **T001-032** | T01 | FE | P0 | 4h | Suspense boundary for panel/* heavy route #4 |
| **T001-033** | T01 | FE | P0 | 5h | ErrorBoundary HOC with telemetry beacon variant 4 |
| **T001-040** | T01 | FE | P0 | 3h | Skeleton shimmer primitive (variant 4) for top route group |
| **T001-041** | T01 | FE | P0 | 4h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 5) |
| **T001-042** | T01 | FE | P0 | 4h | Suspense boundary for panel/* heavy route #5 |
| **T001-043** | T01 | FE | P0 | 5h | ErrorBoundary HOC with telemetry beacon variant 5 |
| **T001-050** | T01 | FE | P0 | 3h | Skeleton shimmer primitive (variant 5) for top route group |
| **T001-051** | T01 | FE | P0 | 4h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 6) |
| **T001-052** | T01 | FE | P0 | 4h | Suspense boundary for panel/* heavy route #6 |
| **T001-053** | T01 | FE | P0 | 5h | ErrorBoundary HOC with telemetry beacon variant 6 |
| **T001-060** | T01 | FE | P1 | 2h | Skeleton shimmer primitive (variant 6) for top route group |
| **T001-061** | T01 | FE | P1 | 3h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 7) |
| **T001-062** | T01 | FE | P1 | 3h | Suspense boundary for panel/* heavy route #7 |
| **T001-063** | T01 | FE | P1 | 4h | ErrorBoundary HOC with telemetry beacon variant 7 |
| **T001-070** | T01 | FE | P1 | 2h | Skeleton shimmer primitive (variant 7) for top route group |
| **T001-071** | T01 | FE | P1 | 3h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 8) |
| **T001-072** | T01 | FE | P1 | 3h | Suspense boundary for panel/* heavy route #8 |
| **T001-073** | T01 | FE | P1 | 4h | ErrorBoundary HOC with telemetry beacon variant 8 |
| **T001-080** | T01 | FE | P1 | 2h | Skeleton shimmer primitive (variant 8) for top route group |
| **T001-081** | T01 | FE | P1 | 3h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 9) |
| **T001-082** | T01 | FE | P1 | 3h | Suspense boundary for panel/* heavy route #9 |
| **T001-083** | T01 | FE | P1 | 4h | ErrorBoundary HOC with telemetry beacon variant 9 |
| **T001-090** | T01 | FE | P2 | 1h | Skeleton shimmer primitive (variant 9) for top route group |
| **T001-091** | T01 | FE | P2 | 2h | Global error.tsx + loading.tsx + not-found.tsx for root layout (variant 10) |
| **T001-092** | T01 | FE | P2 | 2h | Suspense boundary for panel/* heavy route #10 |
| **T001-093** | T01 | FE | P2 | 3h | ErrorBoundary HOC with telemetry beacon variant 10 |
| **T001-100** | T01 | FE | P3 | 1h | Skeleton shimmer primitive (variant 10) for top route group |
| **T002-001** | T02 | FE | P0 | 4h | Zod-resolver migration for form 1 (5 forms / batch) |
| **T002-003** | T02 | FE | P0 | 4h | _legacy archive sweep batch 1 (20 files) |
| **T002-004** | T02 | FE | P0 | 3h | Dead button audit for namespace 1 |
| **T002-009** | T02 | FE | P0 | 4h | Responsive breakpoint sweep for layout 1 |
| **T002-010** | T02 | FE | P0 | 4h | useFormState + useTransition adoption for form 1 |
| **T002-011** | T02 | FE | P1 | 3h | Zod-resolver migration for form 2 (5 forms / batch) |
| **T002-013** | T02 | FE | P1 | 3h | _legacy archive sweep batch 2 (20 files) |
| **T002-014** | T02 | FE | P1 | 2h | Dead button audit for namespace 2 |
| **T002-019** | T02 | FE | P1 | 3h | Responsive breakpoint sweep for layout 2 |
| **T002-020** | T02 | FE | P1 | 3h | useFormState + useTransition adoption for form 2 |
| **T002-021** | T02 | FE | P1 | 3h | Zod-resolver migration for form 3 (5 forms / batch) |
| **T002-023** | T02 | FE | P1 | 3h | _legacy archive sweep batch 3 (20 files) |
| **T002-024** | T02 | FE | P1 | 2h | Dead button audit for namespace 3 |
| **T002-029** | T02 | FE | P1 | 3h | Responsive breakpoint sweep for layout 3 |
| **T002-030** | T02 | FE | P1 | 3h | useFormState + useTransition adoption for form 3 |
| **T002-031** | T02 | FE | P1 | 3h | Zod-resolver migration for form 4 (5 forms / batch) |
| **T002-033** | T02 | FE | P1 | 3h | _legacy archive sweep batch 4 (20 files) |
| **T002-034** | T02 | FE | P1 | 2h | Dead button audit for namespace 4 |
| **T002-039** | T02 | FE | P1 | 3h | Responsive breakpoint sweep for layout 4 |
| **T002-040** | T02 | FE | P1 | 3h | useFormState + useTransition adoption for form 4 |
| **T002-041** | T02 | FE | P1 | 3h | Zod-resolver migration for form 5 (5 forms / batch) |
| **T002-043** | T02 | FE | P1 | 3h | _legacy archive sweep batch 5 (20 files) |
| **T002-044** | T02 | FE | P1 | 2h | Dead button audit for namespace 5 |
| **T002-049** | T02 | FE | P1 | 3h | Responsive breakpoint sweep for layout 5 |
| **T002-050** | T02 | FE | P1 | 3h | useFormState + useTransition adoption for form 5 |
| **T002-051** | T02 | FE | P1 | 3h | Zod-resolver migration for form 6 (5 forms / batch) |
| **T002-053** | T02 | FE | P1 | 3h | _legacy archive sweep batch 6 (20 files) |
| **T002-054** | T02 | FE | P1 | 2h | Dead button audit for namespace 6 |
| **T002-059** | T02 | FE | P2 | 2h | Responsive breakpoint sweep for layout 6 |
| **T002-060** | T02 | FE | P2 | 2h | useFormState + useTransition adoption for form 6 |
| **T002-061** | T02 | FE | P2 | 2h | Zod-resolver migration for form 7 (5 forms / batch) |
| **T002-063** | T02 | FE | P2 | 2h | _legacy archive sweep batch 7 (20 files) |
| **T002-064** | T02 | FE | P2 | 1h | Dead button audit for namespace 7 |
| **T002-069** | T02 | FE | P2 | 2h | Responsive breakpoint sweep for layout 7 |
| **T002-070** | T02 | FE | P2 | 2h | useFormState + useTransition adoption for form 7 |
| **T002-071** | T02 | FE | P2 | 2h | Zod-resolver migration for form 8 (5 forms / batch) |
| **T002-073** | T02 | FE | P2 | 2h | _legacy archive sweep batch 8 (20 files) |
| **T002-074** | T02 | FE | P2 | 1h | Dead button audit for namespace 8 |
| **T002-079** | T02 | FE | P2 | 2h | Responsive breakpoint sweep for layout 8 |
| **T002-080** | T02 | FE | P2 | 2h | useFormState + useTransition adoption for form 8 |
| **T002-081** | T02 | FE | P2 | 2h | Zod-resolver migration for form 9 (5 forms / batch) |
| **T002-083** | T02 | FE | P2 | 2h | _legacy archive sweep batch 9 (20 files) |
| **T002-084** | T02 | FE | P2 | 1h | Dead button audit for namespace 9 |
| **T002-089** | T02 | FE | P2 | 2h | Responsive breakpoint sweep for layout 9 |
| **T002-090** | T02 | FE | P2 | 2h | useFormState + useTransition adoption for form 9 |
| **T002-091** | T02 | FE | P2 | 2h | Zod-resolver migration for form 10 (5 forms / batch) |
| **T002-093** | T02 | FE | P2 | 2h | _legacy archive sweep batch 10 (20 files) |
| **T002-094** | T02 | FE | P2 | 1h | Dead button audit for namespace 10 |
| **T002-099** | T02 | FE | P3 | 2h | Responsive breakpoint sweep for layout 10 |
| **T002-100** | T02 | FE | P3 | 2h | useFormState + useTransition adoption for form 10 |
| **T003-009** | T03 | BE | P0 | 5h | Server actions migration for FE form group 1 |
| **T003-019** | T03 | BE | P0 | 5h | Server actions migration for FE form group 2 |
| **T003-029** | T03 | BE | P0 | 5h | Server actions migration for FE form group 3 |
| **T003-039** | T03 | BE | P1 | 4h | Server actions migration for FE form group 4 |
| **T003-049** | T03 | BE | P1 | 4h | Server actions migration for FE form group 5 |
| **T003-059** | T03 | BE | P1 | 4h | Server actions migration for FE form group 6 |
| **T003-069** | T03 | BE | P1 | 4h | Server actions migration for FE form group 7 |
| **T003-079** | T03 | BE | P1 | 4h | Server actions migration for FE form group 8 |
| **T003-089** | T03 | BE | P2 | 3h | Server actions migration for FE form group 9 |
| **T003-099** | T03 | BE | P3 | 3h | Server actions migration for FE form group 10 |

## Dependency graph (high-level)

- Depends on:
  - AGENT-02 (design tokens), AGENT-09 (build infrastructure).
- Blocks:
  - AGENT-02 (design system migration).
