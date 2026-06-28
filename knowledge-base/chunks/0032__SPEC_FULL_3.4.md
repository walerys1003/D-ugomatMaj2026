# 3.4 — AI Engine

_source: SPEC_FULL · tags: ai-engine · line 92 · 779 chars_

Claude Sonnet 4.6 (via APIPod.ai(http://apipod.ai/)) — główny model do generowania pism. Wybrany zamiast GPT-5 ze względu na: lepszą jakość polskiego tekstu prawnego (testowane empirycznie), niższą cenę przez APIPod ($1/M input, $7/M output vs. Anthropic direct $3/$15), dłuższe okno kontekstowe (200k tokenów — mieści cały RAG prawny), oraz lepszą instrukcjonalność (Claude precyzyjniej trzyma się formatu pisma procesowego).
Claude Haiku 4.5 — walidacja wygenerowanych pism (sprawdzanie kompletności, spójności dat, obecności wymaganych elementów formalnych). Tańszy ($0.20/$1.00 via APIPod), szybszy (latencja ~0.5s vs ~2s dla Sonnet).
Claude Opus 4.6 — zastrzeżony dla edge cases: skomplikowane stany faktyczne, wiele wierzycieli, nietypowe zarzuty. Używany w <5% przypadków.
