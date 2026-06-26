# 05 — Roadmapa implementacji redesignu

> **Cel:** przełożyć dokumenty `00`–`04` na sekwencję wdrożeniową z jasnymi „definicjami done", tak by każda fala kończyła się **działającym, scalonym** stanem (nie wielkim big-bangiem).
> **Zasada:** redesign to warstwa prezentacji + IA. Backend (195 endpointów) nietknięty. Każdy krok ma zielony build i komplet redirectów (zero 404 na starych URL-ach).

---

## 0. Reguły procesu

1. **Małe, scalalne fale.** Każda fala = osobny PR do `main`, zielony CI, brak regresji wizualnych (Percy/Lighthouse już w repo).
2. **Tokeny najpierw.** Żaden nowy ekran nie powstaje przed konsolidacją tokenów (Fala 1).
3. **Redirecty zawsze.** Deduplikacja route'ów wymaga 308, nie usuwania.
4. **Feature-flag dla ryzyka.** Wygaszanie `v5/` i `_legacy/` za flagą + okno obserwacji.
5. **Każdy ekran cytuje endpoint** (`01`) w komentarzu nagłówkowym.

---

## 1. Fala 0 — Dokumentacja (TEN PR) ✅

| Zadanie | Plik | Status |
|---|---|---|
| Audyt krytyczny | `00_AUDYT_KRYTYCZNY.md` | ✅ |
| Mapa funkcji backend↔frontend | `01_MAPA_FUNKCJI_BACKEND_FRONTEND.md` | ✅ |
| Design system unified | `02_DESIGN_SYSTEM_UNIFIED.md` | ✅ |
| Landing struktura + copy | `03_LANDING_PAGE_STRUKTURA_COPY.md` | ✅ |
| Panele wzorcowe | `04_PANELE_WZORCOWE_USER_ADMIN.md` | ✅ |
| Roadmapa | `05_ROADMAPA_IMPLEMENTACJI.md` | ✅ (ten) |

**Done:** komplet 6 dokumentów w `docs/redesign/`, squash commit, PR do `main`.

---

## 2. Fala 1 — Fundament design systemu (P0)

Cel: jeden zestaw tokenów semantycznych. Po tej fali `iron-*` nie jest już sercem semantyki.

| # | Zadanie | Plik | Definicja done |
|---|---|---|---|
| 1.1 | Remap semantyki `--foreground/--border/--muted/--secondary/--card-foreground/--popover-foreground` z `iron-*` na `ink-*` | `styles/globals.css` | build zielony, brak różnicy wizualnej (wartości iron==ink) |
| 1.2 | Usunięcie globalnego `@import "./v5/tokens.css"`; absorpcja unikatowych wartości do kanonu | `styles/globals.css`, `styles/v5/tokens.css` | brak `--v5-*` w runtime poza komponentami v5 (które i tak wygaszamy) |
| 1.3 | Oznaczenie `fluid-*` fontSize jako deprecated (komentarz + lint warning) | `tailwind.config.ts` | nowy kod nie używa `fluid-*` |
| 1.4 | Weryfikacja brand mark (`logo.tsx`) — warianty pełny/znak/mono | `components/layout/logo.tsx` | 3 warianty renderują się, OG/favicon spójne |

**Ryzyko:** niskie — wartości `iron`==`ink` już zremapowane. To głównie zmiana wskazań CSS-var.

---

## 3. Fala 2 — Przełomowa landing page (P1) — **fundament dowodowy**

Cel: strona główna wg `03`, zbudowana **wyłącznie** na tokenach kanonicznych — jako referencyjny dowód, że jeden design system wystarcza.

| # | Zadanie | Plik | Done |
|---|---|---|---|
| 2.1 | `AudienceSwitch` (4 segmenty) | `components/landing/audience-switch.tsx` | linki do `lp/*`,`dla-*`; a11y; tokeny kanon |
| 2.2 | `AIEdge` (5 wyróżników) | `components/landing/ai-edge.tsx` | każdy cytuje endpoint z `01 §6` |
| 2.3 | `ComplianceBand` | `components/landing/compliance-band.tsx` | punkty z `03 §9` |
| 2.4 | `LiveScanDemo` (opcjonalnie z mockiem `ai/ocr`) | `components/landing/live-scan-demo.tsx` | działa bez logowania; CTA do konta |
| 2.5 | Refaktor `Hero` (artefakt `DocumentArtifact`) + `TrustStrip` | `hero.tsx`, `trust-bar.tsx` | KPI z disclosure |
| 2.6 | Złożenie nowej kolejności sekcji | `app/(marketing)/page.tsx` | kolejność z `03 §1` |

**Done fali:** landing renderuje 12 sekcji z `03`, Lighthouse ≥ próg z `lighthouserc.json`, zero `iron-*`/v5 w nowych plikach.

---

## 4. Fala 3 — Zunifikowany shell paneli (P1)

Cel: jeden `AppShell` dla user+admin (`04 §2`).

| # | Zadanie | Plik | Done |
|---|---|---|---|
| 3.1 | `AppShell` z `variant="user"\|"admin"` (merge logiki) | `components/layout/app-shell.tsx` | oba panele używają jednego shell |
| 3.2 | Nawigacja warunkowa (`requires` role/org/plan/flag) | `app-shell.tsx` | dłużnik prywatny nie widzi firma/kancelaria/partner |
| 3.3 | Podpięcie admin layout pod wspólny shell | `app/(admin)/layout.tsx` | admin = `variant="admin"` |
| 3.4 | Komponenty wzorcowe: `PageHeader`, `KpiCard`, `EmptyState` (jeśli brak) | `components/ui/*` | użyte na ≥1 stronie referencyjnej |

**Done:** oba panele dzielą chrome; nav reaguje na rolę/org; zielony build.

---

## 5. Fala 4 — Strona referencyjna `/panel/sprawy/[id]` (P1)

Cel: wzorzec premium eksponujący flagowe AI (`04 §8`).

| # | Zadanie | Plik | Done |
|---|---|---|---|
| 4.1 | `DataTable`, `Timeline`, `ReasoningTrace`, `DocumentArtifact` | `components/ui/*` lub `components/case/*` | reużywalne, tokeny kanon |
| 4.2 | Strona sprawy z tabami Analiza/Pismo/Oś/Dowody | `app/(panel)/panel/sprawy/[id]/page.tsx` | każdy tab cytuje endpoint |
| 4.3 | Sticky pasek płatności | tamże | `stripe/checkout` |

---

## 6. Fala 5 — Deduplikacja route'ów (P2)

Cel: usunąć duplikaty wg `04 §6` bez 404.

| # | Zadanie | Done |
|---|---|---|
| 5.1 | 308: `sprawa→sprawy`, `moje-pisma→dokumenty`, `dashboard-v2→panel` | stare URL-e przekierowują |
| 5.2 | Konsolidacja `profil/bezpieczenstwo` ↔ `ustawienia/bezpieczenstwo` | jedno miejsce |
| 5.3 | Redirecty w `next.config.mjs` | CI test redirectów |

---

## 7. Fala 6 — Migracja legacy admin → kanon (P2)

Cel: przenieść unikaty z `_legacy/admin-pl` (68) do `(admin)` i usunąć martwy kod.

| # | Zadanie | Done |
|---|---|---|
| 6.1 | Inwentaryzacja unikatów (`uzytkownicy`, `platnosci/raport`, `kampanie`, `notyfikacje/szablony`, `slowniki`, `import-komorniczy`) | lista 1:1 mapowań |
| 6.2 | Przeniesienie do grup `(admin)` z `04 §4` | widoki działają na nowym shellu |
| 6.3 | Usunięcie `_legacy/admin-pl` za flagą + okno obserwacji | brak ruchu → delete |

---

## 8. Fala 7 — Wygaszenie `v5/` + codemod `iron→ink` (P2/P3)

| # | Zadanie | Done |
|---|---|---|
| 7.1 | Absorpcja wartościowych wzorców z `components/v5/*` do kanonu | wzorce w `components/ui`/`case` |
| 7.2 | Redirect/usuń `app/v5/*` (30 route) za flagą | brak `/v5` w sitemap |
| 7.3 | Codemod sed `iron-*`→`ink-*` w JSX (~2309 wystąpień) | zero `iron-` poza aliasem kompat. |
| 7.4 | Usunięcie aliasów `fluid-*` i `iron` z `tailwind.config.ts` | config minimalny |

---

## 9. Harmonogram zależności

```
Fala 0 (docs) ──► Fala 1 (tokeny) ──┬─► Fala 2 (landing)
                                     └─► Fala 3 (shell) ──► Fala 4 (strona sprawy)
Fala 1 ──► Fala 5 (dedup) ──► Fala 6 (legacy admin) ──► Fala 7 (v5 + codemod)
```

Fale 2 i 3 mogą iść równolegle po Fali 1 (różne pliki). Fale 5–7 to porządkowanie — po ustabilizowaniu kanonu.

---

## 10. Globalna definicja „redesign done"

- [ ] Jeden zestaw tokenów semantycznych; `iron-*` tylko alias kompat., `v5/tokens.css` usunięty.
- [ ] Landing wg `03` (12 sekcji, wyróżniki AI widoczne).
- [ ] Jeden `AppShell` dla user+admin, nav warunkowana rolą/org/planem.
- [ ] `/panel/sprawy/[id]` jako wzorzec premium z flagowymi AI.
- [ ] Zero duplikatów route (308 ustawione), zero 404 na starych URL-ach.
- [ ] `_legacy/admin-pl` i `app/v5/*` wygaszone; unikaty zmigrowane.
- [ ] Każdy nowy/zmieniony ekran przechodzi checklistę `02 §8` i `04 §9`.
- [ ] CI zielony: testy, Lighthouse, Percy bez regresji.

---

## 11. Metryki sukcesu

| Metryka | Baseline | Cel |
|---|---|---|
| Generacje UI w repo | 3 (legacy/admin/v5) | 1 (kanon) |
| Zestawy tokenów | 3 (iron/ink/v5) | 1 |
| Wystąpienia `iron-*` w JSX | ~2309 | 0 (poza aliasem) |
| Sekcje landingu eksponujące flagowe AI | ~0 dedykowanych | ≥1 (`AIEdge`) + teasery |
| Nav warunkowana rolą | nie | tak |
| Duplikaty route | ≥4 | 0 |
| Martwe route (`_legacy`+`v5`) | 98 | 0 |
