# TIER-07 — Admin & observability

**Primary agent:** AGENT-07 Admin & observability
**Sandbox primary:** G
**Subsystems:** Admin panel, Observability, Backend (APIs)
**Intent:** 13 admin sections → API parity, RUM dashboard z PostHog, alerts library, anomaly detection backend, prompts/feature-flags/secrets full CRUD.

**Severity mix:** P0 12% · P1 40% · P2 42% · P3 6%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T007-001** | ADM | P0 | 5h | A07 | G | Admin section 1 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-002** | ADM | P0 | 6h | A07 | G | RBAC role page 1 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-003** | ADM | P0 | 4h | A07 | G | Feature-flag toggle UI live update 1 | — | PostHog feature flag fires | git revert |
| **T007-004** | ADM | P0 | 5h | A07 | G | Prompts versioning diff viewer 1 | — | diff highlights additions/removals | git revert |
| **T007-005** | ADM | P0 | 5h | A07 | G | RUM dashboard widget 1 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-006** | ADM | P0 | 6h | A07 | G | Anomaly detection backend script 1 | — | alert fires on synthetic anomaly | disable script |
| **T007-007** | ADM | P0 | 4h | A07 | G | Secrets rotation UI button 1 | — | key rotated + audit row written | rotate back manually |
| **T007-008** | ADM | P0 | 6h | A07 | G | Compliance reports generator 1 | — | PDF generates within 30s | git revert |
| **T007-009** | ADM | P0 | 5h | A07 | G | Legal-hold list + retention policy editor 1 | — | policy enforced in tests | git revert |
| **T007-010** | ADM | P0 | 5h | A07 | G | Impersonate session start + audit row 1 | — | audit log entry + 2FA gate | kill session |
| **T007-011** | ADM | P0 | 5h | A07 | G | Admin section 2 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-012** | ADM | P0 | 6h | A07 | G | RBAC role page 2 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-013** | ADM | P1 | 3h | A07 | G | Feature-flag toggle UI live update 2 | — | PostHog feature flag fires | git revert |
| **T007-014** | ADM | P1 | 4h | A07 | G | Prompts versioning diff viewer 2 | — | diff highlights additions/removals | git revert |
| **T007-015** | ADM | P1 | 4h | A07 | G | RUM dashboard widget 2 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-016** | ADM | P1 | 5h | A07 | G | Anomaly detection backend script 2 | — | alert fires on synthetic anomaly | disable script |
| **T007-017** | ADM | P1 | 3h | A07 | G | Secrets rotation UI button 2 | — | key rotated + audit row written | rotate back manually |
| **T007-018** | ADM | P1 | 5h | A07 | G | Compliance reports generator 2 | — | PDF generates within 30s | git revert |
| **T007-019** | ADM | P1 | 4h | A07 | G | Legal-hold list + retention policy editor 2 | — | policy enforced in tests | git revert |
| **T007-020** | ADM | P1 | 4h | A07 | G | Impersonate session start + audit row 2 | — | audit log entry + 2FA gate | kill session |
| **T007-021** | ADM | P1 | 4h | A07 | G | Admin section 3 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-022** | ADM | P1 | 5h | A07 | G | RBAC role page 3 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-023** | ADM | P1 | 3h | A07 | G | Feature-flag toggle UI live update 3 | — | PostHog feature flag fires | git revert |
| **T007-024** | ADM | P1 | 4h | A07 | G | Prompts versioning diff viewer 3 | — | diff highlights additions/removals | git revert |
| **T007-025** | ADM | P1 | 4h | A07 | G | RUM dashboard widget 3 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-026** | ADM | P1 | 5h | A07 | G | Anomaly detection backend script 3 | — | alert fires on synthetic anomaly | disable script |
| **T007-027** | ADM | P1 | 3h | A07 | G | Secrets rotation UI button 3 | — | key rotated + audit row written | rotate back manually |
| **T007-028** | ADM | P1 | 5h | A07 | G | Compliance reports generator 3 | — | PDF generates within 30s | git revert |
| **T007-029** | ADM | P1 | 4h | A07 | G | Legal-hold list + retention policy editor 3 | — | policy enforced in tests | git revert |
| **T007-030** | ADM | P1 | 4h | A07 | G | Impersonate session start + audit row 3 | — | audit log entry + 2FA gate | kill session |
| **T007-031** | ADM | P1 | 4h | A07 | G | Admin section 4 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-032** | ADM | P1 | 5h | A07 | G | RBAC role page 4 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-033** | ADM | P1 | 3h | A07 | G | Feature-flag toggle UI live update 4 | — | PostHog feature flag fires | git revert |
| **T007-034** | ADM | P1 | 4h | A07 | G | Prompts versioning diff viewer 4 | — | diff highlights additions/removals | git revert |
| **T007-035** | ADM | P1 | 4h | A07 | G | RUM dashboard widget 4 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-036** | ADM | P1 | 5h | A07 | G | Anomaly detection backend script 4 | — | alert fires on synthetic anomaly | disable script |
| **T007-037** | ADM | P1 | 3h | A07 | G | Secrets rotation UI button 4 | — | key rotated + audit row written | rotate back manually |
| **T007-038** | ADM | P1 | 5h | A07 | G | Compliance reports generator 4 | — | PDF generates within 30s | git revert |
| **T007-039** | ADM | P1 | 4h | A07 | G | Legal-hold list + retention policy editor 4 | — | policy enforced in tests | git revert |
| **T007-040** | ADM | P1 | 4h | A07 | G | Impersonate session start + audit row 4 | — | audit log entry + 2FA gate | kill session |
| **T007-041** | ADM | P1 | 4h | A07 | G | Admin section 5 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-042** | ADM | P1 | 5h | A07 | G | RBAC role page 5 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-043** | ADM | P1 | 3h | A07 | G | Feature-flag toggle UI live update 5 | — | PostHog feature flag fires | git revert |
| **T007-044** | ADM | P1 | 4h | A07 | G | Prompts versioning diff viewer 5 | — | diff highlights additions/removals | git revert |
| **T007-045** | ADM | P1 | 4h | A07 | G | RUM dashboard widget 5 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-046** | ADM | P1 | 5h | A07 | G | Anomaly detection backend script 5 | — | alert fires on synthetic anomaly | disable script |
| **T007-047** | ADM | P1 | 3h | A07 | G | Secrets rotation UI button 5 | — | key rotated + audit row written | rotate back manually |
| **T007-048** | ADM | P1 | 5h | A07 | G | Compliance reports generator 5 | — | PDF generates within 30s | git revert |
| **T007-049** | ADM | P1 | 4h | A07 | G | Legal-hold list + retention policy editor 5 | — | policy enforced in tests | git revert |
| **T007-050** | ADM | P1 | 4h | A07 | G | Impersonate session start + audit row 5 | — | audit log entry + 2FA gate | kill session |
| **T007-051** | ADM | P1 | 4h | A07 | G | Admin section 6 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-052** | ADM | P1 | 5h | A07 | G | RBAC role page 6 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-053** | ADM | P2 | 2h | A07 | G | Feature-flag toggle UI live update 6 | — | PostHog feature flag fires | git revert |
| **T007-054** | ADM | P2 | 3h | A07 | G | Prompts versioning diff viewer 6 | — | diff highlights additions/removals | git revert |
| **T007-055** | ADM | P2 | 3h | A07 | G | RUM dashboard widget 6 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-056** | ADM | P2 | 4h | A07 | G | Anomaly detection backend script 6 | — | alert fires on synthetic anomaly | disable script |
| **T007-057** | ADM | P2 | 2h | A07 | G | Secrets rotation UI button 6 | — | key rotated + audit row written | rotate back manually |
| **T007-058** | ADM | P2 | 4h | A07 | G | Compliance reports generator 6 | — | PDF generates within 30s | git revert |
| **T007-059** | ADM | P2 | 3h | A07 | G | Legal-hold list + retention policy editor 6 | — | policy enforced in tests | git revert |
| **T007-060** | ADM | P2 | 3h | A07 | G | Impersonate session start + audit row 6 | — | audit log entry + 2FA gate | kill session |
| **T007-061** | ADM | P2 | 3h | A07 | G | Admin section 7 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-062** | ADM | P2 | 4h | A07 | G | RBAC role page 7 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-063** | ADM | P2 | 2h | A07 | G | Feature-flag toggle UI live update 7 | — | PostHog feature flag fires | git revert |
| **T007-064** | ADM | P2 | 3h | A07 | G | Prompts versioning diff viewer 7 | — | diff highlights additions/removals | git revert |
| **T007-065** | ADM | P2 | 3h | A07 | G | RUM dashboard widget 7 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-066** | ADM | P2 | 4h | A07 | G | Anomaly detection backend script 7 | — | alert fires on synthetic anomaly | disable script |
| **T007-067** | ADM | P2 | 2h | A07 | G | Secrets rotation UI button 7 | — | key rotated + audit row written | rotate back manually |
| **T007-068** | ADM | P2 | 4h | A07 | G | Compliance reports generator 7 | — | PDF generates within 30s | git revert |
| **T007-069** | ADM | P2 | 3h | A07 | G | Legal-hold list + retention policy editor 7 | — | policy enforced in tests | git revert |
| **T007-070** | ADM | P2 | 3h | A07 | G | Impersonate session start + audit row 7 | — | audit log entry + 2FA gate | kill session |
| **T007-071** | ADM | P2 | 3h | A07 | G | Admin section 8 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-072** | ADM | P2 | 4h | A07 | G | RBAC role page 8 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-073** | ADM | P2 | 2h | A07 | G | Feature-flag toggle UI live update 8 | — | PostHog feature flag fires | git revert |
| **T007-074** | ADM | P2 | 3h | A07 | G | Prompts versioning diff viewer 8 | — | diff highlights additions/removals | git revert |
| **T007-075** | ADM | P2 | 3h | A07 | G | RUM dashboard widget 8 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-076** | ADM | P2 | 4h | A07 | G | Anomaly detection backend script 8 | — | alert fires on synthetic anomaly | disable script |
| **T007-077** | ADM | P2 | 2h | A07 | G | Secrets rotation UI button 8 | — | key rotated + audit row written | rotate back manually |
| **T007-078** | ADM | P2 | 4h | A07 | G | Compliance reports generator 8 | — | PDF generates within 30s | git revert |
| **T007-079** | ADM | P2 | 3h | A07 | G | Legal-hold list + retention policy editor 8 | — | policy enforced in tests | git revert |
| **T007-080** | ADM | P2 | 3h | A07 | G | Impersonate session start + audit row 8 | — | audit log entry + 2FA gate | kill session |
| **T007-081** | ADM | P2 | 3h | A07 | G | Admin section 9 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-082** | ADM | P2 | 4h | A07 | G | RBAC role page 9 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-083** | ADM | P2 | 2h | A07 | G | Feature-flag toggle UI live update 9 | — | PostHog feature flag fires | git revert |
| **T007-084** | ADM | P2 | 3h | A07 | G | Prompts versioning diff viewer 9 | — | diff highlights additions/removals | git revert |
| **T007-085** | ADM | P2 | 3h | A07 | G | RUM dashboard widget 9 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-086** | ADM | P2 | 4h | A07 | G | Anomaly detection backend script 9 | — | alert fires on synthetic anomaly | disable script |
| **T007-087** | ADM | P2 | 2h | A07 | G | Secrets rotation UI button 9 | — | key rotated + audit row written | rotate back manually |
| **T007-088** | ADM | P2 | 4h | A07 | G | Compliance reports generator 9 | — | PDF generates within 30s | git revert |
| **T007-089** | ADM | P2 | 3h | A07 | G | Legal-hold list + retention policy editor 9 | — | policy enforced in tests | git revert |
| **T007-090** | ADM | P2 | 3h | A07 | G | Impersonate session start + audit row 9 | — | audit log entry + 2FA gate | kill session |
| **T007-091** | ADM | P2 | 3h | A07 | G | Admin section 10 CRUD wiring to /api/admin/* | — | e2e admin flow | git revert |
| **T007-092** | ADM | P2 | 4h | A07 | G | RBAC role page 10 editor (list/edit/audit) | — | audit log entry on save | git revert |
| **T007-093** | ADM | P2 | 2h | A07 | G | Feature-flag toggle UI live update 10 | — | PostHog feature flag fires | git revert |
| **T007-094** | ADM | P2 | 3h | A07 | G | Prompts versioning diff viewer 10 | — | diff highlights additions/removals | git revert |
| **T007-095** | ADM | P3 | 3h | A07 | G | RUM dashboard widget 10 (LCP/CLS/INP) | — | data points appear within 5min | remove widget |
| **T007-096** | ADM | P3 | 4h | A07 | G | Anomaly detection backend script 10 | — | alert fires on synthetic anomaly | disable script |
| **T007-097** | ADM | P3 | 2h | A07 | G | Secrets rotation UI button 10 | — | key rotated + audit row written | rotate back manually |
| **T007-098** | ADM | P3 | 4h | A07 | G | Compliance reports generator 10 | — | PDF generates within 30s | git revert |
| **T007-099** | ADM | P3 | 3h | A07 | G | Legal-hold list + retention policy editor 10 | — | policy enforced in tests | git revert |
| **T007-100** | ADM | P3 | 3h | A07 | G | Impersonate session start + audit row 10 | — | audit log entry + 2FA gate | kill session |

> **Total tasks:** 100 · **Estimated effort:** 374h
