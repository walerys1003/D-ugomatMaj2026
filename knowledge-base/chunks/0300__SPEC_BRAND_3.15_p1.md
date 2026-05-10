# 3.15#p1 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 1)

_source: SPEC_BRAND · tags: frontend, brand · line 1410 · 3995 chars_

TEXT INPUT:
  Height: 44px
  Padding: 12px 14px
  Border: 1px iron-300
  Radius: --radius-md (10px)
  Bg: white
  Font: Inter 15px 400 iron-900
  Placeholder: Inter 15px 400 iron-400

  Focus: border dlug-500 (2px), shadow --shadow-focus, bg white
  Error: border danger-500 (2px), bg danger-50
  Disabled: bg iron-100, text iron-500, cursor-not-allowed, border iron-200

  Transition: border-Kontynuuję dokładnie od urwanego miejsca:
  Transition: border-color 150ms ease, box-shadow 150ms ease,
              background-color 150ms ease

  /* Wariant z ikoną (left icon inside input) */
  Icon-left variant:
    Padding-left: 42px (14px + 20px icon + 8px gap)
    Icon: absolute, left 14px, top 50%, transform -translateY(50%)
    Icon size: 18px, color iron-400
    Focus: icon color → dlug-500
    Error: icon color → danger-500

  /* Wariant z sufiksem (np. "zł", "%") */
  Suffix variant:
    Padding-right: 48px
    Suffix text: absolute, right 14px, top 50%, transform -translateY(50%)
    Inter 14px 500 iron-400
    Pointer-events: none (nie blokuje kliknięcia w input)

  /* Wariant z przyciskiem wewnętrznym (np. show/hide password, clear) */
  Action-right variant:
    Padding-right: 44px
    Button: absolute, right 8px, top 50%, transform -translateY(50%)
    Size: 28x28px, radius-md, bg transparent
    Icon: 16px iron-400
    Hover: bg iron-100, icon iron-600
    Focus-visible: shadow --shadow-focus

  /* Wariant z maską (PESEL, telefon, kod pocztowy) */
  Masked input:
    PESEL: XX-XXXXXXXXX (auto-format on type, cyfry only)
    Telefon: +48 XXX XXX XXX (auto-spacje, prefix locked)
    Kod pocztowy: XX-XXX (auto-myślnik po 2 cyfrach)
    NIP: XXX-XXX-XX-XX
    Sygnatura akt: free text, ale regex validation on blur:
      /^[IVX]+\s+(Nc|C|Co|GC|GCo|Km|Kmp)\s+\d{1,6}\/\d{2,4}$/
    Font dla masked inputs: JetBrains Mono 15px 400
    Cel: monospace zapewnia równe szerokości znaków,
         krytyczne dla danych prawnych

  /* Group inputs (np. adres: ulica + nr + mieszkanie w jednym wierszu) */
  Input group:
    Flex row, gap-3
    First input: flex-[3] (ulica — najszersze)
    Second input: flex-[1] (nr domu — wąskie)
    Third input: flex-[1] (nr mieszkania — wąskie, optional label)
    Mobile (<640px): stack vertically, each full-width
    Border-radius shared:
      NIE — każdy input ma własny radius. Grouping to layout, nie wizualna fuzja.
TEXTAREA:
  Min-height: 120px
  Max-height: 320px (resize: vertical, max constrained via JS)
  Padding: 14px 14px
  Border: 1px iron-300
  Radius: --radius-md (10px)
  Bg: white
  Font: Inter 15px 400 iron-900, leading-relaxed (1.625)
  Placeholder: Inter 15px 400 iron-400

  Focus: border dlug-500 (2px), shadow --shadow-focus
  Error: border danger-500 (2px), bg danger-50
  Disabled: bg iron-100, text iron-500, cursor-not-allowed

  Character counter (positioned bottom-right inside textarea container):
    Position: absolute, bottom 8px, right 12px
    Font: Inter 12px 400
    Color logic:
      0-79% capacity: iron-400
      80-94% capacity: warn-600
      95-99% capacity: danger-500
      100% (at limit): danger-600, font-weight 600
    Format: "234 / 500"
    Bg: white/80% (semi-transparent to not obstruct last line)
    Padding: 2px 6px, radius-sm

  Auto-resize variant (used in chat/note contexts):
    Min-height: 44px (single line)
    Grows with content up to max-height
    Overflow-y: hidden until max → then scroll
    JS: textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    Transition: height 100ms ease (smooth growth)
SELECT (Custom — Radix UI Select):
  Trigger:
    Identical to text input: h-[44px], px-3.5, border 1px iron-300
    Radius: --radius-md
    Bg: white
    Text: Inter 15px 400 iron-900
    Placeholder (no selection): Inter 15px 400 iron-400
    Chevron: ChevronDown 16px iron-400, absolute right 14px
    Focus: border dlug-500, shadow --shadow-focus
    Open state: border dlug-500, chevron rotates 180° (200ms ease)
