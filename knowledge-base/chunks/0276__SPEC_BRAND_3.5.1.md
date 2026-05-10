# 3.5.1 — Landing page — architektura sekcji

_source: SPEC_BRAND · tags: frontend, database, ai-engine, payments, modules, security, brand · line 228 · 5926 chars_

┌─────────────────────────────────────────────────────────────┐
│  TOP BAR — sticky, bg white/95% opacity, blur 12px         │
│  Logo (tarcza + §) | Nav links | CTA "Zaloguj się"        │
│  Wysokość: 64px, border-bottom: 1px iron-100               │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                               │
│  Background: linear-gradient(165deg, dlug-900, dlug-800)    │
│  Subtle pattern: repeating shield outlines at 4% opacity    │
│  Min-height: 600px, padding: 96px top, 128px bottom         │
│                                                             │
│  ┌─────────── Grid 2 kolumny (60/40) ──────────────┐       │
│  │ LEFT:                                            │       │
│  │ Overline: "DŁUGOMAT — LEXMATE24" (Inter 13px,    │       │
│  │   500, dlug-300, tracking-wider, uppercase)      │       │
│  │                                                  │       │
│  │ H1: "Komornik zajął Ci konto?                    │       │
│  │      Sąd wysłał nakaz?                           │       │
│  │      Mamy na to pisma."                          │       │
│  │ (Space Grotesk 700, --text-display-hero, white,  │       │
│  │  tracking-tight, leading-tight)                  │       │
│  │                                                  │       │
│  │ Paragraph: "Wygeneruj sprzeciw, skargę lub       │       │
│  │ wniosek w 12 minut. Bez prawnika. Z gwarancją   │       │
│  │ poprawności formalnej lub zwrot pieniędzy."       │       │
│  │ (Inter 18px, 400, dlug-200, leading-relaxed,     │       │
│  │  max-width: 540px)                               │       │
│  │                                                  │       │
│  │ CTA Row:                                         │       │
│  │ [Skanuj nakaz za darmo →]  ← accent-500 bg,     │       │
│  │   white text, 700, px-8 py-4, radius-full,      │       │
│  │   shadow-lg, hover: accent-400, scale 1.02       │       │
│  │                                                  │       │
│  │ [Zobacz cennik]  ← ghost button, border white/30%│       │
│  │   white text, 500, px-6 py-3, radius-full        │       │
│  │   hover: bg white/10%                            │       │
│  │                                                  │       │
│  │ RIGHT:                                           │       │
│  │ Ilustracja: geometric shield with animated       │       │
│  │ shield-pulse (subtle scale 1.0→1.03→1.0, 4s,    │       │
│  │ ease-in-out, infinite). Lub: screenshot          │       │
│  │ dashboardu na laptop mockup z perspektywą 5°.    │       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
│  TRUST STRIP — poniżej hero, bg white, py-5, border-y      │
│  iron-100. Flex row, gap-12, center.                        │
│  Items: [🔒 AES-256] [🇪🇺 RODO] [💳 Stripe] [⏱ 14 dni  │
│  gwarancja] [✓ 12 400+ wygenerowanych pism]                │
│  Styl: iron-500 text, 13px, 500, ikona 16px iron-400       │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: "Jak to działa?" — 3 kroki                        │
│  Bg: iron-50, py: 96px                                      │
│  Grid 3-kolumnowy, gap-8                                    │
│  Każdy krok: Card white, shadow-sm, radius-xl, p-8         │
│    Numer: accent-500 bg, white text, 40x40 circle, Inter   │
│    700 18px. Nagłówek: Inter 600 20px iron-900.             │
│    Opis: Inter 400 16px iron-600, leading-relaxed.          │
│    Ikona: Lucide, 32px, dlug-500.                           │
│  Krok 1: "Prześlij dokument" (Upload Cloud icon)            │
│  Krok 2: "AI wygeneruje pismo" (Sparkles icon)              │
│  Krok 3: "Pobierz PDF i wyślij" (FileCheck icon)            │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: Moduły — Grid 2x4 (desktop) / 1 kolumna (mobile)  │
│  Bg: white, py: 96px                                        │
│  Heading: "Jedno narzędzie. Osiem tarcz." (center)          │
│  Każdy moduł: Card z ikoną specyficzną, nazwą, ceną,        │
│  krótkim opisem 2 linijki, CTA ghost "Sprawdź →"           │
│  Hover: border-left 4px w kolorze modułu, shadow-card-hover│
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: Porównanie z prawnikiem                            │
│  Bg: dlug-50, py: 96px                                      │
│  Tabela 2-kolumnowa: "Prawnik" vs "Długomat"               │
│  Rows: Koszt, Czas, Dostępność, Gwarancja, Poprawki        │
│  Kolumna prawnik: iron-300 text, przekreślone lub blade     │
│  Kolumna Długomat: accent-600 text, check marks, bold       │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: Pricing                                            │
│  Bg: white, py: 96px                                        │
│  3 karty: Skaner (0 zł), Sprzeciwomat (159 zł, badge       │
│  "NAJPOPULARNIEJSZY"), Pakiet Ochrona (349 zł)              │
│  Pricing card: radius-2xl, shadow-lg, p-10                  │
│  Karta popularna: border 2px dlug-500, scale 1.02           │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: FAQ (Accordion)                                    │
│  Bg: iron-50, py: 96px                                      │
│  Max-width: 720px, center. 8-10 pytań.                      │
│  Schema.org FAQPage JSON-LD.                                │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
│  Bg: dlug-900, py: 64px                                     │
│  4-kolumnowy grid: Moduły, Firma, Pomoc, Kontakt            │
│  Text: dlug-300, links hover: white                         │
│  Bottom: copyright, regulamin, polityka prywatności          │
└─────────────────────────────────────────────────────────────┘
