# 17.1 — Analytics (PostHog)

_source: SPEC_FULL · tags: frontend, payments, modules, devops · line 2420 · 574 chars_

Self-hosted PostHog (docker) lub cloud (EU region). Tracking: page views, button clicks (every CTA), funnel analysis (landing → register → scan → generate → pay → download), feature usage (which modules, which arguments selected), retention (7-day, 30-day), session recording (opt-in, for UX debugging), A/B testing (pricing, copy, layout).
Key funnels to track: Visit → Free Scan (D1 conversion), Scan → Register (lead capture), Register → Generate (activation), Generate → Pay (monetization), Pay → Download (completion), Download → Second Purchase (retention/cross-sell).
