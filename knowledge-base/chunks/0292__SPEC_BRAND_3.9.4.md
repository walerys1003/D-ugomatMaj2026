# 3.9.4 — Document Timeline

_source: SPEC_BRAND · tags: frontend · line 1066 · 1938 chars_

KOMPONENT: DocumentTimeline
Lokalizacja: strona szczegółów sprawy /panel/sprawy/[id]

  Desktop (≥768px): horizontal timeline
  Mobile (<768px): vertical timeline

  Container: bg white, border iron-100, radius-xl, p-6

  HORIZONTAL LAYOUT:
    Flex row, position relative
    Connecting line: absolute, top 50% of dots, height 2px,
      bg iron-200, width calc(100% - 48px), left 24px
    Completed segment: bg dlug-500 (overlay na iron-200 line)

    Każdy punkt:
      Flex col, align-center, flex 1

      Dot:
        Completed: 14px circle, bg dlug-500, border 2px white, shadow-xs
        Active: 14px circle, bg dlug-500, border 2px white,
          + outer ring: 24px, border 2px dlug-300,
            animation: pulse (opacity 0.4→1→0.4, 2s, infinite)
        Future: 14px circle, bg white, border 2px iron-300
        Success: 14px circle, bg accent-500, white checkmark 8px
        Failed: 14px circle, bg danger-500, white X 8px

      Label (below dot, mt-3):
        Inter 13px 600 iron-800 (completed/active)
        Inter 13px 400 iron-400 (future)
        Max-width: 100px, text-center

      Date (below label, mt-1):
        Inter 11px 400 iron-500

    Przykładowe punkty (Sprzeciw EPU):
      ✓ Utworzono      ✓ Wygenerowano    ✓ Opłacono
      12.04.2026       12.04.2026        12.04.2026

      ● Wysłano (ACTIVE — pulsating)
      13.04.2026
      "Oczekiwanie na odpowiedź sądu"

      ○ Odpowiedź sądu (FUTURE)
      —

      ○ Zakończone (FUTURE)
      —

  VERTICAL LAYOUT (mobile):
    Flex col
    Line: absolute, left 10px, width 2px, bg iron-200, top 0 bottom 0
    Completed segment: bg dlug-500

    Każdy punkt: flex row, gap 16px
      Left: dot (10px, positioned on line)
      Right: label + date + optional description
        Label: Inter 14px 600 iron-800
        Date: Inter 12px 400 iron-500
        Description: Inter 13px 400 iron-600 (optional, 1 linia)
      Padding-bottom: 24px per item
