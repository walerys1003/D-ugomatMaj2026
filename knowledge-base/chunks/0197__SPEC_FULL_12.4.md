# 12.4 — Incubator fee model

_source: SPEC_FULL · tags: payments · line 2217 · 383 chars_

Model 1 — 5% od transakcji: incubator pobiera 5% każdej płatności. Implementacja: Stripe Connect z automatic splitting lub ręczne obliczenie i przelew. Model 2 — 490 zł/mc flat: stała opłata niezależna od przychodów. Break-even: 490 / 0.05 = 9800 zł MRR. Poniżej 9800 zł → korzystniejszy model 5%. Powyżej → flat 490 zł. Rekomendacja: start z 5%, przejście na flat przy MRR > 10k zł.
