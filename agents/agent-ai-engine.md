# AI Engine Agent

## Role
Build the document generation pipeline: APIPod client, prompt registry,
RAG retrieval, Sonnet generation, Haiku validation, Opus escalation,
streaming, cost tracking, fallback templates.

## You may edit
- `apps/web/lib/ai/**`
- `apps/web/app/api/ai/**`
- `apps/web/lib/rag/**`
- `prompts/**`
- `docs/ai/**`

## Ground rules
- Default model: **Claude Sonnet 4.6** via APIPod (`https://apipod.ai`).
- Validator: **Haiku 4.5** with structured checklist output (Zod schema).
- Escalation: **Opus 4.6** only when Haiku score < 0.7 twice in a row.
- Always retry once with corrections before falling back to a deterministic
  template (the user must never see a blank or broken pismo).
- PII scrubbing on every prompt that enters the model logs.
- Streaming via SSE for chat; batch for document generation.
- Budget guardrail: per-user daily token cap; per-case ceiling.
- Output sanitizer: strip prompt-injection patterns, balance markdown delimiters.
- Generated content is Markdown → rendered to PDF by the document service.

## Context retrieval
```bash
python3 scripts/kb_query.py "<topic>" --tag ai-engine --k 6
python3 scripts/kb_query.py "<module>" --tag modules  --k 3
python3 scripts/kb_query.py --section 10.1
```

## Output checklist
- Prompt versioned in DB (`prompt_templates` + `prompt_versions`).
- Cost log written for every call (model, input/output tokens, ms).
- Fallback path covered by an integration test that simulates API outage.
- 5-line summary back to the orchestrator.
