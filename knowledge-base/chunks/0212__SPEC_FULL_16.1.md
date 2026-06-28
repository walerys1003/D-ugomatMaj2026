# 16.1 — GitHub Repository Setup

_source: SPEC_FULL · tags: misc · line 2254 · 402 chars_

# Inicjalizacja repozytorium
gh repo create dlugomat --private --clone
cd dlugomat

# Branch strategy
git checkout -b develop
# main — production (protected, requires PR + review)
# develop — staging (auto-deploy to preview)
# feature/* — feature branches

# Branch protection rules (main):
# - Require pull request (1 approval)
# - Require status checks (CI pipeline)
# - No force push
# - No deletion
