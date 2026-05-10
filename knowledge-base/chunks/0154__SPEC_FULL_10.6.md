# 10.6 — Token tracking & cost control

_source: SPEC_FULL · tags: frontend · line 2093 · 349 chars_

Każde wywołanie AI logowane: model, tokens_input, tokens_output, cost_usd, latency_ms. Dashboard admin: dzienny/tygodniowy/miesięczny koszt AI, średni koszt per dokument, rozkład użycia modeli. Alert: jeśli dzienny koszt > $10 (wskazuje na abuse lub pętlę retry). Per-user limit: max 10 generowań dziennie (zapobiega abuse na darmowym scannerze D1).
