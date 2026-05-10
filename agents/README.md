# DŁUGOMAT — Agent Orchestra

This folder defines the **specialized agents** that collaborate (in parallel
where possible) on the project. The `orchestrator` plans and dispatches; each
specialist is given **only the chunks it needs** via the KB retriever.

## How to invoke an agent

1. Read `agents/<role>.md` to load the role contract.
2. Pick the task ID from `docs/PLAN.md` (e.g., `T1.45`).
3. Run the retriever to fetch relevant chunks:

   ```bash
   python3 scripts/kb_query.py "<task topic>" --tag <agent-tag> --k 6
   ```

4. The agent receives: **role contract + task description + retrieved chunks
   only** — never the full 60-page spec.

## Agents

| File                    | Role            | Primary KB tags                          | Parallel-safe with |
| ----------------------- | --------------- | ---------------------------------------- | ------------------- |
| `orchestrator.md`       | Plan & dispatch | (all)                                    | n/a                 |
| `agent-frontend.md`     | UI components, routing, RHF/Zod | frontend, brand          | backend, db         |
| `agent-design.md`       | Design system, motion, brand voice | brand, frontend       | backend, db, ai     |
| `agent-backend.md`      | Route Handlers, middleware, services | backend, security  | frontend (after API contract) |
| `agent-database.md`     | Schema, RLS, migrations, pgvector | database              | frontend, design    |
| `agent-ai-engine.md`    | Prompts, RAG, validators, streaming | ai-engine, ocr      | frontend, payments  |
| `agent-ocr.md`          | Tesseract / Textract / parsers | ocr                      | frontend, ai-engine |
| `agent-payments.md`     | Stripe, Fakturownia, invoices | payments                  | frontend, db        |
| `agent-notifications.md`| Email, SMS, deadline CRON | notifications, devops          | backend, db         |
| `agent-security.md`     | RODO, hardening, pen-test prep | security                  | (review-style)      |
| `agent-qa.md`           | Unit / E2E / a11y / perf | (all)                            | (review-style)      |
| `agent-devops.md`       | CI/CD, infra, monitoring | devops                            | (any)               |

## Parallel execution policy

Three lanes can run truly in parallel because they don't write the same files:

* **Lane A — UX:** `agent-design` + `agent-frontend` (UI tree, components).
* **Lane B — Data:** `agent-database` + `agent-backend` (schema → API).
* **Lane C — Intelligence:** `agent-ai-engine` + `agent-ocr` (pipelines).

`agent-payments`, `agent-notifications`, `agent-security`, `agent-qa`,
`agent-devops` integrate after lanes A–C produce their first slice.

Conflict avoidance:
* Each agent owns its directory tree (see `orchestrator.md` for the map).
* Cross-cutting changes go through the orchestrator with a single squash
  commit per task.
