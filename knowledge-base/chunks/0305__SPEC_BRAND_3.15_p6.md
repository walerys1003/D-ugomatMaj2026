# 3.15#p6 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 6)

_source: SPEC_BRAND · tags: frontend, ocr, payments, modules, strategy · line 1410 · 3936 chars_

  Badge on tab (notification count):
    Inline after label, ml-2
    Min-width: 20px, h-5, radius-full
    Bg: danger-500, text white, Inter 11px 700, center
    Np: "Historia (3)" — 3 new events
BREADCRUMB:
  Location: top of main content area, above page title

  Container: flex row, align-center, gap-2, mb-4

  Items:
    Text: Inter 13px 500 iron-500
    Separator: ChevronRight 14px iron-400, mx-0
    Link: hover text dlug-500, hover underline
    Current (last item): iron-800, font-weight 600, not a link

  Truncation (>4 levels):
    Show first + "..." dropdown + last 2
    "..." is a button → Radix dropdown with middle items

  Example:
    Panel  ›  Sprawy  ›  Sprzeciw EPU  ›  I Nc 3847/26
    [link]    [link]      [link]           [current, bold]

  Mobile (<640px):
    Show only: [← Sprzeciw EPU] (back button style)
    Replaces full breadcrumb — simpler, touchable
    Inter 14px 500 dlug-500, flex row, gap-1.5, align-center
    ChevronLeft 16px
BADGE / TAG:
  Variants by purpose:

  STATUS BADGE (on case cards, document cards):
    Size: h-6, px-2.5, radius-full
    Font: Inter 11px 600, uppercase, tracking-wide

    Nowy:       bg dlug-100,    text dlug-700
    W toku:     bg dlug-50,     text dlug-600
    Wygenerowany: bg accent-100, text accent-700
    Opłacony:   bg accent-50,   text accent-600
    Wysłany:    bg iron-100,    text iron-700
    Zakończony: bg accent-100,  text accent-700, icon Check 12px
    Odrzucony:  bg danger-100,  text danger-700, icon X 12px
    Przeterminowany: bg danger-50, text danger-600

  MODULE BADGE (identifying which module):
    Size: h-6, px-2.5, radius-full
    Font: Inter 11px 600
    Bg: {module-color}-50
    Text: {module-color}-700
    Icon: module icon 12px, mr-1
    Np: "🛡️ Sprzeciwomat EPU" in dlug-50/dlug-700

  INFO BADGE (pricing, features):
    Bg: dlug-500 (lub accent-500)
    Text: white
    Size: h-6, px-3, radius-full
    Font: Inter 11px 700, uppercase, tracking-widest
    Np: "NAJPOPULARNIEJSZY", "NOWY", "PREMIUM"

  COUNTER BADGE (notifications):
    Min-width: 20px, h-5, radius-full
    Bg: danger-500, text white
    Font: Inter 11px 700, center
    Position: absolute, top -4px, right -4px (relative to icon)
    Content: number (max "99+")
    Animation: scale 0→1.1→1.0 (200ms spring) on new count
TOOLTIP:
  Trigger: hover (desktop) / long-press (mobile) / focus (keyboard)
  Delay: 300ms (show), 100ms (hide)

  Content:
    Bg: iron-900 (dark tooltip on light UI)
    Text: white, Inter 13px 400, leading-snug
    Padding: 8px 12px
    Radius: --radius-md (10px)
    Shadow: --shadow-lg
    Max-width: 240px

  Arrow: 6px, same bg as content, centered on trigger edge

  Positioning: auto (Radix handles — prefers top, falls back
               to bottom/left/right based on viewport)

  Animation:
    Enter: opacity 0→1, translateY(4px)→0, 150ms ease-out
    Exit: opacity 1→0, 100ms ease-in

  Rich tooltip variant (with title + description):
    Bg: white, border iron-200, shadow-xl
    Title: Inter 14px 600 iron-900
    Description: Inter 13px 400 iron-600, mt-1
    Max-width: 280px
    Padding: 14px 16px

  Use in Długomat:
    - Icon tooltips in sidebar (collapsed tablet mode)
    - Info icons (ⓘ) next to legal terms
    - OCR confidence explanation
    - Success estimator methodology
    - Form field help text (alternative to helper text below)
    - Button tooltips for icon-only buttons
NOTIFICATION BELL (header component):
  Icon: Bell 20px iron-600
  Container: relative, 36x36px, radius-md, center
  Hover: bg iron-100

  Badge (when unread):
    Position: absolute top-0 right-0
    Size: 8px circle (no number — just dot indicator)
    Bg: danger-500
    Border: 2px white (creates gap between dot and icon)
    Animation: scale 0→1 (150ms spring) when new notification arrives

  Dropdown (Radix Popover):
    Width: 380px
    Max-height: 480px
    Bg: white, shadow-2xl, radius-xl, border iron-200
