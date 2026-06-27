# Długomat — Legal-tech for Polish debtors

> AI-powered platform that generates court-ready legal documents (sprzeciw od
> nakazu zapłaty EPU, skarga komornicza, wniosek BIK, etc.) for people facing
> debt-collection pressure. Built around Claude Sonnet 4.6 (via APIPod.ai),
> Supabase (self-hostable Postgres + Auth + Storage), Next.js 14 App Router,
> Tailwind + shadcn/ui, and a Tesseract.js → AWS Textract OCR pipeline.

---

## Repository layout

```
docs/
  spec/SPEC_FULL.txt         ← full technical specification (canonical)
  spec/SPEC_BRAND.md         ← brand & design system specification
  PLAN.md                    ← 5-tier × 50-task master work plan (250 tasks)
  api/, db/, ai/, design/    ← per-domain documentation (filled as we ship)

knowledge-base/
  chunks/                    ← 307 individually-addressable spec sections
  index/chunks.json          ← chunk metadata (id, section, tags, file)
  index/tfidf.json           ← deterministic offline embeddings
  index/by_tag.json          ← inverted index by domain tag
  index/by_section.json      ← inverted index by section number

scripts/
  build_kb.py                ← rebuilds the knowledge base from /docs/spec
  kb_query.py                ← retrieval CLI (used by every agent)

agents/
  README.md                  ← orchestra overview + parallel-execution lanes
  orchestrator.md            ← planner / dispatcher contract
  agent-{design,frontend,backend,database,ai-engine,ocr,
         payments,notifications,security,qa,devops}.md

apps/web/                    ← Next.js 14 app (created in Tier 1, task 1.1)
supabase/                    ← migrations, seed, edge functions (Tier 2)
tests/                       ← unit / integration / e2e (per QA agent)
.github/workflows/           ← CI lanes (per DevOps agent)
```

## How the AI build process works

1. **Planning.** `docs/PLAN.md` lists 250 tasks across 5 tiers. The
   orchestrator picks ready tasks and assigns them to the right specialist.
2. **Context retrieval (no full-spec dumps).** Before a task starts, the
   orchestrator runs the KB retriever:

   ```bash
   python3 scripts/kb_query.py "RLS policy cases table" --tag database --k 5
   python3 scripts/kb_query.py --section 7.2          # direct lookup
   python3 scripts/kb_query.py --list-tags            # available domains
   ```

   The agent receives only the matching chunks (≈ 5–8 sections, ≤ 30 KB)
   instead of the 250 KB+ full spec.
3. **Parallel execution.** Three lanes run independently (UX, Data,
   Intelligence). Each agent owns a disjoint set of file globs — see
   `agents/orchestrator.md` for the ownership map.
4. **Done = squashed commit on `genspark_ai_developer` + updated PR to `main`.**

## Deployment

Najszybsza ścieżka do produkcji (Vercel + Supabase):

```bash
npm i -g vercel supabase
bash scripts/deploy.sh          # interaktywny skrypt prowadzący
```

Dokumentacja:
* **[`docs/DEPLOY_QUICKSTART.md`](docs/DEPLOY_QUICKSTART.md)** — checklista krok-po-kroku + pełna tabela ENV
* [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) — pre-launch checklist
* [`scripts/deploy.sh`](scripts/deploy.sh) — preflight + `supabase db push` + `vercel --prod`

## Local development

Prerequisites land progressively:

* **Tier 1.1 (next):** Node 20+, `pnpm`, Next.js app in `apps/web`.
* **Tier 2.1:** Docker, Supabase CLI, local Postgres on port 54322.
* **Tier 3.1:** APIPod.ai key (`APIPOD_API_KEY`) for Claude calls.

For now the repo holds the planning artifacts and KB. The next PR will
bootstrap the Next.js app, design tokens, and the auth/profile scaffold
(Tier 1, tasks 1–50).

## Status

| Tier                                    | Status        | Tasks complete |
| --------------------------------------- | ------------- | -------------- |
| 0 — Knowledge base + planning           | ✅ done        | meta           |
| 1 — Foundation & Design System          | ⏳ in progress | 0 / 50         |
| 2 — Core data & Wizard engine           | ⏸ queued      | 0 / 50         |
| 3 — AI Engine + OCR + D1, D2, D5        | ⏸ queued      | 0 / 50         |
| 4 — Modules D3 / D4 / D6 / D7 / D8 + payments | ⏸ queued | 0 / 50         |
| 5 — Hardening, security, launch         | ⏸ queued      | 0 / 50         |
