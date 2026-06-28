# 6.3.3 — OCR (/api/ocr/)

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr · line 900 · 698 chars_

POST /api/ocr/upload — upload pliku (multipart/form-data). Akceptowane formaty: PDF, JPG, JPEG, PNG. Max rozmiar: 10 MB. Pipeline: walidacja MIME type → upload do Supabase Storage (bucket ocr-uploads, ścieżka {user_id}/{case_id}/{filename}) → Tesseract.js OCR (server-side Web Worker) → jeśli confidence < 80%, fallback do AWS Textract → parsowanie tekstu (nakaz-parser.ts) → ekstrakcja pól (sygnatura, sąd, data, powód/pozwany, kwoty, podstawa prawna) → zapis do tabeli ocr_results → zwrot { ocr_id, extracted_data, confidence, raw_text }.
GET /api/ocr/status/[id] — status przetwarzania OCR (pending, processing, completed, failed). Polling co 2s z frontendu (lub Supabase Realtime subscription).
