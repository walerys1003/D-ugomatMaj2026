# `_legacy/` — archived components

Components here are **archived dead code**. They are not imported by anything
in the live tree (verified via `grep -rln "from.*v2/" apps/web` returning zero
hits outside `_legacy/`).

The `_` prefix is a Next.js convention — directories starting with `_` are
excluded from route resolution and most tooling, so this dir is safe inside
`components/`.

## Why kept, not deleted

1. **Git history**: `git mv` preserves the rename trail, so `git log --follow`
   on any file still works.
2. **Reference**: some patterns inside (e.g. `command-palette.tsx`,
   `advanced-filters.tsx`) may be useful when building v4 equivalents.
3. **Cheap revert**: if a future commit accidentally breaks something that
   silently depended on v2 (we verified zero deps, but defensive), revert is
   `git mv` back.

## What's here

| Subdir | Origin | Status |
|---|---|---|
| `landing-v2/` | `apps/web/components/landing/v2/` | 3 files: hero-v2, live-stats, trust-bar |
| `ui-v2/` | `apps/web/components/ui/v2/` | 16 files + barrel: breadcrumbs, pagination, copy-button, multi-select, datepicker, file-uploader, command-palette, error-state, loading-state, keyboard-shortcuts, onboarding-tooltip, advanced-filters, segmented-control, stepper, inline-banner, page-header |

Total: 19 component files + 1 barrel = 1950 LOC of dead code archived.

## When to delete

When v4 design system is stable for 30+ days and no v2 patterns have been
needed for reference, this directory can be `rm -rf`'d.
