# 3.11 — RESPONSYWNOŚĆ

_source: SPEC_BRAND · tags: frontend, database, payments, brand · line 1225 · 1889 chars_

BREAKPOINTS (Tailwind defaults + custom):
  xs:  475px   (duże telefony landscape)
  sm:  640px   (małe tablety)
  md:  768px   (tablety portrait)
  lg:  1024px  (tablety landscape, małe laptopy)
  xl:  1280px  (desktop standard)
  2xl: 1536px  (duże monitory)

MOBILE (<768px):
  Sidebar: ukryty, dostępny via hamburger (top-left)
    Overlay: bg iron-950/60% backdrop-blur-sm
    Sidebar slides in from left, 280px, shadow-2xl
    Close: X button top-right sidebar + tap overlay

  Nawigacja: bottom tab bar (fixed bottom)
    5 items: Dashboard, Sprawy, Nowe pismo, Terminy, Więcej
    Height: 64px + safe-area-inset-bottom
    Bg: white, border-top iron-200, shadow-sm
    Active: dlug-500 icon + label, scale 1.05
    Inactive: iron-400 icon, iron-500 label (11px)

  Wizard: full-width (px-4), single column
    Cards: radius-lg (not 2xl — mniejszy radius na mobile)
    Buttons: full-width, stacked vertically
    Legal Tip Panel: collapsed accordion below form

  Hero: single column, text centered
    H1: --text-display-h1 (clamp handles sizing)
    Ilustracja: hidden on mobile (treść ważniejsza)
    CTA: full-width stack

  Pricing: single column, scroll, cards full-width
    „NAJPOPULARNIEJSZY" card: first (not second)

  Tables: horizontal scroll with fade indicators (left/right gradient)

TABLET (768-1023px):
  Sidebar: collapsed (64px width, icons only, tooltip on hover)
  Content: expands to fill
  Wizard: full width z padding 48px
  Gridy: 2 kolumny zamiast 3-4

DESKTOP (≥1024px):
  Sidebar: expanded (272px)
  Wizard: max-width 800px + Legal Tip Panel right (280px)
  Dashboard: 2x2 widget grid
  Pricing: 3 kolumny

PRINT (@media print):
  Ukryj: sidebar, navigation, buttons, shadows, backgrounds
  Zachowaj: treść sprawy, timeline, dane, tabelę podsumowującą
  Force: black text, white bg, border 1px solid #000
  PDF previews: render full page without scroll
