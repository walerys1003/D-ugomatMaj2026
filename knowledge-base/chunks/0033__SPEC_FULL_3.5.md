# 3.5 — OCR

_source: SPEC_FULL · tags: ocr · line 96 · 318 chars_

Tesseract.js (client-side) — pierwsza warstwa OCR, działa w przeglądarce (Web Worker), zero kosztów serwerowych. Dokładność 85–92% na skanach nakazów zapłaty.
AWS Textract (server-side fallback) — gdy Tesseract.js zwraca confidence <80%, automatyczne przesłanie do Textract. Koszt ~$1.50/1000 stron. Dokładność 95–99%.
