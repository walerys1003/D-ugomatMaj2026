# 4.2 — Konwencje kodowania

_source: SPEC_FULL · tags: frontend, database, monorepo · line 407 · 910 chars_

Nazewnictwo plików: kebab-case dla plików (case-card.tsx), PascalCase dla komponentów (CaseCard), camelCase dla funkcji i zmiennych. Schemat bazy danych: snake_case (case_type, created_at).
Importy: aliasy ścieżek (@/components/, @/lib/, @/hooks/, @/types/, @/stores/). Kolejność importów: 1) React/Next, 2) biblioteki zewnętrzne, 3) wewnętrzne moduły, 4) typy, 5) style.
Typy: strict TypeScript — strict: true, noUncheckedIndexedAccess: true. Zero any. Wszystkie API responses typowane. Zod schemas jako single source of truth (typy generowane z walidatorów).
Obsługa błędów: Every async function wrapped w try/catch z typowanymi błędami. API zwraca standaryzowany format: { success: boolean, data?: T, error?: { code: string, message: string } }.
Komentarze: JSDoc dla każdej eksportowanej funkcji. Inline comments tylko dla nieintuicyjnej logiki prawnej (np. wyjaśnienie dlaczego termin to 14 dni a nie 30).
