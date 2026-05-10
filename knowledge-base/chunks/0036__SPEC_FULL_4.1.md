# 4.1 — Struktura katalogów

_source: SPEC_FULL · tags: frontend, backend, database, ai-engine, ocr, payments, notifications, modules, devops, monorepo · line 102 · 11519 chars_

dlugomat/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # lint + test + type-check
│   │   ├── deploy-preview.yml        # deploy preview na Vercel
│   │   └── deploy-production.yml     # deploy production
│   └── CODEOWNERS
├── .vscode/
│   ├── settings.json
│   ├── extensions.json               # rekomendowane rozszerzenia
│   └── launch.json
├── spec/                             # dokumentacja specyfikacji
│   ├── 00-index.md
│   ├── 01-architektura.md
│   ├── 02-core.md
│   ├── 05-dlugomat.md
│   ├── 07-api.md
│   └── 08-db-schema.md
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # route group: landing, cennik, blog
│   │   │   ├── page.tsx              # strona główna
│   │   │   ├── cennik/page.tsx
│   │   │   ├── jak-to-dziala/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── layout.tsx            # marketing layout (navbar, footer)
│   │   ├── (auth)/                   # route group: login, register
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # route group: panel użytkownika
│   │   │   ├── panel/
│   │   │   │   ├── page.tsx          # dashboard główny
│   │   │   │   ├── sprawy/
│   │   │   │   │   ├── page.tsx      # lista spraw
│   │   │   │   │   ├── [id]/page.tsx # szczegóły sprawy
│   │   │   │   │   └── nowa/page.tsx # kreator nowej sprawy
│   │   │   │   ├── dokumenty/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── terminy/page.tsx
│   │   │   │   ├── profil/page.tsx
│   │   │   │   └── platnosci/page.tsx
│   │   │   └── layout.tsx            # dashboard layout (sidebar, header)
│   │   ├── (wizards)/                # route group: kreatory pism
│   │   │   ├── sprzeciw-epu/
│   │   │   │   ├── page.tsx          # start wizarda
│   │   │   │   ├── [step]/page.tsx   # dynamiczne kroki
│   │   │   │   └── podsumowanie/page.tsx
│   │   │   ├── komornik-shield/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [step]/page.tsx
│   │   │   ├── bik-fix/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [step]/page.tsx
│   │   │   ├── cesja-check/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [step]/page.tsx
│   │   │   ├── ugodo-mat/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [step]/page.tsx
│   │   │   ├── upadlosc-lite/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [step]/page.tsx
│   │   │   └── potracenia-stop/
│   │   │       ├── page.tsx
│   │   │       └── [step]/page.tsx
│   │   ├── api/                      # Route Handlers
│   │   │   ├── auth/
│   │   │   │   ├── callback/route.ts
│   │   │   │   └── [...supabase]/route.ts
│   │   │   ├── cases/
│   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │   │       └── documents/route.ts
│   │   │   ├── ai/
│   │   │   │   ├── generate/route.ts # POST — generowanie pisma
│   │   │   │   ├── validate/route.ts # POST — walidacja Haiku
│   │   │   │   ├── chat/route.ts     # POST — AI asystent "Co dalej?"
│   │   │   │   └── analyze-ocr/route.ts
│   │   │   ├── ocr/
│   │   │   │   ├── upload/route.ts   # POST — upload i OCR
│   │   │   │   └── status/[id]/route.ts
│   │   │   ├── documents/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── [id]/pdf/route.ts # GET — render PDF
│   │   │   ├── payments/
│   │   │   │   ├── create-session/route.ts
│   │   │   │   ├── webhook/route.ts  # Stripe webhook
│   │   │   │   └── status/[id]/route.ts
│   │   │   ├── notifications/
│   │   │   │   ├── deadlines/route.ts
│   │   │   │   └── send/route.ts
│   │   │   └── admin/
│   │   │       ├── stats/route.ts
│   │   │       └── users/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                # root layout
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   ├── layout/
│   │   │   ├── marketing-navbar.tsx
│   │   │   ├── marketing-footer.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── dashboard-header.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── wizards/
│   │   │   ├── wizard-shell.tsx      # wspólny shell dla wszystkich wizardów
│   │   │   ├── step-indicator.tsx
│   │   │   ├── wizard-navigation.tsx
│   │   │   ├── ocr-upload-step.tsx
│   │   │   ├── data-review-step.tsx
│   │   │   ├── arguments-step.tsx
│   │   │   ├── preview-step.tsx
│   │   │   ├── payment-step.tsx
│   │   │   └── download-step.tsx
│   │   ├── dashboard/
│   │   │   ├── case-card.tsx
│   │   │   ├── deadline-widget.tsx
│   │   │   ├── stats-overview.tsx
│   │   │   ├── recent-documents.tsx
│   │   │   └── ai-chat-widget.tsx
│   │   ├── marketing/
│   │   │   ├── hero-section.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── pricing-table.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── faq-section.tsx
│   │   │   ├── trust-badges.tsx
│   │   │   └── cta-section.tsx
│   │   └── shared/
│   │       ├── ocr-viewer.tsx
│   │       ├── pdf-preview.tsx
│   │       ├── document-editor.tsx
│   │       ├── deadline-countdown.tsx
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # browser client
│   │   │   ├── server.ts             # server client
│   │   │   ├── admin.ts              # service role client
│   │   │   └── middleware.ts         # auth middleware
│   │   ├── ai/
│   │   │   ├── claude-client.ts      # APIPod wrapper
│   │   │   ├── prompts/
│   │   │   │   ├── sprzeciw-epu.ts
│   │   │   │   ├── komornik-shield.ts
│   │   │   │   ├── bik-fix.ts
│   │   │   │   ├── cesja-check.ts
│   │   │   │   ├── ugodo-mat.ts
│   │   │   │   ├── upadlosc-lite.ts
│   │   │   │   ├── potracenia-stop.ts
│   │   │   │   └── validation.ts     # prompt walidacyjny Haiku
│   │   │   ├── rag/
│   │   │   │   ├── legal-context.ts  # baza orzecznictwa
│   │   │   │   ├── embeddings.ts     # generowanie embeddingów
│   │   │   │   └── retriever.ts      # wyszukiwanie kontekstu
│   │   │   └── pipeline.ts           # orchestrator generowania
│   │   ├── ocr/
│   │   │   ├── tesseract-worker.ts
│   │   │   ├── textract-client.ts
│   │   │   ├── parser.ts             # ekstrakcja danych z OCR
│   │   │   └── nakaz-parser.ts       # specjalizowany parser nakazów
│   │   ├── pdf/
│   │   │   ├── generator.ts          # Puppeteer PDF render
│   │   │   ├── templates/
│   │   │   │   ├── sprzeciw.html
│   │   │   │   ├── wniosek-komornik.html
│   │   │   │   ├── reklamacja-bik.html
│   │   │   │   ├── odpowiedz-cesja.html
│   │   │   │   ├── ugoda.html
│   │   │   │   ├── wniosek-upadlosc.html
│   │   │   │   └── base-layout.html  # wspólny layout
│   │   │   └── styles/
│   │   │       └── legal-document.css
│   │   ├── payments/
│   │   │   ├── stripe-client.ts
│   │   │   ├── pricing.ts            # cennik i logika zniżek
│   │   │   └── invoice.ts            # integracja Fakturownia
│   │   ├── notifications/
│   │   │   ├── email-client.ts       # AWS SES
│   │   │   ├── sms-client.ts         # SMSAPI.pl
│   │   │   ├── templates/
│   │   │   │   ├── welcome.html
│   │   │   │   ├── document-ready.html
│   │   │   │   ├── deadline-reminder.html
│   │   │   │   ├── payment-confirmation.html
│   │   │   │   └── deadline-urgent.html
│   │   │   └── scheduler.ts          # CRON dla deadline'ów
│   │   ├── calculators/
│   │   │   ├── przedawnienie.ts      # kalkulator przedawnienia
│   │   │   ├── kwota-wolna.ts        # kalkulator kwoty wolnej
│   │   │   ├── potracenia.ts         # kalkulator potrąceń
│   │   │   └── budzet-domowy.ts      # kalkulator budżetu
│   │   ├── validators/
│   │   │   ├── case-schema.ts        # Zod schemas dla spraw
│   │   │   ├── document-schema.ts
│   │   │   ├── payment-schema.ts
│   │   │   └── user-schema.ts
│   │   ├── utils/
│   │   │   ├── dates.ts              # polskie formaty dat
│   │   │   ├── currency.ts           # formatowanie PLN
│   │   │   ├── legal-terms.ts        # słownik terminów prawnych
│   │   │   └── analytics.ts          # PostHog wrapper
│   │   └── constants/
│   │       ├── deadlines.ts          # terminy procesowe
│   │       ├── courts.ts             # lista sądów
│   │       ├── pricing.ts            # cennik produktów
│   │       └── legal-bases.ts        # podstawy prawne
│   ├── hooks/
│   │   ├── use-wizard.ts             # zarządzanie stanem wizarda
│   │   ├── use-ocr.ts                # hook OCR
│   │   ├── use-deadline.ts           # countdown do terminu
│   │   ├── use-ai-generate.ts        # hook generowania AI
│   │   ├── use-case.ts               # CRUD sprawy
│   │   └── use-payment.ts            # hook płatności
│   ├── stores/
│   │   ├── wizard-store.ts           # Zustand — stan wizarda
│   │   ├── case-store.ts             # Zustand — bieżąca sprawa
│   │   └── ui-store.ts               # Zustand — stan UI
│   └── types/
│       ├── database.ts               # auto-generated z Supabase
│       ├── ai.ts                     # typy dla promptów/odpowiedzi
│       ├── wizard.ts                 # typy wizarda
│       ├── case.ts                   # typy spraw
│       └── document.ts               # typy dokumentów
├── supabase/
│   ├── config.toml                   # konfiguracja self-hosted
│   ├── migrations/
│   │   ├── 20260401000000_init.sql
│   │   ├── 20260401000001_auth.sql
│   │   ├── 20260401000002_cases.sql
│   │   ├── 20260401000003_documents.sql
│   │   ├── 20260401000004_payments.sql
│   │   ├── 20260401000005_deadlines.sql
│   │   ├── 20260401000006_ocr.sql
│   │   ├── 20260401000007_notifications.sql
│   │   ├── 20260401000008_rls_policies.sql
│   │   └── 20260401000009_indexes.sql
│   ├── seed.sql                      # dane testowe
│   └── functions/
│       ├── deadline-checker/index.ts  # Edge Function — CRON
│       └── ocr-processor/index.ts     # Edge Function — OCR
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── og-image.jpg
│   │   ├── hero-illustration.svg
│   │   └── icons/
│   ├── fonts/
│   │   ├── inter-var.woff2
│   │   └── space-grotesk-var.woff2
│   └── legal/
│       ├── regulamin.pdf
│       └── polityka-prywatnosci.pdf
├── tests/
│   ├── unit/
│   │   ├── calculators/
│   │   ├── validators/
│   │   └── parsers/
│   ├── integration/
│   │   ├── api/
│   │   └── ai/
│   └── e2e/
│       ├── wizard-flow.spec.ts
│       ├── payment-flow.spec.ts
│       └── ocr-flow.spec.ts
├── scripts/
│   ├── generate-types.ts             # Supabase type generation
│   ├── seed-legal-data.ts            # import orzecznictwa
│   └── test-ai-prompts.ts            # testowanie promptów
├── .env.local.example
├── .kilocodeignore                   # ignoruje spec/ i tests/ w kontekście
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
