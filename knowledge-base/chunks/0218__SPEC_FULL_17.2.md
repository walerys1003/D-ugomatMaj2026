# 17.2 — Error Monitoring

_source: SPEC_FULL · tags: frontend, backend, ocr, notifications, devops · line 2423 · 312 chars_

Sentry (sentry.io(http://sentry.io/), free tier 5k events/mo). Frontend: automatic error catching (React Error Boundary + Sentry React integration). Backend: Sentry middleware on API routes. Custom context: user_id, case_type, AI model used, OCR provider. Alert rules: >10 errors/hour → Slack/email notification.
