# DODATEK B — Architektura AI (hybryda) + krytyczne ryzyka

> Ten dokument tłumaczy **dlaczego** wdrażamy Featherless w sposób hybrydowy (a nie „albo-albo")
> i jakie ryzyka musi rozumieć każdy deweloper dotykający warstwy AI. Czytaj **przed** ETAPEM 2.

⬅️ [Indeks](./README.md) · Powiązane → [ETAP 2](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md) · [Matryca modeli](./05-MATRYCA-ROUTINGU-MODELI.md)

---

## B.1. Werdykt architektoniczny

Featherless (modele open-source) jest **dobry kosztowo i architektonicznie**, ale **NIE jako jedyny
mózg systemu**. Obowiązuje **architektura hybrydowa**:

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. DRAFT                                                             │
│    Featherski model open-source (np. Ebumping/Qwen3-32B-Fable)      │
│    generuje pierwszą wersję pisma.                                  │
│                              │                                       │
│                              ▼                                       │
│ 2. WERYFIKACJA                                                       │
│    citation-verifier  (apps/web/lib/ai/citation-verifier.ts)        │
│    hallucination-guard(apps/web/lib/ai/hallucination-guard.ts)      │
│    — działają na Claude/GPT, sprawdzają poprawność przepisów        │
│      (k.p.c., k.c.) i wyłapują halucynacje.                         │
│                              │                                       │
│                              ▼                                       │
│ 3. FALLBACK                                                          │
│    Gdy Featherless padnie / zwróci śmieć / model niedostępny →      │
│    callWithFallback() (llm-client.ts:142) schodzi na Claude.        │
└─────────────────────────────────────────────────────────────────────┘
```

**Kluczowe:** kod **już to wspiera** — `callWithFallback()`, `model-router.ts`, osobny
`citation-verifier` i `hallucination-guard` są dokładnie pod ten wzorzec zaprojektowane.

---

## B.2. Co jest DOBRE w podejściu Featherless ✅

- **Jeden endpoint OpenAI-compatible + abonament** = realnie tanio przy dużym wolumenie i
  trywialnie w integracji (kod ma już `provider: "openai"`).
- **Routing per-SaaS** (inny model do innego typu pisma) — architektonicznie słuszny;
  `model-router.ts` + `callWithFallback()` są pod to zaprojektowane.
- **Qwen3.6 faktycznie jest mocny w polskim** — to nie mit, Qwen wygrywa polskie benchmarki
  wśród modeli open-source.

---

## B.3. Ryzyka — wymaga zimnej głowy 🚩

### B.3.1 Oceny w rankingu to NIE benchmarki 🔴
Oceny w dokumencie to **subiektywne szacunki** („potencjalnie", „teoretycznie", „nieznane — 2 pobrania").
Model „#1" testowy ma 2 pobrania i zero testów społeczności. To **hipoteza, nie dowód jakości**.
**Nie wdrażaj** modelu z oceną „potencjał 8.5" bez własnych 30–50 testów (sam dokument to mówi w „Planie 7 dni").

### B.3.2 Halucynacje przepisów = ryzyko egzystencjalne 🔴
Modele **uncensored** (`huihui/Ablit`, `Heretic`) mają **wyższe** ryzyko halucynacji
(dokument ocenia je 6–7/10 w „brak halucynacji"). Dla pisma procesowego błędny art. k.p.c. =
przegrana klienta = odpowiedzialność firmy. **„Zero odmów" ≠ „zero błędów"** — to pułapka.
Uncensored kusi (model zawsze coś napisze), ale to najgorsza cecha do prawa **bez twardej walidacji**.
➡️ Dlatego krok 2 (citation-verifier na Claude/GPT) jest **obowiązkowy**.

### B.3.3 Kontekst 32K to mało 🟡
Pismo + dowody + załadowane przepisy + baza orzecznicza (RAG) łatwo przekracza 32K.
Zapas dają tylko:
- `lordx64/...Distilled` — **64K**,
- `cloudyu/gpt-oss-120b` — **128K**, ale **słaby polski (4/10)** → odpada.

➡️ Dla Długomata pilnuj rozmiaru promptu; gdy zbliża się do 32K — przytnij RAG / rozważ Distilled (64K).

### B.3.4 DENSE 32B/40B są wolne 🟡
DENSE generuje 35–50 s/pismo. Dla „masowo 500 pism dziennie" to wąskie gardło.
MoE jest szybsze, ale mniej spójne. **Klasyczny trade-off** — zmierz na realnym ruchu
(`Jackrong` 27B DENSE jest najszybszy: 20–25 s, dlatego jest fallbackiem).

### B.3.5 Dostępność modelu na Featherless 🔴
Featherless **rotuje** modele. `Ebumping` ma adapter **LoRA/PEFT** — dokument sam ostrzega
„sprawdź czy Featherless to obsługuje". Twój „król Długomata" może być chwilowo niedostępny.
➡️ Dlatego w chainie jest **solidny fallback (Jackrong → Claude)**.

---

## B.4. Reguły dla dewelopera (twarde)

1. **Żaden Featherski model nie idzie na produkcję bez 30–50 testów jakości PL** (zwłaszcza H).
2. **Każdy draft przechodzi przez `citation-verifier` + `hallucination-guard`** — nie wolno tego wyłączać.
3. **Chain zawsze kończy się na Claude** (bezpiecznik dostępności).
4. **Modele uncensored** (`huihui/Ablit`) używać tylko tam, gdzie zero-refusal jest potrzebny,
   i **zawsze** z weryfikacją cytatów.
5. **Monitoruj kontekst** — alarm, gdy prompt zbliża się do limitu okna modelu.
6. **Monitoruj koszty/tokeny** (`token-tracker.ts`) — abonament Featherless + opłaty Claude za weryfikację.

---

## B.5. Mapa kodu warstwy AI (dla orientacji)

| Plik | Rola |
|---|---|
| `apps/web/lib/ai/llm-client.ts` | klient LLM, `callLlm`, `callAnthropic`, `callOpenAi`, `callWithFallback`, circuit breaker |
| `apps/web/lib/ai/model-router.ts` | `MODEL_REGISTRY`, `ModelDescriptor`, `selectModel()`, `estimateCostGrosze()` |
| `apps/web/lib/ai/citation-verifier.ts` | weryfikacja poprawności cytowanych przepisów |
| `apps/web/lib/ai/hallucination-guard.ts` | wykrywanie halucynacji |
| `apps/web/lib/ai/generation-pipeline.ts` / `generation-v2.ts` | pipeline generacji pisma |
| `apps/web/lib/ai/rag-retriever.ts` / `rag/` | RAG (pgvector) |
| `apps/web/lib/ai/token-tracker.ts` / `usage-tracker.ts` | liczenie tokenów / kosztów |

---

## B.6. Podsumowanie jednym zdaniem

> **Featherski model pisze szybko i tanio; Claude pilnuje, żeby nie skłamał o przepisach;
> fallback gwarantuje, że system zawsze odpowie.** To jest hybryda — i kod już ją wspiera.
