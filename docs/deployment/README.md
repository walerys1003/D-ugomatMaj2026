# DEPLOY PRODUKCJA — CZYNNOŚCI DO WYKONANIA

> **Dokument główny (indeks) wdrożenia produkcyjnego Długomata.**
> Wersja: 1.0 · Data: 2026-06-26 · Status: do realizacji · Branch bazowy: `genspark_ai_developer`

---

## 0. Dla kogo jest ten dokument

Ten zestaw dokumentów jest napisany **dla nowego dewelopera**, który:

- **nie zna jeszcze** tego repozytorium,
- ma za zadanie **doprowadzić projekt do publikacji online** (produkcja),
- musi to zrobić **krok po kroku**, z odwołaniami do konkretnych plików i linii kodu.

Każdy ETAP jest osobnym plikiem. Możesz je czytać po kolei (zalecane) lub skakać do
konkretnego etapu, jeśli wiesz, czego szukasz. **Nie pomijaj ETAPU 0** — bez niego
projekt się nawet nie zbuduje.

> ⚠️ **Najważniejsza zasada bezpieczeństwa biznesu:** Długomat generuje **pisma procesowe**.
> Błędny przepis (np. zły artykuł k.p.c.) = przegrana klienta = odpowiedzialność firmy.
> Dlatego **żaden** model AI nie jest „jedynym mózgiem" systemu. Obowiązuje **architektura
> hybrydowa** (patrz [`06-ARCHITEKTURA-AI-I-RYZYKA.md`](./06-ARCHITEKTURA-AI-I-RYZYKA.md)).

---

## 1. Czym jest Długomat (kontekst dla nowego dewelopera)

**Długomat** to polski legal-tech SaaS dla dłużników. Generuje pisma:

- **sprzeciw EPU** (elektroniczne postępowanie upominawcze),
- **skarga na czynności komornika**,
- **korekta wpisu BIK**,
- **wnioski o ugodę / rozłożenie na raty**.

### Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript 5.6 |
| UI | Tailwind CSS + shadcn/ui (Radix), lucide-react, design system **Tarcza v4 Stoic+** |
| Backend / DB | Supabase (Postgres 15, RLS FORCE, **pgvector**, **pgcrypto**, Auth, Storage) |
| AI (obecnie) | Claude przez gateway APIPod.ai + warstwa fallback (`lib/ai/`) |
| AI (docelowo) | **Featherless.ai** (modele open-source HuggingFace, endpoint OpenAI-compatible) jako generator draftu + Claude/GPT jako weryfikator cytatów |
| Płatności | Stripe (Checkout) + Fakturownia (faktury VAT PL) |
| Hosting | Vercel (SSR) |
| Powiadomienia | Resend (e-mail) + SMSAPI.pl (SMS) |
| Monitoring | Sentry + PostHog |

### Struktura repozytorium (skrót)

```
/ (monorepo, npm workspaces)
├── apps/web/                 # aplikacja Next.js 14
│   ├── app/                  # App Router (landing, panel, admin, api/*)
│   ├── lib/
│   │   ├── ai/               # warstwa AI: llm-client.ts, model-router.ts, ...
│   │   ├── billing/          # Stripe (wymaga `stripe` z npm — ETAP 0)
│   │   ├── coupons/          # kupony (wymaga `stripe`)
│   │   ├── invoices/         # faktury (wymaga `pdf-lib` z npm — ETAP 0)
│   │   ├── documents/        # render PDF pism (wymaga `pdf-lib`)
│   │   ├── pdf/              # PDF/A conformance (wymaga `pdf-lib`)
│   │   ├── db/               # supabase-server.ts (klient serwerowy + mock DEV-PREVIEW)
│   │   └── dev/              # tryb DEV-PREVIEW (preview.ts, mock-supabase.ts)
│   ├── package.json          # ⚠️ brakuje `stripe` i `pdf-lib` — ETAP 0
│   └── .env.example          # pełna lista zmiennych środowiskowych
├── supabase/
│   ├── migrations/           # 49 migracji + 2 seedy
│   └── functions/            # Edge Functions: deadline-cron, image-resize, ...
└── docs/deployment/          # TEN dokument
```

---

## 2. Mapa etapów (kolejność WYKONANIA)

Wykonuj etapy **po kolei**. Każdy następny zakłada, że poprzedni jest ukończony.

| Etap | Plik | Cel | Czas (szac.) | Bloker? |
|---|---|---|---|---|
| **ETAP 0** | [`00-ETAP-0-ODBLOKOWANIE-BUILDU.md`](./00-ETAP-0-ODBLOKOWANIE-BUILDU.md) | Naprawić `next build` (dodać `stripe` + `pdf-lib`) | 0,5 h | 🔴 TAK — bez tego nic nie ruszy |
| **ETAP 1** | [`01-ETAP-1-BAZA-SUPABASE.md`](./01-ETAP-1-BAZA-SUPABASE.md) | Postawić bazę na Supabase hosting (49 migracji, pgvector, pgcrypto, RLS) | 1–2 h | 🔴 TAK — bez DB brak auth/danych |
| **ETAP 2** | [`02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md`](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md) | Podpiąć Featherless.ai (OpenAI-compatible) + rejestr modeli | 0,5 dnia | 🟡 częściowy (Claude działa jako fallback) |
| **ETAP 3** | [`03-ETAP-3-INTEGRACJE-ZEWNETRZNE.md`](./03-ETAP-3-INTEGRACJE-ZEWNETRZNE.md) | Stripe, Fakturownia, Resend, SMS, Sentry, ClamAV, klucze szyfrujące | 1 dzień | 🟡 zależne od funkcji |
| **ETAP 4** | [`04-ETAP-4-HOSTING-VERCEL.md`](./04-ETAP-4-HOSTING-VERCEL.md) | Deploy na Vercel, domena, SSL, env produkcyjne, wyłączenie DEV-PREVIEW | 2–3 h | 🔴 TAK — to jest „w sieci" |
| **DODATEK A** | [`05-MATRYCA-ROUTINGU-MODELI.md`](./05-MATRYCA-ROUTINGU-MODELI.md) | Matryca: który model do którego pisma (z dokumentu rankingowego) | — | dokumentacja |
| **DODATEK B** | [`06-ARCHITEKTURA-AI-I-RYZYKA.md`](./06-ARCHITEKTURA-AI-I-RYZYKA.md) | Architektura hybrydowa + krytyczne ryzyka (halucynacje, kontekst, LoRA) | — | dokumentacja |

---

## 3. Stan gotowości projektu (audyt na 2026-06-26)

| Warstwa | Gotowość | Co zostało do zrobienia |
|---|---|---|
| Frontend (landing + 2 panele) | **~85%** | dedup 3 generacji UI, migracja legacy admin |
| Backend (API, pipeline AI, RAG, citation-verifier) | **~75%** | parametryzacja base URL (ETAP 2), podpięcie płatności (ETAP 3) |
| Baza danych (schema) | **~90%** | tylko wdrożyć 49 migracji na Supabase hosting (ETAP 1) |
| Integracje (Stripe, Fakturownia, Resend, SMS, Sentry, ClamAV) | **~40%** | ⚠️ największe braki (ETAP 3) |
| Auth (Supabase + RBAC + MFA) | **~85%** | wymaga żywego Supabase (ETAP 1) |
| Build | **🔴 zepsuty** | brak `stripe` + `pdf-lib` w `package.json` (ETAP 0) |

---

## 4. Stan techniczny na dziś (do czego się odnosimy)

- **Branch roboczy:** `genspark_ai_developer`
- **Build (`npx next build`):** ❌ FAILURE — `Module not found: Can't resolve 'stripe'` oraz `'pdf-lib'`
- **Typecheck (`npx tsc --noEmit`):** ✅ EXIT 0
- **Lint (`npx eslint`):** ✅ EXIT 0
- **DEV-PREVIEW:** zaimplementowany (`lib/dev/preview.ts`, `lib/dev/mock-supabase.ts`) — pozwala
  podejrzeć panele `/panel` i `/admin` bez żywego Supabase. **MUSI być wyłączony na produkcji** (ETAP 4).

---

## 5. Wymagania wstępne (zainstaluj zanim zaczniesz)

```bash
# Node.js 20 LTS (zgodny z next 14.2)
node --version    # >= 20.x

# Menedżer pakietów — repo używa npm workspaces
npm --version     # >= 10.x

# Supabase CLI (do migracji w ETAPIE 1)
npm install -g supabase
supabase --version

# Vercel CLI (do deployu w ETAPIE 4) — opcjonalne, można też przez panel
npm install -g vercel
vercel --version
```

Konta, które musisz mieć (zakładamy stopniowo w kolejnych etapach):

- [ ] **Supabase** (region UE — RODO) — ETAP 1
- [ ] **Featherless.ai** (abonament + API key) — ETAP 2
- [ ] **Anthropic** (Claude — fallback/weryfikator) — ETAP 2/3
- [ ] **Stripe** (PL, VAT 23%) — ETAP 3
- [ ] **Fakturownia** — ETAP 3
- [ ] **Resend** + **SMSAPI.pl** — ETAP 3
- [ ] **Sentry** — ETAP 3
- [ ] **Vercel** — ETAP 4
- [ ] **domena** `dlugomat.pl` (DNS) — ETAP 4

---

## 6. Definition of Done (kiedy wdrożenie jest skończone)

- [ ] ETAP 0: `npm --workspace apps/web run build` kończy się **EXIT 0**.
- [ ] ETAP 1: 49 migracji wdrożone, `pgvector` + `pgcrypto` aktywne, RLS FORCE potwierdzone testem izolacji.
- [ ] ETAP 2: generacja pisma przez Featherski model + weryfikacja cytatów + fallback na Claude działają E2E.
- [ ] ETAP 3: płatność testowa Stripe → faktura Fakturownia → e-mail Resend → SMS — pełny przepływ.
- [ ] ETAP 4: aplikacja dostępna pod `https://dlugomat.pl`, SSL OK, DEV-PREVIEW **wyłączony**, Sentry zbiera błędy.
- [ ] Wszystkie zmiany zacommitowane na `genspark_ai_developer`, PR #1 zaktualizowany.

---

## 7. Konwencje w tych dokumentach

- 🔴 = bloker / krytyczne · 🟡 = ważne · 🟢 = opcjonalne / nice-to-have
- `ŚCIEŻKA:linia` = odwołanie do konkretnego miejsca w kodzie (np. `apps/web/lib/ai/llm-client.ts:121`)
- Bloki ```bash``` = komendy do wykonania w terminalu (z katalogu repo, chyba że napisano inaczej)
- Bloki ```ts``` = kod do wklejenia / zmiany
- **„ZADANIE N.x"** = konkretna, odhaczalna czynność

---

**Następny krok →** [`00-ETAP-0-ODBLOKOWANIE-BUILDU.md`](./00-ETAP-0-ODBLOKOWANIE-BUILDU.md)
