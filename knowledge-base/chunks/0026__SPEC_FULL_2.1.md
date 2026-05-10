# 2.1 — Diagram architektury

_source: SPEC_FULL · tags: frontend, backend, database, ai-engine, ocr, payments, notifications · line 37 · 2436 chars_

┌─────────────────────────────────────────────────────────────────┐
│                        UŻYTKOWNIK                                │
│                   (przeglądarka / mobile)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                           │
│              (Next.js 14 App Router, SSR/ISR)                   │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Landing     │  │  Dashboard   │  │  Wizard (formularz     │  │
│  │  Pages       │  │  (/panel)    │  │  krok po kroku)        │  │
│  │  (ISR/SSG)   │  │  (SSR+CSR)  │  │  (CSR + React Hook    │  │
│  │              │  │              │  │   Form + Zod)          │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API ROUTES (Next.js Route Handlers)          │   │
│  │  /api/auth/*  /api/cases/*  /api/ai/*  /api/payments/*   │   │
│  │  /api/ocr/*   /api/documents/*  /api/notifications/*     │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────────┐
          │                   │                       │
          ▼                   ▼                       ▼
┌──────────────┐  ┌────────────────────┐  ┌──────────────────────┐
│  SUPABASE    │  │  CLAUDE API        │  │  USŁUGI ZEWNĘTRZNE   │
│  (self-host) │  │  (via APIPod.ai)   │  │                      │
│              │  │                    │  │  • Stripe (płatn.)   │
│  • PostgreSQL│  │  • Sonnet 4.6      │  │  • AWS SES (email)   │
│  • Auth      │  │    (generowanie)   │  │  • SMSAPI.pl         │
│  • Storage   │  │  • Haiku 4.5       │  │  • Tesseract.js      │
│  • Realtime  │  │    (walidacja)     │  │  • Puppeteer (PDF)   │
│  • Edge Fn   │  │  • Opus 4.6        │  │  • Fakturownia       │
│              │  │    (edge cases)    │  │  • PostHog (analyt.) │
└──────────────┘  └────────────────────┘  └──────────────────────┘
