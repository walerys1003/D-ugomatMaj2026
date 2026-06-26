# DODATEK A — Matryca routingu modeli (Featherless.ai)

> Źródło: dokument rankingowy „FULL CZERWIEC 21 — RANKING/OCENA 15 MODELI DLA 4 SAAS-ÓW".
> Ten dokument przekłada ranking na **konkretne wpisy** do `apps/web/lib/ai/model-router.ts`
> (`MODEL_REGISTRY` + `selectModel()`). Patrz [ETAP 2](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md).

⬅️ [Indeks](./README.md) · Powiązane → [Architektura/ryzyka](./06-ARCHITEKTURA-AI-I-RYZYKA.md)

> ⚠️ **Oceny w rankingu to subiektywne szacunki, NIE twarde benchmarki.** Część modeli ma
> „potencjał 8.5", „teoretycznie", „nieznane — 2 pobrania". **Każdy model przed produkcją
> wymaga 30–50 własnych testów** (plan 7-dniowy z dokumentu). Patrz [ryzyka](./06-ARCHITEKTURA-AI-I-RYZYKA.md).

---

## A.1. 7 wymiarów oceny (legenda)

| Skrót | Wymiar |
|---|---|
| **P** | Polski prawniczy |
| **R** | Rozumowanie |
| **S** | Spójność |
| **H** | Brak halucynacji |
| **U** | Uncensored (zero odmów) |
| **V** | Szybkość |
| **C** | Kontekst (okno) |

Wszystkie modele to fine-tune'y / merge **Qwen3.6-35B** (+ kilka Gemma / GPT-OSS).

---

## A.2. TOP 5 produkcyjny (ranking)

| # | Model (HF) | Średnia | Najlepszy do | Kontekst | Uwagi |
|---|---|---|---|---|---|
| 🥇 | `lordx64/Qwable-v1` (35B MoE) | 8.1 | uniwersalny #1 | 32K | ⚠️ tylko ~516❤️, mało testów społeczności; NIE uncensored |
| 🥈 | `huihui/Qwen3.6-35B-Opus-4.7-Ablit` | 8.0 | Mandatomat (9.1, zero odmów) | 32K | **uncensored 10/10** → wyższe ryzyko halucynacji |
| 🥉 | `lordx64/Qwen3.6-35B-Opus-4.7-Distilled` | 7.8 | Rozwodomat / Alimentomat | **64K** | duży kontekst (10/10), 9620❤️ |
| 4 | `Ebumping/Qwen3-32B-Fable-Distill` (DENSE) | 7.5 (pot. 8.5) | **Długomat (8.8, spójność)** | 32K | ⚠️ adapter **LoRA/PEFT** — sprawdź dostępność na Featherless; 371❤️ |
| 5 | `Jackrong/Qwen3.5-27B-Opus-4.6` (DENSE 27B) | 7.3 | fallback, **najszybszy** (20–25s) | 32K | 2890❤️ |

---

## A.3. Routing per-SaaS (z dokumentu)

| SaaS / typ pisma | PRIMARY | FALLBACK | Zero-refusal (uncensored) |
|---|---|---|---|
| **DŁUGOMAT** | `Ebumping/Qwen3-32B-Fable-Distill` (spójność 10/10) | `Jackrong/Qwen3.5-27B-Opus-4.6` (najszybszy) | `huihui/...Opus-4.7-Ablit` |
| Mandatomat | `huihui/...Opus-4.7-Ablit` (9.1, zero odmów) | — | — |
| Rozwodomat / Alimentomat | `lordx64/...Opus-4.7-Distilled` (64K kontekst) | — | — |
| Uniwersalny | `lordx64/Qwable-v1` (MoE) | — | — |

> **Dla naszego wdrożenia (Długomat)** liczy się głównie pierwszy wiersz. Te trzy modele są
> dodane do `MODEL_REGISTRY` w [ETAP 2 / ZADANIE 2.3](./02-ETAP-2-INTEGRACJA-AI-FEATHERLESS.md#24-zadanie-23--dodać-modele-featherless-do-model_registry).

---

## A.4. Mapowanie ranking → kod (`MODEL_REGISTRY`)

| Klucz w `MODEL_REGISTRY` | `id` (HF) | `provider` | `tier` | `context_window` |
|---|---|---|---|---|
| `featherless/ebumping-qwen3-32b-fable` | `Ebumping/Qwen3-32B-Fable-Distill` | `openai` | `standard` | `32_000` |
| `featherless/jackrong-qwen3-5-27b-opus` | `Jackrong/Qwen3.5-27B-Opus-4.6` | `openai` | `fast` | `32_000` |
| `featherless/huihui-qwen3-6-35b-opus-ablit` | `huihui/Qwen3.6-35B-Opus-4.7-Ablit` | `openai` | `standard` | `32_000` |

Chain dla `selectModel("document_draft")`:
```
primary:   featherless/ebumping-qwen3-32b-fable
fallback1: featherless/jackrong-qwen3-5-27b-opus
fallback2: claude-sonnet-4-5            ← bezpiecznik hybrydowy
```

---

## A.5. Modele ODRZUCONE (nie wdrażać)

Z dokumentu — nie dodajemy ich do rejestru:

- `Kimi-K2.6`
- `hiebo 34B-80L`
- `empero Qwythos-9B`
- `Ex0bit MYTHOS-26B`
- `empero Qwable-9B`

Inne (warunkowo / niszowo):
- `DavidAU/Qwen3.6-40B-Heretic` (DENSE, uncensored, **wolny ~40–50s**)
- `Lambent/Fabled-Gemma4-31B` (**słaby polski 5/10**)
- `cloudyu/gpt-oss-120b-Fable-5` (**128K kontekst**, ale **słaby polski 4/10**)

---

## A.6. Plan testów 7-dniowy (z dokumentu — STRESZCZENIE)

> Pełny plan jest w pliku rankingowym. Esencja przed produkcją:

1. **Dzień 1–2:** smoke test dostępności modeli na Featherless (czy `Ebumping` z LoRA w ogóle działa).
2. **Dzień 3–5:** 30–50 realnych pism per typ; ocena P/R/S/H (zwłaszcza **H — brak halucynacji przepisów**).
3. **Dzień 6:** test kontekstu (pismo + dowody + przepisy + RAG — czy mieści się w 32K).
4. **Dzień 7:** test fallbacku (wymuś awarię Featherless → czy chain schodzi na Claude).

Kryterium akceptacji: **0 halucynacji przepisów** w próbce + spójność ≥ 8/10.

➡️ Szczegóły ryzyk i architektura hybrydowa: [`06-ARCHITEKTURA-AI-I-RYZYKA.md`](./06-ARCHITEKTURA-AI-I-RYZYKA.md).
