# TIER-10 — Enterprise polish + Future R&D

**Primary agent:** AGENT-10 QA, A11y & Enterprise polish
**Sandbox primary:** J
**Subsystems:** Accessibility, Mobile / PWA, Candidate, Recruitment, Enterprise Readiness
**Intent:** A11y 100% Axe gate, SEO 100% Lighthouse SEO, dynamic OG image generator, mobile PWA full offline mode, candidate/recruitment placeholder modules, white-label themes, multi-region data residency.

**Severity mix:** P0 4% · P1 20% · P2 55% · P3 21%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T010-001** | A11Y | P0 | 4h | A10 | J | Axe CI gate scope 1 | — | 0 critical Axe issues | lower gate |
| **T010-002** | SEO | P0 | 5h | A10 | J | Dynamic OG image generator for slug group 1 | — | Twitter card validator passes | remove generator |
| **T010-003** | SEO | P0 | 4h | A10 | J | Lighthouse SEO 100 push for page 1 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-004** | MOB | P0 | 5h | A10 | J | PWA offline shell update for route group 1 | — | lighthouse PWA install pass | remove SW route |
| **T010-005** | ENT | P1 | 6h | A04 | D | Multi-region data residency switch 1 | — | RLS region-pinned | rollback config |
| **T010-006** | ENT | P1 | 4h | A02 | B | White-label theme variant 1 | — | tenant theme renders | git revert |
| **T010-007** | HR | P1 | 3h | A08 | H | Candidate panel placeholder module 1 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-008** | HR | P1 | 3h | A08 | H | Recruitment workflow stub 1 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-009** | ENT | P1 | 4h | A07 | G | SLA report generator section 1 | — | PDF generates SLA breakdown | git revert |
| **T010-010** | A11Y | P1 | 3h | A10 | J | Keyboard navigation deep audit for screen 1 | — | 0 trap, focus visible | git revert |
| **T010-011** | A11Y | P1 | 3h | A10 | J | Axe CI gate scope 2 | — | 0 critical Axe issues | lower gate |
| **T010-012** | SEO | P1 | 4h | A10 | J | Dynamic OG image generator for slug group 2 | — | Twitter card validator passes | remove generator |
| **T010-013** | SEO | P1 | 3h | A10 | J | Lighthouse SEO 100 push for page 2 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-014** | MOB | P1 | 4h | A10 | J | PWA offline shell update for route group 2 | — | lighthouse PWA install pass | remove SW route |
| **T010-015** | ENT | P1 | 6h | A04 | D | Multi-region data residency switch 2 | — | RLS region-pinned | rollback config |
| **T010-016** | ENT | P1 | 4h | A02 | B | White-label theme variant 2 | — | tenant theme renders | git revert |
| **T010-017** | HR | P1 | 3h | A08 | H | Candidate panel placeholder module 2 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-018** | HR | P1 | 3h | A08 | H | Recruitment workflow stub 2 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-019** | ENT | P1 | 4h | A07 | G | SLA report generator section 2 | — | PDF generates SLA breakdown | git revert |
| **T010-020** | A11Y | P1 | 3h | A10 | J | Keyboard navigation deep audit for screen 2 | — | 0 trap, focus visible | git revert |
| **T010-021** | A11Y | P1 | 3h | A10 | J | Axe CI gate scope 3 | — | 0 critical Axe issues | lower gate |
| **T010-022** | SEO | P1 | 4h | A10 | J | Dynamic OG image generator for slug group 3 | — | Twitter card validator passes | remove generator |
| **T010-023** | SEO | P1 | 3h | A10 | J | Lighthouse SEO 100 push for page 3 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-024** | MOB | P1 | 4h | A10 | J | PWA offline shell update for route group 3 | — | lighthouse PWA install pass | remove SW route |
| **T010-025** | ENT | P1 | 6h | A04 | D | Multi-region data residency switch 3 | — | RLS region-pinned | rollback config |
| **T010-026** | ENT | P2 | 3h | A02 | B | White-label theme variant 3 | — | tenant theme renders | git revert |
| **T010-027** | HR | P2 | 2h | A08 | H | Candidate panel placeholder module 3 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-028** | HR | P2 | 2h | A08 | H | Recruitment workflow stub 3 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-029** | ENT | P2 | 3h | A07 | G | SLA report generator section 3 | — | PDF generates SLA breakdown | git revert |
| **T010-030** | A11Y | P2 | 2h | A10 | J | Keyboard navigation deep audit for screen 3 | — | 0 trap, focus visible | git revert |
| **T010-031** | A11Y | P2 | 2h | A10 | J | Axe CI gate scope 4 | — | 0 critical Axe issues | lower gate |
| **T010-032** | SEO | P2 | 3h | A10 | J | Dynamic OG image generator for slug group 4 | — | Twitter card validator passes | remove generator |
| **T010-033** | SEO | P2 | 2h | A10 | J | Lighthouse SEO 100 push for page 4 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-034** | MOB | P2 | 3h | A10 | J | PWA offline shell update for route group 4 | — | lighthouse PWA install pass | remove SW route |
| **T010-035** | ENT | P2 | 5h | A04 | D | Multi-region data residency switch 4 | — | RLS region-pinned | rollback config |
| **T010-036** | ENT | P2 | 3h | A02 | B | White-label theme variant 4 | — | tenant theme renders | git revert |
| **T010-037** | HR | P2 | 2h | A08 | H | Candidate panel placeholder module 4 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-038** | HR | P2 | 2h | A08 | H | Recruitment workflow stub 4 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-039** | ENT | P2 | 3h | A07 | G | SLA report generator section 4 | — | PDF generates SLA breakdown | git revert |
| **T010-040** | A11Y | P2 | 2h | A10 | J | Keyboard navigation deep audit for screen 4 | — | 0 trap, focus visible | git revert |
| **T010-041** | A11Y | P2 | 2h | A10 | J | Axe CI gate scope 5 | — | 0 critical Axe issues | lower gate |
| **T010-042** | SEO | P2 | 3h | A10 | J | Dynamic OG image generator for slug group 5 | — | Twitter card validator passes | remove generator |
| **T010-043** | SEO | P2 | 2h | A10 | J | Lighthouse SEO 100 push for page 5 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-044** | MOB | P2 | 3h | A10 | J | PWA offline shell update for route group 5 | — | lighthouse PWA install pass | remove SW route |
| **T010-045** | ENT | P2 | 5h | A04 | D | Multi-region data residency switch 5 | — | RLS region-pinned | rollback config |
| **T010-046** | ENT | P2 | 3h | A02 | B | White-label theme variant 5 | — | tenant theme renders | git revert |
| **T010-047** | HR | P2 | 2h | A08 | H | Candidate panel placeholder module 5 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-048** | HR | P2 | 2h | A08 | H | Recruitment workflow stub 5 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-049** | ENT | P2 | 3h | A07 | G | SLA report generator section 5 | — | PDF generates SLA breakdown | git revert |
| **T010-050** | A11Y | P2 | 2h | A10 | J | Keyboard navigation deep audit for screen 5 | — | 0 trap, focus visible | git revert |
| **T010-051** | A11Y | P2 | 2h | A10 | J | Axe CI gate scope 6 | — | 0 critical Axe issues | lower gate |
| **T010-052** | SEO | P2 | 3h | A10 | J | Dynamic OG image generator for slug group 6 | — | Twitter card validator passes | remove generator |
| **T010-053** | SEO | P2 | 2h | A10 | J | Lighthouse SEO 100 push for page 6 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-054** | MOB | P2 | 3h | A10 | J | PWA offline shell update for route group 6 | — | lighthouse PWA install pass | remove SW route |
| **T010-055** | ENT | P2 | 5h | A04 | D | Multi-region data residency switch 6 | — | RLS region-pinned | rollback config |
| **T010-056** | ENT | P2 | 3h | A02 | B | White-label theme variant 6 | — | tenant theme renders | git revert |
| **T010-057** | HR | P2 | 2h | A08 | H | Candidate panel placeholder module 6 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-058** | HR | P2 | 2h | A08 | H | Recruitment workflow stub 6 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-059** | ENT | P2 | 3h | A07 | G | SLA report generator section 6 | — | PDF generates SLA breakdown | git revert |
| **T010-060** | A11Y | P2 | 2h | A10 | J | Keyboard navigation deep audit for screen 6 | — | 0 trap, focus visible | git revert |
| **T010-061** | A11Y | P2 | 2h | A10 | J | Axe CI gate scope 7 | — | 0 critical Axe issues | lower gate |
| **T010-062** | SEO | P2 | 3h | A10 | J | Dynamic OG image generator for slug group 7 | — | Twitter card validator passes | remove generator |
| **T010-063** | SEO | P2 | 2h | A10 | J | Lighthouse SEO 100 push for page 7 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-064** | MOB | P2 | 3h | A10 | J | PWA offline shell update for route group 7 | — | lighthouse PWA install pass | remove SW route |
| **T010-065** | ENT | P2 | 5h | A04 | D | Multi-region data residency switch 7 | — | RLS region-pinned | rollback config |
| **T010-066** | ENT | P2 | 3h | A02 | B | White-label theme variant 7 | — | tenant theme renders | git revert |
| **T010-067** | HR | P2 | 2h | A08 | H | Candidate panel placeholder module 7 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-068** | HR | P2 | 2h | A08 | H | Recruitment workflow stub 7 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-069** | ENT | P2 | 3h | A07 | G | SLA report generator section 7 | — | PDF generates SLA breakdown | git revert |
| **T010-070** | A11Y | P2 | 2h | A10 | J | Keyboard navigation deep audit for screen 7 | — | 0 trap, focus visible | git revert |
| **T010-071** | A11Y | P2 | 2h | A10 | J | Axe CI gate scope 8 | — | 0 critical Axe issues | lower gate |
| **T010-072** | SEO | P2 | 3h | A10 | J | Dynamic OG image generator for slug group 8 | — | Twitter card validator passes | remove generator |
| **T010-073** | SEO | P2 | 2h | A10 | J | Lighthouse SEO 100 push for page 8 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-074** | MOB | P2 | 3h | A10 | J | PWA offline shell update for route group 8 | — | lighthouse PWA install pass | remove SW route |
| **T010-075** | ENT | P2 | 5h | A04 | D | Multi-region data residency switch 8 | — | RLS region-pinned | rollback config |
| **T010-076** | ENT | P2 | 3h | A02 | B | White-label theme variant 8 | — | tenant theme renders | git revert |
| **T010-077** | HR | P2 | 2h | A08 | H | Candidate panel placeholder module 8 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-078** | HR | P2 | 2h | A08 | H | Recruitment workflow stub 8 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-079** | ENT | P2 | 3h | A07 | G | SLA report generator section 8 | — | PDF generates SLA breakdown | git revert |
| **T010-080** | A11Y | P3 | 2h | A10 | J | Keyboard navigation deep audit for screen 8 | — | 0 trap, focus visible | git revert |
| **T010-081** | A11Y | P3 | 2h | A10 | J | Axe CI gate scope 9 | — | 0 critical Axe issues | lower gate |
| **T010-082** | SEO | P3 | 3h | A10 | J | Dynamic OG image generator for slug group 9 | — | Twitter card validator passes | remove generator |
| **T010-083** | SEO | P3 | 2h | A10 | J | Lighthouse SEO 100 push for page 9 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-084** | MOB | P3 | 3h | A10 | J | PWA offline shell update for route group 9 | — | lighthouse PWA install pass | remove SW route |
| **T010-085** | ENT | P3 | 5h | A04 | D | Multi-region data residency switch 9 | — | RLS region-pinned | rollback config |
| **T010-086** | ENT | P3 | 3h | A02 | B | White-label theme variant 9 | — | tenant theme renders | git revert |
| **T010-087** | HR | P3 | 2h | A08 | H | Candidate panel placeholder module 9 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-088** | HR | P3 | 2h | A08 | H | Recruitment workflow stub 9 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-089** | ENT | P3 | 3h | A07 | G | SLA report generator section 9 | — | PDF generates SLA breakdown | git revert |
| **T010-090** | A11Y | P3 | 2h | A10 | J | Keyboard navigation deep audit for screen 9 | — | 0 trap, focus visible | git revert |
| **T010-091** | A11Y | P3 | 2h | A10 | J | Axe CI gate scope 10 | — | 0 critical Axe issues | lower gate |
| **T010-092** | SEO | P3 | 3h | A10 | J | Dynamic OG image generator for slug group 10 | — | Twitter card validator passes | remove generator |
| **T010-093** | SEO | P3 | 2h | A10 | J | Lighthouse SEO 100 push for page 10 | — | Lighthouse SEO ≥ 100 | revert if regress |
| **T010-094** | MOB | P3 | 3h | A10 | J | PWA offline shell update for route group 10 | — | lighthouse PWA install pass | remove SW route |
| **T010-095** | ENT | P3 | 5h | A04 | D | Multi-region data residency switch 10 | — | RLS region-pinned | rollback config |
| **T010-096** | ENT | P3 | 3h | A02 | B | White-label theme variant 10 | — | tenant theme renders | git revert |
| **T010-097** | HR | P3 | 2h | A08 | H | Candidate panel placeholder module 10 (HR-tech future) | — | stub page renders, no crash | delete page |
| **T010-098** | HR | P3 | 2h | A08 | H | Recruitment workflow stub 10 (ATS-lite preview) | — | stub page renders | delete page |
| **T010-099** | ENT | P3 | 3h | A07 | G | SLA report generator section 10 | — | PDF generates SLA breakdown | git revert |
| **T010-100** | A11Y | P3 | 2h | A10 | J | Keyboard navigation deep audit for screen 10 | — | 0 trap, focus visible | git revert |

> **Total tasks:** 100 · **Estimated effort:** 299h
