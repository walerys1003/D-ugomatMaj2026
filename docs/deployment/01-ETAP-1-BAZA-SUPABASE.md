# ETAP 1 — Baza danych na Supabase hosting

> **Cel:** postawić produkcyjną bazę Postgres na Supabase, wdrożyć **49 migracji** + seedy,
> włączyć rozszerzenia `pgvector` i `pgcrypto`, potwierdzić **RLS FORCE**, podpiąć klucze do aplikacji.
> **Czas:** 1–2 h. **Trudność:** średnia.

⬅️ [ETAP 0](./00-ETAP-0-ODBLOKOWANIE-BUILDU.md) · [Indeks](./README.md) · Następny → [ETAP 2: AI Featherless](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md)

---

## 1.1. Kontekst — co już mamy w repo

Schemat bazy jest **gotowy** (~90%). Wszystko siedzi w `supabase/migrations/` — **49 plików** `.sql`,
wykonywanych w kolejności nazw (timestamp-prefiks). Najważniejsze z nich:

| Plik | Co tworzy |
|---|---|
| `20260510120000_init_profiles.sql` | tabela `profiles` (start) |
| `20260510130000_enums_and_extensions.sql` | **rozszerzenia** (`uuid-ossp`, `pgcrypto`, `vector`) + enumy domeny (`case_type`, ...) |
| `20260510130200_cases.sql` | sprawy klientów |
| `20260510130300_documents.sql` | dokumenty / pisma |
| `20260510130600_payments.sql` | płatności (Stripe) |
| `20260510130900_ai_knowledge.sql` | baza wiedzy AI + kolumny `vector` (RAG) |
| `20260510131100_rls_policies.sql` | polityki RLS |
| `20260510131200_seed_prompt_templates.sql` | **seed** szablonów promptów |
| `20260510140000_rag_match_function.sql` | funkcja `match_*` do wyszukiwania wektorowego (pgvector) |
| `20260510160000_pgcrypto_encryption.sql` | szyfrowanie at-rest (pgcrypto) |
| `20260510170000_seed_legal_knowledge_d3_d8.sql` | **seed** wiedzy prawnej D3–D8 |
| `20260601000000_wave6_force_rls_critical_tables.sql` | **FORCE RLS** na tabelach krytycznych |
| `20260602000000_wave7_force_rls_batch2.sql` | **FORCE RLS** batch 2 |

> Rozszerzenia są deklarowane idempotentnie już w migracji `..._enums_and_extensions.sql`:
> ```sql
> create extension if not exists "uuid-ossp";
> create extension if not exists "pgcrypto";
> create extension if not exists "vector";  -- pgvector dla RAG
> ```
> Czyli **migracje same włączą rozszerzenia** — ale na Supabase trzeba je czasem dopuścić w panelu (patrz 1.4).

---

## 1.2. ZADANIE 1.1 — Założyć projekt Supabase (region UE / RODO)

1. Wejdź na <https://supabase.com> → **New project**.
2. **Region:** wybierz UE (np. `Frankfurt (eu-central-1)` lub `London`) — **wymóg RODO** (dane klientów-dłużników).
3. Ustaw silne hasło do bazy (zapisz w menedżerze haseł — przyda się do `DATABASE_URL`).
4. Poczekaj aż projekt wstanie (~2 min).

Zanotuj z **Project Settings → API**:
- `Project URL` → trafi do `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**SEKRET — nigdy do klienta!**)

Z **Project Settings → Database** zanotuj `Connection string` (URI) → przyda się do CLI.

---

## 1.3. ZADANIE 1.2 — Połączyć repo z projektem Supabase (CLI)

```bash
# zainstaluj CLI, jeśli nie masz
npm install -g supabase
supabase --version

# zaloguj się (otworzy przeglądarkę / token)
supabase login

# z katalogu głównego repo — połącz z projektem
# <PROJECT_REF> = ciąg z URL projektu, np. abcdwxyz1234
supabase link --project-ref <PROJECT_REF>
```

> Jeśli `supabase link` pyta o hasło do bazy — podaj to z ZADANIA 1.1.

---

## 1.4. ZADANIE 1.3 — Włączyć rozszerzenia (jeśli panel tego wymaga)

Migracje robią `create extension if not exists ...`, ale na niektórych planach Supabase
trzeba najpierw **dopuścić** rozszerzenie w panelu:

**Database → Extensions** → włącz:
- ✅ `vector` (pgvector) — RAG / embeddings
- ✅ `pgcrypto` — szyfrowanie at-rest
- ✅ `uuid-ossp` — UUID

> Jeśli `db push` rzuci `permission denied to create extension "vector"`, to znaczy, że
> rozszerzenie nie jest dopuszczone w panelu — włącz je ręcznie i powtórz push.

---

## 1.5. ZADANIE 1.4 — Wdrożyć 49 migracji + seedy

```bash
# DRY-RUN — zobacz, co zostanie wykonane (NIC nie zmienia)
supabase db push --dry-run

# Wdrożenie właściwe
supabase db push
```

Supabase wykona wszystkie pliki z `supabase/migrations/` w kolejności timestampów,
łącznie z seedami (`...seed_prompt_templates.sql`, `...seed_legal_knowledge_d3_d8.sql`).

**Weryfikacja po push:**

```bash
# lista wykonanych migracji po stronie zdalnej
supabase migration list
```

Albo w panelu Supabase → **Table Editor**: powinny być widoczne tabele `profiles`, `cases`,
`documents`, `payments`, `ai_knowledge`, `deadlines`, `notifications` itd.

> ⚠️ **Kolejność ma znaczenie.** Nie uruchamiaj pojedynczych migracji ręcznie poza kolejnością —
> część zależy od wcześniejszych (np. `force_rls` zakłada istnienie tabel).

---

## 1.6. ZADANIE 1.5 — Zweryfikować RLS FORCE (krytyczne dla RODO)

Długomat trzyma dane wrażliwe (długi, dane osobowe). **RLS musi być FORCE** — czyli
egzekwowane nawet dla właściciela tabeli. W repo jest 9 plików włączających RLS,
w tym dwa „wave force" (`wave6`, `wave7`).

**Test izolacji danych (ręczny):**

W panelu Supabase → **SQL Editor** sprawdź, że tabele krytyczne mają RLS i FORCE:

```sql
select relname,
       relrowsecurity   as rls_enabled,
       relforcerowsecurity as rls_forced
from pg_class
where relkind = 'r'
  and relnamespace = 'public'::regnamespace
  and relname in ('profiles','cases','documents','payments','ocr_results')
order by relname;
```

Oczekiwane: `rls_enabled = true` **i** `rls_forced = true` dla tabel z danymi klienta.

**Test praktyczny (2 użytkowników):**
1. Załóż konto A i konto B (przez aplikację po ETAPIE 4 lub przez Auth panel).
2. Jako A utwórz sprawę.
3. Jako B spróbuj pobrać sprawy — **nie może** zobaczyć danych A.

> Klient serwerowy w aplikacji **celowo** używa JWT użytkownika (nie service_role),
> dzięki czemu RLS działa — patrz `apps/web/lib/db/supabase-server.ts:18`
> (`createSupabaseServerClient()` używa `anon` + cookies, nie service role).

---

## 1.7. ZADANIE 1.6 — Podpiąć klucze do aplikacji

Skopiuj szablon env i uzupełnij:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Uzupełnij w `apps/web/.env.local` (sekcja „Supabase"):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # SEKRET
```

> 🔴 **DEV-PREVIEW vs realne Supabase:** dopóki `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` są puste
> **i** włączony jest `NEXT_PUBLIC_DEV_PREVIEW`, aplikacja zwraca **mock** klienta
> (`apps/web/lib/db/supabase-server.ts:24` → `createMockSupabaseClient()`).
> Gdy podasz prawdziwe klucze, aplikacja automatycznie przełączy się na realne Supabase.
> **Na produkcji DEV-PREVIEW musi być wyłączony** — patrz [ETAP 4](./04-ETAP-4-HOSTING-VERCEL.md).

---

## 1.8. ZADANIE 1.7 — Storage buckets

Migracja `20260510131000_storage_buckets.sql` definiuje bucket(y) na pliki (skany pism, dowody).
Sprawdź w panelu **Storage**, że bucket istnieje i ma poprawne polityki dostępu (RLS na obiektach).
Jeśli migracja nie utworzyła bucketu (zależnie od wersji Supabase), utwórz go ręcznie zgodnie
z nazwą z pliku migracji i nałóż polityki z `..._rls_policies.sql`.

---

## 1.9. Definition of Done — ETAP 1

- [ ] Projekt Supabase w regionie **UE**.
- [ ] `supabase db push` wykonał **49 migracji** + 2 seedy bez błędów.
- [ ] Rozszerzenia `vector`, `pgcrypto`, `uuid-ossp` aktywne.
- [ ] RLS **FORCE** potwierdzone zapytaniem `pg_class` + testem 2 użytkowników.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY` w `.env.local`.
- [ ] Storage bucket(y) istnieją z politykami.

✅ Po odhaczeniu → **[ETAP 2: Integracja AI / Featherless](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md)**.
