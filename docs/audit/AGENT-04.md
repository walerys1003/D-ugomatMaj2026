# AGENT-04 — Database & RLS

**Focus:** FORCE RLS sweep, FK coverage, indexes, materialized views, partitioning, pgvector indexes, pg_stat_statements.
**Sandbox:** D

**Total tasks owned:** 120
**Total effort:** 363h
**Severity breakdown:** P0 21 · P1 51 · P2 41 · P3 7

## Tasks owned

| ID | Tier | Sub | Sev | Effort | Description |
|---|---|---|---|---:|---|
| **T001-005** | T01 | DB | P0 | 4h | FORCE RLS migration batch 1/29 (5 tables/batch) |
| **T001-015** | T01 | DB | P0 | 4h | FORCE RLS migration batch 2/29 (5 tables/batch) |
| **T001-025** | T01 | DB | P0 | 4h | FORCE RLS migration batch 3/29 (5 tables/batch) |
| **T001-035** | T01 | DB | P0 | 4h | FORCE RLS migration batch 4/29 (5 tables/batch) |
| **T001-045** | T01 | DB | P0 | 4h | FORCE RLS migration batch 5/29 (5 tables/batch) |
| **T001-055** | T01 | DB | P0 | 4h | FORCE RLS migration batch 6/29 (5 tables/batch) |
| **T001-065** | T01 | DB | P1 | 3h | FORCE RLS migration batch 7/29 (5 tables/batch) |
| **T001-075** | T01 | DB | P1 | 3h | FORCE RLS migration batch 8/29 (5 tables/batch) |
| **T001-085** | T01 | DB | P1 | 3h | FORCE RLS migration batch 9/29 (5 tables/batch) |
| **T001-095** | T01 | DB | P2 | 2h | FORCE RLS migration batch 10/29 (5 tables/batch) |
| **T004-001** | T04 | DB | P0 | 4h | FORCE RLS migration batch 1/29 (5 tables) |
| **T004-002** | T04 | DB | P0 | 4h | Foreign key audit batch 1 (add missing FK constraints) |
| **T004-003** | T04 | DB | P0 | 3h | Covering index for hot query 1 |
| **T004-004** | T04 | DB | P0 | 5h | Materialized view for analytics dashboard 1 |
| **T004-005** | T04 | DB | P0 | 5h | Partition audit_chain by month — slice 1 |
| **T004-006** | T04 | DB | P0 | 3h | RLS policy cleanup duplicate 1 |
| **T004-007** | T04 | DB | P0 | 3h | Trigger for updated_at on table group 1 |
| **T004-008** | T04 | DB | P0 | 4h | Search index (pgvector) for module 1 embeddings |
| **T004-009** | T04 | DB | P0 | 5h | Function for tier-1 business logic moved to plpgsql |
| **T004-010** | T04 | DB | P0 | 4h | PII column encryption with pgp_sym_encrypt for column 1 |
| **T004-011** | T04 | DB | P0 | 4h | FORCE RLS migration batch 2/29 (5 tables) |
| **T004-012** | T04 | DB | P0 | 4h | Foreign key audit batch 2 (add missing FK constraints) |
| **T004-013** | T04 | DB | P0 | 3h | Covering index for hot query 2 |
| **T004-014** | T04 | DB | P0 | 5h | Materialized view for analytics dashboard 2 |
| **T004-015** | T04 | DB | P0 | 5h | Partition audit_chain by month — slice 2 |
| **T004-016** | T04 | DB | P1 | 2h | RLS policy cleanup duplicate 2 |
| **T004-017** | T04 | DB | P1 | 2h | Trigger for updated_at on table group 2 |
| **T004-018** | T04 | DB | P1 | 3h | Search index (pgvector) for module 2 embeddings |
| **T004-019** | T04 | DB | P1 | 4h | Function for tier-2 business logic moved to plpgsql |
| **T004-020** | T04 | DB | P1 | 3h | PII column encryption with pgp_sym_encrypt for column 2 |
| **T004-021** | T04 | DB | P1 | 3h | FORCE RLS migration batch 3/29 (5 tables) |
| **T004-022** | T04 | DB | P1 | 3h | Foreign key audit batch 3 (add missing FK constraints) |
| **T004-023** | T04 | DB | P1 | 2h | Covering index for hot query 3 |
| **T004-024** | T04 | DB | P1 | 4h | Materialized view for analytics dashboard 3 |
| **T004-025** | T04 | DB | P1 | 4h | Partition audit_chain by month — slice 3 |
| **T004-026** | T04 | DB | P1 | 2h | RLS policy cleanup duplicate 3 |
| **T004-027** | T04 | DB | P1 | 2h | Trigger for updated_at on table group 3 |
| **T004-028** | T04 | DB | P1 | 3h | Search index (pgvector) for module 3 embeddings |
| **T004-029** | T04 | DB | P1 | 4h | Function for tier-3 business logic moved to plpgsql |
| **T004-030** | T04 | DB | P1 | 3h | PII column encryption with pgp_sym_encrypt for column 3 |
| **T004-031** | T04 | DB | P1 | 3h | FORCE RLS migration batch 4/29 (5 tables) |
| **T004-032** | T04 | DB | P1 | 3h | Foreign key audit batch 4 (add missing FK constraints) |
| **T004-033** | T04 | DB | P1 | 2h | Covering index for hot query 4 |
| **T004-034** | T04 | DB | P1 | 4h | Materialized view for analytics dashboard 4 |
| **T004-035** | T04 | DB | P1 | 4h | Partition audit_chain by month — slice 4 |
| **T004-036** | T04 | DB | P1 | 2h | RLS policy cleanup duplicate 4 |
| **T004-037** | T04 | DB | P1 | 2h | Trigger for updated_at on table group 4 |
| **T004-038** | T04 | DB | P1 | 3h | Search index (pgvector) for module 4 embeddings |
| **T004-039** | T04 | DB | P1 | 4h | Function for tier-4 business logic moved to plpgsql |
| **T004-040** | T04 | DB | P1 | 3h | PII column encryption with pgp_sym_encrypt for column 4 |
| **T004-041** | T04 | DB | P1 | 3h | FORCE RLS migration batch 5/29 (5 tables) |
| **T004-042** | T04 | DB | P1 | 3h | Foreign key audit batch 5 (add missing FK constraints) |
| **T004-043** | T04 | DB | P1 | 2h | Covering index for hot query 5 |
| **T004-044** | T04 | DB | P1 | 4h | Materialized view for analytics dashboard 5 |
| **T004-045** | T04 | DB | P1 | 4h | Partition audit_chain by month — slice 5 |
| **T004-046** | T04 | DB | P1 | 2h | RLS policy cleanup duplicate 5 |
| **T004-047** | T04 | DB | P1 | 2h | Trigger for updated_at on table group 5 |
| **T004-048** | T04 | DB | P1 | 3h | Search index (pgvector) for module 5 embeddings |
| **T004-049** | T04 | DB | P1 | 4h | Function for tier-5 business logic moved to plpgsql |
| **T004-050** | T04 | DB | P1 | 3h | PII column encryption with pgp_sym_encrypt for column 5 |
| **T004-051** | T04 | DB | P1 | 3h | FORCE RLS migration batch 6/29 (5 tables) |
| **T004-052** | T04 | DB | P1 | 3h | Foreign key audit batch 6 (add missing FK constraints) |
| **T004-053** | T04 | DB | P1 | 2h | Covering index for hot query 6 |
| **T004-054** | T04 | DB | P1 | 4h | Materialized view for analytics dashboard 6 |
| **T004-055** | T04 | DB | P1 | 4h | Partition audit_chain by month — slice 6 |
| **T004-056** | T04 | DB | P1 | 2h | RLS policy cleanup duplicate 6 |
| **T004-057** | T04 | DB | P1 | 2h | Trigger for updated_at on table group 6 |
| **T004-058** | T04 | DB | P1 | 3h | Search index (pgvector) for module 6 embeddings |
| **T004-059** | T04 | DB | P1 | 4h | Function for tier-6 business logic moved to plpgsql |
| **T004-060** | T04 | DB | P1 | 3h | PII column encryption with pgp_sym_encrypt for column 6 |
| **T004-061** | T04 | DB | P2 | 2h | FORCE RLS migration batch 7/29 (5 tables) |
| **T004-062** | T04 | DB | P2 | 2h | Foreign key audit batch 7 (add missing FK constraints) |
| **T004-063** | T04 | DB | P2 | 1h | Covering index for hot query 7 |
| **T004-064** | T04 | DB | P2 | 3h | Materialized view for analytics dashboard 7 |
| **T004-065** | T04 | DB | P2 | 3h | Partition audit_chain by month — slice 7 |
| **T004-066** | T04 | DB | P2 | 1h | RLS policy cleanup duplicate 7 |
| **T004-067** | T04 | DB | P2 | 1h | Trigger for updated_at on table group 7 |
| **T004-068** | T04 | DB | P2 | 2h | Search index (pgvector) for module 7 embeddings |
| **T004-069** | T04 | DB | P2 | 3h | Function for tier-7 business logic moved to plpgsql |
| **T004-070** | T04 | DB | P2 | 2h | PII column encryption with pgp_sym_encrypt for column 7 |
| **T004-071** | T04 | DB | P2 | 2h | FORCE RLS migration batch 8/29 (5 tables) |
| **T004-072** | T04 | DB | P2 | 2h | Foreign key audit batch 8 (add missing FK constraints) |
| **T004-073** | T04 | DB | P2 | 1h | Covering index for hot query 8 |
| **T004-074** | T04 | DB | P2 | 3h | Materialized view for analytics dashboard 8 |
| **T004-075** | T04 | DB | P2 | 3h | Partition audit_chain by month — slice 8 |
| **T004-076** | T04 | DB | P2 | 1h | RLS policy cleanup duplicate 8 |
| **T004-077** | T04 | DB | P2 | 1h | Trigger for updated_at on table group 8 |
| **T004-078** | T04 | DB | P2 | 2h | Search index (pgvector) for module 8 embeddings |
| **T004-079** | T04 | DB | P2 | 3h | Function for tier-8 business logic moved to plpgsql |
| **T004-080** | T04 | DB | P2 | 2h | PII column encryption with pgp_sym_encrypt for column 8 |
| **T004-081** | T04 | DB | P2 | 2h | FORCE RLS migration batch 9/29 (5 tables) |
| **T004-082** | T04 | DB | P2 | 2h | Foreign key audit batch 9 (add missing FK constraints) |
| **T004-083** | T04 | DB | P2 | 1h | Covering index for hot query 9 |
| **T004-084** | T04 | DB | P2 | 3h | Materialized view for analytics dashboard 9 |
| **T004-085** | T04 | DB | P2 | 3h | Partition audit_chain by month — slice 9 |
| **T004-086** | T04 | DB | P2 | 1h | RLS policy cleanup duplicate 9 |
| **T004-087** | T04 | DB | P2 | 1h | Trigger for updated_at on table group 9 |
| **T004-088** | T04 | DB | P2 | 2h | Search index (pgvector) for module 9 embeddings |
| **T004-089** | T04 | DB | P2 | 3h | Function for tier-9 business logic moved to plpgsql |
| **T004-090** | T04 | DB | P2 | 2h | PII column encryption with pgp_sym_encrypt for column 9 |
| **T004-091** | T04 | DB | P2 | 2h | FORCE RLS migration batch 10/29 (5 tables) |
| **T004-092** | T04 | DB | P2 | 2h | Foreign key audit batch 10 (add missing FK constraints) |
| **T004-093** | T04 | DB | P2 | 1h | Covering index for hot query 10 |
| **T004-094** | T04 | DB | P2 | 3h | Materialized view for analytics dashboard 10 |
| **T004-095** | T04 | DB | P2 | 3h | Partition audit_chain by month — slice 10 |
| **T004-096** | T04 | DB | P3 | 1h | RLS policy cleanup duplicate 10 |
| **T004-097** | T04 | DB | P3 | 1h | Trigger for updated_at on table group 10 |
| **T004-098** | T04 | DB | P3 | 2h | Search index (pgvector) for module 10 embeddings |
| **T004-099** | T04 | DB | P3 | 3h | Function for tier-10 business logic moved to plpgsql |
| **T004-100** | T04 | DB | P3 | 2h | PII column encryption with pgp_sym_encrypt for column 10 |
| **T010-005** | T10 | ENT | P1 | 6h | Multi-region data residency switch 1 |
| **T010-015** | T10 | ENT | P1 | 6h | Multi-region data residency switch 2 |
| **T010-025** | T10 | ENT | P1 | 6h | Multi-region data residency switch 3 |
| **T010-035** | T10 | ENT | P2 | 5h | Multi-region data residency switch 4 |
| **T010-045** | T10 | ENT | P2 | 5h | Multi-region data residency switch 5 |
| **T010-055** | T10 | ENT | P2 | 5h | Multi-region data residency switch 6 |
| **T010-065** | T10 | ENT | P2 | 5h | Multi-region data residency switch 7 |
| **T010-075** | T10 | ENT | P2 | 5h | Multi-region data residency switch 8 |
| **T010-085** | T10 | ENT | P3 | 5h | Multi-region data residency switch 9 |
| **T010-095** | T10 | ENT | P3 | 5h | Multi-region data residency switch 10 |

## Dependency graph (high-level)

- Depends on:
  - none (foundational).
- Blocks:
  - AGENT-03, AGENT-05, AGENT-07 (everything that touches DB).
