# 46 — RLS policies

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr, payments, notifications, modules, devops · line 2511 · 2385 chars_

Batch 2 — Layout & UI (prompty 11–20):
 11. Marketing layout (navbar, footer)
 12. Dashboard layout (sidebar, header, mobile nav)
 13. WizardShell component (stepper, navigation, progress)
 14. shadcn/ui primitives customization (button, card, form, input, toast)
 15. Hero section component
 16. How-it-works section
 17. Pricing table component
 18. FAQ accordion + Schema.org(http://schema.org/)
 19. Dashboard overview page (cards, stats, deadlines widget)
 20. Cases list page (table, filters, pagination)
Batch 3 — OCR (prompty 21–25):
 21. OCR upload component (drag-drop, preview, progress)
 22. Tesseract.js server-side Worker
 23. NakazParser (regex extraction)
 24. AWS Textract fallback
 25. OCR review UI (highlighted fields, confidence, edit)
Batch 4 — AI Engine (prompty 26–35):
 26. Claude client (APIPod wrapper + Anthropic fallback)
 27. RAG: embeddings generation script
 28. RAG: pgvector retriever
 29. Prompt template: sprzeciw EPU (system + context + format)
 30. Prompt template: komornik pisma (6 wariantów)
 31. Prompt template: BIK-Fix (3 etapy)
 32. Prompt template: cesja, ugoda, upadłość
 33. Generation pipeline (orchestrator)
 34. Haiku validation prompt + checker
 35. Token tracking + cost logging
Batch 5 — D1 + D2 (prompty 36–45):
 36. D1 landing page (free scan CTA)
 37. D1 scan flow (upload → OCR → AI analysis → result page)
 38. D2 wizard step 1: upload
 39. D2 wizard step 2: dane sprawy (form + auto-fill)
 40. D2 wizard step 3: wybór zarzutów
 41. D2 wizard step 4: dane dodatkowe (dynamic fields)
 42. D2 wizard step 5: preview + edit
 43. D2 wizard step 6: payment + download
 44. Stripe integration (create session, webhook, status)
 45. PDF generator (Puppeteer, template sprzeciwu)
Batch 6 — D3-D8 (prompty 46–60):
 46–48: D3 KomornikShield (kalkulator + 6 pism)
 49–50: D4 PotrąceniaStop
 51–53: D5 BIK-Fix (3-etapowy flow)
 54–55: D6 CesjaCheck
 56–58: D7 UgodoMat (budżet + multi-wierzyciel)
 59–60: D8 Upadłość-Lite (ankieta + scoring + 5 docs)
Batch 7 — Notifications & Polish (prompty 61–70):
 61. Email templates (MJML → HTML)
 62. AWS SES integration
 63. SMSAPI.pl(http://smsapi.pl/) integration
 64. Deadline CRON Edge Function
 65. Admin dashboard (stats, users)
 66. Dark mode
 67. Accessibility pass
 68. SEO optimization (meta, OG, schema)
 69. Error pages + loading states
 70. Final deployment config (Vercel + Supabase)
