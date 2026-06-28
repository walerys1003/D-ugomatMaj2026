# Długomat — Audyt i Redesign (seria 00–05)

> **Data:** 2026-06-26 · **Branch:** `genspark_ai_developer`
> Kompletna seria dokumentów audytu i redesignu oparta na **żywej eksploracji kodu** (322 route'y front-end, 195 API handlerów, 73 moduły `lib/`, 49 migracji SQL). Zasada nadrzędna: **redesign to warstwa prezentacji + informacja (IA), backend nietknięty.**

## Spis dokumentów

| # | Dokument | Co zawiera |
|---|---|---|
| 00 | [`00_AUDYT_KRYTYCZNY.md`](./00_AUDYT_KRYTYCZNY.md) | Stan faktyczny, metryki, 10 problemów krytycznych (3 generacje UI, 3 zestawy tokenów), zasady redesignu |
| 01 | [`01_MAPA_FUNKCJI_BACKEND_FRONTEND.md`](./01_MAPA_FUNKCJI_BACKEND_FRONTEND.md) | 195 endpointów → konsumenci front, role, panele; rdzeń „od nakazu do pisma"; matryca ról×powierzchnia |
| 02 | [`02_DESIGN_SYSTEM_UNIFIED.md`](./02_DESIGN_SYSTEM_UNIFIED.md) | „Tarcza v4 Stoic+" — jeden zestaw tokenów, konsolidacja iron/ink/v5, komponenty, checklista spójności |
| 03 | [`03_LANDING_PAGE_STRUKTURA_COPY.md`](./03_LANDING_PAGE_STRUKTURA_COPY.md) | 12-sekcyjna przełomowa landing + gotowe copy PL, ekspozycja wyróżników AI |
| 04 | [`04_PANELE_WZORCOWE_USER_ADMIN.md`](./04_PANELE_WZORCOWE_USER_ADMIN.md) | Jeden shell user+admin, nawigacja warunkowana rolą/org/planem, deduplikacja, strona referencyjna sprawy |
| 05 | [`05_ROADMAPA_IMPLEMENTACJI.md`](./05_ROADMAPA_IMPLEMENTACJI.md) | 8 fal wdrożeniowych, zależności, definicje „done", metryki sukcesu |

## Kluczowe ustalenia

1. **Brak panelu kandydata — i tak ma być.** Role: `user` (warianty B2B firma/kancelaria/partner przez organizację) + `admin`.
2. **Backend jest kompletny.** Problemem jest spójność prezentacji, nie braki funkcji.
3. **Trzy generacje UI** (`_legacy/admin-pl`, `(admin)/admin`, `v5/`) → jedna kanoniczna.
4. **Trzy zestawy tokenów** (`iron`/`ink`/`v5`) → jeden semantyczny (oparty na `ink-*`).
5. **Landing musi eksponować wyróżniki AI** (wirtualny sędzia, szansa wygranej, walidator cytatów, IRAC, RAG) — dziś niedoeksponowane.

## Jak czytać

Kolejność: `00` (diagnoza) → `01` (kontrakt funkcji) → `02` (fundament wizualny) → `03`/`04` (zastosowanie) → `05` (jak wdrożyć).

Poprzednie audyty (`docs/AUDIT_FULL_2026-05.md`, `docs/AUDIT_BACKEND_TO_FRONTEND.md`) ta seria **aktualizuje**, przesuwając fokus na ujednolicenie.
