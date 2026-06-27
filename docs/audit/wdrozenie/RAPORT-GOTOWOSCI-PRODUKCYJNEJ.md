# Audyt gotowości produkcyjnej — Długomat (2026-06-27)

> Raport z rzetelnej weryfikacji end-to-end (czytanie rzeczywistych plików, nie z pamięci).
> Branch: `genspark_ai_developer`. PR #1.

## 1. Stos: baza danych i hosting

| Pytanie | Odpowiedź | Dowód |
|---|---|---|
| **Jaka baza danych — Vercel czy Supabase?** | **Supabase** (Postgres + Auth + Storage) | `README.md`, `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`), typowany klient w całym kodzie |
| Hosting | **Vercel** (to NIE baza, tylko target deployu) | `vercel.json` — cron `/api/cron/onboarding` co godzinę |
| Migracje | **56** plików SQL | `supabase/migrations/*.sql` |
| Endpointy API | **195** route.ts | `apps/web/app/api/**/route.ts` |
| AI | Claude Sonnet 4.6 via APIPod.ai (+ Anthropic fallback) | `.env.example` `APIPOD_API_KEY` |
| OCR | Tesseract.js (klient) → AWS Textract (fallback) | `lib/ocr/*` |

**Po przeniesieniu na domenę + bazę:** rdzeń (generowanie, skan, odczyt) zadziała,
bo używa Supabase Auth/RLS/Storage przez zmienne środowiskowe. Wymaga ustawienia
wszystkich kluczy z `.env.example` (Supabase, APIPOD/Anthropic, AWS Textract,
Stripe, Resend/SMSAPI, VAPID) oraz uruchomienia 56 migracji.

## 2. Weryfikacja konkretnych zarzutów

### 2a. „BRAK komponentu frontendowego do uploadu / `<input type="file">` / `/api/uploads`"
**WERDYKT: NIEPRAWDA (zarzut nieaktualny).** Istnieje pełny przepływ uploadu:
- `components/ocr/ocr-dropzone.tsx` — dropzone z `<input type="file">` (accept: PDF, JPG, PNG, WEBP), drag&drop, progress bar.
- `lib/ocr/use-ocr-upload.ts` — hook: hash → upload (signed URL Supabase Storage) → Tesseract OCR → submit → fallback Textract.
- `app/(panel)/panel/skaner/page.tsx` — strona „Skaner nakazu" renderująca `SkanerClient` → `OcrDropzone` + historia skanów z Supabase.

Upload **nie** używa `/api/uploads` (taki endpoint nie istnieje) — zamiast tego
**server actions** (`createOcrUploadUrlAction`) + signed URL do Supabase Storage.
To architektonicznie poprawne (bezpieczniejsze niż przesyłanie pliku przez API route).
Drugi `<input type="file">` jest w kreatorze zadłużenia (krok „Dokumenty") — ale tam
to mock bez podpięcia (patrz §4).

### 2b. „OCR tylko obrazki (JPEG/PNG/WebP), PDF nie jest OCR-owany; komentarz «PDF na razie nie OCR-ujemy»"
**WERDYKT: komentarz NIE istnieje, ale problem realny — CZĘŚCIOWO PRAWDA (NAPRAWIONE).**
- Frontend deklarował akceptację PDF, ale **Tesseract.js (klient) nie renderuje PDF** —
  `worker.recognize()` na PDF zwracał pusty/śmieciowy tekst → ciche „Skan przeanalizowany"
  z pustą treścią.
- AWS Textract (server fallback) obsługuje **single-page PDF** przez `Bytes` (sync API, limit 10 MB).
- **Naprawa (iter. audytu #18):**
  - `lib/ocr/tesseract-client.ts` — `isPdfFile()` + guard: PDF → pusty wynik wymuszający fallback Textract.
  - `lib/ocr/use-ocr-upload.ts` — gdy Tesseract pusty ORAZ Textract niedostępny/za duży → **jawny błąd** zamiast fałszywego sukcesu.
  - `components/ocr/ocr-dropzone.tsx` — uczciwy copy: PDF = pojedyncza strona, do 10 MB, najlepiej zdjęcie.

## 3. Core flow (pismo: generowanie → skan → odczyt) — DZIAŁA i jest podpięty

| Etap | Stan | Dowód |
|---|---|---|
| **Generowanie pisma** | OK Podpięte (backend solidny) | `components/wizard/case-wizard-client.tsx` → `generateDocumentFromWizardAction` → `/api/ai/generate` (SSE streaming, auth, RLS, rate-limit, idempotency, budget guardrails) |
| **Skan / OCR** | OK Podpięte (+ naprawa PDF) | `skaner` → `OcrDropzone` → `use-ocr-upload` → Supabase Storage + Tesseract/Textract |
| **Odczyt / podgląd** | OK Podpięte do Supabase | `sprawa/[id]/dokument/[docId]/podglad` + `/print` czytają `documents`/`cases` z RLS |
| **Pobranie / druk PDF** | OK Podpięte (print/HTML) | `lib/documents/pdf-renderer.ts` `composePrintableHtml` (window.print); pełny pdf-lib/Puppeteer = Tier 4 |
| **Kreator sprawy** | OK Podpięte | `sprawy/nowa` → `startCaseAction` |

## 4. Pokrycie endpoint <-> UI (sedno pytania)

### Panel ADMINA (`app/(admin)/admin/*`) — ~89% podpięty
- BACKEND/REDIRECT (podpięte lub delegują do client/wrapperów): analytics/*, dashboard, compliance, errors, feature-flags, impersonate, legal-hold, prompts/[id]/versions, rate-limits, rbac, secrets, workflows.
- **MOCK (do podpięcia):** `rbac/[role]`, `rum`.

### Panel UŻYTKOWNIKA (`app/(panel)/panel/*`) — ~40% w pełni podpięte
- **Podpięte (BACKEND/lib-repo/client):** sprawa/[id] (+podgląd/print/płatność), skaner, sprawy/nowa, moje-zadluzenie, plan-splaty, ai-asystent (ChatStream), organizacja/* (część), partner/* (część), ustawienia/* (część), dokumenty (lista), kalendarz, baza-orzecznicza (lista), wsparcie.
- **MOCK (hardcoded const, 0 realdata) — ~62 strony**, m.in.:
  `finanse`, `ulubione`, `wiadomosci`, `notatki/*`, `aktywnosc/*`, `dokumenty/[id]`* (NAPRAWIONE w tej iteracji)*,
  `sprawy/[id]/*` (duplikat starej trasy), `firma/*`, `kancelaria/*`, `plan-splaty/[id]`,
  `polecenia/historia|ranking`, `profil/*`, `wsparcie/faq|baza-wiedzy|zgloszenia`, `eksport`, `kalendarz/agenda|miesiac|tydzien`, `moje-zadluzenie/kreator`.

### Naprawione w tej iteracji
- OK `dokumenty/[id]` — przepisane z hardcoded `DOCS/VERSIONS/AUDIT` na realne `documents` + `document_versions` z Supabase (auth+RLS), przyciski Pobierz/Podgląd linkują do realnych tras.
- OK OCR PDF guard (§2b).

## 5. Stan gotowości produkcyjnej — szacunek

| Obszar | Gotowość |
|---|---|
| Architektura, baza, auth, RLS, migracje | ~95% |
| Endpointy API (195) | ~90% (zaimplementowane; część wymaga konfiguracji kluczy) |
| Core flow (pismo/skan/odczyt/płatność) | ~90% (działa end-to-end) |
| Panel admina UI<->backend | ~89% |
| Panel użytkownika UI<->backend | ~40% (dużo stron-makiet) |
| Bezpieczeństwo (rate-limit, idempotency, CSRF, encryption) | ~90% |
| **CAŁOŚĆ (ważona — rdzeń liczy się bardziej)** | **~72–75%** |

### Co blokuje 100% produkcji
1. **~62 strony-makiety w panelu użytkownika** — UI gotowe wizualnie, ale pokazują hardcoded dane. Wymagają podpięcia do Supabase/endpointów (część endpointów już istnieje, część wymaga nowych tabel: `user_activity`, `messages`, `notes`, `favorites`).
2. **Mock `rbac/[role]`, `rum`** w adminie.
3. **Konfiguracja produkcyjna** — wszystkie klucze z `.env.example` + 56 migracji na docelowej bazie.
4. **PDF OCR wielostronicowy** — obecnie single-page (Textract sync). Pełny multi-page = async job (Tier 4).
5. **Pełny generator PDF** (Puppeteer/@react-pdf) — obecnie druk przez HTML/window.print.

### Wniosek
Rdzeń produktu (rejestracja -> sprawa -> AI-pismo -> skan -> podgląd -> płatność -> druk)
jest **funkcjonalnie kompletny i podpięty**. Główny dług to **warstwa prezentacji
peryferyjnych modułów panelu użytkownika** (makiety), która nie blokuje MVP, ale musi
zostać podpięta przed pełnym launchem komercyjnym wszystkich funkcji.
