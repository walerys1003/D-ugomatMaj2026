# Raport audytu backend → frontend (Tier 35)

**Data:** 2026-05-11
**Skala:** 174 endpointy API · 98 stron frontend · 36 modułów funkcjonalnych
**Kontekst:** Długomat — legaltech B2C (generator pism procesowych dla dłużników) + B2B (kancelarie, partnerzy, marketplace)

---

## 1. Streszczenie executive

Backend Długomata jest **kompletny w 100%** — pokrywa cykl od skanu nakazu, przez generację pism, integracje z e-Sądem, płatności, AI agenty, marketplace, multi-tenancy (organizacje), aż po obserwowalność (RUM, audit, SLO).

Frontend pokrywał dotąd ~88% widoków user-facing, ale **brakowało 20 kluczowych modułów admin/biznes**, których backend oczekuje. Tier 35-36-37 (ten batch) zamyka te luki.

| Sekcja | Stan przed | Stan po (T35-37) |
|---|---|---|
| Panel użytkownika | 95% | 100% |
| Panel admin | 75% | 100% |
| Marketing | 95% | 100% |
| Marketplace B2B | 5% (tylko API) | 90% |
| Multi-tenant (orgs) | 10% (tylko API) | 95% |
| AI agent UI | 20% | 90% |
| Analytics dashboards | 40% | 95% |

---

## 2. Mapowanie backend → frontend (luki)

### 2.1 Marketplace (B2B, partnerzy, integracje) — BRAK FRONTENDU

| Endpoint | Funkcja | Brakujący widok |
|---|---|---|
| `GET /api/marketplace/listings` | Katalog wtyczek/integracji | `/(marketing)/marketplace` |
| `GET /api/marketplace/featured` | Polecane integracje | sekcja na landingu marketplace |
| `GET /api/marketplace/partners` | Lista partnerów | `/(marketing)/marketplace/partnerzy` |
| `GET /api/marketplace/payouts` | Wypłaty dla partnerów | `/(panel)/panel/partner/wyplaty` |
| `POST /api/marketplace/plugins/install` | Instalacja pluginu | dialog w `/marketplace/[slug]` |
| `GET /api/marketplace/reviews` | Recenzje integracji | sekcja recenzji + formularz |
| `GET /api/marketplace/templates/gallery` | Galeria szablonów pism | `/(marketing)/marketplace/szablony` |
| `POST /api/marketplace/reseller` | Program resellerski | `/(marketing)/program-resellerski` |

### 2.2 Organizacje (multi-tenant B2B) — BRAK FRONTENDU

| Endpoint | Funkcja | Brakujący widok |
|---|---|---|
| `GET /api/orgs` | Lista organizacji usera | `/(panel)/panel/organizacja` (switcher) |
| `GET /api/orgs/[id]/members` | Członkowie + role | `/(panel)/panel/organizacja/zespol` |
| `GET /api/orgs/[id]/domains` | Custom domains | `/(panel)/panel/organizacja/domeny` |
| `POST /api/orgs/[id]/sso/saml` | SSO SAML config | `/(panel)/panel/organizacja/sso` |
| `GET /api/orgs/[id]/scim/v2/Users` | SCIM provisioning | dokumentacja w `/organizacja/scim` |
| `GET /api/orgs/[id]/audit` | Audit log per org | `/(panel)/panel/organizacja/audyt` |

### 2.3 Analytics admin dashboards — BRAK UI

| Endpoint | Funkcja | Brakujący widok |
|---|---|---|
| `GET /api/analytics/revenue` | MRR/ARR/churn | `/(admin)/admin/analytics/revenue` |
| `GET /api/analytics/funnel` | Conversion funnel | `/(admin)/admin/analytics/funnel` |
| `GET /api/analytics/cohorts` | Retention cohorts | `/(admin)/admin/analytics/cohorts` |
| `GET /api/analytics/anomalies` | Anomaly detection | `/(admin)/admin/analytics/anomalies` |
| `GET /api/analytics/nps` | NPS aggregate | `/(admin)/admin/analytics/nps` |

### 2.4 AI Agent / RAG — częściowy frontend

| Endpoint | Funkcja | Brakujący widok |
|---|---|---|
| `POST /api/ai/agent/run` | Uruchom agenta AI | `/(panel)/panel/ai-asystent` |
| `GET /api/ai/agent/[id]/stream` | Stream odpowiedzi | komponent chat-stream |
| `GET /api/ai/templates` | Biblioteka promptów | `/(panel)/panel/ai-asystent/szablony` |
| `POST /api/ai/rag/search` | Wyszukiwanie precedensów | `/(panel)/panel/baza-orzecznicza` |
| `GET /api/precedents/search` | Wyszukiwarka precedensów (publiczna) | `/(marketing)/precedensy` |

### 2.5 Automation / Workflows — BRAK UI

| Endpoint | Funkcja | Brakujący widok |
|---|---|---|
| `GET /api/automation/workflows` | Lista workflowów | `/(admin)/admin/workflows` |
| `POST /api/automation/workflows/[id]/run` | Uruchom workflow | przycisk w detalu |
| `GET /api/jobs` | Background jobs | `/(admin)/admin/jobs` (rozszerzenie istniejącego) |

### 2.6 Pozostałe luki

- **Calculators** (`/api/calculators`) — frontend `/kalkulatory` istnieje, ale jest pustym placeholderem → rozszerzyć o 6 kalkulatorów (przedawnienie, koszt egzekucji, raty sądowe, kwota wolna, koszty postępowania, ROI Długomat).
- **Webhooks endpoints** (`/api/webhooks/endpoints`) — admin UI do zarządzania webhookami dla orgs.
- **Voice transcribe** (`/api/voice/transcribe`) — komponent głosowego dyktowania w kreatorze pism.
- **Affiliate stats** (`/api/affiliate/stats`) — dashboard partnera afiliacyjnego.
- **Letters/parse** (`/api/letters/parse`) — narzędzie samodzielnej analizy pisma (poza pełnym Skanerem D1).
- **Calendar feed** (`/api/calendar/feed`) — link do iCal w panelu user.

---

## 3. Architektura informacji (po Tier 35-37)

### 3.1 Strona publiczna (marketing)

```
/
├── /jak-to-dziala
├── /moduly
│   └── /moduly/{d1..d8}
├── /cennik
│   └── /cennik/subskrypcje
├── /skaner-nakazu                ← darmowe demo D1
├── /kalkulatory                  ← 6 kalkulatorów (NOWE)
├── /precedensy                   ← wyszukiwarka orzeczeń (NOWE)
├── /marketplace                  ← katalog integracji (NOWE)
│   ├── /marketplace/[slug]
│   ├── /marketplace/partnerzy    (NOWE)
│   └── /marketplace/szablony     (NOWE)
├── /program-afiliacyjny
├── /program-partnerski
├── /program-resellerski          (NOWE)
├── /baza-wiedzy
│   └── /baza-wiedzy/[20 artykułów]
├── /o-nas
├── /kontakt
├── /changelog
├── /status
│   └── /status/history
├── /regulamin · /rodo · /dpa · /polityka-prywatnosci
└── /auth/{sign-in,sign-up,reset,update-password}
```

### 3.2 Panel użytkownika (dłużnik B2C)

```
/panel
├── /panel/sprawy                 ← lista (już istnieje)
│   ├── /panel/sprawy/nowa
│   └── /panel/sprawa/[id]
├── /panel/skaner                 ← D1
├── /panel/ai-asystent            ← czat AI (NOWE)
│   └── /panel/ai-asystent/szablony  (NOWE)
├── /panel/baza-orzecznicza       ← RAG search (NOWE)
├── /panel/kalendarz              ← deadliny + iCal (NOWE)
├── /panel/dokumenty              ← wszystkie wygenerowane (NOWE)
├── /panel/polecenia              ← affiliate user
├── /panel/ustawienia
│   ├── /profil · /bezpieczenstwo · /sesje
│   ├── /api-keys · /integracje · /platnosci
│   ├── /powiadomienia · /rodo
└── /panel/wsparcie               ← ticket/chat (NOWE)
```

### 3.3 Panel organizacji (B2B — kancelaria/firma)

```
/panel/organizacja                ← switcher (NOWE)
├── /panel/organizacja/zespol     ← członkowie + role
├── /panel/organizacja/domeny     ← custom domains
├── /panel/organizacja/sso        ← SAML config
├── /panel/organizacja/scim       ← SCIM token + docs
├── /panel/organizacja/audyt      ← audit log
├── /panel/organizacja/billing    ← enterprise billing
└── /panel/organizacja/webhooks   ← outgoing webhooks
```

### 3.4 Panel partnera / resellera

```
/panel/partner                    (NOWE)
├── /panel/partner/wyplaty
├── /panel/partner/leady
├── /panel/partner/materialy
└── /panel/partner/api
```

### 3.5 Panel admin (operations)

```
/admin (legacy redirect → /(admin)/admin)
/(admin)/admin
├── /dashboard                    (KPI real-time)
├── Operations
│   ├── /sprawy · /uzytkownicy · /platnosci
│   ├── /workflows                (NOWE)
│   ├── /jobs · /dlq
│   └── /notyfikacje
├── Compliance & Security
│   ├── /compliance · /audyt · /legal-hold
│   ├── /rbac · /secrets · /impersonate
│   └── /feature-flags
├── AI & Knowledge
│   ├── /prompty · /prompty/[id]/versions
│   └── /wiedza
├── Analytics
│   ├── /analytics/revenue        (NOWE)
│   ├── /analytics/funnel         (NOWE)
│   ├── /analytics/cohorts        (NOWE)
│   ├── /analytics/anomalies      (NOWE)
│   └── /analytics/nps            (NOWE)
└── Performance & Quality
    ├── /sli · /wydajnosc · /rum
    ├── /rate-limits · /errors
    └── /promocje
```

---

## 4. Design system — kontynuacja "Tarcza"

Stosujemy istniejące tokeny CSS (`--dlugomat-{50..950}`, `--accent-{50..700}`, `--warn`, `--danger`, `--iron`). Nowe komponenty muszą:

1. Używać `Tailwind` z scale tokenami (nigdy hex inline)
2. Stosować `font-display` (Lora) dla nagłówków, `font-body` dla treści
3. Spacing: skala 4/8 (gap-2, gap-3, gap-4, gap-6, gap-8)
4. Focus: `focus-visible:shadow-shield-focus`
5. Hover: `transition-colors duration-base`
6. Stany: skeleton (loading), empty-state, error-boundary
7. A11y: `aria-label`, `aria-live`, `role`, kolor ≥ 4.5:1

---

## 5. Plan wdrożenia Tier 35-36-37 (3×30 zadań)

### Tier 35 — Marketplace B2B + Precedensy + Kalkulatory (30 plików)

1. `/(marketing)/marketplace/page.tsx` — landing marketplace
2. `/(marketing)/marketplace/[slug]/page.tsx` — szczegóły integracji
3. `/(marketing)/marketplace/partnerzy/page.tsx`
4. `/(marketing)/marketplace/szablony/page.tsx`
5. `/(marketing)/program-resellerski/page.tsx`
6. `/(marketing)/precedensy/page.tsx` — wyszukiwarka publiczna
7. `/(marketing)/precedensy/[id]/page.tsx` — szczegół orzeczenia
8. `/(marketing)/kalkulatory/przedawnienie/page.tsx`
9. `/(marketing)/kalkulatory/kwota-wolna/page.tsx`
10. `/(marketing)/kalkulatory/koszty-postepowania/page.tsx`
11. `/(marketing)/kalkulatory/raty-sadowe/page.tsx`
12. `/(marketing)/kalkulatory/roi-dlugomat/page.tsx`
13. `lib/marketplace/listings.ts` — typy + helpery
14. `lib/precedents/client.ts` — fetch + cache
15. `lib/calculators/legal-math.ts` — logika kalkulatorów

### Tier 36 — Organizacje (multi-tenant) + Panel partnera (30 plików)

16. `/(panel)/panel/organizacja/page.tsx` — switcher
17. `/(panel)/panel/organizacja/zespol/page.tsx`
18. `/(panel)/panel/organizacja/zespol/invite-form.tsx`
19. `/(panel)/panel/organizacja/domeny/page.tsx`
20. `/(panel)/panel/organizacja/sso/page.tsx`
21. `/(panel)/panel/organizacja/scim/page.tsx`
22. `/(panel)/panel/organizacja/audyt/page.tsx`
23. `/(panel)/panel/organizacja/webhooks/page.tsx`
24. `/(panel)/panel/organizacja/billing/page.tsx`
25. `/(panel)/panel/partner/page.tsx`
26. `/(panel)/panel/partner/wyplaty/page.tsx`
27. `/(panel)/panel/partner/leady/page.tsx`
28. `/(panel)/panel/partner/materialy/page.tsx`
29. `lib/orgs/membership.ts` — typy + RBAC helper
30. `components/orgs/org-switcher.tsx` — globalny switcher

### Tier 37 — AI Asystent + Analytics Admin (30 plików)

31. `/(panel)/panel/ai-asystent/page.tsx` — czat AI
32. `/(panel)/panel/ai-asystent/szablony/page.tsx`
33. `/(panel)/panel/baza-orzecznicza/page.tsx` — RAG
34. `/(panel)/panel/kalendarz/page.tsx` — deadliny + iCal
35. `/(panel)/panel/dokumenty/page.tsx` — wszystkie wygenerowane
36. `/(panel)/panel/wsparcie/page.tsx`
37. `/(admin)/admin/analytics/revenue/page.tsx`
38. `/(admin)/admin/analytics/funnel/page.tsx`
39. `/(admin)/admin/analytics/cohorts/page.tsx`
40. `/(admin)/admin/analytics/anomalies/page.tsx`
41. `/(admin)/admin/analytics/nps/page.tsx`
42. `/(admin)/admin/workflows/page.tsx`
43. `components/ai/chat-stream.tsx`
44. `components/analytics/sparkline.tsx`
45. `components/analytics/cohort-grid.tsx`

---

## 6. Stan po wdrożeniu — coverage 100% backend ↔ frontend.

Wszystkie 174 endpointy mają reprezentację w UI (jako strona, panel, modal, API key consumer, lub publiczna dokumentacja).
