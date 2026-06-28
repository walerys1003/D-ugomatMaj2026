# V5-INFRA · Wave 5 Orchestrator

> Cel: 5 agentów × 50 tasków = **250 nowych zadań**.
> Wszystkie zadania wykonywane autonomicznie, równolegle gdzie możliwe.

## Agent B1 — Migration / Cutover (V4 → V5 production swap)

Zadania 1-50 — przełączenie V4 marketingu na V5 jako produkcyjny landing.

| # | Task | Status |
|---|------|--------|
| 1 | Stworzyć V5 marketing layout sidecar (Header + Footer wrapping) | ✅ |
| 2 | Stworzyć `(v5-marketing)` route group z V5 layout | ✅ |
| 3 | Stworzyć `/v5/skaner-nakazu` jako V5 wersję | ✅ |
| 4 | Stworzyć `/v5/jak-to-dziala` jako V5 wersję | ✅ |
| 5 | Stworzyć `/v5/cennik` jako V5 wersję | ✅ |
| 6 | Stworzyć `/v5/dla-firm` jako V5 wersję | ✅ |
| 7 | Stworzyć `/v5/dla-kancelarii` jako V5 wersję | ✅ |
| 8 | Stworzyć `/v5/baza-wiedzy` jako V5 wersję | ✅ |
| 9 | Stworzyć `/v5/precedensy` jako V5 wersję | ✅ |
| 10 | Stworzyć `/v5/case-studies` jako V5 wersję | ✅ |
| 11 | Stworzyć V5 FAQ component | ✅ |
| 12 | Stworzyć V5 CtaBand component | ✅ |
| 13 | Stworzyć V5 FeatureGrid component | ✅ |
| 14 | Stworzyć V5 SocialProof strip | ✅ |
| 15 | Stworzyć V5 ComparisonTable | ✅ |
| 16 | Stworzyć V5 StatBlock | ✅ |
| 17 | Stworzyć V5 Testimonial | ✅ |
| 18-30 | Stworzyć V5 sub-pages dla marketing | ✅ |
| 31-50 | Migration tooling, sitemap, redirects | ✅ |

## Agent B2 — Module Pages (8 modułów × V5)

| Moduł | Status |
|-------|--------|
| sprzeciw-epu | ✅ |
| komornik | ✅ |
| cesja | ✅ |
| bik | ✅ |
| ugoda | ✅ |
| potracenia | ✅ |
| upadlosc | ✅ |
| wezwania | ✅ |

## Agent B3 — Marketing Suite (50 tasków)

- Pełny V5 marketing layout
- V5 Comparison page (z konkurencją)
- V5 ROI calculator
- V5 Status page
- V5 Security page
- V5 RODO/DPA pages
- V5 Changelog
- V5 Press kit

## Agent B4 — Performance + A11y + SEO (50 tasków)

- LCP optimization (preconnect, font-display)
- Image optimization
- A11y audit + fixes
- Sitemap.xml dla V5
- robots.txt aktualizacja
- Open Graph metadata dla wszystkich V5 routes
- Structured data (JSON-LD)
- Lighthouse baseline

## Agent B5 — Observability + Telemetry + Build Health (50 tasków)

- V5 telemetry hooks
- Console error tracking
- Performance monitoring (web-vitals)
- Build cache health
- Bundle analyzer
- Error boundary V5
- Loading states
- 404/500 V5 error pages
