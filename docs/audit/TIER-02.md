# TIER-02 — Frontend consolidation

**Primary agent:** AGENT-01 Frontend architecture
**Sandbox primary:** B
**Subsystems:** Frontend (V4), Frontend (V5), Accessibility
**Intent:** Zod-yzacja 56 formularzy, motion library v5 token migration, _legacy 19k LOC archive, dead-button sweep, design-token discipline, Suspense kompletny per route.

**Severity mix:** P0 10% · P1 45% · P2 40% · P3 5%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T002-001** | FE | P0 | 4h | A01 | A | Zod-resolver migration for form 1 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-002** | FE | P0 | 3h | A02 | B | framer-motion variant tokens for component 1 | — | scan-v5 snapshot equal | revert motion props |
| **T002-003** | FE | P0 | 4h | A01 | A | _legacy archive sweep batch 1 (20 files) | — | build still green | git revert |
| **T002-004** | FE | P0 | 3h | A01 | A | Dead button audit for namespace 1 | — | Axe smoke + manual click test | restore button |
| **T002-005** | FE | P0 | 4h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 1 | — | no visual regression Percy | git revert |
| **T002-006** | FE | P0 | 3h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 1) | — | scan-v5 equal | git revert |
| **T002-007** | A11Y | P0 | 3h | A10 | J | aria-label coverage for icon-only buttons batch 1 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-008** | FE | P0 | 3h | A02 | B | Typography scale enforce (V5 tokens) for page group 1 | — | Percy diff < 1% | git revert |
| **T002-009** | FE | P0 | 4h | A01 | A | Responsive breakpoint sweep for layout 1 | — | 375/768/1280 scan | git revert |
| **T002-010** | FE | P0 | 4h | A01 | A | useFormState + useTransition adoption for form 1 | — | loading state visible during submit | remove transition |
| **T002-011** | FE | P1 | 3h | A01 | A | Zod-resolver migration for form 2 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-012** | FE | P1 | 2h | A02 | B | framer-motion variant tokens for component 2 | — | scan-v5 snapshot equal | revert motion props |
| **T002-013** | FE | P1 | 3h | A01 | A | _legacy archive sweep batch 2 (20 files) | — | build still green | git revert |
| **T002-014** | FE | P1 | 2h | A01 | A | Dead button audit for namespace 2 | — | Axe smoke + manual click test | restore button |
| **T002-015** | FE | P1 | 3h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 2 | — | no visual regression Percy | git revert |
| **T002-016** | FE | P1 | 2h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 2) | — | scan-v5 equal | git revert |
| **T002-017** | A11Y | P1 | 2h | A10 | J | aria-label coverage for icon-only buttons batch 2 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-018** | FE | P1 | 2h | A02 | B | Typography scale enforce (V5 tokens) for page group 2 | — | Percy diff < 1% | git revert |
| **T002-019** | FE | P1 | 3h | A01 | A | Responsive breakpoint sweep for layout 2 | — | 375/768/1280 scan | git revert |
| **T002-020** | FE | P1 | 3h | A01 | A | useFormState + useTransition adoption for form 2 | — | loading state visible during submit | remove transition |
| **T002-021** | FE | P1 | 3h | A01 | A | Zod-resolver migration for form 3 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-022** | FE | P1 | 2h | A02 | B | framer-motion variant tokens for component 3 | — | scan-v5 snapshot equal | revert motion props |
| **T002-023** | FE | P1 | 3h | A01 | A | _legacy archive sweep batch 3 (20 files) | — | build still green | git revert |
| **T002-024** | FE | P1 | 2h | A01 | A | Dead button audit for namespace 3 | — | Axe smoke + manual click test | restore button |
| **T002-025** | FE | P1 | 3h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 3 | — | no visual regression Percy | git revert |
| **T002-026** | FE | P1 | 2h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 3) | — | scan-v5 equal | git revert |
| **T002-027** | A11Y | P1 | 2h | A10 | J | aria-label coverage for icon-only buttons batch 3 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-028** | FE | P1 | 2h | A02 | B | Typography scale enforce (V5 tokens) for page group 3 | — | Percy diff < 1% | git revert |
| **T002-029** | FE | P1 | 3h | A01 | A | Responsive breakpoint sweep for layout 3 | — | 375/768/1280 scan | git revert |
| **T002-030** | FE | P1 | 3h | A01 | A | useFormState + useTransition adoption for form 3 | — | loading state visible during submit | remove transition |
| **T002-031** | FE | P1 | 3h | A01 | A | Zod-resolver migration for form 4 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-032** | FE | P1 | 2h | A02 | B | framer-motion variant tokens for component 4 | — | scan-v5 snapshot equal | revert motion props |
| **T002-033** | FE | P1 | 3h | A01 | A | _legacy archive sweep batch 4 (20 files) | — | build still green | git revert |
| **T002-034** | FE | P1 | 2h | A01 | A | Dead button audit for namespace 4 | — | Axe smoke + manual click test | restore button |
| **T002-035** | FE | P1 | 3h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 4 | — | no visual regression Percy | git revert |
| **T002-036** | FE | P1 | 2h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 4) | — | scan-v5 equal | git revert |
| **T002-037** | A11Y | P1 | 2h | A10 | J | aria-label coverage for icon-only buttons batch 4 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-038** | FE | P1 | 2h | A02 | B | Typography scale enforce (V5 tokens) for page group 4 | — | Percy diff < 1% | git revert |
| **T002-039** | FE | P1 | 3h | A01 | A | Responsive breakpoint sweep for layout 4 | — | 375/768/1280 scan | git revert |
| **T002-040** | FE | P1 | 3h | A01 | A | useFormState + useTransition adoption for form 4 | — | loading state visible during submit | remove transition |
| **T002-041** | FE | P1 | 3h | A01 | A | Zod-resolver migration for form 5 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-042** | FE | P1 | 2h | A02 | B | framer-motion variant tokens for component 5 | — | scan-v5 snapshot equal | revert motion props |
| **T002-043** | FE | P1 | 3h | A01 | A | _legacy archive sweep batch 5 (20 files) | — | build still green | git revert |
| **T002-044** | FE | P1 | 2h | A01 | A | Dead button audit for namespace 5 | — | Axe smoke + manual click test | restore button |
| **T002-045** | FE | P1 | 3h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 5 | — | no visual regression Percy | git revert |
| **T002-046** | FE | P1 | 2h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 5) | — | scan-v5 equal | git revert |
| **T002-047** | A11Y | P1 | 2h | A10 | J | aria-label coverage for icon-only buttons batch 5 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-048** | FE | P1 | 2h | A02 | B | Typography scale enforce (V5 tokens) for page group 5 | — | Percy diff < 1% | git revert |
| **T002-049** | FE | P1 | 3h | A01 | A | Responsive breakpoint sweep for layout 5 | — | 375/768/1280 scan | git revert |
| **T002-050** | FE | P1 | 3h | A01 | A | useFormState + useTransition adoption for form 5 | — | loading state visible during submit | remove transition |
| **T002-051** | FE | P1 | 3h | A01 | A | Zod-resolver migration for form 6 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-052** | FE | P1 | 2h | A02 | B | framer-motion variant tokens for component 6 | — | scan-v5 snapshot equal | revert motion props |
| **T002-053** | FE | P1 | 3h | A01 | A | _legacy archive sweep batch 6 (20 files) | — | build still green | git revert |
| **T002-054** | FE | P1 | 2h | A01 | A | Dead button audit for namespace 6 | — | Axe smoke + manual click test | restore button |
| **T002-055** | FE | P1 | 3h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 6 | — | no visual regression Percy | git revert |
| **T002-056** | FE | P2 | 1h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 6) | — | scan-v5 equal | git revert |
| **T002-057** | A11Y | P2 | 1h | A10 | J | aria-label coverage for icon-only buttons batch 6 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-058** | FE | P2 | 1h | A02 | B | Typography scale enforce (V5 tokens) for page group 6 | — | Percy diff < 1% | git revert |
| **T002-059** | FE | P2 | 2h | A01 | A | Responsive breakpoint sweep for layout 6 | — | 375/768/1280 scan | git revert |
| **T002-060** | FE | P2 | 2h | A01 | A | useFormState + useTransition adoption for form 6 | — | loading state visible during submit | remove transition |
| **T002-061** | FE | P2 | 2h | A01 | A | Zod-resolver migration for form 7 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-062** | FE | P2 | 1h | A02 | B | framer-motion variant tokens for component 7 | — | scan-v5 snapshot equal | revert motion props |
| **T002-063** | FE | P2 | 2h | A01 | A | _legacy archive sweep batch 7 (20 files) | — | build still green | git revert |
| **T002-064** | FE | P2 | 1h | A01 | A | Dead button audit for namespace 7 | — | Axe smoke + manual click test | restore button |
| **T002-065** | FE | P2 | 2h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 7 | — | no visual regression Percy | git revert |
| **T002-066** | FE | P2 | 1h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 7) | — | scan-v5 equal | git revert |
| **T002-067** | A11Y | P2 | 1h | A10 | J | aria-label coverage for icon-only buttons batch 7 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-068** | FE | P2 | 1h | A02 | B | Typography scale enforce (V5 tokens) for page group 7 | — | Percy diff < 1% | git revert |
| **T002-069** | FE | P2 | 2h | A01 | A | Responsive breakpoint sweep for layout 7 | — | 375/768/1280 scan | git revert |
| **T002-070** | FE | P2 | 2h | A01 | A | useFormState + useTransition adoption for form 7 | — | loading state visible during submit | remove transition |
| **T002-071** | FE | P2 | 2h | A01 | A | Zod-resolver migration for form 8 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-072** | FE | P2 | 1h | A02 | B | framer-motion variant tokens for component 8 | — | scan-v5 snapshot equal | revert motion props |
| **T002-073** | FE | P2 | 2h | A01 | A | _legacy archive sweep batch 8 (20 files) | — | build still green | git revert |
| **T002-074** | FE | P2 | 1h | A01 | A | Dead button audit for namespace 8 | — | Axe smoke + manual click test | restore button |
| **T002-075** | FE | P2 | 2h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 8 | — | no visual regression Percy | git revert |
| **T002-076** | FE | P2 | 1h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 8) | — | scan-v5 equal | git revert |
| **T002-077** | A11Y | P2 | 1h | A10 | J | aria-label coverage for icon-only buttons batch 8 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-078** | FE | P2 | 1h | A02 | B | Typography scale enforce (V5 tokens) for page group 8 | — | Percy diff < 1% | git revert |
| **T002-079** | FE | P2 | 2h | A01 | A | Responsive breakpoint sweep for layout 8 | — | 375/768/1280 scan | git revert |
| **T002-080** | FE | P2 | 2h | A01 | A | useFormState + useTransition adoption for form 8 | — | loading state visible during submit | remove transition |
| **T002-081** | FE | P2 | 2h | A01 | A | Zod-resolver migration for form 9 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-082** | FE | P2 | 1h | A02 | B | framer-motion variant tokens for component 9 | — | scan-v5 snapshot equal | revert motion props |
| **T002-083** | FE | P2 | 2h | A01 | A | _legacy archive sweep batch 9 (20 files) | — | build still green | git revert |
| **T002-084** | FE | P2 | 1h | A01 | A | Dead button audit for namespace 9 | — | Axe smoke + manual click test | restore button |
| **T002-085** | FE | P2 | 2h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 9 | — | no visual regression Percy | git revert |
| **T002-086** | FE | P2 | 1h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 9) | — | scan-v5 equal | git revert |
| **T002-087** | A11Y | P2 | 1h | A10 | J | aria-label coverage for icon-only buttons batch 9 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-088** | FE | P2 | 1h | A02 | B | Typography scale enforce (V5 tokens) for page group 9 | — | Percy diff < 1% | git revert |
| **T002-089** | FE | P2 | 2h | A01 | A | Responsive breakpoint sweep for layout 9 | — | 375/768/1280 scan | git revert |
| **T002-090** | FE | P2 | 2h | A01 | A | useFormState + useTransition adoption for form 9 | — | loading state visible during submit | remove transition |
| **T002-091** | FE | P2 | 2h | A01 | A | Zod-resolver migration for form 10 (5 forms / batch) | — | form submit valid + invalid path tested | switch back to manual validate |
| **T002-092** | FE | P2 | 1h | A02 | B | framer-motion variant tokens for component 10 | — | scan-v5 snapshot equal | revert motion props |
| **T002-093** | FE | P2 | 2h | A01 | A | _legacy archive sweep batch 10 (20 files) | — | build still green | git revert |
| **T002-094** | FE | P2 | 1h | A01 | A | Dead button audit for namespace 10 | — | Axe smoke + manual click test | restore button |
| **T002-095** | FE | P2 | 2h | A02 | B | Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch 10 | — | no visual regression Percy | git revert |
| **T002-096** | FE | P2 | 1h | A02 | B | Replace ad-hoc <Spinner> with shadcn Skeleton (group 10) | — | scan-v5 equal | git revert |
| **T002-097** | A11Y | P3 | 1h | A10 | J | aria-label coverage for icon-only buttons batch 10 | — | Axe rule 'button-name' pass | remove aria-label |
| **T002-098** | FE | P3 | 1h | A02 | B | Typography scale enforce (V5 tokens) for page group 10 | — | Percy diff < 1% | git revert |
| **T002-099** | FE | P3 | 2h | A01 | A | Responsive breakpoint sweep for layout 10 | — | 375/768/1280 scan | git revert |
| **T002-100** | FE | P3 | 2h | A01 | A | useFormState + useTransition adoption for form 10 | — | loading state visible during submit | remove transition |

> **Total tasks:** 100 · **Estimated effort:** 215h
