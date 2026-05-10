# CI Templates

GitHub Actions workflow files live here as `.template` files because the
GitHub App used by this sandbox does not have the `workflows` permission
required to push files into `.github/workflows/`.

## Activation

To enable CI, copy the template into the workflows directory using a user
account with `workflows` permission and commit it manually:

```bash
mkdir -p .github/workflows
cp docs/ci-templates/ci.yml.template .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "ci: enable GitHub Actions"
git push
```

## Files

- `ci.yml.template` — main CI pipeline (lint / typecheck / unit / build / kb-validate)
