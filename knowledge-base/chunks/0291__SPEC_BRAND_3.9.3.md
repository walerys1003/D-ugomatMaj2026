# 3.9.3 — AI Success Estimator

_source: SPEC_BRAND · tags: frontend, strategy · line 1013 · 1726 chars_

KOMPONENT: SuccessEstimator
Lokalizacja: wizard krok 3 (po wyborze powodu sprzeciwu/odwołania)

  Pojawia się po wybraniu powodu (300ms delay).

  Card:
    Background: dlug-50, border 1px dlug-100, radius-lg, padding 16px
    Flex row, gap 14px, align-center

    Left: circular mini-chart (40px × 40px)
      SVG circle:
        Track: stroke dlug-200, stroke-width 3px
        Fill: stroke dynamiczny:
          ≥70% → accent-500
          40-69% → warn-500
          <40% → danger-500
        stroke-dasharray: calculated, stroke-linecap round
        Animacja fill: 0 → target %, 800ms, ease-out, delay 200ms
      Center number: Inter 12px 700, kolor fill

    Center:
      Linia 1: "Szacunkowa skuteczność: 82%"
        Inter 14px 600 iron-800
      Linia 2: "Na podstawie 1 240 podobnych spraw"
        Inter 12px 400 iron-500

    Right:
      Info icon (InfoCircle 16px dlug-400)
      Tooltip on hover:
        Bg: white, shadow-xl, radius-lg, p-4, max-width 260px
        "Szacunek opiera się na analizie AI wyników podobnych spraw
         z tego samego powodu i wobec tego samego typu wierzyciela.
         Nie jest to porada prawna."
        Inter 13px 400 iron-700

  Animacja wejścia:
    Container: height 0→auto, opacity 0→1, 250ms,
    ease [0.16, 1, 0.3, 1]

  Zmiana powodu:
    Fade out 100ms → update data → fade in 200ms
    Chart re-animates from 0

  API: POST /api/ai/estimate-success
    Body: { module: "D2", reason: "przedawnienie",
            creditor_type: "fundusz_sekurytyzacyjny" }
    Response: { score: 82, sample_size: 1240, confidence: "high" }

  Fallback (jeśli API niedostępne):
    Ukryj komponent — nie pokazuj "brak danych" ani błędu.
    Wizard działa normalnie bez estimatora.
