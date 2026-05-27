<!--
Długomat — PR template.
Wymagane sekcje są oznaczone gwiazdką (*). Resztę można skrócić jeśli nieistotne.
-->

## Co się zmieniło? *

<!-- 1-2 zdania: co dokładnie ten PR robi. Bez wstępów. -->

## Dlaczego? *

<!-- Link do zadania w PLAN.md / PLAN_V2.md albo issue / decyzji biznesowej. -->

## Jak przetestowane? *

- [ ] `npm run typecheck` — zielony
- [ ] `npm run lint` — zielony
- [ ] `npm test` — zielony (jeśli dodane/zmienione testy)
- [ ] Manual QA na critical path (jeśli dotyczy UI/wizard)
- [ ] Migracje DB przetestowane lokalnie (jeśli dotyczy)

## Wpływ na produkcję

<!-- Zaznacz wszystkie pasujące: -->

- [ ] **Breaking change** — wymaga migracji danych / koordynacji deploy
- [ ] **Nowa env var** — zaktualizuj `.env.example` + `LAUNCH_CHECKLIST.md`
- [ ] **Nowa zależność npm** — zweryfikowana licencja + audit
- [ ] **Schema DB** — migracja dodana w `supabase/migrations/`
- [ ] **Tylko refactor** — bez zmian behaviour-wise
- [ ] **Hotfix** — wymaga fast-track review

## Compliance / Security

- [ ] **Brak PII w logach** — żaden nowy log nie zawiera email/PESEL/IP w plaintext
- [ ] **RLS sprawdzone** — nowe tabele mają policy + FORCE ROW LEVEL SECURITY
- [ ] **CSRF** — nowe server actions używają `assertCsrfFromFormData`
- [ ] **N/A** — zmiana niezwiązana z bezpieczeństwem

## Screeny / nagrania (UI changes)

<!-- Wstaw screeny przed/po jeśli dotyczy landing/wizarda/panelu. -->

---

<sub>Plan: `docs/PLAN.md` (zad. 1–250) · `docs/PLAN_V2.md` (zad. 251–500)</sub>
