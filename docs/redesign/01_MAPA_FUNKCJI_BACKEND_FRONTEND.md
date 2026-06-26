# 01 — Mapa funkcji: Back-end ↔ Front-end

> **Cel:** dla każdego obszaru backendu (195 route handlerów + moduły `lib/`) określić: **co robi**, **kto go woła z front-endu**, **w jakim panelu/ekranie**, **dla jakiej roli**. To kontrakt, na którym opiera się landing (`03`) i panele (`04`).
> **Zasada:** żadna sekcja UI w redesignie nie może istnieć bez endpointu z tej mapy. Żaden endpoint klasy „flagowej" nie może być niewidoczny w UI.

---

## 0. Legenda ról i powierzchni

**Role** (z modelu danych / RLS):
- `anon` — niezalogowany (marketing, darmowy skan)
- `user` — zalogowany dłużnik prywatny
- `org:firma` / `org:kancelaria` / `org:partner` — warianty B2B (przez przynależność do organizacji)
- `admin` — operator platformy

**Powierzchnie:**
- `LP` — landing/marketing (`app/(marketing)`)
- `PANEL` — panel użytkownika (`app/(panel)/panel`)
- `ADMIN` — panel admina (`app/(admin)/admin`)
- `AUTH` — flow uwierzytelniania

---

## 1. Rdzeń produktu — ścieżka „od nakazu do pisma"

To jest **główna pętla wartości**. Musi być widoczna na landingu i być centralną osią panelu.

| Krok | Endpoint / lib | Co robi | Powierzchnia | Rola |
|---|---|---|---|---|
| 1. Skan | `lib/ai/ocr/document-ocr.ts`, `api/ai/ocr`, `api/letters/parse` | OCR dokumentu (Tesseract→cloud), ekstrakcja encji (sygnatura, kwota, wierzyciel, terminy) | `LP /skaner-nakazu`, `PANEL /skaner` | `anon`, `user` |
| 2. Analiza | `api/ai/irac`, `lib/ai/win-probability.ts`, `api/cases/[id]/win-probability` | Analiza IRAC, ocena przedawnienia, prawdopodobieństwo wygranej | `PANEL /sprawy/[id]`, hero `LP` | `user` |
| 3. „Wirtualny sędzia" | `api/cases/[id]/virtual-judge`, `lib/ai/virtual-judge.ts` | Symulacja oceny sądu — argumenty za/przeciw | `PANEL /sprawy/[id]` | `user` |
| 4. Wizard | `api/wizard/save`, `api/wizard/suggestions`, `lib/wizard/*` | Kreator zbierania danych do pisma (branch-engine, smart-defaults, autosave) | `PANEL /moje-zadluzenie/kreator`, `/sprawy/nowa` | `user` |
| 5. Generacja | `api/ai/generate`, `lib/ai/generation-pipeline.ts`, `generation-v2.ts` | Generacja pisma (Sonnet) + walidacja (Haiku) + eskalacja (Opus) | `PANEL /sprawy/[id]/dokument` | `user` |
| 6. Weryfikacja | `lib/ai/citation-verifier.ts`, `hallucination-guard.ts`, `reasoning/citation-validator.ts` | Weryfikacja cytatów prawnych, anty-halucynacja | (w tle generacji) | system |
| 7. Rewizja | `api/documents/[id]/revise`, `lib/ai/multi-turn-revision.ts` | Iteracyjna poprawa pisma w dialogu | `PANEL /sprawy/[id]/dokument` | `user` |
| 8. Wersjonowanie | `api/documents/[id]/versions`, `restore`, `restore/[versionId]` | Historia wersji + przywracanie | `PANEL /dokumenty/[id]` | `user` |
| 9. Płatność | `api/stripe/checkout`, `api/billing/subscribe`, `api/invoices` | Odblokowanie pisma / subskrypcja + faktura VAT | `PANEL /sprawa/[id]/platnosc`, `/cennik` | `user` |
| 10. Eksport / e-Sąd | `api/court/epuap`, `epuap/sign`, `api/court/krs`, print routes | Podpis ePUAP, wysyłka do e-Sądu, druk | `PANEL /sprawa/[id]/dokument/[docId]/{print,podglad}` | `user` |

> **Implikacja dla landingu (`03`):** sekcja „Jak to działa" musi pokazać kroki 1→5→10, a sekcja wyróżników — kroki 2,3,6 (to przewaga nad konkurencją).

---

## 2. AI Engine — pełna mapa

| Endpoint | Lib | Funkcja | Konsument UI |
|---|---|---|---|
| `api/ai/generate` | `generation-pipeline`, `generation-v2` | generacja pisma | `PANEL` dokument, hero showcase |
| `api/ai/answer` | `qa-knowledge`, `rag-retriever` | Q&A prawne na bazie wiedzy | `PANEL /ai-asystent`, `LP /baza-wiedzy` |
| `api/ai/irac` | `agents/legal-agent` | analiza IRAC | `PANEL /sprawy/[id]` |
| `api/ai/ocr` | `ocr/document-ocr`, `letter-ocr` | OCR + ekstrakcja | `/skaner`, `/skaner-nakazu` |
| `api/ai/rag/search` + `rag/ingest` | `rag/retriever`, `rag/vector-store`, `embeddings` | wyszukiwanie semantyczne (pgvector) | `PANEL /baza-orzecznicza/szukaj`, `LP /precedensy` |
| `api/ai/agent/run` + `agent/[id]/stream` | `agents/legal-agent` | agent wieloetapowy (streaming) | `PANEL /ai-asystent` |
| `api/ai/evaluate` | `quality/evaluation-harness` | ocena jakości pisma | `ADMIN /prompts`, w tle |
| `api/ai/templates` | `prompt-templates`, `prompt-loader` | szablony promptów | `PANEL /ai-asystent/szablony`, `ADMIN /prompts` |
| `api/ai/usage` | `usage-tracker`, `token-tracker` | zużycie tokenów/limity | `PANEL /finanse`, `ADMIN /metrics` |

**Wyróżniki (flagowe, niedoeksponowane):** `virtual-judge`, `win-probability`, `citation-verifier`, `hallucination-guard`, `reasoning/chain-of-thought`. → muszą trafić do landingu (`03 §Wyróżniki`).

---

## 3. Sprawy i dokumenty

| Endpoint | Funkcja | UI | Rola |
|---|---|---|---|
| `api/cases` (+ `lib/cases/case-repository`, `case-actions`) | CRUD spraw | `PANEL /sprawy`, `/sprawy/nowa` | `user` |
| `api/cases/[id]` | szczegóły sprawy | `PANEL /sprawy/[id]`, `/sprawa/[id]` | `user` |
| `api/cases/[id]/status` | zmiana statusu (enum) | `PANEL /sprawy/[id]` | `user` |
| `api/cases/[id]/timeline` (+ `lib/cases/timeline`) | oś czasu sprawy | `PANEL /sprawy/[id]/chronologia`, `/sprawa/[id]/timeline` | `user` |
| `api/cases/[id]/evidence` | dowody/załączniki | `PANEL /sprawy/[id]/dokumenty` | `user` |
| `api/documents` + `[id]` | CRUD dokumentów | `PANEL /dokumenty/*` | `user` |
| `api/documents/[id]/{versions,revise,restore}` | wersje, rewizja, restore | `PANEL /dokumenty/[id]` | `user` |
| `api/deadlines` + `deadlines/due` | terminy procesowe | `PANEL /kalendarz` + Edge Fn `deadline-cron` | `user` |
| `api/calendar/{feed,ics-export,token}` | feed/ICS kalendarza | `PANEL /kalendarz/*`, ustawienia integracji | `user` |

> **Duplikat do rozstrzygnięcia (`04`):** `/panel/sprawa` (l.poj.) vs `/panel/sprawy` (l.mn.); `/panel/moje-pisma` vs `/panel/dokumenty`.

---

## 4. Płatności i rozliczenia

| Endpoint | Lib | Funkcja | UI |
|---|---|---|---|
| `api/billing/plans` | `payments/pricing` | lista planów | `LP /cennik`, `/cennik/subskrypcje`, `PANEL /finanse` |
| `api/billing/{subscribe,change-plan,portal,usage}` | `subscription/subscription-lifecycle` | cykl subskrypcji | `PANEL /finanse`, `/ustawienia/platnosci` |
| `api/stripe/checkout` + `stripe/webhook` | `stripe-client`, `stripe-tax-eu` | checkout + webhook + VAT EU | `PANEL /sprawa/[id]/platnosc/*`, `/cennik` |
| `api/invoices` + `[id]` | `fakturownia/client`, `vat-pl/invoice-builder` | faktury VAT PL | `PANEL /firma/faktury`, `/organizacja/billing` |
| `api/coupons/validate` | `promo-codes` | walidacja kuponów | `/cennik`, checkout |
| `api/payments/subscription` | `payment-actions` | stan subskrypcji | `PANEL /finanse` |
| `api/referrals/code`, `api/affiliate/*` | `referrals`, `affiliate` | polecenia/afiliacja | `PANEL /polecenia/*`, `LP /program-afiliacyjny` |

---

## 5. B2B — organizacje, multi-tenant, marketplace

| Endpoint | Funkcja | UI | Rola |
|---|---|---|---|
| `api/orgs/mine`, `current`, `switch` | przełączanie organizacji | `PANEL` org switcher | `org:*` |
| `api/orgs/[orgId]/members` | zarządzanie zespołem | `PANEL /organizacja/zespol`, `/firma/zespol`, `/kancelaria/zespol` | `org:*` admin |
| `api/orgs/[orgId]/sso` + `sso/saml` | SSO SAML | `PANEL /organizacja/sso` | `org:*` admin |
| `api/orgs/[orgId]/scim` + `scim/v2/Users` | provisioning SCIM | `PANEL /organizacja/scim` | `org:*` admin |
| `api/orgs/[orgId]/domains` | domeny org | `PANEL /organizacja/domeny` | `org:*` admin |
| `api/orgs/webhooks` | webhooki org | `PANEL /organizacja/webhooks` | `org:*` admin |
| `api/orgs/billing/*` | rozliczenia org | `PANEL /organizacja/billing` | `org:*` admin |
| `api/marketplace/{listings,templates,plugins,partners,payouts,reviews}` | marketplace szablonów/wtyczek | `LP /marketplace/*`, `PANEL /partner/*` | `anon`, `org:partner` |
| `api/integrations/*` (oauth, crm, accounting, calendar, esign, slack, sms, zapier, make, sdk) | integracje zewnętrzne | `PANEL /firma/integracje`, `/ustawienia/integracje` | `org:*` |

---

## 6. Admin — operacje platformy

| Endpoint | Funkcja | UI (`ADMIN`) |
|---|---|---|
| `api/admin/users` | zarządzanie użytkownikami | `/admin/dashboard` (+ legacy `uzytkownicy`) |
| `api/admin/impersonate` | impersonacja (audytowana) | `/admin/impersonate` |
| `api/admin/prompts` + `[id]/versions/*/promote` | wersjonowanie promptów + promocja | `/admin/prompts/[id]/versions` |
| `api/admin/rbac` + `rbac/policies` | role i polityki | `/admin/rbac/[role]` |
| `api/admin/feature-flags` | flagi funkcji | `/admin/feature-flags` |
| `api/admin/secrets` | sekrety/rotacja | `/admin/secrets` |
| `api/admin/{metrics,realtime-kpis}` | metryki, KPI live | `/admin/dashboard`, `/admin/rum` |
| `api/admin/audit-log` | dziennik audytu | `/admin/compliance`, `/admin/legal-hold` |
| `api/admin/{job-queue,data-export}` | kolejki, eksport | `/admin/workflows`, `/admin/errors` |
| `api/analytics/{funnel,cohorts,revenue,nps,anomalies}` | analityka biznesowa | `/admin/analytics/*` |
| `api/automation/workflows/*` | automatyzacje | `/admin/workflows` |
| `api/compliance/{ediscovery,reports}` | compliance/RODO | `/admin/compliance` |

---

## 7. Wiedza, kalkulatory, marketing-funkcje

| Endpoint | Funkcja | UI |
|---|---|---|
| `api/calculators` | kalkulatory (odsetki, przedawnienie, kwota wolna, koszty, raty, ROI) | `LP /kalkulatory/*` (6 narzędzi) |
| `api/precedents/search` | wyszukiwarka precedensów | `LP /precedensy`, `PANEL /baza-orzecznicza` |
| `api/cee/case-types` | typy spraw (CEE) | `LP /cee`, wizard |
| `api/changelog`, `api/status/incidents` | changelog + status | `LP /changelog`, `/status` |
| `api/leads/roi-b2b`, `api/email/leads` | leady B2B | `LP /roi-b2b`, `/kontakt/firmy` |
| `api/experiments/{assign,convert}` | A/B testy | całe `LP` (warstwa) |
| `api/og/[slug]` | dynamiczne OG images | meta wszystkich stron |

---

## 8. Bezpieczeństwo, RODO, konto

| Endpoint | Funkcja | UI |
|---|---|---|
| `api/security/mfa/{setup,verify,disable}` | MFA TOTP | `PANEL /ustawienia/bezpieczenstwo`, `/profil/bezpieczenstwo` |
| `api/security/webauthn/{register,authenticate}` | passkeys | `PANEL /ustawienia/bezpieczenstwo` |
| `api/security/sessions` | sesje | `PANEL /ustawienia/sesje/*` |
| `api/security/api-keys` | klucze API | `PANEL /ustawienia/api-keys`, `/organizacja/api-klucze` |
| `api/security/gdpr/{consent,export,delete}`, `api/gdpr/export-v2`, `api/rodo/export` | zgody, eksport, usunięcie | `PANEL /ustawienia/rodo`, `/organizacja/zgody-rodo`, `/eksport` |
| `api/auth/register`, `(auth)/*` | rejestracja/logowanie | `AUTH /sign-in`, `/sign-up`, `/reset` |
| `api/notifications/{dispatch,preferences}`, `api/push/*` | powiadomienia + push | `PANEL /ustawienia/powiadomienia`, Edge Fn `push-fanout` |
| `api/support/tickets` | zgłoszenia wsparcia | `PANEL /wsparcie/zgloszenia/*` |

---

## 9. Matryca pokrycia ról × powierzchnia (synteza)

| Domena | `anon` LP | `user` PANEL | `org:*` PANEL | `admin` ADMIN |
|---|:--:|:--:|:--:|:--:|
| Skan/OCR | ✅ darmowy | ✅ | ✅ | — |
| Generacja pism | demo | ✅ | ✅ | szablony |
| Wyróżniki AI (judge/win) | teaser | ✅ | ✅ | ewaluacja |
| Sprawy/dokumenty | — | ✅ | ✅ (zespół) | wgląd |
| Płatności | cennik | ✅ | ✅ (org billing) | revenue |
| Organizacje/SSO/SCIM | dla-firm | — | ✅ | — |
| Marketplace | ✅ | — | ✅ (partner) | moderacja |
| Analityka | — | — | raporty org | ✅ |
| Bezpieczeństwo/RODO | polityki | ✅ | ✅ | compliance |

**Wniosek:** nawigacja paneli MUSI być warunkowana rolą i przynależnością do org (`04 §Nawigacja warunkowa`). Dziś nie jest — to problem PN-2 z audytu `00`.

---

## 10. Reguły wiążące dla redesignu

1. **Landing pokrywa kolumnę `anon`** z matrycy §9 + teasery flagowych funkcji AI.
2. **Panel user pokrywa kolumny `user` + `org:*`** z warunkowaniem nawigacji.
3. **Panel admin pokrywa kolumnę `admin`** + przejmuje unikatowe widoki z `_legacy/admin-pl`.
4. **Każdy nowy ekran cytuje endpoint** z tej mapy w komentarzu nagłówkowym pliku.
5. **Endpointy flagowe** (`virtual-judge`, `win-probability`, `citation-verifier`) mają gwarantowaną widoczność: landing (teaser) + panel (pełne).
