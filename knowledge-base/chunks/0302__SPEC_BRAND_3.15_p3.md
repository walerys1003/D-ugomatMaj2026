# 3.15#p3 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 3)

_source: SPEC_BRAND · tags: frontend, notifications, strategy · line 1410 · 3918 chars_

  Radio button:
    Size: 20x20px, fully round (border-radius: 50%)
    Unchecked:
      Border: 2px iron-300
      Bg: white
    Hover (unchecked):
      Border: 2px iron-400
      Bg: iron-50
    Selected:
      Border: 2px dlug-500
      Inner dot: 10px circle, bg dlug-500
      Animation:
        Inner dot scale 0 → 1.1 → 1.0 (200ms spring)
    Focus: shadow --shadow-focus (focus-visible only)
    Disabled: border iron-200, dot iron-400, label iron-400

  Label: Inter 15px 400 iron-800, ml-3, cursor-pointer
  Description: Inter 13px 400 iron-500, ml-[calc(20px+12px)]
               (aligned with label text, not radio)
CARD SELECT (custom — used in wizards for choosing options):
  Layout: grid, gap-4
    2 columns (desktop ≥768px)
    1 column (mobile <768px)
    3 columns ONLY when ≥6 options AND labels short

  Card option:
    Border: 1.5px iron-200
    Radius: --radius-lg (14px)
    Padding: 20px
    Bg: white
    Cursor: pointer
    Transition: all 200ms ease

    Content layout: flex row, gap-14px, align-start
      Left (optional): icon container
        Size: 40x40px, radius-lg
        Bg: iron-100
        Icon: 20px iron-600
      Center: flex col
        Label: Inter 15px 600 iron-900
        Description: Inter 13px 400 iron-600, mt-1, leading-snug
        Badge (optional): inline, mt-2
          Bg: dlug-50, text dlug-600, Inter 11px 600,
          px-2 py-0.5, radius-sm, uppercase, tracking-wide
          Np: "NAJCZĘŚCIEJ WYBIERANY"
      Right: selection indicator
        Unchecked: 20px circle, border 2px iron-300, bg white
        Checked: 20px circle, bg dlug-500, white check 12px

    States:
      Default: border iron-200, shadow-xs
      Hover: border dlug-200, bg dlug-50/50%, shadow-sm
        Icon container bg: dlug-100
        Icon color: dlug-500
      Selected:
        Border: 2px dlug-500
        Bg: dlug-50
        Shadow: --shadow-sm
        Icon container bg: dlug-100
        Icon color: dlug-600
        Label color: dlug-800
      Focus (keyboard): shadow --shadow-focus, border dlug-500
      Disabled: opacity 0.5, cursor-not-allowed, no hover

    Animation on select:
      Border color: 150ms ease
      Check indicator: scale 0 → 1.0 (200ms spring)
      Background: 150ms ease

  Multi-select variant:
    Same visual, but checkbox instead of radio indicator
    Multiple cards can be selected simultaneously
    Use case: "Wybierz wszystkie powody sprzeciwu"

  Keyboard:
    Arrow keys navigate between cards
    Space/Enter toggles selection
    Tab moves to next form element (not next card)
TOGGLE SWITCH:
  Track:
    Size: 44px × 24px
    Radius: --radius-full
    Off: bg iron-200
    On: bg dlug-500
    Transition: background-color 200ms ease

  Thumb:
    Size: 20px × 20px circle
    Bg: white
    Shadow: --shadow-sm
    Position:
      Off: left 2px
      On: right 2px (translateX: 20px)
    Transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1)

  Focus: track gets shadow --shadow-focus
  Disabled: track bg iron-100, thumb bg iron-200, opacity 0.6

  Label (right of switch):
    Inter 15px 500 iron-800, ml-3
    Description below (optional): Inter 13px 400 iron-500

  Use cases in Długomat:
    "Powiadomienia email" — toggle
    "Powiadomienia SMS" — toggle
    "Tryb ciemny" — toggle
    "Automatyczne usuwanie danych po 30 dniach" — toggle
DATE PICKER (Radix / custom):
  Trigger: text input style, calendar icon right (18px iron-400)
  Format displayed: "24 kwietnia 2026" (human-readable PL)
  Format stored: "2026-04-24" (ISO 8601)

  Calendar dropdown:
    Bg: white, shadow-2xl, radius-xl, border iron-200, p-4
    Width: 320px

    Header: flex row between
      Month/Year: Inter 15px 600 iron-900
      Arrows: ChevronLeft / ChevronRight, 18px, iron-500
        Hover: iron-800, bg iron-100, radius-md

    Weekday headers:
      Inter 12px 500 iron-400, center, uppercase
      "Pn  Wt  Śr  Cz  Pt  Sb  Nd"
