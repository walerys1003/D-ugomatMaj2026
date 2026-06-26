# ETAP 2 — Integracja AI: Featherless.ai (OpenAI-compatible)

> **Cel:** podpiąć **Featherless.ai** (SaaS hostujący modele open-source z HuggingFace przez
> jeden endpoint **OpenAI-compatible**) jako generator draftów pism, z zachowaniem
> **architektury hybrydowej** (weryfikacja cytatów na Claude/GPT + fallback).
> **Czas:** ~0,5 dnia. **Trudność:** średnia (zmiany w 2 plikach + testy).

⬅️ [ETAP 1](./01-ETAP-1-BAZA-SUPABASE.md) · [Indeks](./README.md) · Następny → [ETAP 3: Integracje](./03-ETAP-3-INTEGRACJE-ZEWNETRZNE.md)

> 🔴 **Zanim zaczniesz kodować — przeczytaj** [`06-ARCHITEKTURA-AI-I-RYZYKA.md`](./06-ARCHITEKTURA-AI-I-RYZYKA.md).
> Tam jest uzasadnienie, dlaczego Featherski model **nie jest** jedynym mózgiem systemu i dlaczego
> halucynacje przepisów to ryzyko egzystencjalne. Matryca „który model do którego pisma" →
> [`05-MATRYCA-ROUTINGU-MODELI.md`](./05-MATRYCA-ROUTINGU-MODELI.md).

---

## 2.0. Sprostowanie nazwy (ważne dla nowego dewelopera)

W rozmowach pojawiało się „Fathomless" — to **pomyłka**. Właściwa nazwa to **Featherless.ai**:

- **Featherless.ai** — SaaS z abonamentem, hostuje tysiące modeli open-source z HuggingFace
  przez **jeden endpoint OpenAI-compatible** (`https://api.featherless.ai/v1`). ✅
- „Fathomless" — w kontekście legal-AI marka praktycznie nie istnieje. Ignorujemy.

Skoro Featherless jest **OpenAI-compatible**, integracja sprowadza się do:
1) zmiany **base URL** w istniejącym kliencie OpenAI, 2) dodania modeli do rejestru, 3) ustawienia kluczy.

---

## 2.1. Diagnoza — gdzie jest „jedyna przeszkoda"

Warstwa AI jest dojrzała. Klient LLM (`apps/web/lib/ai/llm-client.ts`) ma już abstrakcję providerów,
circuit breaker i `callWithFallback()`. **Problem:** funkcja `callOpenAi()` ma **zaszyty na sztywno**
URL OpenAI.

`apps/web/lib/ai/llm-client.ts:111-140` (fragment, stan obecny):

```ts
async function callOpenAi(req: LlmRequest): Promise<LlmResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  const body = {
    model: req.model.id,
    messages: req.messages,
    max_tokens: req.max_tokens ?? 2048,
    temperature: req.temperature ?? 0.2,
    stop: req.stop,
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {   // ← HARDCODED (linia ~121)
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`openai_${r.status}`);
  const j: any = await r.json();
  const choice = j.choices?.[0];
  const inputTokens = j.usage?.prompt_tokens ?? 0;
  const outputTokens = j.usage?.completion_tokens ?? 0;
  return {
    text: choice?.message?.content ?? "",
    model_id: req.model.id,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_grosze: estimateCostGrosze(req.model, inputTokens, outputTokens),
    latency_ms: 0,
    finish_reason: choice?.finish_reason === "length" ? "length" : "stop",
  };
}
```

Rejestr modeli (`apps/web/lib/ai/model-router.ts:8-60`) ma interfejs `ModelDescriptor`,
ale **bez pola `baseUrl`** — trzeba je dodać, żeby każdy model mógł wskazać własny endpoint.

---

## 2.2. ZADANIE 2.1 — Dodać pole `baseUrl` do `ModelDescriptor`

Plik: `apps/web/lib/ai/model-router.ts`

**Zmiana w interfejsie** (`model-router.ts:8-17`):

```ts
export interface ModelDescriptor {
  id: string;
  provider: ModelProvider;
  tier: ModelTier;
  context_window: number;
  input_cost_per_1k_grosze: number; // 1 grosz = 0.01 PLN
  output_cost_per_1k_grosze: number;
  supports_tools: boolean;
  supports_vision: boolean;
  /** Opcjonalny endpoint OpenAI-compatible. Gdy pusty → domyślny URL providera. */
  baseUrl?: string;
}
```

> To pole jest **opcjonalne** — istniejące modele (Claude, GPT) nie wymagają zmian.

---

## 2.3. ZADANIE 2.2 — Sparametryzować base URL w `callOpenAi()`

Plik: `apps/web/lib/ai/llm-client.ts` (linia ~121).

Zamień zaszyty URL na wybór: `model.baseUrl` → `OPENAI_BASE_URL` (env) → domyślny OpenAI.

```ts
async function callOpenAi(req: LlmRequest): Promise<LlmResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  // Wybór endpointu: per-model baseUrl > env OPENAI_BASE_URL > domyślny OpenAI.
  const baseUrl =
    req.model.baseUrl ??
    process.env.OPENAI_BASE_URL ??
    "https://api.openai.com/v1";

  const body = {
    model: req.model.id,
    messages: req.messages,
    max_tokens: req.max_tokens ?? 2048,
    temperature: req.temperature ?? 0.2,
    stop: req.stop,
  };
  const r = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {  // ← już NIE hardcoded
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`openai_${r.status}`);
  // ... reszta bez zmian (parsowanie j.choices / j.usage) ...
}
```

> `.replace(/\/$/, "")` usuwa ewentualny końcowy slash, żeby nie zrobić `//chat/completions`.
> **Reszta funkcji bez zmian** — Featherless zwraca ten sam kształt odpowiedzi co OpenAI
> (`choices[].message.content`, `usage.prompt_tokens`, `usage.completion_tokens`).

---

## 2.4. ZADANIE 2.3 — Dodać modele Featherless do `MODEL_REGISTRY`

Plik: `apps/web/lib/ai/model-router.ts` (`MODEL_REGISTRY`, linia ~19).

Dodaj wpisy dla modeli z [matrycy routingu](./05-MATRYCA-ROUTINGU-MODELI.md). `id` = dokładna nazwa
modelu z HuggingFace (taka, jaką akceptuje Featherless), `provider: "openai"`, `baseUrl` = endpoint Featherless.

```ts
export const MODEL_REGISTRY: Record<string, ModelDescriptor> = {
  // ... istniejące claude-sonnet-4-5, claude-haiku-4, gpt-4o, gpt-4o-mini ...

  // --- Featherless.ai (open-source, OpenAI-compatible) ----------------------
  // PRIMARY dla Długomata — DENSE, spójność 10/10 (wg dokumentu rankingowego)
  "featherless/ebumping-qwen3-32b-fable": {
    id: "Ebumping/Qwen3-32B-Fable-Distill",   // dokładna nazwa z HF
    provider: "openai",
    tier: "standard",
    context_window: 32_000,
    input_cost_per_1k_grosze: 1,   // ⚠️ zweryfikuj realny cennik Featherless / abonament
    output_cost_per_1k_grosze: 1,
    supports_tools: false,
    supports_vision: false,
    baseUrl: process.env.FEATHERLESS_BASE_URL ?? "https://api.featherless.ai/v1",
  },
  // FALLBACK — najszybszy DENSE 27B
  "featherless/jackrong-qwen3-5-27b-opus": {
    id: "Jackrong/Qwen3.5-27B-Opus-4.6",
    provider: "openai",
    tier: "fast",
    context_window: 32_000,
    input_cost_per_1k_grosze: 1,
    output_cost_per_1k_grosze: 1,
    supports_tools: false,
    supports_vision: false,
    baseUrl: process.env.FEATHERLESS_BASE_URL ?? "https://api.featherless.ai/v1",
  },
  // ZERO-REFUSAL (uncensored) — używać OSTROŻNIE, tylko z twardą weryfikacją cytatów
  "featherless/huihui-qwen3-6-35b-opus-ablit": {
    id: "huihui/Qwen3.6-35B-Opus-4.7-Ablit",
    provider: "openai",
    tier: "standard",
    context_window: 32_000,
    input_cost_per_1k_grosze: 1,
    output_cost_per_1k_grosze: 1,
    supports_tools: false,
    supports_vision: false,
    baseUrl: process.env.FEATHERLESS_BASE_URL ?? "https://api.featherless.ai/v1",
  },
};
```

> ⚠️ **Koszty** (`*_grosze`) są **placeholderami**. Featherless rozlicza abonamentowo, nie per-token.
> Token-tracker (`apps/web/lib/ai/token-tracker.ts`) i tak potrzebuje liczb do statystyk —
> wpisz wartości spójne z Twoim planem (lub 0/0 jeśli liczysz tylko zużycie tokenów, nie koszt).

---

## 2.5. ZADANIE 2.4 — Wpiąć Featherski model do routingu Długomata

Plik: `apps/web/lib/ai/model-router.ts` → funkcja `selectModel()` (linia ~68).

Dla `taskType: "document_draft"` ustaw chain: **Featherless primary → Featherless fallback → Claude**
(hybryda — Claude jako ostatnia deska ratunku, gdy Featherless padnie):

```ts
if (opts.taskType === "legal_reasoning" || opts.taskType === "document_draft") {
  if (quality === "premium") {
    return {
      primary: MODEL_REGISTRY["featherless/ebumping-qwen3-32b-fable"],
      fallbacks: [
        MODEL_REGISTRY["featherless/jackrong-qwen3-5-27b-opus"],
        MODEL_REGISTRY["claude-sonnet-4-5"],   // 🔴 fallback bezpieczeństwa (hybryda)
      ],
      reason: "dlugomat_featherless_hybrid",
    };
  }
  // ... wariant standard bez zmian albo analogicznie ...
}
```

> **Dlaczego Claude w fallbacku?** Featherless rotuje modele i Ebumping ma adapter **LoRA/PEFT** —
> może być chwilowo niedostępny. `callWithFallback()` (`llm-client.ts:142`) automatycznie zejdzie
> niżej po łańcuchu. To realizuje architekturę hybrydową.

---

## 2.6. ZADANIE 2.5 — Ustawić zmienne środowiskowe

Dodaj do `apps/web/.env.local` (i później do Vercel — ETAP 4):

```bash
# AI — Featherless.ai (OpenAI-compatible)
OPENAI_API_KEY=<klucz API z panelu Featherless>
OPENAI_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1   # używane przez baseUrl w MODEL_REGISTRY

# AI — Claude (weryfikator cytatów + fallback) — patrz sekcja "AI — Claude" w .env.example
ANTHROPIC_API_KEY=<klucz Anthropic>
```

> 🟡 **Uwaga:** `.env.example` nie ma jeszcze `OPENAI_BASE_URL` / `FEATHERLESS_BASE_URL`.
> Dopisz je do `.env.example` (bez wartości-sekretów), żeby kolejny deweloper wiedział, że istnieją:
> ```bash
> # AI — OpenAI-compatible / Featherless
> OPENAI_API_KEY=
> OPENAI_BASE_URL=https://api.featherless.ai/v1
> FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
> ```

---

## 2.7. ZADANIE 2.6 — Test integracji (krytyczny przed produkcją)

### 2.6.1 Smoke test (czy endpoint w ogóle odpowiada)

```bash
curl https://api.featherless.ai/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Ebumping/Qwen3-32B-Fable-Distill",
    "messages": [{"role":"user","content":"Napisz jedno zdanie po polsku."}],
    "max_tokens": 64
  }'
```

**Sprawdź w odpowiedzi:**
- [ ] `choices[0].message.content` — jest tekst (po polsku, sensowny).
- [ ] `usage.prompt_tokens` i `usage.completion_tokens` — **są obecne** (token-tracker/billing tego wymaga!).
- [ ] model **istnieje** na Featherless (czy nazwa/`LoRA` jest dostępna — patrz ryzyka).

### 2.6.2 Test E2E przez aplikację

1. Odpal aplikację z realnymi kluczami (po ETAPIE 1).
2. Wygeneruj testowe pismo (np. sprzeciw EPU) przez panel.
3. Zweryfikuj, że:
   - [ ] draft powstał z **Featherskiego** modelu (sprawdź logi / `model_id` w odpowiedzi),
   - [ ] `citation-verifier` (`apps/web/lib/ai/citation-verifier.ts`) i
         `hallucination-guard` (`apps/web/lib/ai/hallucination-guard.ts`) **uruchomiły się** na drafcie,
   - [ ] przy wymuszonym błędzie Featherless (np. zły klucz) chain **spadł na Claude** (fallback).

### 2.6.3 Test jakości PL (min. 30–50 pism — zgodnie z planem z dokumentu rankingowego)

> 🔴 **Nie wdrażaj na produkcję modelu z oceną „potencjał 8.5" bez własnych testów.**
> Oceny w dokumencie rankingowym to **subiektywne szacunki**, nie twarde benchmarki.
> Model „#1" miał 2 pobrania i zero testów społeczności. Przetestuj realnie 30–50 pism per typ,
> sprawdzając: poprawność przepisów (k.p.c., k.c.), spójność, brak halucynacji, długość kontekstu.

---

## 2.8. Definition of Done — ETAP 2

- [ ] `ModelDescriptor` ma pole `baseUrl?`.
- [ ] `callOpenAi()` używa `model.baseUrl ?? OPENAI_BASE_URL ?? domyślny` (URL **nie** zaszyty).
- [ ] Modele Featherless w `MODEL_REGISTRY` (primary/fallback/zero-refusal).
- [ ] `selectModel("document_draft")` zwraca chain Featherless → Featherless → Claude.
- [ ] `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `FEATHERLESS_BASE_URL`, `ANTHROPIC_API_KEY` ustawione.
- [ ] Smoke test curl: zwraca tekst + `usage.*`.
- [ ] Test E2E: draft (Featherless) → weryfikacja cytatów → fallback Claude działa.
- [ ] Min. 30–50 testów jakości PL per typ pisma — wynik zaakceptowany.
- [ ] `npx tsc --noEmit` i `next build` → EXIT 0 po zmianach.

✅ Po odhaczeniu → **[ETAP 3: Integracje zewnętrzne](./03-ETAP-3-INTEGRACJE-ZEWNETRZNE.md)**.
