# ORCHESTRATOR — central execution coordinator

## Wave plan
- **Wave 6 (this session)** — single sandbox = this agent. Executes a curated subset of P0 from Tier 01–04 (~15 tasks) + commits the entire ledger.
- **Wave 7..N (future sessions)** — picks unfinished P0/P1 with FIFO order, respecting dependency graph.

## Dependency layers (topological)
1. **Layer 0 — Foundational**: AGENT-04 (DB & RLS).
2. **Layer 1 — Contracts**: AGENT-03 (APIs), AGENT-05 (AI orchestration).
3. **Layer 2 — Domain**: AGENT-06 (integrations), AGENT-07 (admin/obs), AGENT-08 (recruitment/legal).
4. **Layer 3 — Architecture**: AGENT-01 (frontend), AGENT-09 (perf/DevOps).
5. **Layer 4 — Polish**: AGENT-02 (design system), AGENT-10 (QA/A11y).

## Merge governance
- Each agent works on a feature branch `feat/agent-XX-tNNN-NNN`.
- Squash on PR to `genspark_ai_developer`.
- Conflict resolution prefers `origin/main`.
- CI gates: tsc V5 = 0 errors, scan-v5 21/21 pass, smoke 9/9 pass, Axe critical = 0, size-limit OK.

## FE↔BE parity check (every wave)
- `comm -23 api-existing api-calls` ≤ 30 orphans (target).
- `comm -23 api-calls api-existing` = 0 missing (target).

## AI systems parity
- lib/ai TS errors → 0 after Tier 05 completion.
- Eval harness coverage ≥ 80% of D1–D16 modules.

## Design governance
- Percy visual diff < 5% on every merge.
- V5 design token usage ≥ 95% of components after Tier 02 + Tier 06.

## Execution order (this session — Wave 6)
1. Implement T001-001 (root error.tsx), T001-002 (root loading.tsx), T001-003 (root not-found.tsx).
2. PostHogProvider in root layout (T001-007 group).
3. 3 critical FORCE RLS migrations (T004-001 batch).
4. 5 critical missing API endpoints (T003-001 batch).
5. RBAC central helper (T003-007 instance).
6. tsc + scan-v5 + smoke.
7. Commit + push + PR update.
