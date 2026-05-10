# 18.4 — Faza 3 — AI Engine (5–7 dni)

_source: SPEC_FULL · tags: ai-engine, strategy · line 2439 · 465 chars_

Zadania: Claude client (APIPod wrapper z fallback), RAG pipeline (embeddings, retriever, pgvector queries), prompt templates (wszystkie typy pism), generation pipeline (composition → call → parse → validate → retry), Haiku validation, token tracking, fallback templates.
Estymacja tokenów: ~50–70 interakcji × 12k tokens = ~600–840k tokens (prompty w kontekście są dłuższe). Koszt: ~$0.80–1.20 → ~3.20–4.80 zł. Plus testowanie promptów (AI calls): ~$2–5 → ~8–20 zł.
