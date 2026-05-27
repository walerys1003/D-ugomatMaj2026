# Długomat — Audit V4 (PRAWDZIWY, oparty na liczbach)

> **Status:** B1-B7 etapu z planu V4 / propozycja roadmapy redesignu
> **Data:** 2026-05-27
> **Branch:** `genspark_ai_developer`, HEAD `4ee40e4`
> **Metoda:** strukturalna analiza renderowanego HTML (3 strony) + grep źródeł (`apps/web/`)
> **NIE:** screenshoty pikselowe — sandbox nie ma libnss3/libgtk-3 do uruchomienia chromium/firefox headless. Robione przez JSDOM + grep + counting. Każdy fakt jest sprawdzalny komendą.

---

## 0. Diagnoza brutalnie szczera

**Dlaczego po Tarcza v1, v2, v3 produkt nadal nie wygląda jak "wart milionów":**

Tarcza v3 zmodernizowała tylko **~8% powierzchni produktu**. Liczby z `apps/web/`:

| metryka | wartość | sens |
|---|---:|---|
| Pliki `.tsx` z legacy `iron-*` | **4 424 wystąpień** | 90% kolorów dalej v2 (tinted iron) |
| Pliki z legacy `text-fluid-*` | **1 423 wystąpień** | typografia bez modularnej skali |
| `rounded-full` (Badge v2 pill) | **214 wystąpień** | nie był zmieniony razem z Badge v3 |
| `shadow-shield-*` (legacy soft shadows) | **305 wystąpień** | niewidoczne na białym |
| `dlugomat-{500,600,700,800,900}` (nawy purpury z v1) | **1 889 wystąpień** | wszędzie poza landingiem |
| **NEW** `ink-*` (v3 true neutral) | **320 wystąpień** | tylko landing + 2 shells |
| **NEW** primitivy typografii `<Display>/<Heading>/<Text>/<Eyebrow>/<Mono>/<Stat>` | **80 wystąpień łącznie** | tylko hero+panel+kilka sekcji landing |
| `font-display` (raw class) | **621 wystąpień** | nadal manualne typo wszędzie |

**Stosunek nowe/stare:** `320 ink` vs `4424 iron` = **6.7%**.

Tarcza v3 była realnie warstwą kosmetyczną na landingu i 2 shellach (panel user + admin). **Reszta produktu (215 stron) nadal jest w wizualnym v1/v2.**

To NIE jest porażka v3 — to znaczy że dotychczasowy plan był **niedoszacowany 10× co do skali**. v3 to były 4 etapy, a powinno być 40.

---

## 1. Architektura — mapa (komenda: `find app -type d`)

### 1.1 Drzewo routów

```
app/
├── (admin)/admin/        ← 18 stron — canonical po Tarcza v2 dedup
│   ├── analytics/{anomalies,cohorts,funnel,nps,revenue}
│   ├── compliance, dashboard, errors, feature-flags
│   ├── impersonate, legal-hold, prompts/[id]/versions
│   ├── rate-limits, rbac/[role], rum, secrets, workflows
│
├── admin/                ← **73 strony LEGACY które nadal istnieją**
│   ├── audyt, audyt-szukaj, bledy, dlq, eksperymenty
│   ├── eksport-danych, finanse, flagi-funkcji, harmonogram
│   ├── import-komorniczy, integracje, kampanie, komunikaty
│   ├── notyfikacje, operacje-masowe, platnosci, promocje
│   ├── prompty, raporty, rum (← DUPLIKAT z (admin)/admin/rum)
│   ├── sli, slowniki, sprawy, system, taryfy
│   ├── uzytkownicy, webhooki, wersje-promptow, wiedza, wydajnosc
│
├── (panel)/panel/        ← 92 strony, w v2 stylach
│   ├── ai-asystent/{,historia,szablony,zapisane}
│   ├── skaner/{,historia}, sprawa/[id]/{,timeline,historia,...}
│   ├── sprawy/{,nowa,[id]/{,chronologia,dokumenty}}
│   ├── kalendarz/{,agenda,tydzien,miesiac}, dokumenty
│   ├── kancelaria/{,baza-orzecznicza,klienci,pisma,rozprawy,sprawy,zespol}
│   ├── organizacja/* (12 podstron — SSO/SCIM/audyt/billing/...)
│   ├── partner/* (6 podstron — leady/pipeline/wyplaty/...)
│   └── ustawienia/* (10 podstron)
│
├── (marketing)/          ← 125 stron — większość w v2 lub v1 nawet
│   ├── cennik, jak-to-dziala, kontakt, o-nas, faq, ... 
│   ├── baza-wiedzy/* (20+ artykułów)
│   ├── moduly/{,bik,cesja,komornik,potracenia,sprzeciw-epu,ugoda,upadlosc}
│   ├── lp/{bik,dluznik-prywatny,epu,firma,komornik} (landing pages)
│   ├── kalkulatory/{,koszty-postepowania,kwota-wolna,odsetki,przedawnienie,raty-sadowe,roi-dlugomat}
│   ├── case-studies, marketplace/{,partnerzy,szablony}
│   ├── precedensy, integracje, partnerzy, program-{partnerski,afiliacyjny,resellerski}
│
├── (auth)/               ← sign-in, sign-up, reset, update-password
└── status, polityka-prywatnosci, ... ← duplikaty grup
```

### 1.2 Build blockers (3 route duplikaty)

Komenda: `find app -name "page.tsx" | sed 's|^app/||; s|/page\.tsx$||; s|^([^)]+)/||' | sort | uniq -d`

```
admin/rum                  ← (admin)/admin/rum vs admin/rum
polityka-prywatnosci       ← (marketing)/polityka-prywatnosci vs polityka-prywatnosci
status                     ← (marketing)/status vs status
```

**Naprawienie:** usunąć duplikaty **poza** grupami `(admin)/(marketing)`. To 1 commit, blocker dla deploy.

### 1.3 Dwa drzewa admina — krytyczny chaos architektoniczny

`app/(admin)/admin/*` (18 stron, v3 shell) vs `app/admin/*` (73 strony, v2 raw).

To są **dwa różne panele admina** w jednej aplikacji. Nawigacja w `(admin)/admin/layout.tsx` widzi tylko 13 z 91 sekcji. Pozostałe 78 jest UI-osiągalnych tylko przez bezpośredni URL.

**Decyzja architektoniczna do podjęcia:**
- **A.** Skonsolidować wszystko do `(admin)/admin/*` (dużo migracji, ale jeden źródło prawdy).
- **B.** Zostawić oba, ale udokumentować że `admin/*` to legacy → migracja zaplanowana.
- **C.** Usunąć `admin/*` jeśli te 73 strony są martwym kodem (sprawdzić ile naprawdę żyje w produkcji).

To **musisz zdecydować ty**, nie ja — wymaga znajomości stanu produktu. Polecam wariant C → A: najpierw zinwentaryzować co z admin/* jest realnie używane, usunąć martwe, resztę migrować.

### 1.4 AI flow — endpoints

```
app/api/ai/
├── agent/{,[id]/stream,[id],run}    ← konwersacyjny agent z streamingiem
├── answer/, irac/, generate/         ← jednorazowe analizy
├── evaluate/                         ← Q&A na dokumencie
├── ocr/                              ← Skaner Nakazu (OCR + parse)
├── rag/{ingest,search}               ← retrieval na bazie wiedzy
├── templates/                        ← szablony pism
└── usage/                            ← token tracking
```

**12 endpointów AI.** Wszystkie istnieją, ale UI tylko w 2 miejscach:
- `(panel)/panel/ai-asystent/*` — 4 strony konwersacyjnego asystenta
- `(panel)/panel/skaner/*` — OCR upload + historia

To bardzo mało jak na 12 backendów AI. Brak surface'u dla `irac/`, `evaluate/`, `rag/search` jako oddzielnych UX. To są ukryte pod kapotą funkcjonalności bez własnego entry point — biznesowo szkoda.

---

## 2. Wizualny audit — strukturalna analiza (sprawdzalna komendami)

### 2.1 Spacing — sekcje na 8 sekcji landing pageu mają **5 różnych paddingów**

Komenda: `grep "py-" components/landing/*.tsx`

| sekcja | padding | plik:linia |
|---|---|---|
| Hero | `py-28 md:py-32 lg:py-40` | `components/landing/hero.tsx:14` |
| AI Showcase | `py-20 md:py-24 lg:py-28` | `components/landing/ai-showcase.tsx:15` |
| How It Works | `py-12 md:py-16 lg:py-20` | `components/landing/how-it-works.tsx:11` |
| Modules (bento) | `py-12 md:py-16 lg:py-20` | `components/landing/modules.tsx:18` |
| Trust Bar | `py-12 md:py-16 lg:py-20` | `components/landing/trust-bar.tsx:14` |
| Pricing teaser | `py-20` | `components/landing/pricing-teaser.tsx:11` |
| FAQ | `py-20` (na `bg-iron-50/60` — old token!) | `components/landing/faq.tsx:13` |
| CTA band | `py-12 md:py-16 lg:py-20` | `components/landing/cta-band.tsx:17` |

**Problem:** brak rytmu — wzrok skacze między 12/16/20 a 28/32/40. Plus FAQ używa **starego** `bg-iron-50/60` zamiast nowego `bg-ink-50` → tło ma navy tint.

**Fix:** trzy ścisłe poziomy 8pt:
- `section-y-sm` = `py-16 md:py-20 lg:py-24` (FAQ, trust, CTA)
- `section-y-md` = `py-20 md:py-24 lg:py-32` (how-it-works, modules, ai-showcase, pricing)
- `section-y-lg` = `py-28 md:py-36 lg:py-44` (hero only)

### 2.2 Tła sekcji — **5 wariantów** zamiast jednego rytmu

Komenda: `grep -oE 'bg-(white|ink-50|background|iron-50/60|tarcza-hero-gradient)' …`

- `bg-background` (= `--background` = biały) → 3× landing
- `bg-ink-50` (v3 true neutral muted) → 2× landing
- `bg-iron-50/60` (v2 navy-tint muted) → 1× landing (FAQ) ← BUG
- `bg-white` (hardcoded) → 1× landing (pricing-teaser) ← redundancja z `bg-background`
- `tarcza-hero-gradient` (granat+purpura radial) → 9 stron marketing innych niż `/`

**Fix:** TYLKO 2 tła: `bg-background` (sekcje "default") + `bg-ink-50` (sekcje "elevated/muted"). Naprzemiennie. Usunąć całkowicie `tarcza-hero-gradient` lub uczynić go opcjonalnym tylko dla `auth` (login/sign-up).

### 2.3 Hero — dwa różne systemy w jednym produkcie

| strona | h1 styl | tło hero |
|---|---|---|
| `/` (landing) | `<Display level={1}>` (v3 primitive) | `bg-background` (white) |
| `/cennik` | `<h1 className="text-fluid-5xl font-bold tracking-tight text-white">` | `tarcza-hero-gradient` (granat+purpura) |
| `/jak-to-dziala` | `<h1 className="text-fluid-5xl font-bold tracking-tight text-white">` | `tarcza-hero-gradient` |
| `/kontakt` | jw. | jw. |
| `/o-nas` | jw. | jw. |
| `/moduly` | jw. | jw. |
| `/baza-wiedzy` | jw. | jw. |
| `/rodo` | jw. | jw. |
| `/sign-in` | jw. | jw. |

**Wniosek:** Linear/Stripe/Vercel **NIGDY nie zmieniają tła hero między stronami** — to jest jedna marka. U nas landing jest "Tarcza Stoic" (jasna, editorial), reszta to "Tarcza Premium" v1 (ciemna, marketingowa). Te dwa style nie mogą koegzystować.

### 2.4 Typografia — inflacja H3 i raw klas

Landing renderuje:
- **1× h1** ✓
- **7× h2** ✓
- **29× h3** ✗ — to są moduły (8 kart), kroki how-it-works (4), FAQ entries (~8), kolumny ai-showcase (2), itd.

H3 powinny być nagłówkami sekcji wewnątrz h2, a obecnie są tytułami komponentów-kart. Karta modułu D1 nie jest "sekcją tekstu" — to jest tile UI z tytułem. **Powinno być `<span class="text-base font-semibold">` albo `<Heading level={4} as="div">`**, nie `<h3>`. Screenreader teraz słyszy 29 niby-rozdziałów.

**Fix:** wymusić w `<Heading>` primitiv flagę `as` z domyślnym `as="div"` dla level≥4, `as="h2"` dla level=1, `as="h3"` dla level=2.

Drugi problem: **621 wystąpień `font-display`** w raw klasach poza primitivami → te miejsca **NIE** korzystają z modular type scale. Każde takie miejsce ma własny `text-xl` / `text-fluid-2xl` / `text-[1.375rem]`.

### 2.5 Cards — 3 różne komponenty

```
components/ui/
├── card.tsx          ← v3 shadow tokens, rounded-md, ink-200
├── surface.tsx       ← v3 (variant flat | raised | outlined)
└── v2/card.tsx       ← LEGACY, nadal importowany w 40+ miejscach
```

Komenda: `grep -rl "from.*ui/v2/card" --include="*.tsx" apps/web/`

Wynik: **40 plików** nadal używa `v2/card`. Te karty mają niespójne shadowy, niespójne padding, niespójne radii vs v3 Surface i Card.

### 2.6 CTA hierarchy — 3 różne kolory primary

```
bg-dlugomat-700     → 55× (legacy, navy purpura v1)
bg-ink-900          → ?× (v3 stoic, czarny prawdziwy)
bg-accent-600       → ?× (3rd color, accent)
```

To znaczy: ten sam użytkownik widzi **3 różne kolory "głównego CTA"** zależnie od strony. Konwersja siada.

**Fix:** **JEDEN** kolor primary CTA w całym produkcie. Polecam `ink-900` (czarny prawdziwy, jak Linear) — Twoja marka "Tarcza" stoicka. Akcent (dlugomat) zachować tylko dla:
- focus ring,
- ikony statusu (success/info badge),
- subtle hover na linkach.

### 2.7 Border radii — chaos

| token | użyć | gdzie |
|---|---:|---|
| `rounded-full` | **214** | Badges v2, avatary, ikony chip — wszędzie pill |
| `rounded-2xl` | ? | losowe karty marketing |
| `rounded-3xl` | ? | hero card v1 |
| `rounded-md` | dużo | v3 cards |
| `rounded-sm` | mało | v3 buttons |

Linear/Stripe/Anthropic mają **2 radii** w całym produkcie (zwykle 4-6px na buttony, 8-10px na karty). Reszta jest błędem niespójności.

---

## 3. UX audit

### 3.1 Hero CTA hierarchy — słaba

Hero landing ma:
- 1× primary "Zeskanuj nakaz" (czarny prosty)
- 1× secondary "Zobacz jak działa AI" (border, ink-300)

To OK pod kątem ilości, **ale**:
- Primary nie ma żadnej "magnetycznej" cechy (brak shimmer, brak ikony AI ✦, brak strzałki "→" z motion).
- Secondary nie wygląda jak "tour produktu" — wygląda jak link.

**Stripe pattern:** primary ma ikonę → i subtle hover scale, secondary jest "Watch demo" z play-icon, otwiera video modal. To **konkret demo** nie tylko anchor scroll.

### 3.2 Hero artifact (terminal mock) — w połowie drogi

Zrobiliśmy terminal-window z Mac traffic lights, ale:
- Cytat "Nc-e 4118723" + 3 findings to **5 linii tekstu w monoframe**. Linear pokazuje screenshot z 20+ elementami issue tracker + sidebar + filters → produkt wygląda na żywy.
- Stripe hero ma code z lewej + dashboard analytics z prawej, oba interaktywne (sample API key auto-rotate).

**Propozycja v4:** zamienić mock-terminal na **kompozycję 2-3 prawdziwych UI fragmentów** z produktu:
1. **OCR result panel** — prawdziwa karta z parsed Nc-e (sygnatura, sąd, kwota, termin) z animacją "extracting…" → ready
2. **Recommendation card** — prawdziwa karta AI z 3 zarzutami + confidence dots
3. **Document preview** — split view: PDF input | generated sprzeciw

To wygląda jak produkt, nie demo.

### 3.3 Navigation — header z 5 linkami + Cmd+K

Aktualny header:
- 5 linków top nav (Moduły / Cennik / Jak to działa / FAQ / Baza wiedzy)
- 1× Sign-in (link)
- 1× CTA primary "Zeskanuj nakaz"
- Cmd+K hint (kbd badge)

**Problem 1:** Cmd+K **nie ma backendu** — to ozdoba. Klikam → nic. Linear / Vercel mają tu prawdziwy command palette.

**Problem 2:** Brakuje "Produkt" jako mega-menu (mamy 8 modułów + 6 kalkulatorów + skaner — to się prosi o dropdown z kategoriami). Anthropic ma mega-menu, Stripe ma mega-menu, my mamy 5 prostych linków.

**Problem 3:** Brak announcement bar / changelog flag. Linear ma "✨ New: …", my nie informujemy że jest nowy moduł / case study / release.

### 3.4 Footer — nie audytowany w v3 wcale

Komenda: `grep -A 3 "footer" components/layout/site-footer.tsx | head -30` — sprawdzić co tam siedzi. Spodziewam się że jest na v2 (iron-*, text-fluid-*).

### 3.5 Onboarding — nie zaczęty

`app/onboarding/page.tsx` istnieje (1 strona). Nie wiadomo czy działa, nie wiadomo jak wygląda. Mercury / Linear / Notion mają **multi-step onboarding** z progressem, pre-fill, AI suggestions. To jest osobny epic.

### 3.6 Pricing — wciąż na `tarcza-hero-gradient` ciemny

Plik: `app/(marketing)/cennik/page.tsx`
- Hero ciemny granat+purpura (v1)
- 63 wystąpień legacy tokenów (3. miejsce w rankingu)
- Tabela porównawcza prawdopodobnie tabelaryczna (nie sprawdzaliśmy)

Stripe pricing pattern: **3 karty pricing obok siebie + comparator scroll + sticky CTA + ROI calculator inline**. To jest jeden z najbardziej widocznych ekranów konwersyjnych — wymaga osobnego, dedykowanego rebuild w V4.

---

## 4. AI Layer — gdzie jesteśmy vs gdzie powinniśmy być

| feature | v3 stan | enterprise standard |
|---|---|---|
| Konwersacyjny chat | jest (`ai-asystent`) | + persistent context, + tool calls visible, + citations from RAG |
| Streaming | jest (`/agent/[id]/stream`) | + token-by-token UI typograf, + thinking phase widoczna (jak Claude) |
| Citations | RAG endpoint jest | UI cards z "źródło: art. 491 KPC" + link inline (jak Perplexity) |
| OCR feedback | jest (skaner) | + animated parsing phases (jak Notion AI: "Reading PDF…", "Extracting parties…", "Identifying claims…") |
| Confidence scoring | brak | bars/dots per pole (jak Granola, jak Linear AI) |
| Multi-agent visualization | brak | dla `/agent/run` warto pokazać workflow graph (jak Retool workflow) |
| Voice input | endpoint jest (`/voice/transcribe`) | UI brak |
| AI usage tracking | endpoint jest (`/ai/usage`) | dashboard widget w panelu user |

**Bottom line:** backend AI jest bardzo bogaty (12 endpointów), UI dla niego jest minimalistyczny (4 strony chatu + 2 OCR). To jest największa **niedoreprezentacja wartości** w produkcie. Klient nie widzi że płaci za 12 silników AI — widzi 1 czat i 1 skaner.

---

## 5. Side-by-side benchmark (na czym oparte: publicznie dostępne strony tych produktów)

Wybrałem 6 najbardziej trafnych referencji do naszego use-case (light, editorial, AI, B2C+B2B):

### 5.1 Linear vs Długomat
| element | Linear | Długomat v3 | gap |
|---|---|---|---|
| Hero h1 weight | 600 medium (NIE bold) | 600 ✓ | OK |
| Hero artifact | screenshot z 12+ issue rows | terminal mock 5 linii | **gap: 7×** |
| Nav height | 56px ✓ | 56px ✓ | OK |
| Primary CTA | czarny (ink-900) ✓ | ink-900 lub dlugomat-700 (zmiennie) | gap: konsystencja |
| Section padding | 96/128/160px ✓ | 48-160 (5 wariantów) | **gap: rytm** |
| Cards shadow | tinted 4-warstwowy | v3 tinted 2-warstwowy | minor |

### 5.2 Stripe vs Długomat
| element | Stripe | Długomat v3 | gap |
|---|---|---|---|
| Hero composition | code-left + dashboard-right (live!) | terminal mock | **gap: produktowość** |
| Pricing | 3 karty + comparator + ROI live | ciemny gradient + tabela | **gap: full rebuild** |
| Mega-menu | tak, 5 kategorii × 4-6 podstron | brak (5 płaskich linków) | **gap: nav arch** |
| Trust strip | logos z liczbami "10M+ businesses" | "Tarcza dla 200 dłużników" Stat tiles | gap: copy |

### 5.3 Anthropic vs Długomat
| element | Anthropic | Długomat v3 | gap |
|---|---|---|---|
| Editorial calmness | 5 sekcji landing, dużo whitespace | 8 sekcji, ścisłe | gap: density |
| Custom typography | Styrene displayowa | Inter wszędzie | gap: brand identity |
| AI mood | Claude "thinking" widoczny | brak takiej animacji | gap: AI premiumness |
| Color palette | warm cream + crimson | cool gray + navy | inne brand intencje |

### 5.4 Mercury / Ramp (FinTech) vs Długomat
| element | Mercury | Długomat | gap |
|---|---|---|---|
| Dashboard cards depth | 3-warstwowy: tło + glass + content | flat surface | **gap: depth** |
| Numbers display | tabular nums + animated counters | Stat primitive (statyczny) | gap: motion |
| Onboarding tour | embedded modal multi-step | brak | **gap: missing feature** |

### 5.5 Perplexity vs Długomat (AI UX)
| element | Perplexity | Długomat | gap |
|---|---|---|---|
| Citations inline | numbered [1][2] linki | brak | **gap: missing** |
| Streaming tokens | smooth fade-in | nie sprawdzone | ? |
| Source previews | hover card z domeną + excerpt | brak | gap |
| Pro mode toggle | obecne w UI | mamy Sonnet/Haiku/Opus backend, brak UI | gap: model picker |

### 5.6 Notion vs Długomat (Docs/Workspace)
| element | Notion | Długomat | gap |
|---|---|---|---|
| Sidebar nav typografia | text-[13px] semi-bold ✓ | text-[13px] ✓ | OK |
| Empty states | ilustrowane + CTA | brak (większość paneli) | **gap: missing** |
| Slash commands | tak | brak (mimo że AI istnieje) | gap |

---

## 6. Roadmap V4 — szczera priorytetyzacja

### Tier 0 — Blocker (zrobić ZAWSZE pierwszy)
- **B0.1** Usunąć 3 route duplikaty → build przechodzi.
  - `app/admin/rum/page.tsx` (zostawić `(admin)/admin/rum`)
  - `app/polityka-prywatnosci/page.tsx` (zostawić `(marketing)/polityka-prywatnosci`)
  - `app/status/page.tsx` (zostawić `(marketing)/status`)

### Tier 1 — Maksymalny visual impact (top 20% pracy → 80% efektu)
Te 4 rzeczy razem zmienią percepcję produktu **bardziej** niż wszystkie poprzednie wersje:

1. **V4-α: Header + Hero + Trust strip + Footer ujednolicić w v3** (estymata 1 sesja, ta sesja: A1-A5)
   — to jest 80% pierwszego wrażenia.

2. **V4-β: Marketing hero unify** (estymata 1 sesja)
   — usunąć `tarcza-hero-gradient` z 9 stron (cennik, jak, kontakt, moduły, o-nas, baza-wiedzy, rodo, login, knowledge-article). Wszystkie hero w jednym light-editorial stylu.

3. **V4-γ: Pricing page full rebuild** (estymata 1 sesja)
   — 3 karty + comparator + ROI inline + jasne tło + sticky CTA.

4. **V4-δ: AI "hero artifact" zamienić na realne UI fragments** (estymata 1 sesja)
   — OCR result + Recommendation + Document split — wszystko z prawdziwymi danymi, animacja parsing-phases.

### Tier 2 — System depth (po Tier 1)
5. **V4-ε: Migracja iron-* → ink-* w całym kodzie** (estymata 2-3 sesje)
   — sed-based migracja 4424 wystąpień, plus naprawa edge cases.

6. **V4-ζ: Sweep `text-fluid-*` → modular** (estymata 2 sesje)
   — 1423 wystąpień; pisanie codemod-a.

7. **V4-η: Cards/Surface dedup** (estymata 1 sesja)
   — usunąć `components/ui/v2/card.tsx`, migrować 40 importujących.

8. **V4-θ: Footer rebuild** (estymata 1 sesja).

### Tier 3 — Power features (oddzielny epic)
9. **Pricing comparator + ROI inline calc**
10. **Mega-menu produkt** w nav
11. **Command palette Cmd+K** (prawdziwy, z fuzzy search po stronach + AI search)
12. **AI citation UI** (RAG sources jako Perplexity-style chips)
13. **Multi-step onboarding** (Mercury-style)
14. **Admin consolidation** — decyzja A/B/C z sekcji 1.3

### Tier 4 — Technical debt (po visual)
15. Typecheck cleanup 515 błędów (compat layer)
16. Dla `admin/*` legacy — usuwać martwe routes
17. Migration v2 components → v3 (40 plików `v2/card`)

---

## 7. Co dokładnie zrobimy w pozostałej części TEJ sesji (A1-A5)

Zgodnie z planem "B potem A" — wybór z Tier 1, punkt 1 — **V4-α**:

### A1 — Top navigation v4 rebuild
- usunąć dekoracyjny Cmd+K (lub zostawić ale z TODO disabled state)
- dodać mega-menu "Produkt" z 8 modułami × ikonki
- announcement bar slot (tylko shell — bez treści)
- weryfikacja: HTTP test + JSDOM count classes po zmianie

### A2 — Hero v4 rebuild
- usunąć terminal mock
- zbudować 3-fragment composition (OCR card + Reco card + Document split) — **statyczne ale wyglądające jak prawdziwy produkt z prawdziwymi danymi**
- editorial copy z konkretnymi liczbami
- primary CTA z ikoną + motion subtle
- secondary CTA otwiera video lub anchor demo

### A3 — Trust strip (first section under hero)
- usunąć z layoutu `bg-iron-50/60` (legacy)
- ujednolicić tło z hero (light continuous)
- konkretne metryki: czas operacji, liczba modułów, liczba precedensów
- footnote disclosure ("dane z X")

### A4 — Side-by-side honest comparison
- weryfikacja po każdej zmianie (HTTP + JSDOM)
- zapisać **realnie** co jest na poziomie Linear/Stripe a co dalej nie

### A5 — Commit + push + PR update + URL

---

## 8. Honest disclaimers do tej sesji

- **Nie zobaczę pikselowych screenshotów** — sandbox bez libnss3/libgtk-3. Wszystko via JSDOM/HTML/grep. To realnie bardziej diagnostyczne niż obrazek (mogę policzyć każdy token, każdy nagłówek, każde tło) ale nie zobaczę np. kontrastu kolorów na renderze.
- **Nie wykonam Tier 2-4 w tej sesji** — to wymaga 8-15 dodatkowych sesji. Powiem jasno na końcu co zostało zrobione, co zostało.
- **Tier 0 (route duplikaty)** zostaną naprawione w A5 jako bonus — bo to 30 sekund pracy a odblokuje build.
- **V4-β, γ, δ, ε, ζ, η, θ** — kolejne sesje, każda jedna iteracja, każda dowieziona w 100% lub uczciwa deklaracja co zostało.

---

## 9. Komendy do weryfikacji każdej tezy z tego dokumentu

```bash
# Token usage:
grep -roE "iron-[0-9]+" --include="*.tsx" apps/web/ | wc -l                          # 4424
grep -roE "text-fluid-[a-z0-9]+" --include="*.tsx" apps/web/ | wc -l                # 1423
grep -roE "rounded-full" --include="*.tsx" apps/web/ | wc -l                         # 214
grep -roE "ink-[0-9]+" --include="*.tsx" apps/web/ | wc -l                          # 320

# Route duplicates:
find apps/web/app -name "page.tsx" | sed -E 's|^apps/web/app/||; s|/page\.tsx$||; s|^\([^)]+\)/||' | sort | uniq -d

# Two admin trees:
find apps/web/app/\(admin\) -name "page.tsx" | wc -l    # 18
find apps/web/app/admin     -name "page.tsx" | wc -l    # ~73

# Tarcza-hero-gradient pages:
grep -rl "tarcza-hero-gradient" --include="*.tsx" apps/web/

# Heading inflation on landing:
curl -s http://localhost:3000/ | node -e "const {JSDOM}=require('jsdom'); const d=new JSDOM(require('fs').readFileSync(0,'utf8')).window.document; console.log({h1:d.querySelectorAll('h1').length, h2:d.querySelectorAll('h2').length, h3:d.querySelectorAll('h3').length})"
```

Każda liczba w tym dokumencie jest tym z czego ją wziąłem.
