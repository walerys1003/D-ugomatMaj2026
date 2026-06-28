# 3.15#p2 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 2)

_source: SPEC_BRAND · tags: frontend, brand, strategy · line 1410 · 3688 chars_

  Content (dropdown panel):
    Bg: white
    Border: 1px iron-200
    Radius: --radius-lg (14px)
    Shadow: --shadow-xl
    Padding: 6px
    Max-height: 280px
    Overflow-y: auto (custom scrollbar: 4px width,
                thumb iron-300, track transparent, radius-full)

    Animation open:
      scale-y 0.96 → 1.0, opacity 0 → 1
      Transform-origin: top
      Duration: 150ms ease-out
    Animation close:
      opacity 1 → 0
      Duration: 100ms ease-in

  Item:
    Padding: 10px 12px
    Radius: --radius-md (8px)
    Font: Inter 15px 400 iron-800

    Hover: bg dlug-50, text iron-900
    Focus (keyboard): bg dlug-50, outline none
      (visual focus indicated by bg, not ring —
       because ring inside dropdown is noisy)
    Selected: bg dlug-100, text dlug-700, font-weight 500
      Check icon: right side, 16px dlug-500
    Disabled item: text iron-400, cursor-not-allowed, no hover

  Group label (for grouped selects):
    Font: Inter 12px 600 iron-500, uppercase, tracking-wider
    Padding: 8px 12px 4px
    Not selectable, not focusable

  Separator (between groups):
    Height: 1px, bg iron-100, mx-2, my-1

  Empty state (no matching items after filter):
    Center: "Brak wyników" Inter 14px 400 iron-500
    Padding: 20px
COMBOBOX (Search + Select — Radix Combobox):
  Użycie: sąd (lista 300+ sądów), miasto, wierzyciel

  Trigger: text input z ikoną Search left + ChevronDown right
    User types → filters dropdown in real-time
    Debounce: 150ms
    Min chars to open: 2 (for large lists) or 0 (for small lists ≤20)

  Dropdown: identical to Select Content
    Matching text highlighted:
      <mark> tag, bg dlug-100, text dlug-700,
      padding 0 1px, radius 2px

  No match:
    "Nie znaleziono sądu o takiej nazwie" Inter 14px iron-500
    + link: "Zgłoś brakujący sąd →" dlug-500, 13px

  Selected value: displayed in input, ChevronDown → X button (clear)

  Keyboard:
    ArrowDown/Up: navigate items
    Enter: select highlighted
    Escape: close dropdown, keep current value
    Type: filters list
CHECKBOX:
  Container: flex row, gap-3, align-start (nie center —
             dla multi-line labels alignment is better at top)

  Box:
    Size: 20x20px
    Border-radius: 6px
    Unchecked:
      Border: 2px iron-300
      Bg: white
    Hover (unchecked):
      Border: 2px iron-400
      Bg: iron-50
    Checked:
      Bg: dlug-500
      Border: 2px dlug-500
      Icon: check SVG path, white, stroke-width 2.5px
      Animation:
        Background: instant (no delay — responsiveness matters)
        Check path: draw from stroke-dashoffset full → 0
        Duration: 200ms ease-out
        Slight overshoot: scale box 1.0 → 1.06 → 1.0 (150ms spring)
    Focus:
      Shadow: --shadow-focus (0 0 0 3px rgba(43, 105, 202, 0.35))
      Widoczny TYLKO z keyboard (focus-visible), nie na click
    Disabled:
      Box: bg iron-100, border iron-200
      Check (if checked+disabled): iron-400
      Label: iron-400
    Error state:
      Box border: danger-500
      Error message below: same as text input error style

  Label:
    Font: Inter 15px 400 iron-800
    Cursor: pointer (cały label klikalny)
    Multi-line: leading-snug (1.375)

  Description (optional, below label):
    Font: Inter 13px 400 iron-500
    Margin-top: 2px
    Use case: legal consent checkboxes — długi tekst wyjaśniający

  Indeterminate state (for parent checkbox in tree):
    Bg: dlug-500, border dlug-500
    Icon: horizontal dash (—), white, 2px stroke, centered
    Animation: same as checked
RADIO GROUP:
  Container: flex col, gap-3 (vertical) lub flex row, gap-6 (horizontal)
  Horizontal layout: only when ≤3 options AND labels are short (≤20 chars)
