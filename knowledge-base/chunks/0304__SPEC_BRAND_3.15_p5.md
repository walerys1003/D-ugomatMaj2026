# 3.15#p5 — FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW (part 5)

_source: SPEC_BRAND · tags: frontend, database, ai-engine · line 1410 · 3900 chars_

  Content:
    Bg: white (light) / --bg-modal (dark)
    Radius: --radius-xl (18px)
    Shadow: --shadow-2xl
    Max-width: 520px (default), 640px (large), 400px (small)
    Max-height: calc(100vh - 64px)
    Overflow-y: auto (for long content)
    Margin: 32px auto

    Animation:
      Enter: scale 0.96→1.0, opacity 0→1, 200ms ease-out
      Exit: scale 1.0→0.98, opacity 1→0, 150ms ease-in
      prefers-reduced-motion: opacity only, 150ms

  Structure:
    ┌─────────────────────────────────────────┐
    │ HEADER: flex row between, p-6 pb-0      │
    │  Left: H3 (Inter 700 --text-h3 iron-900)│
    │  Right: X button (icon-only ghost,       │
    │    iron-400, hover iron-600, 32x32px)   │
    ├─────────────────────────────────────────┤
    │ BODY: p-6, flex col, gap-4              │
    │  Description: Inter 15px 400 iron-600   │
    │  Form fields / content                  │
    ├─────────────────────────────────────────┤
    │ FOOTER: flex row justify-end, gap-3,    │
    │   p-6 pt-0                              │
    │  [Anuluj] ghost button                  │
    │  [Potwierdź] primary button             │
    └─────────────────────────────────────────┘

  Danger modal (delete confirmation):
    Icon: AlertTriangle 48px danger-500, center, mb-4
    Heading: center
    Description: center, max-width 360px
    CTA: [Usuń] danger button, full-width
    Cancel: ghost button, full-width, below danger button

  Keyboard:
    Escape: close (always)
    Tab: trapped inside modal (focus trap)
    Initial focus: first focusable element (or close button)
    Return focus: to trigger element on close

  Mobile (<640px):
    Converted to bottom sheet:
      Radius: radius-xl radius-xl 0 0 (top corners only)
      Max-height: 85vh
      Width: 100%
      Bottom: 0
      Animation: slide-up from bottom (translateY 100%→0%, 250ms spring)
      Drag handle: centered top, 36x4px, bg iron-300, radius-full, mt-2
      Swipe down to dismiss (threshold: 100px translateY)
ACCORDION / COLLAPSIBLE (Radix Accordion):
  Usage: FAQ section, Legal Tip Panel (mobile), additional info blocks

  Item container:
    Border-bottom: 1px iron-200
    First item: border-top: 1px iron-200

  Trigger:
    Flex row between, py-5, px-0, w-full
    Text: Inter 16px 600 iron-900
    Icon: ChevronDown 18px iron-500, right side

    Hover: text dlug-600
    Focus: outline none, text dlug-600 (subtle — no ring inside accordion)

    Open state:
      Icon: rotated 180° (transition: transform 200ms ease)
      Text color: dlug-700

  Content:
    Animation:
      Open: height 0→auto, opacity 0→1
        Duration: 250ms cubic-bezier(0.16, 1, 0.3, 1)
      Close: height auto→0, opacity 1→0
        Duration: 200ms ease-in

    Padding: pb-5 (top padding from gap with trigger)
    Text: Inter 15px 400 iron-700, leading-relaxed
    Max-width: 640px (prevent ultra-wide paragraphs)

    Links inside: dlug-500, hover underline

  Single-expand variant (FAQ): only one item open at a time
  Multi-expand variant (settings): multiple items can be open
TABS (Radix Tabs):
  Usage: document detail page (Podgląd / Dane / Historia),
         settings page, module comparison

  Tab list:
    Flex row, border-bottom 2px iron-200, gap-0
    Overflow-x: auto on mobile (horizontal scroll, no scrollbar visible)

  Tab trigger:
    Padding: 12px 20px
    Font: Inter 14px 500 iron-600
    Border-bottom: 2px transparent (overlay on list border)
    Position: relative, bottom -2px (sits on top of list border)
    Transition: color 150ms, border-color 150ms

    Hover: text iron-800
    Active:
      Text: dlug-600, font-weight 600
      Border-bottom: 2px dlug-500
    Focus (keyboard):
      text dlug-600, subtle bg dlug-50, radius-t-md
    Disabled: iron-400, cursor-not-allowed

  Tab content:
    Padding-top: 24px
    Animation: opacity 0→1, 150ms ease (no slide — tabs should feel instant)
