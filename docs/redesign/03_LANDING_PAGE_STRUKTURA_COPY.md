# 03 — Landing Page: struktura przełomowa + copy

> **Cel:** strona główna, która sprawia **wrażenie potęgi firmowej**, eksponuje realne wyróżniki backendu (`01`), prowadzi cztery segmenty do właściwej ścieżki i konwertuje. Estetyka: editorial klasy Stripe, ton: kancelaria + autorytet (archetyp „Tarcza", `02`).
> **Wiążące:** każda sekcja mapuje się na istniejący endpoint (`01`). Copy poniżej jest **gotowe do wklejenia** (PL, ton spokojny-pewny).

---

## 0. Reguły nadrzędne copy

- **Mówimy do człowieka w stresie.** Krótkie zdania. Zero żargonu w nagłówkach, żargon prawny dozwolony w dowodach.
- **Dowód > obietnica.** Każdy claim z liczbą, paragrafem KPC lub artefaktem pisma.
- **Nigdy panika.** „Masz prawo się bronić", nie „Komornik Cię zniszczy".
- **CTA różnicuje intencję:** główne `Zeskanuj nakaz za darmo` (B2C), poboczne `Umów demo dla firmy` (B2B).

---

## 1. Architektura strony (kolejność sekcji)

| # | Sekcja | Komponent | Endpoint (`01`) | Cel |
|---|---|---|---|---|
| 1 | **Hero** + żywy artefakt | `Hero` (ulepszony) | `ai/ocr`, `cases/win-probability` | propozycja wartości + dowód |
| 2 | **Pasek zaufania** (logo prasy + 3 KPI) | `TrustStrip` | `analytics` | autorytet od razu |
| 3 | **Segmenty odbiorcy** (4 ścieżki) | `AudienceSwitch` (NOWA) | `lp/*`, `dla-*` | routing B2C/B2B |
| 4 | **Jak to działa** (3 kroki) | `HowItWorks` | rdzeń `01 §1` | zrozumienie procesu |
| 5 | **Wyróżniki AI** (Legal OS) | `AIEdge` (NOWA) | `virtual-judge`, `win-probability`, `irac`, `citation-verifier` | „dlaczego my" |
| 6 | **Moduły D1–D8** | `ModulesGrid` | `moduly/*`, `ai/generate` | szerokość oferty |
| 7 | **Żywe demo skanera** | `LiveScanDemo` (NOWA) | `ai/ocr`, `letters/parse` | „pokaż, nie mów" |
| 8 | **Dowód społeczny** (case studies) | `SocialProof` | `case-studies/*` | wiarygodność |
| 9 | **Bezpieczeństwo i zgodność** | `ComplianceBand` | `security/*`, RLS | redukcja obiekcji |
| 10 | **Cennik (teaser)** | `PricingTeaser` | `billing/plans` | konwersja |
| 11 | **FAQ** | `FAQ` | `ai/answer` (baza wiedzy) | obiekcje |
| 12 | **CTA końcowe** | `CtaBand` | `ai/ocr`, `leads/roi-b2b` | ostatnie wezwanie |

> Zmiany vs obecny landing: dodane **#3 AudienceSwitch**, **#5 AIEdge**, **#7 LiveScanDemo**, **#9 ComplianceBand** rozdzielone od TrustStrip. To zamyka braki LP-1…LP-5 z `00`.

---

## 2. Hero — copy

**Eyebrow:** `AI legal-tech · nadzór radcy prawnego · zgodne z KPC`

**H1 (Display):**
> ## Tarcza dla zadłużonych.

**Sub-H1 (Text lg):**
> Wczytaj nakaz zapłaty, pismo od komornika albo raport BIK. Długomat rozpozna dokument, oceni przedawnienie i wygeneruje pismo procesowe — **w 12 minut, bez prawnika.**

**CTA główne:** `Zeskanuj nakaz za darmo →` (→ `/skaner-nakazu`)
**CTA poboczne:** `Zobacz, jak to działa` (→ `#jak-to-dziala`)

**Micro-trust pod CTA:** `Skaner darmowy · bez karty · dane szyfrowane (pgcrypto)`

**Prawy panel (żywy artefakt — `DocumentArtifact`):** dwa nakładające się panele:
1. *Skaner nakazu* — wyekstrahowane encje: `Sygnatura: Nc-e 1234567/24 · Wierzyciel: Fundusz X · Kwota: 4 218,00 zł · Termin sprzeciwu: 14 dni`
2. *Sprzeciw (draft)* — fragment: „...podnoszę zarzut przedawnienia roszczenia (art. 118 k.c.)..."

**Stat row (3 KPI, prawdziwe disclosure):**
`12 min — mediana do gotowego pisma` · `8 typów pism (D1–D8)` · `100% — pisma sprawdzane przez walidator cytatów`

---

## 3. TrustStrip — copy

**Logo prasy:** Rzeczpospolita · Puls Biznesu · Money.pl · Forbes Polska
**3 KPI inline:** `Tysiące wygenerowanych pism` · `Średni czas: 12 min` · `Zgodność: RODO + RLS FORCE`

---

## 4. AudienceSwitch (NOWA) — copy

**Eyebrow:** `Dla kogo jest Długomat`
**H2:** `Cztery sytuacje. Jedna tarcza.`

| Karta | Nagłówek | Pod-copy | CTA → |
|---|---|---|---|
| Dłużnik prywatny | „Dostałem nakaz / pismo od komornika" | Sprzeciw, skarga, korekta BIK — gotowe pismo w 12 minut. | `/lp/dluznik-prywatny` |
| Firma | „Mamy zaległości i wezwania" | Ugody, restrukturyzacja, automaty na powtarzalne sprawy. | `/dla-firm` |
| Kancelaria | „Obsługujemy sprawy dłużników" | Generator pism + baza orzecznicza + zespół i białe etykiety. | `/dla-kancelarii` |
| Windykacja | „Zarządzamy portfelem należności" | Masowe operacje, integracje, API. | `/dla-windykacji` |

---

## 5. HowItWorks — copy

**H2:** `Trzy kroki. Bez prawnika obok.`

1. **Wczytaj dokument.** „Zrób zdjęcie lub wgraj PDF. AI rozpozna sygnaturę, kwotę, wierzyciela i terminy." *(→ `ai/ocr`)*
2. **Sprawdź szanse.** „Dostajesz ocenę przedawnienia i prawdopodobieństwo wygranej — zanim cokolwiek zapłacisz." *(→ `win-probability`, `irac`)*
3. **Pobierz pismo.** „Gotowy sprzeciw lub skarga, z paragrafami i cytatami. Do druku albo wysyłki przez ePUAP." *(→ `ai/generate`, `court/epuap`)*

---

## 6. AIEdge (NOWA) — wyróżniki, copy

**Eyebrow:** `Dlaczego Długomat, a nie szablon z internetu`
**H2:** `To nie generator tekstu. To legal OS.`

| Wyróżnik | Nagłówek | Copy | Endpoint |
|---|---|---|---|
| Wirtualny sędzia | „Zobacz sprawę oczami sądu" | Symulujemy argumenty za i przeciw, zanim złożysz pismo. | `cases/[id]/virtual-judge` |
| Szansa wygranej | „Prawdopodobieństwo, nie wróżby" | Model ocenia siłę Twoich zarzutów na bazie przepisów i orzeczeń. | `cases/[id]/win-probability` |
| Walidator cytatów | „Każdy paragraf sprawdzony" | Anty-halucynacja: cytujemy tylko realne, zweryfikowane przepisy. | `citation-verifier`, `hallucination-guard` |
| Analiza IRAC | „Prawnicza logika, nie ściana tekstu" | Issue–Rule–Application–Conclusion — tak myśli prawnik. | `ai/irac` |
| Baza orzecznicza (RAG) | „Wyszukiwanie po sensie, nie po słowach" | Semantyczne przeszukanie precedensów (pgvector). | `ai/rag/search`, `precedents/search` |

---

## 7. ModulesGrid — copy (8 modułów)

**H2:** `Osiem rodzajów pism. Jeden proces.`

| Moduł | Pismo | Slug |
|---|---|---|
| D1 | Sprzeciw od nakazu zapłaty (EPU) | `/moduly/sprzeciw-epu` |
| D2 | Skarga na czynności komornika | `/moduly/komornik` |
| D3 | Korekta / wniosek BIK | `/moduly/bik` |
| D4 | Propozycja ugody z wierzycielem | `/moduly/ugoda` |
| D5 | Zarzuty: cesja / fundusz sekurytyzacyjny | `/moduly/cesja` |
| D6 | Ograniczenie potrąceń z wynagrodzenia | `/moduly/potracenia` |
| D7 | Upadłość konsumencka | `/moduly/upadlosc` |
| D8 | Wezwania / pisma przedsądowe | `/moduly/wezwania` (B2B) |

Każda karta: nazwa + 1 zdanie korzyści + cena/plan (`billing/plans`) + „Zobacz moduł →".

---

## 8. LiveScanDemo (NOWA) — copy

**H2:** `Wypróbuj teraz. Tu, na stronie.`
**Copy:** „Wgraj przykładowy nakaz (lub użyj naszego). Zobacz, co AI z niego wyciągnie — w czasie rzeczywistym, bez logowania."
**Interakcja:** upload → `ai/ocr` → wyświetlenie encji w `DocumentArtifact`. Po demo: CTA `Wygeneruj pełne pismo →` (wymaga konta).

---

## 9. ComplianceBand — copy

**H2:** `Twoje dane są bezpieczniejsze niż w szufladzie.`
**Punkty:** `Szyfrowanie pól wrażliwych (pgcrypto)` · `Izolacja danych per-użytkownik (Postgres RLS FORCE)` · `Zgodność z RODO — eksport i usunięcie na żądanie` · `Hosting w UE` · `MFA i passkeys dla konta`.
*(→ `security/gdpr/*`, `security/mfa/*`, RLS z migracji)*

---

## 10. PricingTeaser — copy

**H2:** `Płacisz za pismo, nie za nadzieję.`
**Copy:** „Skan i ocena szans — za darmo. Płacisz dopiero, gdy chcesz pobrać gotowe pismo. Dla firm i kancelarii: subskrypcja z limitami i fakturą VAT."
CTA: `Zobacz pełny cennik →` (→ `/cennik`).

---

## 11. FAQ — copy (przykłady, zasilane `ai/answer`)

- „Czy pismo z Długomata jest tak samo ważne jak od prawnika?" → „Tak. To pismo procesowe zgodne z KPC; nadzór merytoryczny radcy prawnego."
- „Czy mam jeszcze czas na sprzeciw?" → „Masz 14 dni od doręczenia nakazu (EPU). Skaner od razu policzy Twój termin."
- „Co jeśli nie stać mnie na opłatę sądową?" → „Generujemy wniosek o zwolnienie z kosztów i raty sądowe."
- „Czy moje dane są bezpieczne?" → „Szyfrujemy dane wrażliwe i izolujemy je per-konto (RLS). Możesz je w każdej chwili wyeksportować lub usunąć."

---

## 12. CtaBand — copy

**H2:** `Nakaz ma termin. Ty masz tarczę.`
**Sub:** „Zacznij od darmowego skanu. Zobacz swoje szanse, zanim zapłacisz złotówkę."
CTA główne: `Zeskanuj nakaz za darmo →` · CTA B2B: `Umów demo dla firmy`.

---

## 13. SEO / meta (zostaje, doprecyzowane)

- `title`: „Tarcza dla osób zadłużonych — pisma procesowe w 12 minut"
- JSON-LD: Organization + WebApplication + FAQPage (już w `page.tsx`).
- OG dynamiczne przez `api/og/home`. ✅

---

## 14. Mapowanie na pliki (do implementacji — `05`)

| Sekcja | Plik docelowy |
|---|---|
| Hero (ulepszony artefakt) | `components/landing/hero.tsx` |
| TrustStrip | `components/landing/trust-bar.tsx` (refaktor) |
| AudienceSwitch | `components/landing/audience-switch.tsx` (NOWY) |
| AIEdge | `components/landing/ai-edge.tsx` (NOWY) |
| LiveScanDemo | `components/landing/live-scan-demo.tsx` (NOWY) |
| ComplianceBand | `components/landing/compliance-band.tsx` (NOWY) |
| Złożenie | `app/(marketing)/page.tsx` |

Wszystkie nowe komponenty: **wyłącznie tokeny kanoniczne** (`02 §8`), zero `iron-*`, zero importu v5.
