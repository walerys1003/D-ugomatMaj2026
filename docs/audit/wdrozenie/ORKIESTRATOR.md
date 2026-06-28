# WDROŻENIE AUDYTU — ORKIESTRACJA 5 AGENTÓW × 50 ZADAŃ (250 zadań)

> Bazuje na `docs/audit/AUDYT-2026-06-27.md`. Każdy agent ma 50 atomowych zadań.
> Wykonanie równoległe ścieżkami; walidacja `tsc --noEmit` + `next lint` po każdej fazie.
> Branch: `genspark_ai_developer`.

## Podział odpowiedzialności (rozłączne pliki = brak konfliktów merge)

| Agent | Domena | Główne pliki | Błędy z audytu |
|---|---|---|---|
| **A1** | Security / Infra | `lib/security/*`, `lib/env.ts`, `middleware.ts`, `.env.example` | #2, #11 |
| **A2** | AI / Payments | `app/api/ai/*`, `lib/ai/*`, `app/api/stripe/*`, `lib/payments/*` | #3, #4, #5, #6(payments), #17 |
| **A3** | Notifications / Jobs | `lib/notifications/*`, `lib/jobs/*`, `lib/queue/*` | #7, #8, #9, #10 |
| **A4** | Database / Types | `supabase/migrations/*`, `lib/db/types.ts` | #6(types), #15, #16, #19, #22 |
| **A5** | Frontend / SEO / Cleanup | `app/sitemap.ts`, `app/robots.ts`, `app/v5/*`, `app/_legacy/*`, components | #1, #12, #13, #14, #18, #20, #21 |

## Status wykonania
Legenda: ⬜ pending · 🔄 in_progress · ✅ done

(Szczegółowe listy zadań w plikach AGENT-A1..A5.)
