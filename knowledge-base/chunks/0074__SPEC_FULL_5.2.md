# 5.2 — Design System — „Tarcza"

_source: SPEC_FULL · tags: frontend, modules, security, brand · line 762 · 2377 chars_

Filozofia: Długomat obsługuje osoby w stresie — zadłużone, przerażone komornikiem, z poczuciem bezsilności. Design musi komunikować: bezpieczeństwo (jesteś chroniony), kompetencję (wiemy co robimy), prostotę (to łatwiejsze niż myślisz), oraz nadzieję (jest rozwiązanie).
Paleta kolorów:
Primary:
  --shield-900: #0B1D3A    (navy — nagłówki, tekst główny)
  --shield-800: #132D5E
  --shield-700: #1B3F82
  --shield-600: #2354A6    (primary button, linki)
  --shield-500: #2B69CA
  --shield-400: #5A8FDB
  --shield-300: #89B5EC
  --shield-200: #B8DBFD
  --shield-100: #E0EFFF
  --shield-50:  #F0F7FF    (tło sekcji)

Accent (zielony — sukces, nadzieja):
  --hope-600:   #0D8A4A
  --hope-500:   #10B461    (CTA buttons, success states)
  --hope-400:   #34D07E
  --hope-100:   #DCFCE7
  --hope-50:    #F0FFF4

Warning (amber — terminy):
  --alert-600:  #D97706
  --alert-500:  #F59E0B
  --alert-100:  #FEF3C7

Danger (red — pilne terminy, błędy):
  --danger-600: #DC2626
  --danger-500: #EF4444
  --danger-100: #FEE2E2

Neutrals:
  --gray-900:   #111827
  --gray-700:   #374151
  --gray-500:   #6B7280
  --gray-300:   #D1D5DB
  --gray-100:   #F3F4F6
  --gray-50:    #F9FAFB
  --white:      #FFFFFF

Typografia:
Nagłówki: Space Grotesk (zmienny font, 600–700 weight). Geometric sans-serif komunikuje nowoczesność i technologię. H1: 48px/1.1 (desktop), 36px/1.15 (mobile). H2: 36px/1.2 (desktop), 28px/1.25 (mobile). H3: 24px/1.3. H4: 20px/1.4.
Body text: Inter (zmienny font, 400–500 weight). Doskonała czytelność na ekranach, szerokie wsparcie polskich znaków. Body: 16px/1.6. Small: 14px/1.5. Caption: 12px/1.4.
Tekst prawny w pismach: system serif font (Georgia, “Times New Roman”) — 12pt, interlinia 1.5, marginesy zgodne z wymogami procesowymi.
Spacing system: bazowy 4px grid. Skala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px. Sekcje na landing page: 96–128px padding vertical. Karty: 24px padding. Formularze: 16–20px gap między polami.
Border radius: Karty i kontenery: 16px. Buttony i inputy: 12px. Badges i chipy: 8px. Avatary: pełne koło.
Shadows: sm (karty formularzy): 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06). md (karty dashboard): 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.06). lg (modele, dropdowny): 0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05). xl (hero card): 0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04).
