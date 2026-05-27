# TIER-04 — Database normalization & RLS hardening

**Primary agent:** AGENT-04 Database & RLS
**Sandbox primary:** D
**Subsystems:** Database (Postgres+RLS)
**Intent:** FORCE RLS na 143 tabel, partitioning audit_chain, pg_stat_statements, materialized views dla analytics, FK coverage 100%, indexes audit.

**Severity mix:** P0 15% · P1 45% · P2 35% · P3 5%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T004-001** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 1/29 (5 tables) | — | supabase test pass | down migration |
| **T004-002** | DB | P0 | 4h | A04 | D | Foreign key audit batch 1 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-003** | DB | P0 | 3h | A04 | D | Covering index for hot query 1 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-004** | DB | P0 | 5h | A04 | D | Materialized view for analytics dashboard 1 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-005** | DB | P0 | 5h | A04 | D | Partition audit_chain by month — slice 1 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-006** | DB | P0 | 3h | A04 | D | RLS policy cleanup duplicate 1 | — | policy count matches expected | restore policy |
| **T004-007** | DB | P0 | 3h | A04 | D | Trigger for updated_at on table group 1 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-008** | DB | P0 | 4h | A04 | D | Search index (pgvector) for module 1 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-009** | DB | P0 | 5h | A04 | D | Function for tier-1 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-010** | DB | P0 | 4h | A04 | D | PII column encryption with pgp_sym_encrypt for column 1 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-011** | DB | P0 | 4h | A04 | D | FORCE RLS migration batch 2/29 (5 tables) | — | supabase test pass | down migration |
| **T004-012** | DB | P0 | 4h | A04 | D | Foreign key audit batch 2 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-013** | DB | P0 | 3h | A04 | D | Covering index for hot query 2 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-014** | DB | P0 | 5h | A04 | D | Materialized view for analytics dashboard 2 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-015** | DB | P0 | 5h | A04 | D | Partition audit_chain by month — slice 2 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-016** | DB | P1 | 2h | A04 | D | RLS policy cleanup duplicate 2 | — | policy count matches expected | restore policy |
| **T004-017** | DB | P1 | 2h | A04 | D | Trigger for updated_at on table group 2 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-018** | DB | P1 | 3h | A04 | D | Search index (pgvector) for module 2 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-019** | DB | P1 | 4h | A04 | D | Function for tier-2 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-020** | DB | P1 | 3h | A04 | D | PII column encryption with pgp_sym_encrypt for column 2 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-021** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 3/29 (5 tables) | — | supabase test pass | down migration |
| **T004-022** | DB | P1 | 3h | A04 | D | Foreign key audit batch 3 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-023** | DB | P1 | 2h | A04 | D | Covering index for hot query 3 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-024** | DB | P1 | 4h | A04 | D | Materialized view for analytics dashboard 3 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-025** | DB | P1 | 4h | A04 | D | Partition audit_chain by month — slice 3 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-026** | DB | P1 | 2h | A04 | D | RLS policy cleanup duplicate 3 | — | policy count matches expected | restore policy |
| **T004-027** | DB | P1 | 2h | A04 | D | Trigger for updated_at on table group 3 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-028** | DB | P1 | 3h | A04 | D | Search index (pgvector) for module 3 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-029** | DB | P1 | 4h | A04 | D | Function for tier-3 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-030** | DB | P1 | 3h | A04 | D | PII column encryption with pgp_sym_encrypt for column 3 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-031** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 4/29 (5 tables) | — | supabase test pass | down migration |
| **T004-032** | DB | P1 | 3h | A04 | D | Foreign key audit batch 4 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-033** | DB | P1 | 2h | A04 | D | Covering index for hot query 4 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-034** | DB | P1 | 4h | A04 | D | Materialized view for analytics dashboard 4 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-035** | DB | P1 | 4h | A04 | D | Partition audit_chain by month — slice 4 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-036** | DB | P1 | 2h | A04 | D | RLS policy cleanup duplicate 4 | — | policy count matches expected | restore policy |
| **T004-037** | DB | P1 | 2h | A04 | D | Trigger for updated_at on table group 4 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-038** | DB | P1 | 3h | A04 | D | Search index (pgvector) for module 4 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-039** | DB | P1 | 4h | A04 | D | Function for tier-4 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-040** | DB | P1 | 3h | A04 | D | PII column encryption with pgp_sym_encrypt for column 4 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-041** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 5/29 (5 tables) | — | supabase test pass | down migration |
| **T004-042** | DB | P1 | 3h | A04 | D | Foreign key audit batch 5 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-043** | DB | P1 | 2h | A04 | D | Covering index for hot query 5 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-044** | DB | P1 | 4h | A04 | D | Materialized view for analytics dashboard 5 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-045** | DB | P1 | 4h | A04 | D | Partition audit_chain by month — slice 5 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-046** | DB | P1 | 2h | A04 | D | RLS policy cleanup duplicate 5 | — | policy count matches expected | restore policy |
| **T004-047** | DB | P1 | 2h | A04 | D | Trigger for updated_at on table group 5 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-048** | DB | P1 | 3h | A04 | D | Search index (pgvector) for module 5 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-049** | DB | P1 | 4h | A04 | D | Function for tier-5 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-050** | DB | P1 | 3h | A04 | D | PII column encryption with pgp_sym_encrypt for column 5 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-051** | DB | P1 | 3h | A04 | D | FORCE RLS migration batch 6/29 (5 tables) | — | supabase test pass | down migration |
| **T004-052** | DB | P1 | 3h | A04 | D | Foreign key audit batch 6 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-053** | DB | P1 | 2h | A04 | D | Covering index for hot query 6 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-054** | DB | P1 | 4h | A04 | D | Materialized view for analytics dashboard 6 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-055** | DB | P1 | 4h | A04 | D | Partition audit_chain by month — slice 6 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-056** | DB | P1 | 2h | A04 | D | RLS policy cleanup duplicate 6 | — | policy count matches expected | restore policy |
| **T004-057** | DB | P1 | 2h | A04 | D | Trigger for updated_at on table group 6 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-058** | DB | P1 | 3h | A04 | D | Search index (pgvector) for module 6 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-059** | DB | P1 | 4h | A04 | D | Function for tier-6 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-060** | DB | P1 | 3h | A04 | D | PII column encryption with pgp_sym_encrypt for column 6 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-061** | DB | P2 | 2h | A04 | D | FORCE RLS migration batch 7/29 (5 tables) | — | supabase test pass | down migration |
| **T004-062** | DB | P2 | 2h | A04 | D | Foreign key audit batch 7 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-063** | DB | P2 | 1h | A04 | D | Covering index for hot query 7 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-064** | DB | P2 | 3h | A04 | D | Materialized view for analytics dashboard 7 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-065** | DB | P2 | 3h | A04 | D | Partition audit_chain by month — slice 7 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-066** | DB | P2 | 1h | A04 | D | RLS policy cleanup duplicate 7 | — | policy count matches expected | restore policy |
| **T004-067** | DB | P2 | 1h | A04 | D | Trigger for updated_at on table group 7 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-068** | DB | P2 | 2h | A04 | D | Search index (pgvector) for module 7 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-069** | DB | P2 | 3h | A04 | D | Function for tier-7 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-070** | DB | P2 | 2h | A04 | D | PII column encryption with pgp_sym_encrypt for column 7 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-071** | DB | P2 | 2h | A04 | D | FORCE RLS migration batch 8/29 (5 tables) | — | supabase test pass | down migration |
| **T004-072** | DB | P2 | 2h | A04 | D | Foreign key audit batch 8 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-073** | DB | P2 | 1h | A04 | D | Covering index for hot query 8 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-074** | DB | P2 | 3h | A04 | D | Materialized view for analytics dashboard 8 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-075** | DB | P2 | 3h | A04 | D | Partition audit_chain by month — slice 8 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-076** | DB | P2 | 1h | A04 | D | RLS policy cleanup duplicate 8 | — | policy count matches expected | restore policy |
| **T004-077** | DB | P2 | 1h | A04 | D | Trigger for updated_at on table group 8 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-078** | DB | P2 | 2h | A04 | D | Search index (pgvector) for module 8 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-079** | DB | P2 | 3h | A04 | D | Function for tier-8 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-080** | DB | P2 | 2h | A04 | D | PII column encryption with pgp_sym_encrypt for column 8 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-081** | DB | P2 | 2h | A04 | D | FORCE RLS migration batch 9/29 (5 tables) | — | supabase test pass | down migration |
| **T004-082** | DB | P2 | 2h | A04 | D | Foreign key audit batch 9 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-083** | DB | P2 | 1h | A04 | D | Covering index for hot query 9 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-084** | DB | P2 | 3h | A04 | D | Materialized view for analytics dashboard 9 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-085** | DB | P2 | 3h | A04 | D | Partition audit_chain by month — slice 9 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-086** | DB | P2 | 1h | A04 | D | RLS policy cleanup duplicate 9 | — | policy count matches expected | restore policy |
| **T004-087** | DB | P2 | 1h | A04 | D | Trigger for updated_at on table group 9 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-088** | DB | P2 | 2h | A04 | D | Search index (pgvector) for module 9 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-089** | DB | P2 | 3h | A04 | D | Function for tier-9 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-090** | DB | P2 | 2h | A04 | D | PII column encryption with pgp_sym_encrypt for column 9 | — | encrypted at rest, decrypt RLS-gated | drop encryption |
| **T004-091** | DB | P2 | 2h | A04 | D | FORCE RLS migration batch 10/29 (5 tables) | — | supabase test pass | down migration |
| **T004-092** | DB | P2 | 2h | A04 | D | Foreign key audit batch 10 (add missing FK constraints) | — | EXPLAIN shows index usage | drop constraint |
| **T004-093** | DB | P2 | 1h | A04 | D | Covering index for hot query 10 | — | pg_stat_statements shows < 50ms p95 | drop index |
| **T004-094** | DB | P2 | 3h | A04 | D | Materialized view for analytics dashboard 10 | — | REFRESH MATERIALIZED VIEW < 5s | drop view |
| **T004-095** | DB | P2 | 3h | A04 | D | Partition audit_chain by month — slice 10 | — | partition pruning in EXPLAIN | merge partitions |
| **T004-096** | DB | P3 | 1h | A04 | D | RLS policy cleanup duplicate 10 | — | policy count matches expected | restore policy |
| **T004-097** | DB | P3 | 1h | A04 | D | Trigger for updated_at on table group 10 | — | INSERT then UPDATE shows new timestamp | drop trigger |
| **T004-098** | DB | P3 | 2h | A04 | D | Search index (pgvector) for module 10 embeddings | — | match_documents() returns < 200ms | drop ivfflat index |
| **T004-099** | DB | P3 | 3h | A04 | D | Function for tier-10 business logic moved to plpgsql | — | function unit test pass | drop function |
| **T004-100** | DB | P3 | 2h | A04 | D | PII column encryption with pgp_sym_encrypt for column 10 | — | encrypted at rest, decrypt RLS-gated | drop encryption |

> **Total tasks:** 100 · **Estimated effort:** 275h
