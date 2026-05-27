# DŁUGOMAT V5 — ULTRA ENTERPRISE AI-NATIVE LEGAL OS

**Codename:** `V5-INFRA` (Infrastructure)
**Predecessor:** V4-ι.6 (Tarcza v4 iota)
**Start:** 2026-05-27
**Branch:** `genspark_ai_developer`
**Orchestrator:** Central AI System

---

## 1. ARCHITECTURAL POSITIONING SHIFT

```
V4 (Tarcza)              →   V5 (INFRA)
─────────────────────────────────────────────────────
Legal-tech SaaS          →   Procedural OS
Document generator       →   Reasoning engine
Chatbot wrapper          →   AI orchestration platform
Marketing site           →   Infrastructure surface
Tarcza brand             →   INFRA-grade enterprise cloud
Trust signals            →   Audit-native architecture
```

**Inspirations (visual language reference set):**
Modal · OpenAI Enterprise · Anthropic · Linear · Harvey AI · Vercel AI Cloud · Palantir-lite · Stripe Infrastructure · Retool Enterprise.

---

## 2. EXECUTION TOPOLOGY

```
                  ┌─────────────────────────┐
                  │  ORCHESTRATOR (central) │
                  │  • design governance     │
                  │  • dep graph             │
                  │  • visual QA             │
                  └────────────┬─────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │           FOUNDATION LAYER (wave 1)            │
       │   A01 Design System ◀─── A10 Motion            │
       └───────────────────────┬───────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │            SURFACE LAYER (wave 2)              │
       │   A02 Landing  · A04 Panel  · A05 Admin        │
       │   A09 Mobile (cross-cutting)                   │
       └───────────────────────┬───────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │          DOMAIN LAYER (wave 3)                 │
       │   A03 Reasoning · A06 AI · A07 Cases · A08 Docs│
       └────────────────────────────────────────────────┘
```

**Why waves:** A01 produces tokens that A02–A09 consume. A03/A06/A07/A08 consume primitives from A02/A04. Parallel inside wave, sync between waves.

---

## 3. V5-INFRA DESIGN TOKENS (canonical)

### Typography scale (browser-zoom-120% native parity)
```
display     clamp(5.75rem, 6vw + 1rem, 8.75rem)   /* 92-140 */
h1          clamp(4rem, 4vw + 1rem, 5.5rem)       /* 64-88 */
h2          clamp(2.75rem, 2vw + 1rem, 3.75rem)   /* 44-60 */
h3          clamp(1.875rem, 1vw + 1rem, 2.5rem)   /* 30-40 */
body-lg     1.375rem (22px)
body        1.1875rem (19px)
caption     0.9375rem (15px) — minimum
```

### Spacing rhythm (infrastructure-grade)
```
section-y   clamp(11.25rem, 14vw, 16.25rem)  /* 180-260 */
card-pad    clamp(2.25rem, 3vw, 3.5rem)      /* 36-56 */
grid-gap    clamp(1.75rem, 2vw, 2.75rem)     /* 28-44 */
layout-max  min(1800px, 100vw - 8rem)        /* 1600-1800 */
```

### Palette (V5-INFRA)
```
─ Infrastructure White ──
infra-25     #FAFAF8  page bg (warmer than pure white)
infra-50     #F7F6F3  raised surface
infra-100    #F3F2EF  card bg
infra-150    #EBE9E4  divider

─ Procedural Violet ──   (primary accent — AI / reasoning / orchestration)
violet-300   #A4A8FF
violet-500   #5B5AF7   primary CTA, focus
violet-600   #6B6BFF   hover

─ Audit Blue ──          (audit chains, verification)
audit-300    #A4A8FF
audit-500    #4F46E5

─ System Gray ──         (chrome, infrastructure)
system-200   #D8D4CC
system-400   #9A958B
system-600   #5E5A52

─ Ink (text) ──
ink-900      #111111
ink-700      #202020
ink-500      #5E5A52

─ Topology ──
ok           #00C27A
warn         #F59E0B
err          #DC2626
```

### Elevation (infra layers)
```
elev-0   flat (rest)
elev-1   inset hairline border + 1px shadow
elev-2   card lift (cards, dropdowns)
elev-3   modal / dialog
elev-4   command bar / overlay
glow-ai  ambient violet halo (reasoning surfaces only)
```

### Motion tokens
```
ease-cinematic  cubic-bezier(0.22, 1, 0.36, 1)
ease-procedural cubic-bezier(0.4, 0, 0.2, 1)
ease-topology   cubic-bezier(0.65, 0, 0.35, 1)

dur-instant   80ms
dur-fast      160ms
dur-base      240ms
dur-slow      400ms
dur-ambient   2400ms  (pulses, glow breathing)
```

---

## 4. WAVE EXECUTION PLAN

### WAVE 1 — Foundation (this commit)
- A01 Design System Architect → `styles/v5/tokens.css`, `tailwind.v5.ts`, primitives in `components/v5/primitives/`
- A10 Motion → `components/v5/motion/`, motion tokens, animation primitives

### WAVE 2 — Surfaces (next commit)
- A02 Landing → `components/v5/landing/` (hero cockpit, sections)
- A04 User Panel → `components/v5/panel/` (shell, dashboard)
- A05 Admin → `components/v5/admin/` (ops center)
- A09 Mobile → cross-cutting responsive layer

### WAVE 3 — Domain (final commit)
- A03 Reasoning UX → `components/v5/reasoning/`
- A06 AI Orchestration → `components/v5/ai/`
- A07 Case Mgmt → `components/v5/case/`
- A08 Document Infra → `components/v5/docs/`

---

## 5. NON-NEGOTIABLE GOVERNANCE RULES

1. **No regression** — V4 components remain mounted until V5 equivalent is shipped and QA-passed. V5 lives in `components/v5/**` alongside V4.
2. **Token discipline** — every V5 component MUST consume `--v5-*` CSS variables. No hex literals in JSX.
3. **Build green** — every wave commit must compile (`tsc --noEmit` allowed pre-existing errors, zero NEW from V5).
4. **Visual smoke** — `scripts/scan-overflow-multi.mjs` must pass on the V5 demo route before merge.
5. **No dribbble gimmicks** — no neon, no crypto aesthetic, no gradient chaos, no over-animation.
6. **Audit-native by default** — every data surface implies provenance (who/when/source).
7. **AI-native ≠ animation-heavy** — motion is calm, cinematic, operational. Pulses only on live data.

---

## 6. ROUTE BINDING (V5 surface coverage)

Connecting orchestration plan to architectural audit (123 orphaned endpoints, 174 backend routes):

| V5 surface | Binds orphaned endpoints |
|---|---|
| `/v5/landing` | none (marketing) |
| `/v5/panel` demo | `/api/dashboard`, `/api/deadlines/due` |
| `/v5/reasoning` demo | `/api/ai/irac`, `/api/ai/evaluate`, `/api/ai/agent` |
| `/v5/case` demo | `/api/cases/[id]/timeline`, `/evidence`, `/virtual-judge`, `/win-probability` |
| `/v5/docs` demo | `/api/documents/[id]/versions`, `/revise`, `/restore` |
| `/v5/admin` demo | `/api/admin/users`, `/audit-log`, `/realtime-kpis`, `/job-queue` |

V5 thus serves dual purpose: design refresh + orphaned endpoint surface activation.

---

## 7. SUCCESS CRITERIA

V5 ships when:
- [ ] `/v5/showcase` route renders all 10 agents' outputs in a single tour
- [ ] Visual smoke (5 viewports × showcase) passes
- [ ] Zero new TS errors
- [ ] Lighthouse perf ≥ 85 on `/v5/showcase`
- [ ] PR #1 updated with full V5 ledger
