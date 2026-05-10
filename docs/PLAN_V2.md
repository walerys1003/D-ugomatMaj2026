# Długomat — Master Plan v2 (250 zadań, 5 tierów × 50)

> **Status**: Plan v1 (`docs/PLAN.md`) — 250 zadań Tier 0–5 (MVP + GTM) — w 100% zaadresowany w PR #1.
> **Plan v2** — kolejne 250 zadań, post-MVP, Q3 2026 → Q1 2027. Cel: Series A‑ready, ROI dla pierwszej rundy klientów (Q3 2026), ekspansja CEE (Q1 2027).
> Numeracja 251–500. Każdy tier ma 50 zadań, ułożonych od fundamentów ku produktowi.

---

## Tier 6 — Stabilność, niezawodność, observability (zad. 251–300)

Cel: SLO 99.9% uptime, p95 < 2 s na ścieżkach krytycznych, błędne stany odzyskiwalne, audytowalność klasy SOC2.

251. **Strukturalne logowanie pino + correlation_id** w każdym żądaniu Next.js (middleware ustawia `x-request-id`).
252. **OpenTelemetry traces** — instrumentacja Anthropic SDK, Stripe, Supabase; eksport do Honeycomb / Tempo / Vercel OTel.
253. **Sentry release tracking** — `SENTRY_RELEASE = git sha`, source maps upload w CI.
254. **Error budget alerts** — Grafana / Vercel alerts: 5xx > 1% w 5 min, p95 latencja > 3 s.
255. **Idempotency keys w API generate** — header `Idempotency-Key`, store w Redis 24 h.
256. **Retry-with-backoff w Anthropic client** — 3 próby, exponential backoff + jitter, classify retriable vs non-retriable.
257. **Circuit breaker dla zewnętrznych integracji** — Stripe / Anthropic / Resend, otwiera się po 5 błędach w 30 s.
258. **Dead letter queue dla nieudanych notyfikacji** — `notifications.status='dead_letter'` + dashboard w `/admin/notyfikacje/dlq`.
259. **Health endpoint `/api/health/deep`** — sprawdza Supabase, Stripe ping, Anthropic ping, Redis; zwraca 503 jeśli któryś down.
260. **Sztuczna degradacja w `/api/ai/generate`** — chaos engineering flag `DLUGOMAT_AI_DEGRADE=true` zwraca losowo 503.
261. **Rate-limit per user (Sliding Window Log)** — zamiast obecnego token bucket; tier-aware (free / paid / admin).
262. **Audit log retention policy** — partycje miesięczne, automatyczny archive do object storage po 13 miesiącach (RODO).
263. **Snapshot testing dla migracji Supabase** — porównaj schema diff w CI z poprzednią wersją.
264. **Database read replica** — Supabase Pro read replica dla `/admin/*` queries (RLS przez service-role).
265. **Connection pool stats endpoint** — `/api/health/pool` — supabase + redis active/idle/waiting.
266. **GraphQL-like field selection w admin queries** — zmniejsz over-fetch, kolumny przez `?select=id,created_at`.
267. **DB indexy: covering index dla list_cases_for_admin** — INCLUDE (status, customer_type, created_at).
268. **Row-level locking w cron jobach** — `SELECT ... FOR UPDATE SKIP LOCKED` dla notifications dispatch.
269. **Backup restore drill** — quarterly: restore z PITR do staging, sanity check, dokumentacja runbook.
270. **PII redaction w logach** — pino-redact: emails, NIP, phone, IP, tokens przed wysyłką do Sentry/Datadog.
271. **GDPR-compliant request tracing** — correlation_id na każdym pisemnym dowodzie obrotu (faktura, email, push).
272. **Synthetic monitoring** — Checkly: 5 ścieżek krytycznych co 5 min (rejestracja, generate, pay, download, refund).
273. **Frontend error boundary z fallback** + automatyczne raportowanie do Sentry (`captureException`).
274. **Web Vitals budgets w CI** — Lighthouse CI: LCP < 2.0 s, INP < 200 ms, CLS < 0.05 na `/`, `/cennik`, `/baza-wiedzy`.
275. **Bundle size budgets** — `size-limit` w CI: main bundle < 200 kB gzipped, route chunks < 80 kB.
276. **Image optimization audit** — wszystkie `<img>` → `next/image`, `priority` dla LCP, AVIF/WebP, sizes.
277. **Font preload + size-adjust** — `next/font` z subset, fallback z size-adjust żeby uniknąć CLS.
278. **CSP report-only → enforce** — strict CSP, `report-uri` do `/api/csp-report`, po 2 tyg. obserwacji przejście na enforce.
279. **HSTS preload submission** — `hstspreload.org`, max-age 2 lata, includeSubDomains, preload.
280. **Subresource Integrity (SRI)** dla zewnętrznych skryptów (Stripe.js, Resend pixel).
281. **CAPTCHA v3 (hCaptcha / Turnstile)** na rejestracji i formularzu kontaktowym (zamiast rate-limit-only).
282. **Bot detection w `/api/ai/generate`** — odrzuć user-agentów Headless Chrome bez ważnej sesji.
283. **WAF rules na Vercel/Cloudflare** — block known bad ASNs, geo-block enumeracji rejestracji.
284. **DDoS playbook** — runbook + alarmy: gdy req/s > X, automatyczne zwiększenie rate-limit i powiadomienie on-call.
285. **Secrets rotation policy** — Stripe webhook secret, Anthropic key, Supabase service role: rotacja co 90 dni.
286. **Vault / Doppler integration** — zamiast `.env`, wszystkie sekrety w secret manager z audit log.
287. **Supabase Edge Function dla niskolatencyjnych ścieżek** — np. webhook Stripe dla refund (sub-50 ms ack).
288. **Read-after-write consistency w Stripe webhooks** — `SELECT ... USING (replica_identity=primary)`.
289. **Test rezyliencji: Supabase 500 dla 30 s** — Toxiproxy / staging, sprawdź degradację UX.
290. **Test rezyliencji: Anthropic 429 dla 60 s** — generation queue + retry UI „Wygenerujemy automatycznie gdy się zwolni”.
291. **Test rezyliencji: Stripe 503** — payment_intent retry, no double charge.
292. **DR exercise** — przerwanie regionu Supabase (eu-west) → fallback do read-only mode + banner.
293. **Multi-region static assets** — Vercel Edge + Cloudflare; sanity test latencji z 5 regionów (PL/DE/UK/US/UA).
294. **OpenAPI / Schema dla wszystkich endpointów** — `apps/web/openapi.yaml` generated z Zod schemas.
295. **API versioning strategy** — `/api/v2/...` jako default, deprecation header dla v1, sunset notice 6 miesięcy.
296. **GraphQL gateway (opcjonalne)** — Pothos + Yoga dla mobilnej aplikacji w Tier 9.
297. **WebSocket / SSE keep-alive** — heartbeat co 15 s, auto-reconnect dla stream generate.
298. **Service Worker offline cache** — `/baza-wiedzy/*` dostępne offline, stale-while-revalidate.
299. **Background sync w PWA** — odpowiedzi formularzy → IndexedDB → wysyłka po wznowieniu połączenia.
300. **SLO dashboard w `/admin/sli`** — error rate, p50/p95/p99, availability, error budget burn rate.

---

## Tier 7 — Produkt: nowe moduły D9–D16 i AI v2 (zad. 301–350)

Cel: 8 nowych typów pism, AI „radca podpowiada”, samouczki wewnątrz wizarda, narzędzia self-service.

301. **D9 — Wniosek o ogłoszenie upadłości konsumenckiej** — wizard 8 kroków, formularz urzędowy KRS-FORM-UPK1.
302. **D10 — Pozew o zwrot opłat windykacyjnych** — 30/40/100 zł monity, klauzula abuzywna, art. 359 § 2(2) k.c.
303. **D11 — Reklamacja do banku (Rzecznik Finansowy)** — szablon RF, klauzula 30-dniowej odpowiedzi.
304. **D12 — Skarga do PUODO** — wzór ze wskazaniem naruszenia RODO art. X i żądaniem ograniczenia przetwarzania.
305. **D13 — Wniosek o rozłożenie należności sądowych na raty** — art. 320 k.p.c., wzór z uzasadnieniem stanu majątkowego.
306. **D14 — Wniosek o zwolnienie od kosztów sądowych** — formularz urzędowy + oświadczenie majątkowe.
307. **D15 — Zażalenie na klauzulę wykonalności** — art. 795 k.p.c., wzór z brakiem doręczenia nakazu EPU.
308. **D16 — Wniosek o pozbawienie tytułu wykonawczego wykonalności** — art. 840 k.p.c., trzy podstawy.
309. **Wizard branching engine** — kroków warunkowych na podstawie odpowiedzi (np. „czy masz dzieci” → krok o alimentach).
310. **In-wizard explainers** — tooltipy „Co to znaczy?” z linkiem do artykułu w bazie wiedzy.
311. **Smart defaults w polach wizarda** — preselekcja na podstawie poprzednich spraw użytkownika.
312. **AI „radca podpowiada”** — w trakcie wypełniania wizarda Haiku sugeruje brakujące argumenty (np. „dodaj zarzut klauzul abuzywnych”).
313. **Generation v2 — multi-step planning** — sonet planuje sekcje, haiku wypełnia, sonet polish; 3× lepsza spójność.
314. **Embedding-based template selection** — pgvector + cosine similarity, dobierz najlepszy szablon do faktów sprawy.
315. **Wzbogacenie kontekstu o orzecznictwo SN** — RAG z LEX/LegalMind API (opcjonalne premium tier).
316. **Citation verification** — po generacji walidacja, czy każde przytoczone orzeczenie istnieje w SN database.
317. **Hallucination guard 2.0** — drugie wywołanie Haiku w trybie „czy są w tekście fakty niewspomniane w wejściu”.
318. **Multi-turn revision UI** — „popraw uzasadnienie do drugiego zarzutu” jako prompt natural language.
319. **Diff view dla rewizji** — split-view z poprzednią wersją, accept/reject per akapit.
320. **Document versioning** — `case_documents.version`, restore previous version, branch w przyszłości.
321. **PDF/A-2b conformance** — dla pism procesowych wysyłanych elektronicznie do e-sądu.
322. **e-Pismo / e-Doręczenia integration** — wysyłka pisma bezpośrednio przez PUE-SD (od 2026).
323. **ePUAP signature integration** — podpis profilem zaufanym z poziomu aplikacji (oauth flow).
324. **Auto-fill z mObywatel API** — autoryzacja → dane osobowe + adres zameldowania prefilled.
325. **OCR pism od wierzyciela** — upload PDF / zdjęcie, Tesseract / Google Vision → wyciąg sygnatury i daty.
326. **Auto-tagowanie pism** — klasyfikator NLP rozpoznaje typ pisma (nakaz/pozew/komornik) i sugeruje moduł.
327. **Wirtualny sędzia (sandbox)** — symulacja, jaki argument prawdopodobnie sąd uzna; oparte na embeddings z orzeczeń.
328. **Kalkulator szans wygrania** — heurystyka + ML: 30 features ze sprawy → prawdopodobieństwo sukcesu.
329. **Auto-generowanie wniosków dowodowych** — pole „opisz fakty”, AI sugeruje świadków / dokumenty.
330. **Generator timeline sprawy** — wizualizacja: pozew → odpowiedź → rozprawa → wyrok → klauzula → komornik.
331. **Auto-przypomnienia po analizie pisma** — z pisma od komornika wyciągnij termin → kalendarz + email + SMS.
332. **Mobile-first wizard redesign** — 1-pytanie-na-ekran flow dla mobile (>60% ruchu PL).
333. **Voice-to-text w pytaniach otwartych** — Web Speech API, fallback Whisper, opisz sytuację głosem.
334. **AI Q&A panel w bazie wiedzy** — embedding search po artykułach + Haiku odpowiada cytując źródła.
335. **Public legal precedent search** — wyszukiwarka orzeczeń SN i SA z filtrami (rok, izba, sędzia, sentencja).
336. **Crowd-sourced sample documents** — użytkownicy mogą oddać swoje pisma do public corpus (po anonymizacji).
337. **AI redaction tool** — automatyczna anonymizacja PDF (PESEL, imiona, adresy) przed udostępnieniem.
338. **Side-by-side compare** — porównaj swoje pismo z innym z bazy, zobacz różnice w argumentacji.
339. **Generation queue z priorytetami** — paid users priority over free trial; SLA 30 s vs 2 min.
340. **Async generation w tle** — submit → email z linkiem gdy gotowe (zamiast trzymać tab otwarty).
341. **Push notifications PWA** — gdy generation gotowy / termin za 24 h / wpłata zaksięgowana.
342. **Calendar.ics export terminów** — z każdej sprawy → ics dla Google/Apple Calendar.
343. **Multi-case dashboard** — kafelki: terminy zbliżające się, sprawy bez aktywności > 30 dni, oczekujące na akcję.
344. **Co-pilot mode dla profesjonalistów** — adwokat/radca tworzy w imieniu klienta, audit log per działanie.
345. **Pełnomocnictwo w aplikacji** — wzór + ePUAP podpis, zapisane w `case_documents.kind='power_of_attorney'`.
346. **Klient gives access** — share-with-lawyer link z RBAC: view-only / can-edit / can-generate.
347. **Family / company tenant** — wiele user pod jednym billing account, role-based access.
348. **API publiczne dla kancelarii** — REST + OAuth2, rate-limit 1000 req/h, billing per request.
349. **Webhook subscriptions** — kancelaria może subskrybować eventy `case.generated`, `payment.completed`.
350. **Marketplace szablonów** — community templates, system reputation, revenue share dla autorów.

---

## Tier 8 — Wzrost, retencja, monetyzacja (zad. 351–400)

Cel: CAC < 80 zł, LTV/CAC > 3, retencja 30-d > 25%, MRR 100k PLN.

351. **Pricing v2 — 3 tiery: Solo (49 zł/pismo), Pakiet (149 zł/3 pisma), Pro (39 zł/m subskrypcja)**.
352. **Subskrypcja Pro** — `subscriptions` table, Stripe Subscription, cancel-anytime, proration.
353. **Trial 7 dni dla Pro** — bez karty (email + telefon SMS opt-in), auto-pricing po końcu trialu.
354. **Promo codes 2.0** — multi-use, percentage / fixed, expiry, max-uses, tier-restricted.
355. **Affiliate program** — `/program-partnerski` v2: cookie 30 dni, prowizja 25%, payout co miesiąc.
356. **Referral program** — „polec znajomemu, ty -30 zł, on -30 zł”, unique referral codes, double-sided.
357. **Cashback / „Gwarancja sukcesu”** — jeśli sąd oddali roszczenie windykatora po naszym sprzeciwie, 100% zwrotu.
358. **Cross-sell w panelu** — po zakończeniu sprzeciwu sugestia „dodaj wniosek o zwrot kosztów” (-50%).
359. **Upsell „Konsultacja z prawnikiem 30 min”** — 199 zł, calendly + Zoom integration.
360. **Marketplace prawników** — wybierz radcę z naszej sieci, my pobieramy 20% prowizji od pierwszego zlecenia.
361. **Lead magnet — bezpłatny e-book „Co zrobić gdy dostałeś nakaz zapłaty”** — 30 stron, gated by email.
362. **Quiz „Jakie masz prawa jako dłużnik”** — 10 pytań → personalizowany raport + CTA do modułu.
363. **Webinary co miesiąc** — Zoom Webinar 500 osób, gated registration, follow-up email cascade.
364. **YouTube channel** — 1 video/tydzień, evergreen content (przedawnienie, BIK, komornik), CTA do bazy wiedzy.
365. **Podcast „Dłużnik ma prawa”** — 30-min wywiady z prawnikami / klientami, Spotify + Apple.
366. **TikTok / Reels** — 3 short/tydzień, edukacyjne, link in bio.
367. **SEO content engine** — 4 long-tail artykuły/tydzień, focus na transactional queries („skarga na komornika wzór”).
368. **Programmatic landing pages** — per miasto / per typ długu (1000+ stron) z dynamic content.
369. **Backlinking outreach** — guest posty w prawniczych blogach, partnerstwa z organizacjami konsumenckimi (Federacja Konsumentów, Rzecznik Praw Obywatelskich).
370. **PR strategy** — co kwartał release danych „Raport dłużnika 2026”, media outreach (Gazeta Prawna, Money.pl).
371. **Google Ads — search campaigns** — 200 najwyższych intent keywords, ROAS target 4×.
372. **Facebook / Instagram retargeting** — pixel users którzy nie kupili w 7 dni, 3 video creatives.
373. **TikTok Ads** — UGC-style ad creative, lookalike audiences PL 25–45.
374. **Email cascade dla niezalogowanych ≥ 14 d** — „Dawno cię nie było, oto co nowego” + 20% promo.
375. **Win-back cascade dla churned subscribers** — 30 d / 60 d / 90 d, eskalujące rabaty 30 / 50 / 70%.
376. **NPS modal po pierwszym pobraniu** — 0–10 score + open question, alerts dla score ≤ 6.
377. **In-product feedback widget** — Canny / własny, public roadmap, voting per feature.
378. **A/B testing framework** — `feature_flags` + variant assignment + analytics, statystyczna istotność min n=500.
379. **A/B test: cennik 49 zł vs 59 zł vs 39 zł** — winner promote do default po 4 tygodniach.
380. **A/B test: 3-step wizard vs 5-step wizard** — completion rate.
381. **Onboarding checklist w panelu** — 5 checkboxów: stwórz sprawę, wypełnij wizard, opłać, pobierz, ocen.
382. **Gamification — odznaki** — „Pierwsza sprawa”, „Trzy pisma”, „Polec znajomemu”, social proof on profile.
383. **Personalizowany feed w panelu** — recommended articles + relevant case updates.
384. **Real-time „social proof”** — „W ostatniej godzinie 14 osób pobrało sprzeciw EPU”.
385. **Trust badges na pricing page** — RODO compliant, Stripe verified, 4.7/5 z 1200+ ocen.
386. **Customer testimonials video** — 5 case studies z prawdziwymi klientami (po zgodzie pisemnej).
387. **Public dashboard „statystyki sukcesu”** — % spraw wygranych / oddalonych (anonymized).
388. **Branded merchandise** — naklejki / koszulki dla affiliate ambasadorów, drop ship Printful.
389. **Polskie influencers cooperation** — 3–5 mikro-influencerów (fin/legal niche), barter + revenue share.
390. **Comparison landing pages** — „Długomat vs prawnik”, „Długomat vs Lex.pl”, „Długomat vs robić samemu”.
391. **Glossary SEO** — 200 słownikowych haseł („cesja”, „klauzula”, „EPU”) jako mini-landing pages.
392. **Case studies SEO** — 30 anonimizowanych spraw z timeline + outcome, gated content.
393. **Wynagrodzenie za leady B2B** — 200 zł / lead dla biur rachunkowych, programów partnerskich.
394. **Outbound do biur księgowych** — cold email 100 firm/tydzień, demo + revenue share dla klientów.
395. **Integracja z mObywatel mojeIKP** — single sign-on, prefill data.
396. **Integracja z PUE-ZUS** — import zaświadczeń o zarobkach do wniosku o zwolnienie z kosztów sądowych.
397. **B2B onboarding flow** — dedicated `/dla-biznesu` z calendar booking demo i offer template.
398. **Self-serve B2B kontrakt** — DocuSign + Stripe ACH, plan Enterprise 999 zł/m + 5 zł/pismo.
399. **Customer Success dla > 500 zł/m B2B** — dedicated Slack channel, monthly review call, custom training.
400. **Revenue dashboard dla foundera** — MRR, ARR, churn, LTV, CAC, runway w `/admin/biznes` (full-admin only).

---

## Tier 9 — Mobile, multi-platform, ekspansja CEE (zad. 401–450)

Cel: aplikacja mobilna iOS + Android, white-label dla CZ/SK/RO, multi-jurysdykcja w core.

401. **React Native expo app — auth + cases list + push** (read-only first version, MVP 4 tygodnie).
402. **Mobile wizard — krok-po-kroku UI** z swipe gestures, autosave per pole.
403. **Mobile camera OCR pism** — scan dokumentu od wierzyciela, automatyczne wykrycie sygnatury i daty.
404. **Apple Pay / Google Pay** — Stripe Payment Element wbudowany w app, 1-tap checkout.
405. **iOS / Android push** — APN + FCM, deep links do konkretnej sprawy / dokumentu.
406. **Background generation z notification** — submit z app → push gdy gotowy.
407. **Offline draft w mobile** — wypełniaj wizard offline, sync gdy online (CRDT for fields).
408. **Apple Sign-In** — wymagany dla iOS apps w AppStore review.
409. **Biometric unlock w app** — FaceID / fingerprint dla otwarcia case z poufnymi danymi.
410. **App Store / Play Store listing** — screenshoots, copy, age rating, privacy policy URL.
411. **App Store Optimization (ASO)** — keywords research, A/B test ikona, screenshoots.
412. **Crashlytics + analytics dla mobile** — Firebase Crashlytics, Mixpanel events.
413. **OTA updates** — Expo EAS Update dla hotfixes bez przejścia przez review.
414. **Multi-jurysdykcja w core** — `case.jurisdiction` enum (PL, CZ, SK, RO, HU), per-jurisdiction templates.
415. **i18n nowych języków** — czeski, słowacki, rumuński, węgierski (next-intl, ICU MessageFormat).
416. **Currency multi-tenant** — PLN / CZK / EUR / RON, Stripe automatic conversion + per-region pricing.
417. **VAT per kraj** — PL 23%, CZ 21%, SK 20%, RO 19%, HU 27% z Fakturownia / iFirma integration.
418. **Local payment methods** — BLIK (PL), Apple Pay all, SEPA Direct Debit (CZ/SK), Sofort.
419. **Country selector + auto-detect z Cloudflare CF-IPCountry header**.
420. **Local domains: dlugomat.cz / .sk / .ro** — separate SEO, hreflang, geo-canonical.
421. **CZ legal content audit** — 20 cornerstone articles dla czeskiego prawa konsumenckiego.
422. **SK legal content** — analogicznie 20 artykułów.
423. **RO legal content** — 15 artykułów (mniejszy market).
424. **Local KYC w UE** — Veriff / Onfido integration dla wymaganych usług prawnych.
425. **GDPR for cross-border** — DPA z subprocessorami per kraj, Standard Contractual Clauses.
426. **Customer support multilang** — Intercom z routingiem per język, hr 9–17 lokalnie.
427. **Multi-region database** — Supabase replicas eu-central (PL) + eu-west (CZ/SK).
428. **CDN per region** — Vercel Edge Functions per geo, latencja < 50 ms RTT z każdej stolicy.
429. **Local marketing landing pages** — country-specific testimonials, case studies, pricing.
430. **Influencer marketing CZ/SK/RO** — mikro-partnerstwa lokalne.
431. **Local PR push** — distribute „Raport dłużnika” w każdym kraju, press release lokalnie.
432. **White-label SDK** — kancelarie / banki mogą embed wizard w swoich aplikacjach, revenue share.
433. **API klient SDK — TypeScript + Python + Java** — dla integracji partnerskich.
434. **Webhook signatures library** — open source na GitHub, dokumentacja, examples.
435. **Public status page** — status.dlugomat.pl, real uptime + incident timeline, RSS feed.
436. **Public changelog** — changelog.dlugomat.pl, deployments timeline.
437. **Dev portal docs.dlugomat.pl** — OpenAPI explorer, code samples, getting started.
438. **Hackathon program** — co kwartał, sponsored prize, integrations / use cases.
439. **Investor data room** — `/data-room` (gated by NDA + JWT), financials, customer cohorts, deck.
440. **SOC2 Type 1 audit** — Vanta / Drata integration, 6 miesięcy audit, certyfikat dla enterprise sales.
441. **ISO 27001 readiness** — gap analysis + remediation plan, target Q2 2027.
442. **Pen-test annual** — accredited firm (Securing / Niebezpiecznik), public report po remediation.
443. **Bug bounty na HackerOne / YesWeHack** — payout 100–2000 zł per vuln (severity-based).
444. **Disaster recovery rehearsal** — quarterly: restore prod do separate region, dokumentacja runbook.
445. **Insurance — cyber liability + E&O** — 5M PLN coverage dla enterprise contracts.
446. **Legal opinion: AI-generated docs** — opinia kancelarii „nasze pisma to nie świadczenie pomocy prawnej”.
447. **Disclaimer 2.0 z confirmation modal** — przed pierwszą generacją explicit „rozumiem ograniczenia AI”.
448. **AI Act compliance plan** — Article 6 (high-risk?), QMS, transparency, technical documentation.
449. **Data residency option** — Enterprise klienci mogą wybrać region przechowywania danych.
450. **Federated SSO — SAML / OIDC** — Okta, Azure AD, Google Workspace dla enterprise / kancelarii.

---

## Tier 10 — AI native, ekosystem, exit-ready (zad. 451–500)

Cel: produkt z efektem sieci, defensible moat (dane + modele), Series A → A+ (M&A optional).

451. **Własny LLM fine-tune na polskim orzecznictwie SN** — LoRA na Llama 3.3 70B, eval suite (faithfulness + groundedness).
452. **Eval harness — LegalBench-PL** — własny benchmark 200 spraw z gold standard, automatyczna ocena co PR.
453. **RLHF pipeline** — labelujemy 1000 wygenerowanych pism (good/bad/edit), DPO fine-tune.
454. **Multi-model routing** — easy cases → Haiku (cheap), complex → Sonnet, edge → Opus / GPT-4o.
455. **Smart caching with embeddings** — cache decisions o szablonach na podstawie similarity > 0.95.
456. **Knowledge graph orzecznictwa** — Neo4j: sygnatury ↔ artykuły KC ↔ tezy ↔ cytowania.
457. **Recommender system w bazie wiedzy** — collaborative filtering + content-based, „użytkownicy z podobnym profilem czytali”.
458. **Personalized AI persona** — adaptacja tonu (formalny / przyjacielski) per użytkownik.
459. **Conversation memory w panelu** — chat z asystentem AI „pomogłeś mi w sprawie X, pomóż w Y”.
460. **Real-time co-edit z AI** — Notion-like w wizardzie, AI suggestions inline jak Cursor.
461. **Agentowa automatyzacja** — agent może sam pobrać dokumenty z e-Sądu (po uwierzytelnieniu) i przygotować draft.
462. **Browser extension** — wykryj pisma z banku / komornika w PDF preview → 1-click „przygotuj odpowiedź”.
463. **Outlook / Gmail add-in** — wykryj email od wierzyciela → contextual sidebar z rekomendacjami.
464. **Slack / Teams bot dla kancelarii** — @dlugomat „przygotuj sprzeciw dla klienta X”.
465. **Voice assistant — Alexa / Siri shortcuts** — „Hej Długomat, ile dni mam na sprzeciw od nakazu z dziś?”.
466. **AI w call center — outbound** — proaktywne dzwonienie do użytkowników z terminem za 3 dni (consent gated).
467. **Sentiment analysis w support** — Intercom messages → priorytetuj wściekłych, hand-off do human.
468. **Auto-summarization spraw** — TL;DR dla każdej sprawy w panelu, „aktualny stan + następna akcja”.
469. **Predictive case outcome 2.0** — model ML na 50k+ historycznych spraw + outcomes (gdy uzbieramy dataset).
470. **Time-to-resolution forecasting** — „Twoja sprawa zakończy się prawdopodobnie za 4–6 miesięcy”.
471. **AI-powered legal research** — query natural language → cytowane orzeczenia + komentarz.
472. **Vector DB — pgvector na orzecznictwie SN** — 100k+ orzeczeń embedded, semantic search.
473. **AI „debaty”** — AI symuluje argumenty drugiej strony, użytkownik widzi gdzie jego pismo ma luki.
474. **Mock court hearing — voice replay** — AI gra rolę powoda + sędziego, użytkownik trenuje wystąpienie.
475. **Multi-modal — wgraj PDF + zdjęcie z paragonu** → Vision LLM → extracted facts → wizard prefill.
476. **AI generuje wizualizacje finansowe** — wykres planu spłaty, projekcja BIK na 5 lat.
477. **Self-improving prompts** — automatyczna optymalizacja promptów na podstawie eval results (PromptOps).
478. **PII filter v2** — przed wysłaniem do Anthropic; lokalne LLM wykrywa i maskuje sensitive data.
479. **On-prem option dla enterprise** — k8s helm chart, all-in-one deployment, support contract.
480. **Edge inference** — najprostsze klasyfikatory (typ pisma, urgency) w client lokalnie, bez cloud roundtrip.
481. **Federated learning** — model uczy się z anonimowych danych klientów bez ich wyciekania (PoC).
482. **Differential privacy w analytics** — Apple-style noise, ochrona indywidualnych klientów w statystykach publicznych.
483. **AI explainability dashboard** — dla każdego pisma: które fragmenty z templates, które z faktów, które halucynacje.
484. **„Why this argument” mode** — kliknij akapit → AI pokazuje, na której orzeczeniu / artykule się opiera.
485. **Public AI model card** — opis modelu, dane treningowe, ograniczenia, evaluation results (zgodne z AI Act).
486. **Red-teaming AI quarterly** — wynajęci ethical hackers próbują wymusić halucynacje / leak PII.
487. **Adversarial test suite w CI** — 50 prompt injection cases, fail build jeśli choć jeden się przebije.
488. **Cost optimization v3** — semantic cache + prompt compression, target 50% redukcja kosztów per pismo.
489. **Streaming structured output** — JSON schema enforced, partial tool-calling, fewer roundtrips.
490. **MCP servers integration** — Anthropic Model Context Protocol: legal-lookup, court-records, KRS — jako tools.
491. **OpenAI Realtime API integration (opcjonalne)** — voice-to-voice consultation z AI prawnikiem.
492. **Long-term memory per użytkownik** — wektorowy zapis historii rozmów, kontekstualizacja po roku.
493. **AI compliance officer mode** — kancelarie używają jako pre-flight check zgodności pism z procedurą.
494. **Marketplace zewnętrznych AI tools** — partnerzy publikują własne moduły (np. „Kalkulator alimentów” od Kancelarii X).
495. **API monetization tier** — pay-per-token dla developerów, free tier 100 generacji/miesiąc.
496. **Open source librarki na GitHub** — np. polish-legal-nlp, polish-court-citations parser; brand building.
497. **Conference & community** — „Legal AI Forum” coroczny, Długomat jako title sponsor.
498. **University partnerships** — UJ / UW / SWPS prawo + informatyka, grant na research polskiego LLM.
499. **Acquisition / strategic partnership scouting** — outreach do legaltechów (Lex.pl, Wolters Kluwer) → exit option.
500. **Series A deck + diligence ready** — financials audited, 100k+ MRR, 30% MoM growth, 90% NRR, > 50k registered users → fundraising Q4 2026 / Q1 2027.

---

## Mapping zależności (high-level)

- **Tier 6** odblokuje audytowalność potrzebną dla enterprise sales (Tier 8 zad. 398–399) i SOC2 (Tier 9 zad. 440).
- **Tier 7 D9–D16** wymaga ukończenia Tier 6 idempotency + retry, aby przy 8 nowych modułach nie eksplodował coupling kosztów.
- **Tier 8** retencja bezpośrednio zasila Tier 10 dataset dla fine-tune (zad. 451–453).
- **Tier 9 mobile + i18n** muszą zostać po stabilizacji Tier 6, inaczej mobile crash logs zaleją observability.
- **Tier 10 AI native** zakłada minimum 50k spraw w bazie — bez Tier 8 retencji nie będzie danych.

## Wskaźniki sukcesu — Plan v2

| Metryka | Q1 2026 (PR #1) | Q3 2026 (Tier 6–7) | Q4 2026 (Tier 8) | Q1 2027 (Tier 9–10) |
|---------|:---------------:|:------------------:|:----------------:|:-------------------:|
| MAU                | 500       | 5 000     | 25 000    | 80 000   |
| MRR (PLN)          | 5k        | 30k       | 100k      | 300k     |
| Uptime SLO         | best-effort| 99.9%    | 99.95%    | 99.99%   |
| p95 generate (s)   | 12        | 6         | 4         | 2.5      |
| Avg cost / pismo   | 0.18 USD  | 0.10 USD  | 0.06 USD  | 0.03 USD |
| LTV / CAC          | —         | 1.8       | 3.2       | 4.5      |
| Retention 30d      | —         | 18%       | 28%       | 38%      |
| Pisma generowane / m | 200     | 2 500     | 12 000    | 50 000   |
