# 10.1 — Pipeline generowania pisma (szczegółowy)

_source: SPEC_FULL · tags: ai-engine, modules · line 1905 · 1876 chars_

[1] INPUT VALIDATION
     │
     │  Zod schema per document_type
     │  ↳ brak wymaganych pól → HTTP 400
     │
[2] RAG CONTEXT RETRIEVAL
     │
     │  a) Określ applicable tags na podstawie case_type i form_data
     │     np. sprzeciw_epu + cesja = ['epu', 'przedawnienie', 'cesja', 'legitymacja']
     │  b) Query embedding (text-embedding-3-small via OpenAI lub Cohere)
     │     → pgvector similarity search (top 5-10 fragmentów)
     │  c) Filter: is_active = true, effective_date <= NOW()
     │  d) Concat context (max 4000 tokens)
     │
[3] PROMPT COMPOSITION
     │
     │  system_prompt + legal_context + user_data + output_format
     │  ↳ total prompt: 6-12k tokens (zależnie od typu pisma)
     │
[4] CLAUDE SONNET 4.6 GENERATION
     │
     │  via APIPod.ai ($1/M input, $7/M output)
     │  temperature: 0.2 (niski — precyzja prawna)
     │  max_tokens: 4000 (sprzeciw) do 8000 (upadłość)
     │  stop_sequences: ["---KONIEC---"]
     │
[5] RESPONSE PARSING
     │
     │  a) Wyodrębnij sekcje pisma (nagłówek, żądanie, uzasadnienie, podstawa, podpis)
     │  b) Sprawdź kompletność struktury
     │  c) Sanitize (usunięcie artefaktów AI, komentarzy)
     │
[6] HAIKU VALIDATION
     │
     │  Claude Haiku 4.5 ($0.20/M input, $1.00/M output)
     │  Prompt: checklist 15-20 punktów per typ pisma
     │  Output: { score: 0-100, issues: [...], auto_fixable: [...] }
     │
[7] AUTO-FIX (jeśli score < 80)
     │
     │  a) Haiku identifies fixable issues (np. brak daty, niepełny adres)
     │  b) Sonnet re-generates only problematic sections
     │  c) Max 2 retry (po 2 → accept with warnings)
     │
[8] SAVE & RETURN
     │
     │  a) Zapis content_markdown do documents
     │  b) Zapis tokeny, koszt, czas, model, score
     │  c) Zapis case_event ('document_generated')
     │  d) Zwrot { document_id, content_markdown, validation_score, warnings }
