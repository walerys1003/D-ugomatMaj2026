# 3.5.2#p1 — Dashboard — architektura (part 1)

_source: SPEC_BRAND · tags: frontend, ocr, payments · line 323 · 3245 chars_

┌──────────────────────────────────────────────────────────────┐
│  LAYOUT: Sidebar (272px fixed) + Main (flex-1)               │
│                                                              │
│  ┌── SIDEBAR ──────────┐ ┌── MAIN AREA ──────────────────┐  │
│  │ Bg: dlug-900         │ │ Bg: iron-50                   │  │
│  │                      │ │                               │  │
│  │ Logo area: py-6 px-6 │ │ TOP BAR (wewnętrzny):         │  │
│  │ Tarcza § + "Długomat"│ │ h-16, bg white, border-b      │  │
│  │ Space Grotesk 600    │ │ iron-100, px-8                │  │
│  │ 18px, white          │ │ Left: Breadcrumb              │  │
│  │                      │ │ Right: Search (⌘K), Bell,     │  │
│  │ ── separator ──      │ │ Avatar dropdown               │  │
│  │ 1px dlug-850         │ │                               │  │
│  │                      │ │ CONTENT AREA:                 │  │
│  │ Nav items:           │ │ px-8, py-6                    │  │
│  │ Icon (20px, dlug-400)│ │ max-width: 1200px             │  │
│  │ + Label (Inter 14px, │ │                               │  │
│  │   500, dlug-300)     │ │ ┌── PAGE HEADER ──────────┐  │  │
│  │ py-2.5, px-4,        │ │ │ H1 (Inter 700 --text-h1)│  │  │
│  │ radius-md            │ │ │ + optional subtitle      │  │  │
│  │                      │ │ │ + CTA button right       │  │  │
│  │ Active state:        │ │ └─────────────────────────┘  │  │
│  │ bg dlug-800/70%,     │ │                               │  │
│  │ text white,          │ │ ┌── CONTENT ──────────────┐  │  │
│  │ icon white,          │ │ │ (page-specific)          │  │  │
│  │ border-left 3px      │ │ │                          │  │  │
│  │ accent-500           │ │ └─────────────────────────┘  │  │
│  │                      │ │                               │  │
│  │ Hover state:         │ │                               │  │
│  │ bg dlug-850/50%      │ │                               │  │
│  │                      │ │                               │  │
│  │ Nav groups:          │ │                               │  │
│  │ SPRAWY               │ │                               │  │
│  │  · Dashboard         │ │                               │  │
│  │  · Moje sprawy       │ │                               │  │
│  │  · Terminy           │ │                               │  │
│  │ NARZĘDZIA            │ │                               │  │
│  │  · Nowe pismo        │ │                               │  │
│  │  · Skaner OCR        │ │                               │  │
│  │  · Kalkulatory       │ │                               │  │
│  │ KONTO                │ │                               │  │
│  │  · Dokumenty         │ │                               │  │
│  │  · Płatności         │ │                               │  │
│  │  · Ustawienia        │ │                               │  │
│  │                      │ │                               │  │
│  │ ── bottom ──         │ │                               │  │
│  │ Pomoc (?) icon       │ │                               │  │
│  │ Wersja: 1.0.0        │ │                               │  │
│  └──────────────────────┘ └───────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
