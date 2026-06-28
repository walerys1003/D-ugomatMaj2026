# 9.1 — Architektura OCR

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr · line 1858 · 2023 chars_

Użytkownik uploaduje plik (PDF/JPG/PNG)
         │
         ▼
┌─────────────────────┐
│  Frontend validation │  ← sprawdzenie: rozmiar ≤10MB, typ MIME, wymiary
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Upload do Supabase  │  ← bucket 'ocr-uploads', path: {user_id}/{case_id}/
│  Storage             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐    confidence ≥ 80%    ┌─────────────────────┐
│  Tesseract.js        │ ─────────────────────→ │  NakazParser         │
│  (server-side Worker)│                        │  (ekstrakcja pól)    │
└──────────┬──────────┘                        └──────────┬──────────┘
           │ confidence < 80%                              │
           ▼                                               │
┌─────────────────────┐                                    │
│  AWS Textract        │ ─────────────────────────────────→│
│  (fallback)          │                                    │
└─────────────────────┘                                    │
                                                           ▼
                                                ┌─────────────────────┐
                                                │  AI Analyzer          │
                                                │  (Claude Sonnet 4.6) │
                                                │  — typ dokumentu     │
                                                │  — wykryte zarzuty   │
                                                │  — scoring szansy    │
                                                └──────────┬──────────┘
                                                           │
                                                           ▼
                                                ┌─────────────────────┐
                                                │  Zapis do ocr_results│
                                                │  + auto-fill form    │
                                                └─────────────────────┘
