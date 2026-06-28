# 00 — Audyt krytyczny Długomat (redesign baseline)

> **Data:** 2026-06-26 · **Branch:** `genspark_ai_developer`
> **Charakter:** audyt na żywo z kodu (nie hipotezy). Każda teza ma kotwicę w pliku/route/migracji.
> **Poprzednie audyty:** `docs/AUDIT_FULL_2026-05.md`, `docs/AUDIT_BACKEND_TO_FRONTEND.md` — ten dokument je **aktualizuje** i przesuwa fokus z „uzupełniania luk" na **ujednolicenie wizualne i informacyjne** (single source of truth dla landing + paneli).
> **Seria redesign:** `00` (ten) → `01` mapa funkcji → `02` design system → `03` landing → `04` panele → `05` roadmapa.

---

## 0. TL;DR dla decydenta

Długomat to **dojrzała, w pełni zaimplementowana** platforma legal-tech (B2C dłużnicy + B2B kancelarie/windykacja/partnerzy). Backend pokrywa cały cykl: skan nakazu → OCR → analiza AI → generacja pisma → płatność → e-Sąd → obserwowalność. **Problem nie leży w brakach funkcjonalnych — leży w spójności prezentacji.**

Trzy generacje UI współistnieją w repo jednocześnie (`_legacy/admin-pl`, `(admin)/admin`, `v5/`), design system jest **dwutorowy** (`iron-*` deprecated ↔ `ink-*` nowy + osobny `v5/tokens.css`), a landing nie eksponuje realnej potęgi backendu. **Nie ma panelu kandydata** — istnieją wyłącznie panel **użytkownika** (`/panel`) i **admina** (`/admin`); to jest stan docelowy, nie luka.

**Rekomendacja:** zamrozić jedną kanoniczną generację designu (Tarcza v4 „Stoic+", patrz `02`), zredukować trzy zestawy tokenów do jednego, przebudować landing wokół realnych wywołań backendu (patrz `03`), a panele user/admin sprowadzić do jednego wzorca shellowego (patrz `04`).

---

## 1. Identyfikacja produktu (z kodu)

| Parametr | Wartość | Kotwica |
|---|---|---|
| Produkt | Długomat — legal-tech SaaS dla polskich dłużników | `README.md`, `app/layout.tsx` (`title`) |
| Archetyp marki | „Tarcza" — autorytet + bezpieczeństwo, nigdy panika | `docs/spec/SPEC_BRAND.md`, `tailwind.config.ts` komentarze |
| Język | wyłącznie polski (UI + dokumenty) | route slugi `baza-wiedzy/*`, `moduly/*` |
| Frontend | Next.js 14 App Router + React 18 + TS 5.6 | `apps/web/package.json` |
| UI | Tailwind + shadcn/ui (Radix) + lucide-react + tokeny CSS-var | `tailwind.config.ts`, `components/ui/*` |
| Backend | Supabase (Postgres 15, RLS FORCE, pgvector, pgcrypto, Auth, Storage, Edge Fns) | `supabase/migrations/*`, `supabase/functions/*` |
| AI | Claude via APIPod.ai (router Sonnet/Haiku/Opus) | `lib/ai/apipod-client.ts`, `lib/ai/model-router.ts` |
| Płatności | Stripe + Fakturownia (VAT PL) | `lib/payments/stripe-client.ts`, `lib/payments/fakturownia/*` |
| OCR | Tesseract.js (przeglądarka) → fallback chmurowy | `lib/ai/ocr/document-ocr.ts`, `lib/ocr/*` |
| Hosting | Vercel (cron w `vercel.json`) | `vercel.json`, `app/api/cron/*` |

**Wniosek:** stack jest kompletny. Redesign = warstwa prezentacji + ujednolicenie, **nie** przepisywanie silnika.

---

## 2. Skala repozytorium (metryki na 2026-06-26)

| Obszar | Liczba | Polecenie weryfikujące |
|---|---:|---|
| Route'y marketing | **106** | `find "app/(marketing)" -name page.tsx \| wc -l` |
| Route'y panel (user) | **100** | `find "app/(panel)" -name page.tsx \| wc -l` |
| Route'y admin (nowy `(admin)`) | **18** | `find "app/(admin)" -name page.tsx \| wc -l` |
| Route'y legacy admin (`_legacy/admin-pl`) | **68** | `find "app/_legacy" -name page.tsx \| wc -l` |
| Route'y `v5/*` | **30** | `find "app/v5" -name page.tsx \| wc -l` |
| API route handlery | **195** | `find app/api -name route.ts \| wc -l` |
| Moduły `lib/*` | **73** | `ls -d lib/*/ \| wc -l` |
| UI primitives (`components/ui`) | **29** | `ls components/ui/*.tsx \| wc -l` |
| Komponenty `v5/*` | **18** | `find components/v5 -name '*.tsx' \| wc -l` |
| Migracje SQL | **49** | `ls supabase/migrations/*.sql \| wc -l` |

Łącznie **~322 strony/route'y front-end** w 5 współistniejących przestrzeniach. To jest sedno problemu: produkt rozrósł się szybciej niż jego warstwa spójności.

---

## 3. Architektura front-end — co istnieje

```
apps/web/app/
├── (marketing)/      106 stron — landing, cennik, moduły D1–D8, baza-wiedzy,
│                     kalkulatory, dla-firm/kancelarii/windykacji, lp/*, marketplace
├── (auth)/           sign-in, sign-up, reset, callback, update-password
├── (panel)/panel/    100 stron — PANEL UŻYTKOWNIKA (kanon): sprawy, dokumenty,
│                     ai-asystent, skaner, kalendarz, finanse, firma, kancelaria,
│                     partner, organizacja, ustawienia, wsparcie
├── (admin)/admin/     18 stron — PANEL ADMIN (kanon, „Stoic"): dashboard,
│                     analytics/*, prompts, rbac, feature-flags, secrets, workflows
├── _legacy/admin-pl/  68 stron — STARY admin (PL slugi) — DO USUNIĘCIA/migracji
├── v5/                30 stron — eksperymentalna generacja „Ultra Enterprise"
└── api/              195 route handlerów — pełny backend HTTP
```

### 3.1. Trzy generacje UI — diagnoza krytyczna

| Generacja | Lokalizacja | Status faktyczny | Decyzja |
|---|---|---|---|
| Legacy admin | `app/_legacy/admin-pl/*` (68) | martwy kod, PL slugi, niespójny z resztą | **USUNĄĆ** po przeniesieniu unikatowych widoków do `(admin)` |
| Admin kanon | `app/(admin)/admin/*` (18) | aktualny, „Stoic", `ink-*` tokeny | **KANON** — rozbudować o brakujące widoki z legacy |
| v5 | `app/v5/*` (30) + `components/v5/*` + `styles/v5/tokens.css` | równoległa generacja z własnymi tokenami `--v5-*` | **ROZSTRZYGNĄĆ** (patrz `02 §Decyzja v5`): albo promować jako v4-kanon, albo wygasić |

**To jest największe ryzyko spójności w projekcie.** Użytkownik wchodzący przez `/` (Tarcza v3) i przez `/v5` (Ultra Enterprise) widzi **dwa różne produkty**.

---

## 4. Architektura back-end — co wywołuje front (skrót; pełna mapa w `01`)

195 handlerów grupuje się w domeny. Najważniejsze z perspektywy redesignu:

| Domena API | Przykładowe endpointy | Konsument front |
|---|---|---|
| **Sprawy** | `api/cases`, `cases/[id]/{status,timeline,evidence,virtual-judge,win-probability}` | `/panel/sprawy/*`, hero landing |
| **AI** | `api/ai/{generate,answer,irac,ocr,rag/search,agent/run,evaluate,usage}` | `/panel/ai-asystent`, `/skaner-nakazu`, hero showcase |
| **Dokumenty** | `api/documents/[id]/{versions,revise,restore}` | `/panel/dokumenty/*`, `sprawa/[id]/dokument/*` |
| **Płatności** | `api/billing/*`, `api/stripe/{checkout,webhook}`, `api/invoices` | `/panel/finanse`, `/cennik`, `sprawa/[id]/platnosc` |
| **Wizard** | `api/wizard/{save,suggestions}` | `/panel/moje-zadluzenie/kreator`, `sprawy/nowa` |
| **Kalkulatory** | `api/calculators` | `/kalkulatory/*` (6 narzędzi marketing) |
| **Organizacje (B2B)** | `api/orgs/*` (SSO, SCIM, domeny, webhooks, billing) | `/panel/organizacja/*` |
| **Admin** | `api/admin/{users,prompts,rbac,feature-flags,secrets,metrics}` | `/admin/*` |
| **Analytics** | `api/analytics/{funnel,cohorts,revenue,nps,anomalies}` | `/admin/analytics/*` |
| **Marketplace** | `api/marketplace/*` | `/marketplace/*`, `/panel/partner/*` |

**Kluczowa obserwacja:** backend jest bogatszy niż to, co landing pokazuje. `virtual-judge`, `win-probability`, `irac`, `rag/search`, `citation-verifier` to **wyróżniki konkurencyjne**, których strona główna prawie nie eksponuje (patrz `03`).

---

## 5. Baza danych — stan

49 migracji, tiers 1–34. Cechy istotne dla redesignu:

- **RLS FORCE** na tabelach krytycznych (`wave6_force_rls_critical_tables`, `wave7_force_rls_batch2`) — każda funkcja front musi respektować politykę wierszową.
- **pgvector** dla RAG (`rag_match_function`) — zasila `ai/rag/search`.
- **pgcrypto** dla szyfrowania pól wrażliwych (`pgcrypto_encryption`).
- Multi-tenant (orgs, marketplace, tenants) — `tier13_enterprise_multitenant`, `tier15_marketplace_ecosystem`.
- Panel user/admin ma dedykowaną migrację `tier27_28_admin_user_panel`.

**Wniosek:** model danych wspiera wszystkie role potrzebne w panelach. **Brak tabeli/roli „kandydat"** — co potwierdza, że panel kandydata nie istnieje i nie jest potrzebny.

---

## 6. Design system — diagnoza krytyczna

System „Tarcza v3 Stoic" jest **przemyślany** (modularna skala typografii 1.25, 8pt grid, tinted shadows, motion tokens). Problemy są strukturalne, nie estetyczne:

| # | Problem | Dowód | Wpływ |
|---|---|---|---|
| DS-1 | **Dwie skale neutralne** `iron-*` (deprecated) i `ink-*` (nowa) współistnieją | `globals.css` komentarz: „2309 wystąpień iron, codemod odłożony" | Niespójny odcień neutralny; ryzyko, że nowe ekrany mają inny „cast" niż stare |
| DS-2 | **Trzeci zestaw tokenów** `--v5-*` w `styles/v5/tokens.css` importowany globalnie | `globals.css` `@import "./v5/tokens.css"` | Realnie dwa design systemy w jednej apce |
| DS-3 | **`iron` formalnie deprecated**, ale `--foreground`/`--border`/`--card-foreground` nadal mapują na `iron-*` | `globals.css` semantic tokens | „Deprecated" token jest sercem semantyki — sprzeczność |
| DS-4 | Legacy fontSize aliasy `fluid-*` żyją obok kanonicznych | `tailwind.config.ts` fontSize | Dwa sposoby zapisu tego samego rozmiaru |
| DS-5 | Brak jednego „brand asset" (logo/ikona tarczy) jako komponentu wektorowego — ryzyko ad-hoc emoji/ikon | `components/layout/logo.tsx` istnieje, ale brand mark do weryfikacji | Słabszy „wrażenie potęgi firmowej" |

Pełne rozstrzygnięcie i docelowy zestaw tokenów: **`02_DESIGN_SYSTEM_UNIFIED.md`**.

---

## 7. Landing page — diagnoza krytyczna

Obecny landing (`(marketing)/page.tsx`) ma sensowną kolejność (Hero → AIShowcase → HowItWorks → Modules → Trust → Pricing → FAQ → CTA) i dobry hero (`hero.tsx` v4 „Stoic", 2-panel composition). Braki względem ambicji „przełomowa, potęga firmowa":

| # | Problem | Wpływ |
|---|---|---|
| LP-1 | Wyróżniki AI (`virtual-judge`, `win-probability`, `irac`, citation-verifier) nie mają osobnej sekcji „dlaczego my" | Strona wygląda jak „kolejny generator pism", nie jak legal OS |
| LP-2 | Brak segmentacji odbiorcy nad foldem (dłużnik prywatny vs firma vs kancelaria vs windykacja) mimo że `lp/*` i `dla-*` istnieją | Słaby dopływ do ścieżek B2B, które mają najwyższy ARPU |
| LP-3 | Trust bar miesza press + KPI + compliance — brak „proof of authority" wysoko | Niższe zaufanie przed CTA |
| LP-4 | Brak interaktywnego/żywego dowodu działania AI nad foldem (statyczny mock) | Mniejsza konwersja „pokaż, nie mów" |
| LP-5 | CTA nie różnicuje intencji (darmowy skan vs demo B2B) konsekwentnie | Rozmyta ścieżka konwersji |

Pełna nowa struktura + copy: **`03_LANDING_PAGE_STRUKTURA_COPY.md`**.

---

## 8. Panele — diagnoza krytyczna

| # | Problem | Dowód | Dokument |
|---|---|---|---|
| PN-1 | Panel user ma 100 route'ów, ale shell (`app-shell.tsx`) komentuje, że część sekcji była „UI-nieosiągalna" (martwa nawigacja) | `app-shell.tsx` komentarz IA | `04` |
| PN-2 | Sekcje przeznaczeniowo różnych ról (user/firma/kancelaria/partner) są w jednym shellu bez warunkowania rolą | `NAV_GROUPS` w `app-shell.tsx` zawiera firma+kancelaria+partner równolegle | `04` |
| PN-3 | Duplikaty: `moje-pisma` vs `dokumenty`, `sprawa` vs `sprawy`, `dashboard-v2` | route tree | `04` |
| PN-4 | Admin shell („Stoic", 18 widoków) i panel user shell (Tarcza v2) to **dwa różne wzorce chrome** | `(admin)/layout.tsx` vs `app-shell.tsx` | `04` |
| PN-5 | **Brak panelu kandydata** — i słusznie. Role docelowe: `user` (+ warianty firma/kancelaria/partner przez org) i `admin` | brak route `(candidate)`/tabeli | potwierdzone |

Wzorcowy, jednolity model shellów (user + admin na wspólnym fundamencie): **`04_PANELE_WZORCOWE_USER_ADMIN.md`**.

---

## 9. Rejestr problemów (priorytety)

| ID | Obszar | Problem | Priorytet | Rozwiązanie w |
|---|---|---|---|---|
| A-1 | Architektura | 3 generacje UI współistnieją | 🔴 P0 | `02`, `05` |
| A-2 | Design | 3 zestawy tokenów (iron/ink/v5) | 🔴 P0 | `02` |
| A-3 | Design | `iron` deprecated, ale w semantyce | 🔴 P0 | `02` |
| A-4 | Landing | Brak ekspozycji wyróżników AI | 🟠 P1 | `03` |
| A-5 | Landing | Brak segmentacji B2C/B2B nad foldem | 🟠 P1 | `03` |
| A-6 | Panele | Shell user ≠ shell admin (dwa wzorce) | 🟠 P1 | `04` |
| A-7 | Panele | Brak warunkowania nawigacji rolą/planem | 🟠 P1 | `04` |
| A-8 | Panele | Duplikaty route'ów (pisma/dokumenty, sprawa/sprawy) | 🟡 P2 | `04`, `05` |
| A-9 | Architektura | Martwy `_legacy/admin-pl` (68 stron) | 🟡 P2 | `05` |
| A-10 | Design | Legacy `fluid-*` fontSize aliasy | 🟢 P3 | `02` |

---

## 10. Zasady redesignu (nienaruszalne)

1. **Nie rusza się backendu.** Redesign to warstwa prezentacji + IA. 195 endpointów zostaje.
2. **Jeden design system.** Po `02` istnieje dokładnie jeden zestaw tokenów semantycznych.
3. **Jeden wzorzec shell.** User i admin dzielą fundament (header, sidebar, density), różnią się treścią nawigacji.
4. **Landing eksponuje realne funkcje.** Każda sekcja landingu mapuje się na istniejący endpoint (`01`).
5. **Polski język, archetyp „Tarcza".** Autorytet, spokój, dowód — nigdy panika dłużnika.
6. **Brak panelu kandydata.** Role: `user` (warianty B2B przez org) + `admin`.
7. **RLS-first.** Każda funkcja front respektuje politykę wierszową bazy.

---

## 11. Następne dokumenty

- **`01_MAPA_FUNKCJI_BACKEND_FRONTEND.md`** — pełna mapa 195 endpointów → konsumenci front, role, panele.
- **`02_DESIGN_SYSTEM_UNIFIED.md`** — jeden zestaw tokenów, komponenty, rozstrzygnięcie v5.
- **`03_LANDING_PAGE_STRUKTURA_COPY.md`** — sekcje + copy „przełomowej" strony głównej.
- **`04_PANELE_WZORCOWE_USER_ADMIN.md`** — wzorcowy shell user + admin.
- **`05_ROADMAPA_IMPLEMENTACJI.md`** — kolejność prac, fale, definicje „done".
