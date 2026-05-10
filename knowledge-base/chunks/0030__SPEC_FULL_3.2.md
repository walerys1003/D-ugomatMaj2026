# 3.2 — Backend

_source: SPEC_FULL · tags: backend · line 86 · 380 chars_

Next.js Route Handlers — eliminują potrzebę osobnego serwera Express/Fastify. Dla projektu solo-founder i AI-assisted development, mniejsza liczba repozytoriów i technologii oznacza mniej punktów awarii.
tRPC (opcjonalnie, V2) — typesafe API layer, auto-generowanie typów klient-serwer. W V1 używamy zwykłych Route Handlers z Zod validacją; w V2 migrujemy do tRPC dla lepszego DX.
