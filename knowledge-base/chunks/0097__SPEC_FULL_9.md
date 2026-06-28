# 9 — Zwrot { document_id, content_markdown, validation_score, warnings[] }

_source: SPEC_FULL · tags: ai-engine, ocr, notifications, modules · line 926 · 982 chars_

Timeout: 60s. Fallback: jeśli APIPod nie odpowiada w 30s, przełączenie na direct Anthropic API. Jeśli oba failują → zwrot predefiniowanego szablonu z flagą is_template: true i komunikatem dla użytkownika.
POST /api/ai/validate — walidacja istniejącego dokumentu. Używa Haiku do sprawdzenia kompletności formalnej (sygnatura, dane stron, podpis, data, żądanie, uzasadnienie, podstawa prawna). Zwraca { score: 0-100, issues: ValidationIssue[], suggestions: string[] }.
POST /api/ai/chat — asystent „Co dalej?". Kontekstowy chatbot, który na podstawie stanu sprawy sugeruje kolejne kroki. Używa Haiku (tani, szybki). Kontekst: typ sprawy, status, deadline, dokumenty. Max 3 tury konwersacji per sesja (zapobieganie abuse).
POST /api/ai/analyze-ocr — po OCR, AI analizuje wykryty tekst: identyfikuje typ dokumentu (nakaz, pismo komornika, wezwanie), wykrywa potencjalne zarzuty (przedawnienie, brak legitymacji czynnej, błędy formalne), scoring szansy powodzenia (0–100%). Używa Sonnet.
