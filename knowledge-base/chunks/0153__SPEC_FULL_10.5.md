# 10.5 — Fallback strategy

_source: SPEC_FULL · tags: misc · line 2091 · 489 chars_

Jeśli APIPod nie odpowiada w 30s: retry 1× z 5s delay. Jeśli nadal nie odpowiada: przełączenie na bezpośrednie API Anthropic (droższe, ale niezależne). Jeśli Anthropic API down: użyj predefiniowanego szablonu pisma (statyczny HTML z placeholderami) + flaga is_template: true. Użytkownikowi wyświetl komunikat: „Wygenerowaliśmy pismo na podstawie szablonu. Ze względu na tymczasową niedostępność AI, zalecamy dodatkową weryfikację. Możesz bezpłatnie wygenerować pismo ponownie w ciągu 24h."
