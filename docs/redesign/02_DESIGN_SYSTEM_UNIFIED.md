# 02 — Design System Unified: „Tarcza v4 Stoic+"

> **Cel:** jeden, niepodważalny zestaw tokenów i komponentów dla **całej** aplikacji — landing, panel user, panel admin. Po wdrożeniu tego dokumentu w repo istnieje dokładnie **jeden** design system, a `iron-*` i `v5/tokens.css` są wygaszone.
> **Punkt wyjścia:** istniejący „Tarcza v3 Stoic" (`tailwind.config.ts`, `styles/globals.css`) — dobry fundament, wymaga konsolidacji (problemy DS-1…DS-5 z `00`).

---

## 0. Filozofia: „wrażenie potęgi firmowej"

Długomat broni ludzi w najgorszym momencie życia (dług, komornik, sąd). Design musi komunikować **autorytet instytucji + spokój + dowód** — estetyka klasy Stripe/Linear/Vercel, ale w tonie kancelarii prawnej, nie startupu.

Cztery zasady wizualne:
1. **Cisza zamiast hałasu.** Dużo białej przestrzeni, jeden akcent na sekcję, zero dekoracyjnego koloru.
2. **Dowód zamiast obietnicy.** Każdy claim ma liczbę, źródło prawne lub artefakt (fragment pisma).
3. **Gęstość w panelu, oddech na landingu.** Panel = operations console (Linear). Landing = editorial (Stripe).
4. **Navy = autorytet, zieleń = sukces (tylko), bursztyn/czerwień = termin/ryzyko (tylko z liczbą).** Kolor nigdy nie jest dekoracją.

---

## 1. Decyzja architektoniczna: konsolidacja trzech systemów

| System | Status dziś | Decyzja | Uzasadnienie |
|---|---|---|---|
| `iron-*` | deprecated, ale w semantyce (`--foreground` itd.) | **WYGASIĆ** → remap semantyki na `ink-*` | DS-1, DS-3: deprecated token nie może być sercem semantyki |
| `ink-*` | nowy, true-neutral | **KANON** — jedyna skala neutralna | czysta achromatyka, brak „demo banku" castu |
| `--v5-*` (`styles/v5/tokens.css`) | równoległy system | **ABSORBOWAĆ** — przenieść unikatowe wartości do kanonu, usunąć import | DS-2: dwa systemy w jednej apce to dług nie do utrzymania |

### Decyzja „v5"
`v5/*` to nie osobny produkt, lecz **wcześniejszy szkic tego samego kierunku** („Ultra Enterprise AI-Native Legal OS"). Postępowanie:
1. Wziąć **dobre wzorce** z `components/v5/*` (reasoning, motion, panel) jako inspirację dla kanonicznych komponentów.
2. Tokeny `--v5-*` → zmapować 1:1 na kanon (navy/accent/ink) tam gdzie dublują; usunąć resztę.
3. Route'y `app/v5/*` → wygasić po przeniesieniu unikatowej wartości na kanon (`05` roadmapa).
4. **Jeden import w `globals.css`** — bez `@import "./v5/tokens.css"`.

---

## 2. Tokeny kolorów (kanon)

### 2.1. Skale brandowe (zostają, bez zmian wartości)

| Skala | Rola | Klucz |
|---|---|---|
| `dlugomat-*` (Shield Navy) | primary, autorytet, chrome | `--dlugomat-50…950` |
| `accent-*` (Controlled Hope Green) | **wyłącznie** sukces/ukończenie | `--accent-50…700` |
| `warn-*` (bursztyn) | termin/uwaga **tylko z kontekstem liczbowym** | `--warn-50…600` |
| `danger-*` (czerwień) | błąd/ryzyko **tylko z kontekstem** | `--danger-50…700` |
| `ink-*` (true neutral) | **wszystko inne**: body, border, tła neutralne | `--ink-50…950` |

### 2.2. Zmiana semantyki (to jest sedno konsolidacji)

```css
/* PRZED (globals.css dziś) — semantyka oparta na iron-* */
--foreground: var(--iron-900);
--border:     var(--iron-200);
--muted:      var(--iron-100);

/* PO (kanon v4) — semantyka oparta na ink-* */
--foreground: var(--ink-900);
--border:     var(--ink-200);
--muted:      var(--ink-100);
--muted-foreground: var(--ink-600);
--secondary:  var(--ink-100);
--card-foreground: var(--ink-900);
--popover-foreground: var(--ink-900);
```

> `iron-*` pozostaje **tylko** jako alias kompatybilności (te same wartości co `ink-*` — już dziś są zremapowane w `globals.css`). Nowy kod **nie używa** `iron-*`. Codemod `iron-→ink-` w `05`.

### 2.3. Tokeny semantyczne (pełna lista, light + dark)

| Token | Light | Dark | Użycie |
|---|---|---|---|
| `--background` | `0 0% 100%` | `--dlugomat-950` | tło strony |
| `--foreground` | `--ink-900` | `0 0% 98%` | tekst główny |
| `--card` | `0 0% 100%` | `--dlugomat-900` | karta |
| `--primary` | `--dlugomat-700` | `--dlugomat-500` | CTA, akcja główna |
| `--accent` | `--accent-500` | `--accent-500` | sukces |
| `--border` | `--ink-200` | `--dlugomat-850` | obramowania |
| `--ring` | `--dlugomat-500` | `--dlugomat-400` | focus |
| `--destructive` | `--danger-600` | `--danger-500` | usuwanie |

---

## 3. Typografia (kanon — zostaje z v3, czyszczenie aliasów)

- **Rodziny:** Inter (UI/sans + display alias), IBM Plex Serif (długie treści prawne), JetBrains Mono (sygnatury, kody). Ładowane przez `next/font` w `app/layout.tsx`. ✅ bez zmian.
- **Skala modularna 1.250 (Major Third)** — `xs 12 → 7xl 72`. ✅ zostaje.
- **Czyszczenie:** aliasy `fluid-*` (DS-4) oznaczone jako **DEPRECATED**, do usunięcia po codemodzie JSX. Nowy kod używa wyłącznie kluczy kanonicznych (`text-base`, `text-2xl`...).
- **Komponenty typografii:** `<Display>`, `<Heading>`, `<Text>`, `<Eyebrow>`, `<Mono>` (`components/ui/typography.tsx`) — jedyny sposób renderowania tekstu w nowych ekranach (zakaz surowych `<h1 className="text-5xl">`).

### Hierarchia (wiążąca)
| Element | Komponent | Rozmiar | Waga |
|---|---|---|---|
| Hero H1 | `<Display level={1}>` | `5xl→7xl` clamp | 600 |
| Sekcja H2 | `<Heading level={2}>` | `3xl/4xl` | 600 |
| Karta H3 | `<Heading level={3}>` | `xl/2xl` | 600 |
| Body | `<Text size="base">` | `15px` | 400 |
| Eyebrow | `<Eyebrow>` | `xs` uppercase tracking | 500 |
| Sygnatura/kwota | `<Mono>` | `sm` tabular-nums | 500 |

---

## 4. Przestrzeń, promienie, cienie, ruch (kanon — z v3)

- **8pt grid.** Tailwind `1=4px` mapuje 1:1. Tokeny semantyczne: `header 56px`, `sidebar 256px`, `section-y 96px`. ✅
- **Promienie „Stoic":** `sm 4 → DEFAULT 6 → md 8 → lg 10 → xl 14`. `rounded-full` tylko avatary. ✅
- **Cienie:** tinted navy, zawsze para warstw, `sm/md/lg/xl` przez CSS-var (auto-bump w dark). ✅
- **Ruch:** „calm-confident", nigdy bouncy. Czasy `snappy 120 / base 200 / smooth 280 / deliberate 360`. Easing `shield-out/in/inout`. ✅
- **Zasada ruchu:** animacja tylko jako feedback (fade-up wejścia sekcji, focus-ring). Zero parallax, zero auto-play.

---

## 5. Biblioteka komponentów (kanon)

### 5.1. Primitives (istnieją w `components/ui` — 29 szt., zostają)
`button`, `card`, `surface`, `section`, `container`, `badge`, `input`, `textarea`, `label`, `form-field`, `dialog`, `dropdown-menu`, `tabs`, `accordion`, `tooltip`, `contextual-tooltip`, `toast`, `progress`, `skeleton`, `page-skeleton`, `empty-state`, `divider`, `typography`, `icon`, `kbd`, `announcement-bar`, `cookie-consent`, `optimized-image`, `csrf-input`.

### 5.2. Komponenty do dodania/ujednolicenia (z absorpcji v5 + braki)
| Komponent | Po co | Źródło |
|---|---|---|
| `StatCard` / `KpiCard` | metryki w panelu i adminie (jeden wzorzec) | unifikacja z `v5/panel` |
| `DataTable` | tabele spraw/użytkowników/faktur (sort, filtr, paginacja) | brak kanonicznej |
| `Timeline` | oś czasu sprawy (krok 1.timeline z `01`) | z `lib/cases/timeline` |
| `ReasoningTrace` | wizualizacja IRAC / chain-of-thought | `components/v5/reasoning` |
| `DocumentArtifact` | podgląd fragmentu pisma (hero + panel) | z `hero.tsx` 2-panel |
| `RoleBadge` / `PlanBadge` | sygnalizacja roli/planu w nawigacji warunkowej (`04`) | nowy |
| `AppShell` (zunifikowany) | jeden shell dla user+admin (różnica = treść nav) | merge `app-shell` + `(admin)/layout` |

### 5.3. Zasady komponentów
1. Każdy primitive ma warianty przez `cva` (class-variance-authority), nie przez ad-hoc className.
2. Ikony **wyłącznie** z `lucide-react` (spójny zestaw, już używany). Zero emoji w UI produktu.
3. Stany: każdy komponent interaktywny ma `default / hover / focus-visible / active / disabled / loading`.
4. A11y: `focus-visible` ring (`--ring`), kontrast ≥ WCAG AA, `aria-*` na każdym interaktywnym.

---

## 6. Brand mark / logo

- `components/layout/logo.tsx` — jedyne źródło znaku. Wektorowa „tarcza" + wordmark „Długomat".
- Warianty: pełny (header), sam znak (sidebar collapsed, favicon, OG), monochrom (druk pism).
- Zakaz: rastrowy logotyp, emoji-tarcza, zmienne kolory poza navy/biel/mono.

---

## 7. Dark mode

- Jedna strategia: `.dark` scope (`darkMode: ["class"]`), bootstrap synchroniczny w `layout.tsx` (anty-FOUC). ✅ istnieje.
- W dark: `--background = dlugomat-950`, chrome navy, cienie auto-bump. Akcenty (accent/warn/danger) bez zmiany odcienia, tylko jasność tła.

---

## 8. Definicja „spójny" (checklista akceptacji)

Ekran jest zgodny z design systemem, gdy:
- [ ] używa wyłącznie tokenów semantycznych (`bg-background`, `text-foreground`, `border-border`...) lub skal kanonicznych (`ink/dlugomat/accent/warn/danger`), **zero `iron-*` w nowym kodzie**;
- [ ] tekst przez komponenty `<Display/Heading/Text/...>`;
- [ ] ikony z `lucide-react`, zero emoji;
- [ ] promienie/cienie/odstępy z tokenów (8pt grid);
- [ ] ma komplet stanów + focus-visible + AA kontrast;
- [ ] nie importuje `styles/v5/tokens.css` ani `components/v5/*` bez decyzji absorpcji.

---

## 9. Co wdrożyć teraz vs później (link do `05`)

| Zakres | Kiedy | Dokument |
|---|---|---|
| Remap semantyki `iron→ink` w `globals.css` | Fala 1 (fundament) | `05` |
| Usunięcie importu `v5/tokens.css` + absorpcja wartości | Fala 1 | `05` |
| Codemod `iron-*`→`ink-*` w JSX (2309 wystąpień) | Fala 2 | `05` |
| Nowe komponenty (`DataTable`, `Timeline`, `ReasoningTrace`) | Fala 2–3 | `05` |
| Wygaszenie `app/v5/*` | Fala 3 | `05` |

> **Fundament wdrażany w tym PR:** sekcje §2.2 (semantyka), §5.2 (lista komponentów), oraz przełomowy landing (`03`) zbudowany **wyłącznie** na tokenach kanonicznych — jako referencyjny dowód spójności.
