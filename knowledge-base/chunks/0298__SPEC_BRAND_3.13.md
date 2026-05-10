# 3.13 — ILUSTRACJE I GRAFIKA

_source: SPEC_BRAND · tags: frontend, ocr, brand · line 1337 · 1260 chars_

STYL ILUSTRACJI:
  Geometric flat — nie ilustracyjny, nie realistyczny, nie cute.

  Zasady:
  1. Monoline: stroke-width 2px, rounded caps/joins
  2. Paleta ograniczona: max 3 kolory z palety Długomat per ilustracja
     (np. dlug-200 + dlug-500 + accent-300)
  3. Shapes: prostokąty, kółka, trójkąty, shield shapes
  4. Brak twarzy — żadnych postaci ludzkich. Abstrakcja.
     Dokumenty, tarcze, zegary, zamki — ale nie ludzie.
  5. Brak stock photos — nigdy, w żadnym kontekście.
  6. Format: SVG inline (dla animacji) lub SVG jako asset
  7. Rozmiary: max 200x200px dla empty states, max 400px width
     dla hero/feature sections

  Przykłady ilustracji:
  - Hero: Shield z § — geometryczny, 3 warstwy głębi (opacity layers)
  - Empty state "brak spraw": Shield z checkmark wewnątrz
  - Empty state "brak dokumentów": Folder z powiększonym X
  - Feature "OCR": Dokument z linią skanowania (animowana)
  - Feature "AI": Sparkles nad dokumentem
  - Feature "PDF": Dokument z pieczątką ✓

  PROHIBITED:
  - Stock photography
  - Emoji jako ikony UI (emoji dozwolone wyłącznie w treści bloga)
  - Gradienty w ilustracjach (flat only)
  - Efekty 3D, cienie w ilustracjach
  - Ilustracje z ludźmi, twarzami, rąk
  - Clipart, karuzelowe banery, ozdobne separatory
