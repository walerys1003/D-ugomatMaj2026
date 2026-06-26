# 04 — Panele wzorcowe: użytkownik + admin

> **Cel:** jeden wzorzec shellowy dla obu paneli (różnica = treść nawigacji, nie chrome), nawigacja **warunkowana rolą i planem**, deduplikacja route'ów, gęstość „operations console".
> **Zakres ról (potwierdzony z `00`/`01`):** `user` (warianty `org:firma` / `org:kancelaria` / `org:partner` przez przynależność do organizacji) + `admin`. **Panelu kandydata NIE MA i nie tworzymy.**
> **Punkt wyjścia:** `components/layout/app-shell.tsx` (panel user) + `app/(admin)/layout.tsx` (admin „Stoic").

---

## 0. Diagnoza (z `00 §8`)

| ID | Problem | Rozwiązanie tu |
|---|---|---|
| PN-1 | martwa nawigacja (sekcje UI-nieosiągalne) | jedna kompletna mapa IA §3/§4 |
| PN-2 | brak warunkowania nawigacji rolą/planem | `§5 Nawigacja warunkowa` |
| PN-3 | duplikaty `sprawa/sprawy`, `moje-pisma/dokumenty`, `dashboard-v2` | `§6 Deduplikacja` |
| PN-4 | shell user ≠ shell admin (dwa wzorce) | `§2 Wspólny fundament shell` |
| PN-5 | (potwierdzenie) brak kandydata — OK | bez działań |

---

## 1. Zasada nadrzędna: jeden shell, dwie konfiguracje

Oba panele dzielą **ten sam fundament** (`AppShell` zunifikowany, `02 §5.2`):

```
┌──────────────────────────────────────────────────────────┐
│ TOPBAR (h-56px): logo · [org switcher] · search ⌘K · bell · avatar │
├────────────┬─────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT                                       │
│ (256px)    │  ┌─ PageHeader: tytuł · breadcrumb · akcje ─┐ │
│ grupy nav  │  │  …treść strony…                          │ │
│ warunkowe  │  └──────────────────────────────────────────┘ │
│ wg roli    │                                               │
└────────────┴─────────────────────────────────────────────┘
```

Różnice user vs admin = **wyłącznie**: zawartość `NAV_GROUPS`, kolor akcentu chrome (admin = ciemniejszy navy „operations"), obecność org-switchera (tylko user/B2B).

---

## 2. Wspólny fundament shell (kontrakt komponentu)

`<AppShell variant="user" | "admin" role={...} plan={...} org={...}>`

| Element | User | Admin |
|---|---|---|
| Topbar height | `header` (56px) | `header` (56px) |
| Sidebar width | `sidebar` (256px), collapsible | 256px, collapsible |
| Org switcher | ✅ (gdy `org:*`) | ❌ |
| Search ⌘K | ✅ (sprawy, dokumenty) | ✅ (users, prompts, flags) |
| Density | komfort | gęsta (text-[13px], h-8 nav) |
| Tła | `bg-background` / `ink-50` | `ink-50` (true neutral) |
| Akcent | `dlugomat-700` | `dlugomat-800` (głębszy) |

A11y i tokeny: identyczne (`02 §8`). Brak osobnych „dwóch designów".

---

## 3. Panel UŻYTKOWNIKA — informacja (IA)

Konsoliduje 100 route'ów do **kanonicznych sekcji**, warunkowanych rolą. Grupy:

### Grupa PRACA (zawsze)
| Pozycja | Route | Endpoint (`01`) |
|---|---|---|
| Pulpit | `/panel` | `api/dashboard` |
| Sprawy | `/panel/sprawy` (kanon) | `api/cases` |
| Dokumenty | `/panel/dokumenty` (kanon) | `api/documents` |
| Asystent AI `AI` | `/panel/ai-asystent` | `api/ai/agent/run`, `answer` |
| Skaner nakazu | `/panel/skaner` | `api/ai/ocr` |
| Kalendarz | `/panel/kalendarz` | `api/deadlines`, `calendar` |
| Notatki | `/panel/notatki` | — |
| Ulubione | `/panel/ulubione` | — |

### Grupa FINANSE (zawsze)
| Moje zadłużenie | `/panel/moje-zadluzenie` | wizard |
| Plan spłaty | `/panel/plan-splaty` | — |
| Subskrypcja | `/panel/finanse` | `api/billing/*` |
| Eksport danych | `/panel/eksport` | `api/gdpr/export-v2` |

### Grupa KONTEKST (warunkowa)
| Pozycja | Route | Warunek widoczności |
|---|---|---|
| Baza orzecznicza | `/panel/baza-orzecznicza` | zawsze |
| Firma | `/panel/firma` | `org:firma` |
| Kancelaria | `/panel/kancelaria` | `org:kancelaria` |
| Partner | `/panel/partner` | `org:partner` |
| Organizacja | `/panel/organizacja` | dowolny `org:*` (admin org) |
| Polecenia | `/panel/polecenia` | zawsze |

### Grupa KONTO (zawsze)
| Profil | `/panel/profil` |
| Ustawienia | `/panel/ustawienia` |
| Wiadomości | `/panel/wiadomosci` |
| Wsparcie | `/panel/wsparcie` |
| Aktywność | `/panel/aktywnosc` |

> **Sedno PN-2:** dziś `Firma`, `Kancelaria`, `Partner` są w nav równolegle dla wszystkich. Po redesignie pokazują się **tylko** właścicielowi danej roli org. Dłużnik prywatny widzi czysty, krótki panel.

---

## 4. Panel ADMIN — informacja (IA)

Kanon `(admin)/admin` (18 widoków) + absorpcja unikatów z `_legacy/admin-pl` (68). Grupy:

### OPERATIONS
| Dashboard | `/admin/dashboard` | `api/admin/metrics`, `realtime-kpis` |
| RUM | `/admin/rum` | `api/quality/*` |
| Błędy | `/admin/errors` | `api/observability/error` |
| Analytics | `/admin/analytics/{funnel,cohorts,revenue,nps,anomalies}` | `api/analytics/*` |

### AI / WORKFLOWS
| Prompty + wersje | `/admin/prompts/[id]/versions` | `api/admin/prompts/*` |
| Workflows | `/admin/workflows` | `api/automation/workflows/*` |

### GOVERNANCE
| RBAC | `/admin/rbac/[role]` | `api/admin/rbac` |
| Feature flags | `/admin/feature-flags` | `api/admin/feature-flags` |
| Secrets | `/admin/secrets` | `api/admin/secrets` |
| Rate limits | `/admin/rate-limits` | `api/admin/*` |
| Impersonacja | `/admin/impersonate` | `api/admin/impersonate` |

### COMPLIANCE
| Compliance | `/admin/compliance` | `api/compliance/*` |
| Legal hold | `/admin/legal-hold` | `api/admin/audit-log` |

> **Do migracji z legacy** (unikaty bez odpowiednika w kanonie): `uzytkownicy/*` (zarządzanie userami — krytyczne), `platnosci/raport`, `kampanie`, `notyfikacje/szablony`, `slowniki`, `import-komorniczy`. Przenieść do `(admin)` w odpowiednie grupy, resztę `_legacy` usunąć (`05`).

---

## 5. Nawigacja warunkowa (kontrakt)

```ts
// pseudo-kontrakt NAV (rozszerza NavItem z app-shell.tsx)
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  pill?: "AI" | "PRO" | "BETA";
  // NOWE — warunkowanie
  requires?: {
    role?: ("user" | "admin")[];
    org?: ("firma" | "kancelaria" | "partner")[];
    plan?: ("free" | "pro" | "biznes" | "enterprise")[];
    flag?: string;            // feature-flag z api/admin/feature-flags
  };
}
```

Reguły:
1. Pozycja renderuje się tylko, gdy **wszystkie** warunki `requires` spełnione.
2. Pozycja `PRO` widoczna dla `free`, ale z kłódką + link do `/cennik` (upsell, nie ukrywanie).
3. Feature-flag `flag` czytany z kontekstu (SSR), nie z klienta — spójne z `api/admin/feature-flags`.
4. Org-switcher zmienia kontekst `org` → re-render nav (sekcja KONTEKST).

---

## 6. Deduplikacja route'ów (PN-3)

| Zostaje (kanon) | Redirect 308 z | Powód |
|---|---|---|
| `/panel/sprawy` | `/panel/sprawa` (l.poj.) | liczba mnoga = lista; szczegół = `/sprawy/[id]` |
| `/panel/dokumenty` | `/panel/moje-pisma` | jedna nazwa na repozytorium pism |
| `/panel/dashboard` (`/panel`) | `/panel/dashboard-v2` | jeden pulpit |
| `/panel/ustawienia/*` | duplikaty z `/panel/profil/*` (bezpieczeństwo) | jedno miejsce ustawień; profil = dane, ustawienia = konfiguracja |

> Redirecty przez `next.config.mjs` lub route-level `redirect()`. Stare URL-e nie mogą zwracać 404 (SEO + zakładki userów).

---

## 7. Wzorcowy układ strony panelu (template)

Każda strona panelu używa tego samego rusztowania:

```
PageHeader
  ├─ Breadcrumb (Pulpit / Sprawy / Nc-e 1234567)
  ├─ Tytuł (Heading level=1) + status badge
  └─ Akcje (primary + overflow menu)
Content
  ├─ [opcjonalnie] StatCard row (KpiCard ×3–4)
  ├─ [opcjonalnie] Tabs / filtry
  └─ DataTable | Timeline | Form | DocumentArtifact
EmptyState — gdy brak danych (zawsze z CTA, nigdy goła strona)
```

Wzorcowe komponenty z `02 §5.2`: `KpiCard`, `DataTable`, `Timeline`, `ReasoningTrace`, `DocumentArtifact`, `EmptyState`, `PageHeader`, `RoleBadge`/`PlanBadge`.

---

## 8. Strona referencyjna: `/panel/sprawy/[id]` (wzorzec pełnej wartości)

Pokazuje, jak panel eksponuje flagowe funkcje AI (`01 §1-2`):

| Strefa | Komponent | Endpoint |
|---|---|---|
| Header | `PageHeader` + status + termin (warn jeśli <7 dni) | `cases/[id]`, `deadlines` |
| KPI | `KpiCard`: szansa wygranej · kwota · dni do terminu | `win-probability` |
| Tab „Analiza" | `ReasoningTrace` (IRAC) + „Wirtualny sędzia" | `ai/irac`, `virtual-judge` |
| Tab „Pismo" | `DocumentArtifact` + akcje (generuj/rewizja/wersje) | `ai/generate`, `documents/[id]/*` |
| Tab „Oś czasu" | `Timeline` | `cases/[id]/timeline` |
| Tab „Dowody" | `DataTable` + upload | `cases/[id]/evidence` |
| Pasek płatności | sticky CTA „Odblokuj pismo" | `stripe/checkout` |

To jest **wzorzec premium** — replikowany dla pozostałych typów spraw (D1–D8).

---

## 9. Definicja „done" dla panelu (akceptacja)

- [ ] używa zunifikowanego `AppShell` (`variant`), nie własnego layoutu;
- [ ] nawigacja warunkowana `requires` (rola/org/plan/flag);
- [ ] tokeny kanoniczne (`02 §8`), zero `iron-*`/v5;
- [ ] każda strona ma `PageHeader` + `EmptyState`;
- [ ] flagowe funkcje AI widoczne na `/panel/sprawy/[id]`;
- [ ] zero duplikatów route (redirecty 308 ustawione);
- [ ] RLS respektowane (dane tylko właściciela/org).

---

## 10. Link do realizacji

Kolejność wdrożenia (shell → nav warunkowa → deduplikacja → migracja legacy admin → strona referencyjna): **`05_ROADMAPA_IMPLEMENTACJI.md`**.
