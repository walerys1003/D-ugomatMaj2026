# CI Workflow Templates

## a11y.yml — Accessibility CI Gate (Wave 9 / W9-3a)

This workflow is staged under `ci-templates/` (instead of
`.github/workflows/`) because the **GenSpark GitHub App** that ships
our PRs does **not** have the `workflows` write permission required
to create or update files under `.github/workflows/`.

### How to activate

The repo owner needs to **move the file** in one commit on `main`:

```bash
mkdir -p .github/workflows
git mv ci-templates/a11y.yml .github/workflows/a11y.yml
git add -A
git commit -m "ci: activate Wave 9 a11y workflow"
git push
```

After this initial activation, future PRs from the GenSpark App can
update the workflow freely (the GitHub App restriction only applies
to *creating* new workflow files; once a workflow exists, updates
flow through normal protected-branch rules).

### What it does

- Triggers on PR + push to `main` (paths-filtered to `apps/web/**`)
- Builds Next.js, starts server, crawls 20 critical URLs with `@axe-core/cli`
- **Fails** the job on any WCAG 2.1 AA violation with `serious` or `critical` impact
- Annotates minor / moderate issues without blocking
- Uploads JSON + summary table artifact (`a11y-reports-<run_id>`) for 30 days
- Auto-comments summary table on the PR via `actions/github-script`

See the file header for a fully-documented local repro recipe.
