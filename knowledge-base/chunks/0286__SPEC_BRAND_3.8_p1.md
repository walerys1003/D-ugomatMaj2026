# 3.8#p1 — PRICING SECTION — DESIGN (part 1)

_source: SPEC_BRAND · tags: frontend, ai-engine, ocr, payments, modules, strategy · line 792 · 3246 chars_

Sekcja cennikowa musi odpowiedzieć na jedno pytanie: „Ile zaoszczędzę w porównaniu z prawnikiem?" Dlatego cena nigdy nie stoi sama — zawsze obok jest porównanie.
PRICING SECTION LAYOUT:
  Bg: white, py: 96px
  Heading: "Ile kosztuje obrona?" center, Space Grotesk 700,
           --text-display-h2
  Subheading: "Porównaj z ceną prawnika — i zdecyduj sam."
              center, Inter 400 16px iron-600

  Grid: 3 kolumny (desktop), 1 kolumna (mobile), gap-8, mt-12

  ┌── KARTA 1: SKANER ──────────────┐
  │ Bg: white                        │
  │ Border: 1px iron-200             │
  │ Radius: 2xl                      │
  │ Shadow: sm                       │
  │ Padding: 40px                    │
  │                                  │
  │ Badge: — (brak)                  │
  │ Nazwa: "Skaner" Inter 600 20px   │
  │ Cena: "0 zł" Inter 700 40px     │
  │        iron-900                  │
  │ Opis: "Sprawdź czy masz podstawy │
  │ do obrony — za darmo"            │
  │ Inter 400 15px iron-600          │
  │                                  │
  │ ── separator ──                  │
  │                                  │
  │ Features (checkmark list):       │
  │ ✓ OCR rozpoznawanie dokumentu    │
  │ ✓ Analiza podstaw prawnych       │
  │ ✓ Szacunek skuteczności          │
  │ ✗ Generowanie pisma (grayed)     │
  │ ✗ PDF do pobrania (grayed)       │
  │                                  │
  │ [Skanuj za darmo]                │
  │ Ghost button, dlug-500           │
  │ Full-width, radius-lg            │
  └──────────────────────────────────┘

  ┌── KARTA 2: SPRZECIWOMAT ────────┐
  │ Bg: white                        │
  │ Border: 2px dlug-500             │  ← wyróżnienie
  │ Radius: 2xl                      │
  │ Shadow: xl                       │  ← podniesiona
  │ Padding: 40px                    │
  │ Transform: scale(1.03)           │  ← subtelnie większa
  │ Position: relative               │
  │                                  │
  │ Badge (absolute, top -14px,      │
  │   left 50%, transform -50%):     │
  │   "NAJPOPULARNIEJSZY"            │
  │   Bg: dlug-500, text white       │
  │   Inter 11px 700, uppercase      │
  │   Tracking-widest                │
  │   Px-4 py-1.5, radius-full      │
  │                                  │
  │ Nazwa: "Sprzeciwomat EPU"        │
  │ Cena: "159 zł" Inter 700 40px   │
  │        dlug-600                   │
  │ Porównanie: "Prawnik: 500-2000zł"│
  │   Inter 13px iron-400,           │
  │   line-through                   │
  │ Oszczędność: "Oszczędzasz min.   │
  │   341 zł" Inter 14px 600         │
  │   accent-600                     │
  │                                  │
  │ ── separator ──                  │
  │                                  │
  │ Features (checkmark list):       │
  │ ✓ Wszystko z wersji darmowej     │
  │ ✓ Pismo wygenerowane przez AI    │
  │ ✓ Walidacja formalna 94%+        │
  │ ✓ PDF gotowy do wydruku          │
  │ ✓ Przypomnienia o terminach      │
  │ ✓ 14-dniowa gwarancja zwrotu     │
  │                                  │
  │ [Wygeneruj sprzeciw →]           │
  │ Primary button, accent-500 bg    │
  │ White text, full-width           │
  │ Shadow-md, radius-lg             │
  └──────────────────────────────────┘
