# VISUAL DELTA v2 → v3 "Stoic"

> Dokument źródłowy decyzji projektowych Tarcza v3. Spis konkretnych defektów
> Tarcza v2 (commit `d02c5ec`) z odniesieniem `file:line`, plus filozofia v3.
> Nie estetyka abstrakcyjna — obserwowalne odchyłki względem benchmarków
> Linear / Stripe / Vercel / Raycast / Notion / Arc / Anthropic.

---

## 1. SKĄD W OGÓLE WRAŻENIE "ZA MIĘKKO"

Cztery niezależne źródła miękkości w obecnym DS:

| # | Źródło | Token | Problem |
|---|---|---|---|
| 1 | Cienie | `shadow-card = 0 2px 6px -1px /0.06` | Na białym tle praktycznie znikają. Linear używa 0.08–0.12 na średnich warstwach. |
| 2 | Promienie | `rounded-lg = 12px` na CTA + 20px na hero panelach | Mix 12/20 plus borders `rounded-full` na badge'ach daje "pill UI". Linear: 6/8/10/12 z dominantą 6. |
| 3 | Neutralne kolory | iron HSL `215 14% 47%` (lekko niebieski) | Wszystkie szarości mają niebieski tint → cały UI „pływa" w odcieniach navy. Linear/Stripe używają **true neutral** (HSL `0 0% X%`). |
| 4 | Skala typografii | `fluid-xs..6xl` na clamp(), ale nie modularna (mnożnik niespójny: 1.17, 1.13, 1.17, 1.20, 1.27, 1.27, 1.27) | Nie czuć rytmu pionowego. Modular 1.250 (Major Third) lub 1.200 (Minor Third) ujednolica. |

Każde z tych źródeł sam w sobie nie jest błędem — ale **suma czterech** = template-look.

---

## 2. KONKRETNE DEFEKTY — DOWODY

### 2.1 Hierarchia typograficzna: 3 niezależne systemy w jednym landingu

```
components/landing/hero.tsx:27       text-4xl sm:text-5xl              ← raw Tailwind
components/landing/ai-showcase.tsx:61 text-fluid-4xl                    ← fluid scale
components/landing/modules.tsx:44     text-3xl sm:text-4xl              ← raw Tailwind
components/landing/how-it-works.tsx:47 text-3xl sm:text-4xl             ← raw Tailwind
components/landing/cta-band.tsx:21    text-3xl sm:text-4xl              ← raw Tailwind
components/landing/trust-bar.tsx:50   text-fluid-3xl                    ← fluid scale
styles/globals.css:151                h2 { text-fluid-4xl }             ← element default
```

**Dowód miękkości:** 3 systemy headlinów na jednej stronie. Hero renderuje 4xl
desktop, modules grid 4xl desktop — **niemal identyczna waga** zamiast
hierarchii poziomów.

**Fix v3:** Wprowadzić primitive `<Display level=1|2|3>`, `<Heading
level=1..4>`, `<Text size>`, `<Eyebrow>`, `<Mono>`. **Surowe `text-3xl`
zabronione** poza prymitywami. Element-default w `globals.css` usunięte —
hierarchia tylko explicit.

---

### 2.2 Wysokości headerów / paddingi sekcji: chaos

```
components/layout/site-header.tsx:40   h-16        (64px)
components/landing/hero.tsx:19         py-16 ... py-24
components/landing/how-it-works.tsx:43 py-20
components/landing/modules.tsx:40      py-20
components/landing/cta-band.tsx:13     py-20
components/ui/section.tsx:37–39        compact py-14/20/24, regular py-24/32/40, spacious py-32/48/60
```

Stare sekcje (modules, how-it-works, cta-band) używają `py-20` ad-hoc, **nie
zostały zmigrowane do `<Section>`**, mimo że primitive istnieje od v2. Tylko
AIShowcase i TrustBar użyły `<Section>` → niespójny rytm pionowy.

**Fix v3:** Migracja **wszystkich** sekcji landingu na `<Section>`. Density
tightened do `8pt-grid`: compact 64/96/96, regular 96/128/128, spacious
128/160/160 (każdy = wielokrotność 32px).

---

### 2.3 Cards / Surfaces: dwa równolegle używane primitivy

```
components/landing/hero.tsx:80         <Card elevation="pop">      ← stary Card
components/landing/modules.tsx:55      <Card elevation="..." urgency="..."> ← stary Card
components/landing/how-it-works.tsx:58 <Card elevation="subtle">   ← stary Card
components/landing/cta-band.tsx:15     <Card elevation="pop" urgency="warning"> ← stary Card
components/landing/ai-showcase.tsx:73,99,121 <Surface elevation="raised|flat"> ← nowy Surface
components/landing/trust-bar.tsx:61,78 raw <li className="rounded-lg border..."> ← raw divy
```

3 sposoby renderowania "boxa" na jednej stronie. `Card` i `Surface` współistnieją,
TrustBar i jego compliance row pomijają oba prymitywy i renderują raw.

**Fix v3:** `Card` legacy → re-export wewnętrzny `Surface` (kompatybilność
wsteczna). Wszystkie ad-hoc `rounded-lg border ...` → `<Surface>`. Wprowadzić
nowy primitive `<Stat>` dla KPI tile (TrustBar + Panel dashboard używają
identycznego wzorca z duplikacją kodu).

---

### 2.4 Border-radius: skala niesystemowa

```
tailwind.config.ts:155-163
sm:      4px
DEFAULT: 8px
md:      8px  ← alias do DEFAULT
lg:      12px
xl:      20px
2xl:     28px
```

Skok 12→20→28 jest niemodularny (mnożnik 1.67, 1.40). Razem z `rounded-full`
na Badge'ach + `rounded-md` na ikonkach → minimum 4 promieni na jednym
ekranie.

**Fix v3:** Tarcza v3 radius scale (Linear-grade):
```
xs:   2px   — kbd, tooltip arrow
sm:   4px   — input, button, kbd
DEF:  6px   — primary CTA, card-tight
md:   8px   — surface raised
lg:   10px  — surface floating, hero panel
xl:   14px  — empty-state hero
full:       — only avatars
```
Pill (`rounded-full`) wycofany z Badge'a na rzecz `rounded-sm`. Badges
Linear/Stripe/Anthropic są kwadratowe lub bardzo subtelnie zaokrąglone.

---

### 2.5 Cienie: znikają na białym tle

```
tailwind.config.ts:166-172
subtle: 0 1px 2px /0.04         ← w UI nie istnieje (oko nie widzi)
card:   0 2px 6px -1px /0.06 + 0 1px 2px /0.04   ← ledwo widoczny
pop:    0 10px 24px -8px /0.18 + 0 4px 8px -4px /0.08
```

**Dowód:** `Surface elevation="raised"` na `bg-card` (białe) z `shadow-card` =
niemal niewidzialny przyrost vs `elevation="flat"`. Pierwsze wrażenie:
"wszystko leży na tym samym poziomie".

**Fix v3:** Inspiracja Linear/Notion — cień **kierunkowy + delikatny color
tint** zamiast czystego black/0.04.
```
sm:  0 1px 2px hsl(220 40% 8% / 0.05), 0 1px 1px hsl(220 40% 8% / 0.04)
md:  0 4px 8px -2px hsl(220 40% 8% / 0.08), 0 2px 4px -2px hsl(220 40% 8% / 0.05)
lg:  0 12px 24px -6px hsl(220 40% 8% / 0.12), 0 6px 12px -4px hsl(220 40% 8% / 0.06)
xl:  0 24px 48px -12px hsl(220 40% 8% / 0.18), 0 12px 24px -8px hsl(220 40% 8% / 0.08)
```
Plus border 1px `hsl(var(--ink-200))` na każdym podniesionym Surface — to ten
border, nie sam cień, robi separację (Stripe pattern).

---

### 2.6 Brak skali "ink" (true neutrals)

```
styles/globals.css:52-62 iron-50..950 — wszystkie HSL 210-222 (NIEBIESKI tint)
```

Cały UI ma **delikatny niebieski cast** w "neutralnych" obszarach. Wygląda
to jako "navy-friendly" — co jest OK dla brand identity, ale **iron jest
używany dla text bodyowego, borderów, tła sekundarnego** — czyli 80%
ekranu. W efekcie produkt wygląda jak "ślicznie zaprojektowane demo
banku", a nie jak Linear/Notion.

**Fix v3:** Wprowadzić **drugą skalę** `--ink-*` (true neutral `0 0% X%`)
osobno od `--iron-*`. Iron pozostaje (brand-tinted) — używany na elementach
brand-touched (hero, navy backgrounds, focus ring complement). Ink staje się
**default body text + borders + sekundarne tła** na całej platformie.

```css
--ink-50:  0 0% 98%;   /* page bg */
--ink-100: 0 0% 96%;   /* subtle bg, hover */
--ink-200: 0 0% 92%;   /* border default */
--ink-300: 0 0% 85%;   /* border emphasized */
--ink-400: 0 0% 64%;   /* placeholder, disabled text */
--ink-500: 0 0% 45%;   /* secondary text */
--ink-600: 0 0% 32%;   /* body text */
--ink-700: 0 0% 22%;   /* strong body, labels */
--ink-800: 0 0% 14%;   /* heading default */
--ink-900: 0 0% 8%;    /* strongest, hero h1 */
--ink-950: 0 0% 4%;    /* near-black, code blocks */
```

Migracja stopniowa: nowe primitivy v3 używają ink. Legacy ekrany — iron
zostaje, dark mode niezmieniony.

---

### 2.7 Spacing: zbyt drobnoziarniste Tailwind utility classes

```
components/landing/ai-showcase.tsx
  :71 mt-14, :75 gap-2, :81 gap-4, :82 space-y-3, :91 mt-auto, :92 gap-1.5,
  :100 gap-3, :105 space-y-2.5, :107 gap-2.5, :112 mt-0.5, :143 gap-2, :152 mt-10
```

Wartości używane na jednym ekranie: `2, 1.5, 3, 4, 2.5, 14, 10, 0.5, auto`.
**8 różnych odstępów na 1 sekcji.** Tailwind oferuje skok 4 → 6 → 8, ale
my mieszamy 0.5 (2px) z 14 (56px) bez rytmu.

**Fix v3:** Tarcza v3 trzyma się **8pt grid + 4pt halfstep** dla micro:
dozwolone tylko `1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32`. Wartości
ułamkowe (1.5, 2.5, 3.5) zakazane w nowym kodzie — `eslint:no-restricted-syntax`
rule jeśli zechcemy egzekwować.

---

### 2.8 Mock w Hero (HeroVisual) ma OBNIŻONĄ siłę vs AIShowcase

```
components/landing/hero.tsx:72-123 HeroVisual
  - rounded-full progress bars (h-1.5)
  - bg-dlugomat-50 px-4 py-3 dla "Pismo PDF"
  - 3 generic linijki "OCR rozpoznał…", "Wykryto…", "Pismo wygenerowane"
```

Hero pokazuje **fake-progress** (94%, 100%, 100%) — w 2026 ten patron
("static fake progressbar w hero") jest sygnałem template UI (Tailwind UI,
ThemeForest). Linear, Stripe, Vercel, OpenAI **nie używają fake-progress
w hero od 2023**.

**Fix v3:** Hero v3 = editorial copy + **mini terminal/code block** z
prawdziwą semantyką (np. żywy JSON output AI, snippet ze sprzeciwu),
bez fake-progress.

---

### 2.9 SiteHeader: navy bg dark + transparent light = inkonsystencja kontekstu

```
components/layout/site-header.tsx:34-38
"sticky top-0 z-40 w-full border-b ..."
not-scrolled: bg-background/0 ← przezroczyste
scrolled:     bg-background/85 backdrop-blur-md
```

Pre-scroll header nie ma własnego tła ani separacji — przy hero z `bg-white`
header **jest niewidoczny jako element**. Linear ma stały subtelny
`bg-background/80 + backdrop-blur` zawsze.

**Fix v3:** SiteHeader **zawsze** ma backdrop-blur + 1px bottom border
(separacja od hero), nawet pre-scroll. Wysokość zmniejszona 64 → 56 (cała
nawigacja Linear/Vercel/Notion = 56px). Logo + nav-items + auth CTA w 56px =
densely packed.

---

### 2.10 Brak "Eyebrow" jako primitive — duplikacja stylu w 8+ miejscach

```
ai-showcase.tsx:75      text-fluid-xs font-medium uppercase tracking-wider text-iron-500
ai-showcase.tsx:100     text-fluid-xs font-medium uppercase tracking-wider text-dlugomat-700
ai-showcase.tsx:123     text-fluid-xs font-medium uppercase tracking-wider text-accent-700
trust-bar.tsx:45        text-fluid-xs font-medium uppercase tracking-[0.18em] text-dlugomat-600
panel/page.tsx:77       text-fluid-xs font-semibold uppercase tracking-[0.18em] text-dlugomat-600
hero.tsx:52,56,60       text-xs uppercase tracking-wide text-dlugomat-500
how-it-works.tsx:46     text-xs uppercase tracking-wide text-dlugomat-500
modules.tsx:43          text-xs uppercase tracking-wide text-dlugomat-500
```

8 wariantów tej samej idei wizualnej. 5 różnych kombinacji `font-weight ×
tracking × text-size × color`.

**Fix v3:** `<Eyebrow tone="brand|neutral|success|warning|danger">` —
JEDEN primitive, jeden styl: `text-[11px] font-semibold uppercase
tracking-[0.14em]` (Linear/Vercel-grade label).

---

### 2.11 Mock dashboardu (Panel page) używa `max-w-[1120px]` ad-hoc

```
app/(panel)/panel/page.tsx:73
<div className="mx-auto flex max-w-[1120px] flex-col gap-10">
```

Mamy `<Container width="md">` (1120px) jako primitive od v2, ale pulpit
go nie używa. Każdy panel-page renderuje własne `max-w-*`.

**Fix v3:** Layout `(panel)` przejmuje wrapper, child-page renderuje czyste
treści. Eliminuje `mx-auto max-w-*` ze WSZYSTKICH stron panelu (jeden punkt
prawdy szerokości w `app/(panel)/layout.tsx`).

---

### 2.12 Brak monospace primitive — `font-mono text-xs` × 12 miejsc

```
hero.tsx:82, 102, 119         font-mono text-xs
ai-showcase.tsx:82            font-mono text-[0.78rem]   ← arbitrary value!
ai-showcase.tsx:144 (nie ma font-mono ale styl mono-like)
cta-band.tsx:36               font-mono text-xs
how-it-works.tsx:72           font-mono text-xs
```

`font-mono text-[0.78rem]` (12.48px) to magic number — rękodzieło, nie
system.

**Fix v3:** `<Mono size="xs|sm|md">` z fixed tokens.

---

## 3. ANTI-WZORCE INSPIRACJI (czego v3 NIE robi)

Inspiracje (Linear/Stripe/Vercel/Raycast/Notion/Anthropic) **nie używają**:

1. ❌ `rounded-full` na badge'ach (Linear: 4px, Anthropic: 6px, Stripe: 8px)
2. ❌ Fake progress bars w hero (od 2023 — wszyscy używają realnego mocka kodu/UI)
3. ❌ Soft shadow `<0.08 opacity` na białym tle (zawsze 0.08–0.20 z kolor-tintem)
4. ❌ Gradientów RGB rainbow (tylko brand → brand-darker, max 2 stops)
5. ❌ Centred headers z `text-center` na sekcji `tone="muted"` (Linear: 100% left-aligned editorial)
6. ❌ Pływających "hero card" floatującego po prawej stronie hero copy (Stripe/Linear: pełna szerokość mock pod headerem)
7. ❌ Dropdownów `bg-popover` (sztywne shadcn token) — używają warstwowych komand-palette z border + shadow-lg
8. ❌ Random emoji w UI ani „🎉" → ikony lucide z konsekwentnym 16/20/24px

---

## 4. FILOZOFIA TARCZA v3 "STOIC" — JEDNOZDANIOWO

> **"Każdy piksel ma uzasadnienie. Każdy odstęp to wielokrotność 4. Każdy
> rozmiar tekstu to krok modularny. Każdy cień ma kierunek. Każda neutral
> jest naprawdę neutralna. Każdy primitive ma JEDNĄ poprawną formę."**

Trzy reguły żelazne:

1. **8pt grid bez negocjacji.** Każdy `padding`, `gap`, `margin` ∈ {4, 8,
   12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192}. Ułamki — zakaz.
2. **Modular type 1.250.** xs=12 / sm=14 / base=15 / md=16 / lg=18 /
   xl=20 / 2xl=24 / 3xl=30 / 4xl=36 / 5xl=48 / 6xl=60 / 7xl=72.
   Hero h1 = 5xl. Section h2 = 3xl. Card h3 = lg.
3. **True neutrals dla 80% UI.** `ink-*` na text body, borders, tła
   neutralne. `dlugomat-*` / `iron-*` tylko na brand-touched (focus, CTA,
   navy hero, accent decorations).

---

## 5. ZAKRES SESJI v3 (dziś, sekwencyjnie, ~5h)

### Mandatory (commit per etap):

1. **Tokens v3** — globals.css ink scale + tailwind.config.ts radii/shadows/spacing/type
2. **Typography primitives** — Display, Heading, Text, Eyebrow, Mono, Stat
3. **Primitives upgrade** — Button v3 (tighter), Badge v3 (square), Surface v3 (kolor-tint shadow), Section density v3
4. **Landing v3** — SiteHeader (56px, always-blur), Hero (editorial + real mock), AIShowcase (terminal-grade), ModulesGrid (bento), TrustBar (uses Stat), CtaBand (cleaner), HowItWorks (timeline)
5. **Panel User dashboard v3** — uses Container + Stat + Eyebrow + new Heading
6. **Admin layout v3** — tighter chrome, operations-console feel

### Out of scope dla TEJ sesji (osobny sprint):
- Panel User wszystkie 22 podstrony (tylko dashboard + shell)
- Admin pages content (tylko shell)
- Mobile polish drill-down
- Animations beyond fade-in/fade-up
- Sprint A typecheck (515 błędów)
- D9 template renderer
- E2E playwright update

### Definicja "ukończenia":
- `npm run build` ✅
- `next dev` zwraca 200 dla `/`, `/panel`, `/admin/dashboard`
- 5+ commitów per etap z konwencjonalnymi msg-ami
- PR #1 zaktualizowane z linkiem do v3 preview
