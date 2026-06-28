# 3.6.1 — Struktura WizardShell

_source: SPEC_BRAND · tags: frontend, modules, brand, strategy · line 394 · 5793 chars_

┌─────────────────────────────────────────────────────────────┐
│  WIZARD SHELL                                                │
│  Max-width: 800px, mx-auto, py-8                             │
│                                                              │
│  ┌── PROGRESS BAR ─────────────────────────────────────────┐ │
│  │ Height: 4px, bg: iron-200, radius-full                  │ │
│  │ Fill: dlug-500, width: (currentStep/totalSteps)%        │ │
│  │ Transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1)  │ │
│  │                                                         │ │
│  │ Below bar: Flex row between                              │ │
│  │ Left: "Krok 3 z 5" (Inter 13px 500 iron-600)            │ │
│  │ Right: "Sprzeciw od nakazu EPU" (Inter 13px 500          │ │
│  │         dlug-500, badge-like, bg dlug-50, radius-full,   │ │
│  │         px-3 py-1)                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── STEP CONTENT AREA ──────────────────────────────────┐   │
│  │ Card: bg white, shadow-md, radius-xl, p-10              │   │
│  │                                                         │   │
│  │ H2: Inter 700, --text-h2, iron-900                      │   │
│  │ Subtitle: Inter 400, --text-body, iron-600, mt-2        │   │
│  │                                                         │   │
│  │ ── Form fields ──                                       │   │
│  │ (specyficzne dla kroku — patrz poniżej)                 │   │
│  │                                                         │   │
│  │ ── Tip Panel (opcjonalny) ──                            │   │
│  │ bg: dlug-50, border-left 3px dlug-300, radius-md,       │   │
│  │ p-4, mt-6                                               │   │
│  │ Ikona: Info (16px, dlug-400)                             │   │
│  │ Tekst: Inter 14px 400 iron-700                           │   │
│  │ Np: "Sygnaturę akt znajdziesz w lewym górnym rogu       │   │
│  │ nakazu zapłaty, w formacie: I Nc XXXX/XX"               │   │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── NAVIGATION BAR ────────────────────────────────────┐    │
│  │ Flex row, justify-between, mt-6                       │    │
│  │                                                       │    │
│  │ [← Wstecz]                [Dalej →]                   │    │
│  │ Ghost button,              Primary button,             │    │
│  │ iron-600 text,             dlug-500 bg,                │    │
│  │ hover iron-800             white text 600,             │    │
│  │                            hover dlug-600,             │    │
│  │                            disabled: iron-300 bg,      │    │
│  │                            cursor-not-allowed          │    │
│  │                                                       │    │
│  │ Ostatni krok: "Dalej" → "Wygeneruj pismo"             │    │
│  │ bg accent-500, hover accent-400                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌── LEGAL TIP PANEL (sidebar na desktop) ──────────────┐    │
│  │ Widoczny na desktop (≥1024px) jako kolKontynuuję dokładnie od urwanego miejsca:
│  ┌── LEGAL TIP PANEL (sidebar na desktop) ──────────────┐    │
│  │ Widoczny na desktop (≥1024px) jako kolumna boczna     │    │
│  │ po prawej stronie wizard content area.                 │    │
│  │ Width: 280px, position: sticky, top: 96px              │    │
│  │ Bg: dlug-50, border: 1px dlug-100, radius-lg, p-6     │    │
│  │                                                        │    │
│  │ Heading: "Wskazówka prawna" (Inter 13px 600,           │    │
│  │   dlug-600, uppercase, tracking-wider)                 │    │
│  │                                                        │    │
│  │ Content: dynamiczny, zmienia się z każdym krokiem       │    │
│  │ wizarda. Tekst: Inter 14px 400 iron-700,               │    │
│  │ leading-relaxed. Max 4-5 zdań.                         │    │
│  │                                                        │    │
│  │ Przykłady per krok:                                    │    │
│  │ Krok 1 (upload): "Nakaz zapłaty z e-Sądu to           │    │
│  │   dokument wydawany bez rozprawy. Masz 14 dni          │    │
│  │   od doręczenia na złożenie sprzeciwu. Nie musisz      │    │
│  │   podawać powodu — wystarczy sam sprzeciw."            │    │
│  │ Krok 2 (dane): "Twoje dane osobowe są potrzebne       │    │
│  │   wyłącznie do wygenerowania pisma. Szyfrujemy         │    │
│  │   je AES-256 i usuwamy po 30 dniach."                  │    │
│  │ Krok 3 (powód): "Najczęstsze powody sprzeciwu:        │    │
│  │   przedawnienie roszczenia, brak dowodu doręczenia     │    │
│  │   wezwania, niewłaściwa kwota, cesja bez               │    │
│  │   zawiadomienia dłużnika."                             │    │
│  │                                                        │    │
│  │ Bottom: link "Dowiedz się więcej →" (dlug-500,         │    │
│  │   hover underline) — prowadzi do wpisu blogowego       │    │
│  │   powiązanego z kontekstem kroku.                      │    │
│  │                                                        │    │
│  │ Na mobile (< 1024px): panel chowany do                 │    │
│  │ collapsible accordion pod formularzem,                 │    │
│  │ domyślnie złożony, trigger: "💡 Wskazówka prawna"     │    │
│  │ (Inter 14px 500 dlug-500)                              │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
