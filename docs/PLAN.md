# DŁUGOMAT — Master Work Plan

> **Source of truth:** `docs/spec/SPEC_FULL.txt` + `docs/spec/SPEC_BRAND.md`
> **Knowledge base:** chunked & indexed in `knowledge-base/` (307 chunks, 15 tags).
> **Retrieval:** `python3 scripts/kb_query.py "<query>" [--tag X] [--k N]` —
> agents pull only the chunks they need, never the full spec.

## Critical evaluation of the input brief

The user's instruction has been re-read and challenged before planning:

1. **"5 tiers × 50 tasks = 250 tasks for initial coding"** — adopted as-is. This
   gives a clear delivery cadence (≈ MVP in tier 1–2, full feature parity in
   3–4, hardening + launch in 5). 250 tasks ≈ 50 PR-sized units.
2. **Parallel "modal agents"** — implemented as **specialized agent prompts**
   under `agents/`. Each agent is given only:
   * its scope (frontend / backend / db / ai / design / ops / qa),
   * the **chunk IDs** it is allowed to read for the current task,
   * acceptance criteria.
   This avoids context blow-up and keeps each agent fast and on-topic.
3. **"Design beyond the spec"** — the brand chapter is treated as a *floor*,
   not a ceiling. The design agent is instructed to propose upgrades
   (motion, depth, micro-interactions, dark mode v2) provided they preserve
   the "Tarcza" archetype (authority + safety, never panic).
4. **Anti-patterns rejected:**
   * No "monorepo for the sake of monorepo" — single Next.js 14 app with
     Supabase, exactly as the spec mandates. A `packages/` split would slow
     things down without a second consumer.
   * No bespoke embeddings stack on day 1 — TF-IDF retriever is enough to
     route chunks to agents; semantic embeddings are a tier-3 upgrade
     (`pgvector` + `legal_knowledge` table is already in the schema).
5. **Risk-prioritised ordering:** OCR + AI engine + payments are the highest-
   risk subsystems (legal liability, cost), so they get end-to-end vertical
   slices early, not at the end.

---

## Architecture target (tl;dr)

```
Next.js 14 (App Router, TS, RSC)        ← apps/web
  ├── Tailwind 3.4 + shadcn/ui + Framer Motion
  ├── React Hook Form + Zod
  └── Route Handlers /api/*               ← backend lives here

Supabase (self-hostable)
  ├── PostgreSQL 15 + RLS + pgvector
  ├── Auth (magic link / email-pw / OAuth)
  ├── Storage buckets (uploads, generated PDFs)
  └── Edge Functions (deadline CRON)

External
  ├── APIPod.ai → Claude Sonnet 4.6 / Haiku 4.5 / Opus 4.6
  ├── Tesseract.js (client) → AWS Textract fallback
  ├── Stripe + Fakturownia
  ├── Resend + SMSAPI.pl
  └── Puppeteer (HTML→PDF)
```

---

## Tier overview

| Tier | Theme                          | Tasks | Exit criteria                                 |
| ---- | ------------------------------ | ----- | --------------------------------------------- |
| 1    | Foundation & Design System     | 50    | Landing + auth + design tokens shipped        |
| 2    | Core data & Wizard engine      | 50    | DB live, RLS green, Wizard for D2 end-to-end  |
| 3    | AI Engine + OCR + first 3 modules (D1, D2, D5) | 50 | Free skaner + paid sprzeciw + BIK Fix |
| 4    | Remaining modules (D3, D4, D6, D7, D8) + payments | 50 | Stripe live, full module set, invoices |
| 5    | Hardening, security, launch    | 50    | Pen-test, RODO, monitoring, marketing site, GA |

Each tier ends with: green CI, passing E2E happy-path, deployed preview, PR
to `main` with squashed commit and passing review checklist.

---

## TIER 1 — Foundation & Design System (50)

> Delivers a production-grade shell: design tokens, primitives, landing page,
> auth flow, RLS-protected `profiles`, deploy pipeline.

### 1.1 Repo & tooling (1–8)
1. Bootstrap Next.js 14 app (`apps/web`) with TS, App Router, ESLint, Prettier.
2. Add Tailwind 3.4 with custom theme extension matching brand tokens.
3. Add shadcn/ui base setup + global CSS variables.
4. Configure path aliases (`@/components`, `@/lib`, `@/server`, `@/types`).
5. Add `.editorconfig`, commit hooks (lint-staged + husky).
6. Add `vitest` + `@testing-library/react` + Playwright skeleton.
7. Add GitHub Actions CI: lint, typecheck, unit, build.
8. Add `.env.example` with every required key, documented.

### 1.2 Design tokens (9–16)
9. CSS variables for `dlugomat` navy palette (50–950).
10. CSS variables for `accent` green palette + status amber/red.
11. Iron neutral palette + semantic mappings (bg, fg, border, muted).
12. Fluid typography scale (`clamp()` H1–H6 + body + small).
13. Font loader: Inter (UI), IBM Plex Serif (legal/long-form), JetBrains Mono.
14. Spacing & radius tokens (4-pt grid + Tarcza radii: 4 / 8 / 12 / 20).
15. Shadow system (subtle / card / pop / focus-ring / pressed).
16. Motion tokens (durations + easings; "calm-confident" curves only).

### 1.3 Primitive components (17–28)
17. Button (variants: primary navy, danger, success, ghost, link, icon).
18. Input + Textarea + Select with field shell + error/help slot.
19. Form wrapper bound to React Hook Form + Zod.
20. Card with elevations + status border-left utility.
21. Badge (info / warn / danger / success / neutral) with pill + dot variants.
22. Tooltip with explainer for legal jargon.
23. Modal / Dialog (Radix) with focus-trap + close-on-esc.
24. Toast / Sonner with status colours.
25. Tabs, Accordion, Sheet, DropdownMenu (shadcn baselines).
26. Skeleton + Spinner + Progress (linear + countdown ring).
27. Icon set wrapper (lucide-react) + 8 custom legal icons placeholder.
28. Empty-state component (illustration slot + CTA).

### 1.4 Application shell (29–36)
29. Root layout with theme provider, viewport meta, font preloads.
30. SiteHeader (marketing) — logo, nav, CTA, sticky shadow on scroll.
31. SiteFooter — legal links, RODO, contact, status page.
32. AppShell (post-auth) — sidebar + topbar + breadcrumbs + user menu.
33. Sidebar nav with active states + collapsed mobile drawer.
34. Topbar: notifications bell, search, user avatar menu.
35. Light/Dark mode toggle (system / light / dark).
36. Skip-to-content link + landmark roles for WCAG.

### 1.5 Landing page (37–44)
37. Hero section (gradient navy, headline, subhead, CTA, trust strip).
38. "Jak to działa" 4-step section with iconography.
39. Module catalog grid (D1–D8 cards) with status badges.
40. Pricing teaser + comparison anchor.
41. Social proof / testimonials placeholder (structured data ready).
42. FAQ accordion (12 entries from spec wording).
43. Footer CTA band + legal disclaimer.
44. SEO: metadata, Open Graph, JSON-LD `Organization` + `WebApplication`.

### 1.6 Auth + profile + RLS scaffold (45–50)
45. Supabase client (browser + server) with cookie session.
46. Magic-link sign-in + email/password sign-up pages.
47. Email verification + reset password pages.
48. `profiles` table migration + trigger on `auth.users`.
49. RLS: `select_own`, `update_own`; deny all by default.
50. Middleware: protect `/panel/*`, redirect logged-in users from `/auth/*`.

---

## TIER 2 — Core data & Wizard engine (50)

> Delivers the full database schema, Wizard primitives, deadline engine,
> documents storage, and one full vertical slice: D2 Sprzeciw EPU.

### 2.1 Database schema (51–66)
51. `cases` table + enums (case_type, case_status).
52. `documents` table + version history + storage path.
53. `document_versions` table.
54. `case_events` audit table.
55. `deadlines` table with `due_at`, `notify_offsets`, `acknowledged_at`.
56. `notifications` table + outbound channel enum.
57. `payments` + `invoices` tables.
58. `legal_knowledge` table with `pgvector` column (1536 dims).
59. `prompt_templates` + `prompt_versions` tables.
60. `validation_runs` table linking documents ↔ Haiku checks.
61. Storage buckets: `uploads`, `generated`, `internal`.
62. RLS for cases (owner only) + admin override role.
63. RLS for documents + signed URL helper for owners.
64. RLS for deadlines / notifications.
65. Seed script: 8 module definitions, 32 pism templates metadata.
66. Migrations runner (`supabase/migrations/*.sql`) + rollback note.

### 2.2 Wizard engine (67–80)
67. WizardShell layout with persistent header + step indicator.
68. Step provider (state machine, can branch on answers).
69. Per-step Zod schema registry, composed at submit.
70. Auto-save draft to `cases.draft_payload` (debounced 1.5 s).
71. Resume-where-you-left-off on revisit.
72. Step transitions with Framer Motion (slide-up + fade).
73. Field components: legal date, currency, signature, file uploader.
74. File uploader → Supabase Storage with progress + retry.
75. OCR confidence indicator slot in field.
76. Inline help "What is this?" popovers.
77. Mobile bottom-sticky Continue bar.
78. Keyboard navigation (Enter to advance, Esc to back).
79. Error summary at top of step, scrolls into view.
80. Wizard test harness (Playwright fixtures for D2 happy path).

### 2.3 Case lifecycle + deadlines (81–90)
81. `POST /api/cases` create case + initial event.
82. `GET /api/cases/:id` with documents + deadlines.
83. `PATCH /api/cases/:id/status` with state-machine guard.
84. Deadline service: compute due dates per case_type rules.
85. Deadline CRON Edge Function (every 30 min).
86. `POST /api/notifications/dispatch` (idempotent).
87. Email channel via Resend.
88. SMS channel via SMSAPI.pl.
89. In-app notification list + mark-as-read.
90. Deadline countdown widget (UI primitive in tier 1, wired here).

### 2.4 D2 Sprzeciw EPU vertical slice (91–100)
91. Case-create flow: choose module → opens Wizard.
92. D2 step 1: identyfikacja stron + sygnatura.
93. D2 step 2: kwota główna + odsetki + opłaty.
94. D2 step 3: zarzuty (przedawnienie, brak doręczenia, błędna kwota).
95. D2 step 4: dane sądu i e-Sądu.
96. D2 step 5: podgląd + akceptacja regulaminu.
97. Document scaffold (no AI yet — fixed template) → PDF.
98. Generated PDF stored in `generated` bucket; signed URL.
99. Case detail page with timeline + document download.
100. E2E Playwright test: signup → wizard → PDF download.

---

## TIER 3 — AI Engine + OCR + D1, D2, D5 (50)

> Replaces the static D2 template with the real Claude pipeline, ships D1
> free Skaner Nakazu, ships D5 BIK-Fix, and delivers OCR end-to-end.

### 3.1 AI infrastructure (101–115)
101. APIPod client wrapper with retries + cost logging.
102. Sonnet 4.6 generation endpoint.
103. Haiku 4.5 validator with checklist schema.
104. Opus 4.6 escalation path (only on Haiku score < 0.7 twice).
105. Prompt template registry (DB-backed).
106. RAG retriever: pgvector cosine search over `legal_knowledge`.
107. Prompt composer: system + RAG + user payload.
108. Streaming SSE endpoint for chat.
109. Token tracker per user + per case.
110. Cost guardrails (per-user daily ceiling).
111. Fallback to deterministic template when AI fails twice.
112. PII scrubber before logging prompts.
113. Output sanitizer (no markdown injections, balanced delimiters).
114. Markdown→PDF (Puppeteer) renderer with letterhead.
115. Document validation badge on case detail.

### 3.2 OCR pipeline (116–128)
116. Tesseract.js Web Worker bootstrap.
117. Image preprocessing (grayscale, deskew, contrast).
118. Confidence threshold logic; fallback decision.
119. AWS Textract server route as fallback.
120. NakazParser: extract sygnatura, kwota, data, wierzyciel.
121. Komornik parser: signatures Km / Kmp / Kms.
122. BIK report parser.
123. OCR result normalizer (whitespace, Polish chars).
124. OCR review UI: side-by-side scan + extracted fields.
125. Manual correction → save back to case.
126. OCR cache by file hash.
127. Multi-page PDF support.
128. OCR confidence telemetry to PostHog.

### 3.3 D1 Skaner Nakazu — FREE (129–136)
129. D1 landing entry (no auth required).
130. Drop-zone upload with file-type guard.
131. Run OCR pipeline, show live progress.
132. Display parsed fields with edit-in-place.
133. Show "Co dalej?" CTA → upsell to D2.
134. Save anonymous scan; bind to user on signup.
135. Server-side rate limit (3 free scans / IP / day).
136. SEO landing page targeting "skaner nakazu zapłaty".

### 3.4 D2 Sprzeciw EPU — AI version (137–145)
137. Replace static template with Sonnet generator.
138. Inject RAG: relevant Kpc articles + 2018 nowelizacja.
139. Validate with Haiku checklist (7 items).
140. Retry-with-corrections loop (max 2).
141. Show validation_score + warnings on preview.
142. Allow user-edit of generated draft (rich text).
143. Final PDF export with signature box.
144. Email delivery option (PDF as attachment).
145. Replace E2E test from tier 2 with the AI version.

### 3.5 D5 BIK-Fix (146–150)
146. Wizard for BIK negative entry dispute.
147. Generate "Wniosek o korektę BIK" via Sonnet.
148. Generate cover letter to bank.
149. Deadline tracking (30-day BIK response window).
150. Pricing & checkout link (deferred to tier 4 Stripe).

---

## TIER 4 — Modules D3 / D4 / D6 / D7 / D8 + Payments (50)

### 4.1 Payments + invoicing (151–166)
151. Stripe products/prices seeded from spec cennik.
152. Checkout session creator per module.
153. Webhook handler (signed, idempotent).
154. `payments` write on success + grant document access.
155. Failed payment retry UX.
156. Refund flow + admin tool.
157. Tax / VAT logic (PL B2C + B2B with VAT-ID).
158. Fakturownia integration: auto-issue invoice on success.
159. Invoice download from user panel.
160. Promo codes table + validator.
161. Subscription model for D10 (V2 prep — schema only).
162. Receipts email template.
163. Payment failure recovery emails.
164. Stripe test-mode E2E.
165. Payment analytics → admin KPI tile.
166. PCI-relevant logging (no PAN, no CVV ever).

### 4.2 D3 KomornikShield (167–177)
167. Wizard: skarga na czynności komornika.
168. Wizard: wniosek o ograniczenie egzekucji.
169. Wizard: wniosek o zwolnienie kwoty wolnej.
170. Wizard: wniosek o umorzenie postępowania.
171. Bundle vs single-doc pricing UI.
172. Komornik letterhead parsing helper.
173. Calculator: kwota wolna od zajęcia (pensja / emerytura / 500+).
174. Calculator surface in case + downloadable PDF.
175. RAG: art. 829 kpc, art. 833 kpc, ustawa o komornikach.
176. Validation checklist (7 items) per pismo.
177. E2E test: pakiet 4 pism Komornik.

### 4.3 D4 PotrąceniaStop (178–185)
178. Wizard: wniosek do pracodawcy o wstrzymanie potrąceń.
179. Wizard: wniosek do banku o odblokowanie kwoty wolnej.
180. Wizard: skarga do komornika (kwota wolna).
181. Calculator: kwota wolna z wynagrodzenia (Kp).
182. Calculator: kwota wolna z konta (UFG limit).
183. Pricing: pakiet 199 zł / solo 79 zł.
184. RAG: art. 87 Kp, prawo bankowe.
185. E2E test.

### 4.4 D6 CesjaCheck (186–192)
186. Upload umowy cesji + OCR.
187. AI weryfikacja stron cesji + skuteczności.
188. Generator: wezwanie do okazania umowy cesji.
189. Generator: zarzut braku legitymacji procesowej.
190. RAG: art. 509 kc + orzecznictwo SN.
191. Pricing 149 zł.
192. E2E test.

### 4.5 D7 UgodoMat (193–197)
193. Wizard: propozycja ugody do wierzyciela.
194. AI proponuje warunki (split kapitał / odsetki / koszty / raty).
195. Generator harmonogramu spłaty PDF.
196. Tracking statusu ugody + amend.
197. E2E test.

### 4.6 D8 Upadłość-Lite (198–200)
198. Wizard wniosku o upadłość konsumencką (formularz urzędowy).
199. AI uzasadnienie + spis majątku/wierzycieli.
200. Generator paczki ZIP gotowej do wysyłki.

---

## TIER 5 — Hardening, security, launch (50)

### 5.1 Security & compliance (201–215)
201. Rate-limiting middleware (token bucket per IP + user).
202. CSP, HSTS, X-Content-Type-Options, Referrer-Policy.
203. CSRF for cookie-auth POST endpoints.
204. Input validation Zod everywhere (server + client mirror).
205. File scan: type sniff (magic bytes) + ClamAV in worker.
206. PII redaction in logs + Sentry scrubber.
207. Encryption at rest for sensitive columns (pgcrypto).
208. Backups: nightly pg_dump → S3 with object-lock.
209. Disaster-recovery runbook.
210. RODO: data export endpoint.
211. RODO: account deletion + 30-day soft delete.
212. Cookie banner with categories + Consent Mode v2.
213. Privacy policy + Regulamin pages.
214. DPA template for B2B users.
215. External pen-test checklist + remediation.

### 5.2 Performance & QA (216–230)
216. LCP < 2.5 s on landing on 3G Fast.
217. Image optimization audit (`next/image` everywhere).
218. Code-splitting: per-module bundles.
219. Edge caching strategy for marketing pages.
220. Lighthouse CI in GitHub Actions (perf ≥ 90, a11y = 100).
221. Accessibility audit (axe + manual NVDA / VoiceOver).
222. Visual regression tests (Playwright snapshots).
223. Load test: 200 RPS sustained on /api/ai/generate.
224. Failure injection tests (Claude down, Supabase down).
225. End-to-end happy path per module.
226. Soak test 24 h on staging.
227. SEO audit: titles, descriptions, sitemap, robots.
228. Schema.org coverage: Article, FAQPage, BreadcrumbList.
229. Web vitals dashboard (PostHog).
230. Bug-bash session + triage.

### 5.3 Admin panel (231–240)
231. Admin shell + role-gate (`role = 'admin'`).
232. KPI dashboard (DAU, MRR, conversion, AI cost).
233. User management (search, view, suspend, refund).
234. Case browser + impersonation (audited).
235. Template editor (versioned, with diff).
236. Prompt editor (versioned, A/B).
237. RAG knowledge editor (CRUD + re-embed).
238. Calculator config editor (legal rates).
239. Notification center (manual broadcast).
240. Audit log viewer.

### 5.4 Launch & marketing (241–250)
241. Marketing site polish (hero copy A/B-ready).
242. SEO content: 12 cornerstone articles via AI + human edit slot.
243. Email onboarding sequence (5 emails).
244. Status page (`status.dlugomat.pl`).
245. Public changelog page.
246. Affiliate / referral program scaffold.
247. PostHog funnels + alerts wired.
248. Sentry release tracking + sourcemaps.
249. Production deploy + smoke test.
250. Post-launch checklist + handover document.

---

## Definition of Done — every task

* TypeScript strict, no `any` without comment.
* Lint + format clean.
* Unit + integration tests where logic is non-trivial; E2E for critical paths.
* Accessibility: keyboard reachable, visible focus, AA contrast.
* Updated docs/comments where behaviour is non-obvious.
* Squashed commit on `genspark_ai_developer`, PR opened to `main`.
