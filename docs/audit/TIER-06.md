# TIER-06 — UX redesign & design governance

**Primary agent:** AGENT-02 Design system & UX
**Sandbox primary:** F
**Subsystems:** Frontend (V4), Frontend (V5), Accessibility
**Intent:** V5 design system migration na (panel) i (admin), motion primitives unified, typography scale, responsive breakpoints audit, dark mode parity.

**Severity mix:** P0 5% · P1 30% · P2 55% · P3 10%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T006-001** | UX | P0 | 6h | A02 | B | V5 design system migration for (panel) section 1 | — | Percy < 5% | git revert |
| **T006-002** | UX | P0 | 5h | A02 | B | V5 design tokens for (admin) page 1 | — | Percy < 5% | git revert |
| **T006-003** | UX | P0 | 4h | A02 | B | Empty state illustration for screen 1 | — | visual scan | remove illustration |
| **T006-004** | UX | P0 | 4h | A02 | B | Toast notification design unification for module D1 | — | scan-v5 equal | git revert |
| **T006-005** | UX | P0 | 4h | A02 | B | Modal/dialog pattern audit for surface 1 | — | Axe + keyboard nav pass | git revert |
| **T006-006** | UX | P1 | 3h | A02 | B | Form layout grid migration for form 1 | — | responsive 375/768/1280 | git revert |
| **T006-007** | UX | P1 | 3h | A02 | B | Dashboard card primitive iteration 1 | — | scan-v5 equal | git revert |
| **T006-008** | UX | P1 | 2h | A02 | B | Navigation breadcrumb consistency for tree 1 | — | manual click trail | git revert |
| **T006-009** | UX | P1 | 3h | A02 | B | Dark mode parity audit screen 1 | — | visual scan dark+light | git revert |
| **T006-010** | UX | P1 | 2h | A02 | B | Micro-interaction motion timing for component 1 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-011** | UX | P1 | 5h | A02 | B | V5 design system migration for (panel) section 2 | — | Percy < 5% | git revert |
| **T006-012** | UX | P1 | 4h | A02 | B | V5 design tokens for (admin) page 2 | — | Percy < 5% | git revert |
| **T006-013** | UX | P1 | 3h | A02 | B | Empty state illustration for screen 2 | — | visual scan | remove illustration |
| **T006-014** | UX | P1 | 3h | A02 | B | Toast notification design unification for module D2 | — | scan-v5 equal | git revert |
| **T006-015** | UX | P1 | 3h | A02 | B | Modal/dialog pattern audit for surface 2 | — | Axe + keyboard nav pass | git revert |
| **T006-016** | UX | P1 | 3h | A02 | B | Form layout grid migration for form 2 | — | responsive 375/768/1280 | git revert |
| **T006-017** | UX | P1 | 3h | A02 | B | Dashboard card primitive iteration 2 | — | scan-v5 equal | git revert |
| **T006-018** | UX | P1 | 2h | A02 | B | Navigation breadcrumb consistency for tree 2 | — | manual click trail | git revert |
| **T006-019** | UX | P1 | 3h | A02 | B | Dark mode parity audit screen 2 | — | visual scan dark+light | git revert |
| **T006-020** | UX | P1 | 2h | A02 | B | Micro-interaction motion timing for component 2 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-021** | UX | P1 | 5h | A02 | B | V5 design system migration for (panel) section 3 | — | Percy < 5% | git revert |
| **T006-022** | UX | P1 | 4h | A02 | B | V5 design tokens for (admin) page 3 | — | Percy < 5% | git revert |
| **T006-023** | UX | P1 | 3h | A02 | B | Empty state illustration for screen 3 | — | visual scan | remove illustration |
| **T006-024** | UX | P1 | 3h | A02 | B | Toast notification design unification for module D3 | — | scan-v5 equal | git revert |
| **T006-025** | UX | P1 | 3h | A02 | B | Modal/dialog pattern audit for surface 3 | — | Axe + keyboard nav pass | git revert |
| **T006-026** | UX | P1 | 3h | A02 | B | Form layout grid migration for form 3 | — | responsive 375/768/1280 | git revert |
| **T006-027** | UX | P1 | 3h | A02 | B | Dashboard card primitive iteration 3 | — | scan-v5 equal | git revert |
| **T006-028** | UX | P1 | 2h | A02 | B | Navigation breadcrumb consistency for tree 3 | — | manual click trail | git revert |
| **T006-029** | UX | P1 | 3h | A02 | B | Dark mode parity audit screen 3 | — | visual scan dark+light | git revert |
| **T006-030** | UX | P1 | 2h | A02 | B | Micro-interaction motion timing for component 3 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-031** | UX | P1 | 5h | A02 | B | V5 design system migration for (panel) section 4 | — | Percy < 5% | git revert |
| **T006-032** | UX | P1 | 4h | A02 | B | V5 design tokens for (admin) page 4 | — | Percy < 5% | git revert |
| **T006-033** | UX | P1 | 3h | A02 | B | Empty state illustration for screen 4 | — | visual scan | remove illustration |
| **T006-034** | UX | P1 | 3h | A02 | B | Toast notification design unification for module D4 | — | scan-v5 equal | git revert |
| **T006-035** | UX | P1 | 3h | A02 | B | Modal/dialog pattern audit for surface 4 | — | Axe + keyboard nav pass | git revert |
| **T006-036** | UX | P2 | 2h | A02 | B | Form layout grid migration for form 4 | — | responsive 375/768/1280 | git revert |
| **T006-037** | UX | P2 | 2h | A02 | B | Dashboard card primitive iteration 4 | — | scan-v5 equal | git revert |
| **T006-038** | UX | P2 | 1h | A02 | B | Navigation breadcrumb consistency for tree 4 | — | manual click trail | git revert |
| **T006-039** | UX | P2 | 2h | A02 | B | Dark mode parity audit screen 4 | — | visual scan dark+light | git revert |
| **T006-040** | UX | P2 | 1h | A02 | B | Micro-interaction motion timing for component 4 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-041** | UX | P2 | 4h | A02 | B | V5 design system migration for (panel) section 5 | — | Percy < 5% | git revert |
| **T006-042** | UX | P2 | 3h | A02 | B | V5 design tokens for (admin) page 5 | — | Percy < 5% | git revert |
| **T006-043** | UX | P2 | 2h | A02 | B | Empty state illustration for screen 5 | — | visual scan | remove illustration |
| **T006-044** | UX | P2 | 2h | A02 | B | Toast notification design unification for module D5 | — | scan-v5 equal | git revert |
| **T006-045** | UX | P2 | 2h | A02 | B | Modal/dialog pattern audit for surface 5 | — | Axe + keyboard nav pass | git revert |
| **T006-046** | UX | P2 | 2h | A02 | B | Form layout grid migration for form 5 | — | responsive 375/768/1280 | git revert |
| **T006-047** | UX | P2 | 2h | A02 | B | Dashboard card primitive iteration 5 | — | scan-v5 equal | git revert |
| **T006-048** | UX | P2 | 1h | A02 | B | Navigation breadcrumb consistency for tree 5 | — | manual click trail | git revert |
| **T006-049** | UX | P2 | 2h | A02 | B | Dark mode parity audit screen 5 | — | visual scan dark+light | git revert |
| **T006-050** | UX | P2 | 1h | A02 | B | Micro-interaction motion timing for component 5 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-051** | UX | P2 | 4h | A02 | B | V5 design system migration for (panel) section 6 | — | Percy < 5% | git revert |
| **T006-052** | UX | P2 | 3h | A02 | B | V5 design tokens for (admin) page 6 | — | Percy < 5% | git revert |
| **T006-053** | UX | P2 | 2h | A02 | B | Empty state illustration for screen 6 | — | visual scan | remove illustration |
| **T006-054** | UX | P2 | 2h | A02 | B | Toast notification design unification for module D6 | — | scan-v5 equal | git revert |
| **T006-055** | UX | P2 | 2h | A02 | B | Modal/dialog pattern audit for surface 6 | — | Axe + keyboard nav pass | git revert |
| **T006-056** | UX | P2 | 2h | A02 | B | Form layout grid migration for form 6 | — | responsive 375/768/1280 | git revert |
| **T006-057** | UX | P2 | 2h | A02 | B | Dashboard card primitive iteration 6 | — | scan-v5 equal | git revert |
| **T006-058** | UX | P2 | 1h | A02 | B | Navigation breadcrumb consistency for tree 6 | — | manual click trail | git revert |
| **T006-059** | UX | P2 | 2h | A02 | B | Dark mode parity audit screen 6 | — | visual scan dark+light | git revert |
| **T006-060** | UX | P2 | 1h | A02 | B | Micro-interaction motion timing for component 6 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-061** | UX | P2 | 4h | A02 | B | V5 design system migration for (panel) section 7 | — | Percy < 5% | git revert |
| **T006-062** | UX | P2 | 3h | A02 | B | V5 design tokens for (admin) page 7 | — | Percy < 5% | git revert |
| **T006-063** | UX | P2 | 2h | A02 | B | Empty state illustration for screen 7 | — | visual scan | remove illustration |
| **T006-064** | UX | P2 | 2h | A02 | B | Toast notification design unification for module D7 | — | scan-v5 equal | git revert |
| **T006-065** | UX | P2 | 2h | A02 | B | Modal/dialog pattern audit for surface 7 | — | Axe + keyboard nav pass | git revert |
| **T006-066** | UX | P2 | 2h | A02 | B | Form layout grid migration for form 7 | — | responsive 375/768/1280 | git revert |
| **T006-067** | UX | P2 | 2h | A02 | B | Dashboard card primitive iteration 7 | — | scan-v5 equal | git revert |
| **T006-068** | UX | P2 | 1h | A02 | B | Navigation breadcrumb consistency for tree 7 | — | manual click trail | git revert |
| **T006-069** | UX | P2 | 2h | A02 | B | Dark mode parity audit screen 7 | — | visual scan dark+light | git revert |
| **T006-070** | UX | P2 | 1h | A02 | B | Micro-interaction motion timing for component 7 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-071** | UX | P2 | 4h | A02 | B | V5 design system migration for (panel) section 8 | — | Percy < 5% | git revert |
| **T006-072** | UX | P2 | 3h | A02 | B | V5 design tokens for (admin) page 8 | — | Percy < 5% | git revert |
| **T006-073** | UX | P2 | 2h | A02 | B | Empty state illustration for screen 8 | — | visual scan | remove illustration |
| **T006-074** | UX | P2 | 2h | A02 | B | Toast notification design unification for module D8 | — | scan-v5 equal | git revert |
| **T006-075** | UX | P2 | 2h | A02 | B | Modal/dialog pattern audit for surface 8 | — | Axe + keyboard nav pass | git revert |
| **T006-076** | UX | P2 | 2h | A02 | B | Form layout grid migration for form 8 | — | responsive 375/768/1280 | git revert |
| **T006-077** | UX | P2 | 2h | A02 | B | Dashboard card primitive iteration 8 | — | scan-v5 equal | git revert |
| **T006-078** | UX | P2 | 1h | A02 | B | Navigation breadcrumb consistency for tree 8 | — | manual click trail | git revert |
| **T006-079** | UX | P2 | 2h | A02 | B | Dark mode parity audit screen 8 | — | visual scan dark+light | git revert |
| **T006-080** | UX | P2 | 1h | A02 | B | Micro-interaction motion timing for component 8 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-081** | UX | P2 | 4h | A02 | B | V5 design system migration for (panel) section 9 | — | Percy < 5% | git revert |
| **T006-082** | UX | P2 | 3h | A02 | B | V5 design tokens for (admin) page 9 | — | Percy < 5% | git revert |
| **T006-083** | UX | P2 | 2h | A02 | B | Empty state illustration for screen 9 | — | visual scan | remove illustration |
| **T006-084** | UX | P2 | 2h | A02 | B | Toast notification design unification for module D9 | — | scan-v5 equal | git revert |
| **T006-085** | UX | P2 | 2h | A02 | B | Modal/dialog pattern audit for surface 9 | — | Axe + keyboard nav pass | git revert |
| **T006-086** | UX | P2 | 2h | A02 | B | Form layout grid migration for form 9 | — | responsive 375/768/1280 | git revert |
| **T006-087** | UX | P2 | 2h | A02 | B | Dashboard card primitive iteration 9 | — | scan-v5 equal | git revert |
| **T006-088** | UX | P2 | 1h | A02 | B | Navigation breadcrumb consistency for tree 9 | — | manual click trail | git revert |
| **T006-089** | UX | P2 | 2h | A02 | B | Dark mode parity audit screen 9 | — | visual scan dark+light | git revert |
| **T006-090** | UX | P2 | 1h | A02 | B | Micro-interaction motion timing for component 9 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |
| **T006-091** | UX | P3 | 4h | A02 | B | V5 design system migration for (panel) section 10 | — | Percy < 5% | git revert |
| **T006-092** | UX | P3 | 3h | A02 | B | V5 design tokens for (admin) page 10 | — | Percy < 5% | git revert |
| **T006-093** | UX | P3 | 2h | A02 | B | Empty state illustration for screen 10 | — | visual scan | remove illustration |
| **T006-094** | UX | P3 | 2h | A02 | B | Toast notification design unification for module D10 | — | scan-v5 equal | git revert |
| **T006-095** | UX | P3 | 2h | A02 | B | Modal/dialog pattern audit for surface 10 | — | Axe + keyboard nav pass | git revert |
| **T006-096** | UX | P3 | 2h | A02 | B | Form layout grid migration for form 10 | — | responsive 375/768/1280 | git revert |
| **T006-097** | UX | P3 | 2h | A02 | B | Dashboard card primitive iteration 10 | — | scan-v5 equal | git revert |
| **T006-098** | UX | P3 | 1h | A02 | B | Navigation breadcrumb consistency for tree 10 | — | manual click trail | git revert |
| **T006-099** | UX | P3 | 2h | A02 | B | Dark mode parity audit screen 10 | — | visual scan dark+light | git revert |
| **T006-100** | UX | P3 | 1h | A02 | B | Micro-interaction motion timing for component 10 | — | Lighthouse interaction-to-next-paint < 200ms | remove motion |

> **Total tasks:** 100 · **Estimated effort:** 250h
