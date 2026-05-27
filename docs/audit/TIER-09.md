# TIER-09 — Scalability, observability & DevOps

**Primary agent:** AGENT-09 Performance & DevOps
**Sandbox primary:** I
**Subsystems:** Performance, DevOps, Scale readiness
**Intent:** Edge runtime dla static-heavy routes, queue dashboard admin, cron scheduler UI, supabase edge functions migrations (push notifications, image resize, scheduled cleanup), CDN cache strategy, ISR/SSG everywhere possible.

**Severity mix:** P0 8% · P1 35% · P2 50% · P3 7%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T009-001** | PERF | P0 | 4h | A09 | I | Edge runtime for route group 1 | — | vercel build shows edge region | remove runtime export |
| **T009-002** | PERF | P0 | 6h | A09 | I | Supabase edge function 1 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-003** | PERF | P0 | 3h | A09 | I | CDN cache header tuning for route 1 | — | curl shows Cache-Control match | remove header |
| **T009-004** | PERF | P0 | 3h | A09 | I | ISR for marketing route 1 | — | build manifest | remove revalidate |
| **T009-005** | PERF | P0 | 4h | A09 | I | Image optimization upgrade for asset group 1 | — | Lighthouse LCP improves | git revert |
| **T009-006** | OBS | P0 | 5h | A09 | I | OpenTelemetry span instrumentation for module 1 | — | trace visible in Sentry | remove span |
| **T009-007** | OBS | P0 | 4h | A09 | I | Synthetic check Checkly probe 1 | — | probe green for 24h | remove probe |
| **T009-008** | PERF | P0 | 4h | A09 | I | Bundle size budget enforcement for route 1 | — | size-limit CI gate | raise budget |
| **T009-009** | DEV | P1 | 4h | A09 | I | GitHub Action workflow 1 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-010** | DEV | P1 | 4h | A09 | I | Preview env per-PR config 1 | — | preview URL works | git revert |
| **T009-011** | PERF | P1 | 3h | A09 | I | Edge runtime for route group 2 | — | vercel build shows edge region | remove runtime export |
| **T009-012** | PERF | P1 | 5h | A09 | I | Supabase edge function 2 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-013** | PERF | P1 | 2h | A09 | I | CDN cache header tuning for route 2 | — | curl shows Cache-Control match | remove header |
| **T009-014** | PERF | P1 | 2h | A09 | I | ISR for marketing route 2 | — | build manifest | remove revalidate |
| **T009-015** | PERF | P1 | 3h | A09 | I | Image optimization upgrade for asset group 2 | — | Lighthouse LCP improves | git revert |
| **T009-016** | OBS | P1 | 4h | A09 | I | OpenTelemetry span instrumentation for module 2 | — | trace visible in Sentry | remove span |
| **T009-017** | OBS | P1 | 3h | A09 | I | Synthetic check Checkly probe 2 | — | probe green for 24h | remove probe |
| **T009-018** | PERF | P1 | 3h | A09 | I | Bundle size budget enforcement for route 2 | — | size-limit CI gate | raise budget |
| **T009-019** | DEV | P1 | 4h | A09 | I | GitHub Action workflow 2 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-020** | DEV | P1 | 4h | A09 | I | Preview env per-PR config 2 | — | preview URL works | git revert |
| **T009-021** | PERF | P1 | 3h | A09 | I | Edge runtime for route group 3 | — | vercel build shows edge region | remove runtime export |
| **T009-022** | PERF | P1 | 5h | A09 | I | Supabase edge function 3 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-023** | PERF | P1 | 2h | A09 | I | CDN cache header tuning for route 3 | — | curl shows Cache-Control match | remove header |
| **T009-024** | PERF | P1 | 2h | A09 | I | ISR for marketing route 3 | — | build manifest | remove revalidate |
| **T009-025** | PERF | P1 | 3h | A09 | I | Image optimization upgrade for asset group 3 | — | Lighthouse LCP improves | git revert |
| **T009-026** | OBS | P1 | 4h | A09 | I | OpenTelemetry span instrumentation for module 3 | — | trace visible in Sentry | remove span |
| **T009-027** | OBS | P1 | 3h | A09 | I | Synthetic check Checkly probe 3 | — | probe green for 24h | remove probe |
| **T009-028** | PERF | P1 | 3h | A09 | I | Bundle size budget enforcement for route 3 | — | size-limit CI gate | raise budget |
| **T009-029** | DEV | P1 | 4h | A09 | I | GitHub Action workflow 3 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-030** | DEV | P1 | 4h | A09 | I | Preview env per-PR config 3 | — | preview URL works | git revert |
| **T009-031** | PERF | P1 | 3h | A09 | I | Edge runtime for route group 4 | — | vercel build shows edge region | remove runtime export |
| **T009-032** | PERF | P1 | 5h | A09 | I | Supabase edge function 4 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-033** | PERF | P1 | 2h | A09 | I | CDN cache header tuning for route 4 | — | curl shows Cache-Control match | remove header |
| **T009-034** | PERF | P1 | 2h | A09 | I | ISR for marketing route 4 | — | build manifest | remove revalidate |
| **T009-035** | PERF | P1 | 3h | A09 | I | Image optimization upgrade for asset group 4 | — | Lighthouse LCP improves | git revert |
| **T009-036** | OBS | P1 | 4h | A09 | I | OpenTelemetry span instrumentation for module 4 | — | trace visible in Sentry | remove span |
| **T009-037** | OBS | P1 | 3h | A09 | I | Synthetic check Checkly probe 4 | — | probe green for 24h | remove probe |
| **T009-038** | PERF | P1 | 3h | A09 | I | Bundle size budget enforcement for route 4 | — | size-limit CI gate | raise budget |
| **T009-039** | DEV | P1 | 4h | A09 | I | GitHub Action workflow 4 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-040** | DEV | P1 | 4h | A09 | I | Preview env per-PR config 4 | — | preview URL works | git revert |
| **T009-041** | PERF | P1 | 3h | A09 | I | Edge runtime for route group 5 | — | vercel build shows edge region | remove runtime export |
| **T009-042** | PERF | P1 | 5h | A09 | I | Supabase edge function 5 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-043** | PERF | P1 | 2h | A09 | I | CDN cache header tuning for route 5 | — | curl shows Cache-Control match | remove header |
| **T009-044** | PERF | P2 | 1h | A09 | I | ISR for marketing route 5 | — | build manifest | remove revalidate |
| **T009-045** | PERF | P2 | 2h | A09 | I | Image optimization upgrade for asset group 5 | — | Lighthouse LCP improves | git revert |
| **T009-046** | OBS | P2 | 3h | A09 | I | OpenTelemetry span instrumentation for module 5 | — | trace visible in Sentry | remove span |
| **T009-047** | OBS | P2 | 2h | A09 | I | Synthetic check Checkly probe 5 | — | probe green for 24h | remove probe |
| **T009-048** | PERF | P2 | 2h | A09 | I | Bundle size budget enforcement for route 5 | — | size-limit CI gate | raise budget |
| **T009-049** | DEV | P2 | 3h | A09 | I | GitHub Action workflow 5 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-050** | DEV | P2 | 3h | A09 | I | Preview env per-PR config 5 | — | preview URL works | git revert |
| **T009-051** | PERF | P2 | 2h | A09 | I | Edge runtime for route group 6 | — | vercel build shows edge region | remove runtime export |
| **T009-052** | PERF | P2 | 4h | A09 | I | Supabase edge function 6 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-053** | PERF | P2 | 1h | A09 | I | CDN cache header tuning for route 6 | — | curl shows Cache-Control match | remove header |
| **T009-054** | PERF | P2 | 1h | A09 | I | ISR for marketing route 6 | — | build manifest | remove revalidate |
| **T009-055** | PERF | P2 | 2h | A09 | I | Image optimization upgrade for asset group 6 | — | Lighthouse LCP improves | git revert |
| **T009-056** | OBS | P2 | 3h | A09 | I | OpenTelemetry span instrumentation for module 6 | — | trace visible in Sentry | remove span |
| **T009-057** | OBS | P2 | 2h | A09 | I | Synthetic check Checkly probe 6 | — | probe green for 24h | remove probe |
| **T009-058** | PERF | P2 | 2h | A09 | I | Bundle size budget enforcement for route 6 | — | size-limit CI gate | raise budget |
| **T009-059** | DEV | P2 | 3h | A09 | I | GitHub Action workflow 6 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-060** | DEV | P2 | 3h | A09 | I | Preview env per-PR config 6 | — | preview URL works | git revert |
| **T009-061** | PERF | P2 | 2h | A09 | I | Edge runtime for route group 7 | — | vercel build shows edge region | remove runtime export |
| **T009-062** | PERF | P2 | 4h | A09 | I | Supabase edge function 7 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-063** | PERF | P2 | 1h | A09 | I | CDN cache header tuning for route 7 | — | curl shows Cache-Control match | remove header |
| **T009-064** | PERF | P2 | 1h | A09 | I | ISR for marketing route 7 | — | build manifest | remove revalidate |
| **T009-065** | PERF | P2 | 2h | A09 | I | Image optimization upgrade for asset group 7 | — | Lighthouse LCP improves | git revert |
| **T009-066** | OBS | P2 | 3h | A09 | I | OpenTelemetry span instrumentation for module 7 | — | trace visible in Sentry | remove span |
| **T009-067** | OBS | P2 | 2h | A09 | I | Synthetic check Checkly probe 7 | — | probe green for 24h | remove probe |
| **T009-068** | PERF | P2 | 2h | A09 | I | Bundle size budget enforcement for route 7 | — | size-limit CI gate | raise budget |
| **T009-069** | DEV | P2 | 3h | A09 | I | GitHub Action workflow 7 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-070** | DEV | P2 | 3h | A09 | I | Preview env per-PR config 7 | — | preview URL works | git revert |
| **T009-071** | PERF | P2 | 2h | A09 | I | Edge runtime for route group 8 | — | vercel build shows edge region | remove runtime export |
| **T009-072** | PERF | P2 | 4h | A09 | I | Supabase edge function 8 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-073** | PERF | P2 | 1h | A09 | I | CDN cache header tuning for route 8 | — | curl shows Cache-Control match | remove header |
| **T009-074** | PERF | P2 | 1h | A09 | I | ISR for marketing route 8 | — | build manifest | remove revalidate |
| **T009-075** | PERF | P2 | 2h | A09 | I | Image optimization upgrade for asset group 8 | — | Lighthouse LCP improves | git revert |
| **T009-076** | OBS | P2 | 3h | A09 | I | OpenTelemetry span instrumentation for module 8 | — | trace visible in Sentry | remove span |
| **T009-077** | OBS | P2 | 2h | A09 | I | Synthetic check Checkly probe 8 | — | probe green for 24h | remove probe |
| **T009-078** | PERF | P2 | 2h | A09 | I | Bundle size budget enforcement for route 8 | — | size-limit CI gate | raise budget |
| **T009-079** | DEV | P2 | 3h | A09 | I | GitHub Action workflow 8 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-080** | DEV | P2 | 3h | A09 | I | Preview env per-PR config 8 | — | preview URL works | git revert |
| **T009-081** | PERF | P2 | 2h | A09 | I | Edge runtime for route group 9 | — | vercel build shows edge region | remove runtime export |
| **T009-082** | PERF | P2 | 4h | A09 | I | Supabase edge function 9 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-083** | PERF | P2 | 1h | A09 | I | CDN cache header tuning for route 9 | — | curl shows Cache-Control match | remove header |
| **T009-084** | PERF | P2 | 1h | A09 | I | ISR for marketing route 9 | — | build manifest | remove revalidate |
| **T009-085** | PERF | P2 | 2h | A09 | I | Image optimization upgrade for asset group 9 | — | Lighthouse LCP improves | git revert |
| **T009-086** | OBS | P2 | 3h | A09 | I | OpenTelemetry span instrumentation for module 9 | — | trace visible in Sentry | remove span |
| **T009-087** | OBS | P2 | 2h | A09 | I | Synthetic check Checkly probe 9 | — | probe green for 24h | remove probe |
| **T009-088** | PERF | P2 | 2h | A09 | I | Bundle size budget enforcement for route 9 | — | size-limit CI gate | raise budget |
| **T009-089** | DEV | P2 | 3h | A09 | I | GitHub Action workflow 9 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-090** | DEV | P2 | 3h | A09 | I | Preview env per-PR config 9 | — | preview URL works | git revert |
| **T009-091** | PERF | P2 | 2h | A09 | I | Edge runtime for route group 10 | — | vercel build shows edge region | remove runtime export |
| **T009-092** | PERF | P2 | 4h | A09 | I | Supabase edge function 10 (push/resize/cleanup) | — | supabase functions invoke ok | delete function |
| **T009-093** | PERF | P2 | 1h | A09 | I | CDN cache header tuning for route 10 | — | curl shows Cache-Control match | remove header |
| **T009-094** | PERF | P3 | 1h | A09 | I | ISR for marketing route 10 | — | build manifest | remove revalidate |
| **T009-095** | PERF | P3 | 2h | A09 | I | Image optimization upgrade for asset group 10 | — | Lighthouse LCP improves | git revert |
| **T009-096** | OBS | P3 | 3h | A09 | I | OpenTelemetry span instrumentation for module 10 | — | trace visible in Sentry | remove span |
| **T009-097** | OBS | P3 | 2h | A09 | I | Synthetic check Checkly probe 10 | — | probe green for 24h | remove probe |
| **T009-098** | PERF | P3 | 2h | A09 | I | Bundle size budget enforcement for route 10 | — | size-limit CI gate | raise budget |
| **T009-099** | DEV | P3 | 3h | A09 | I | GitHub Action workflow 10 (tsc/lint/e2e/lighthouse) | — | CI green | git revert |
| **T009-100** | DEV | P3 | 3h | A09 | I | Preview env per-PR config 10 | — | preview URL works | git revert |

> **Total tasks:** 100 · **Estimated effort:** 281h
