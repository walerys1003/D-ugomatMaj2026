# `_legacy/admin-pl/` — Polish-named admin pages archive

**Archived in**: Tarcza v4 Phase 9 (Admin C-decision)
**Original location**: `apps/web/app/admin/`
**Reason**: Replaced by canonical English-named admin under `apps/web/app/(admin)/admin/`

## Backstory

The codebase carried **two parallel admin trees**:

| Tree | Location | Naming | URL prefix | Status |
|------|----------|--------|------------|--------|
| Legacy (v1) | `app/admin/*` | Polish (`audyt/`, `finanse/`, `sprawy/`...) | `/admin/*` | **Archived** |
| Canonical (v4) | `app/(admin)/admin/*` | English (`analytics/`, `dashboard/`, `errors/`...) | `/admin/*` | **Active** |

Both trees merged into the same `/admin/*` URL space at runtime. There were **zero URL conflicts** (the directory name sets were disjoint), so Next.js happily served pages from both — but maintaining two trees with overlapping responsibility was a productivity tax and a UX inconsistency (mixed PL/EN admin navigation).

## What was archived

30 directories + root `layout.tsx` + `page.tsx`:

```
audyt/ audyt-szukaj/ bledy/ dlq/ eksperymenty/ eksport-danych/ finanse/
flagi-funkcji/ harmonogram/ import-komorniczy/ integracje/ kampanie/
komunikaty/ notyfikacje/ operacje-masowe/ platnosci/ promocje/ prompty/
raporty/ sli/ slowniki/ sprawy/ system/ system-health/ taryfy/ uzytkownicy/
webhooki/ wersje-promptow/ wiedza/ wydajnosc/
```

## How Next.js handles the `_` prefix

Directories with **leading underscore** are **excluded from route resolution** by Next.js App Router. Files inside `_legacy/` are NOT compiled into routes, and they don't show up in `next build` output. We keep them in git history for reference & potential salvage.

## Migration path forward

The 30 legacy modules are **NOT** at full feature parity with the 13 canonical ones. The canonical tree intentionally covers a narrower, higher-quality scope:

- `analytics/` (5 sub-pages: anomalies, cohorts, funnel, nps, revenue)
- `compliance/`, `dashboard/`, `errors/`, `feature-flags/`, `impersonate/`
- `legal-hold/`, `prompts/`, `rate-limits/`, `rbac/`, `rum/`, `secrets/`, `workflows/`

For features that exist ONLY in legacy (`finanse/`, `taryfy/`, `kampanie/`, etc.) — they will be ported one-by-one into canonical tree with English naming + v4 design system + primitives.

## Retention policy

**Delete after 90 days of v4 stability** (longer than v2 component archive — admin is higher-risk to lose).

Concretely: if no incident reports reference any legacy admin functionality between **2026-05-27** and **2026-08-25**, this folder may be permanently deleted in `feat(v5-cleanup): purge legacy admin tree`.

## Cross-references

- v2 component archive: `apps/web/components/_legacy/`
- Canonical admin: `apps/web/app/(admin)/admin/`
- Admin RBAC gate: `apps/web/lib/admin/rbac.ts` (still used by canonical tree)
