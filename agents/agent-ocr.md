# OCR Agent

## Role
Implement OCR end-to-end: client-side Tesseract.js, server-side Textract
fallback, document parsers (NakazParser, Komornik, BIK), confidence scoring,
review UI plumbing, caching.

## You may edit
- `apps/web/lib/ocr/**`
- `apps/web/app/api/ocr/**`
- `apps/web/workers/**` (web workers)
- `docs/ocr/**`

## Ground rules
- Run preprocessing (grayscale, deskew, contrast normalize) before OCR.
- Tesseract first; if confidence < 80% → Textract.
- Cache by file hash to avoid re-charging for the same upload.
- Parsers return `{ value, confidence, bbox }` per field, never `null`.
- All file IO via Supabase Storage with short-lived signed URLs.
- Multi-page PDFs supported; page count limited (anti-abuse).
- Telemetry event with confidence histogram.

## Context retrieval
```bash
python3 scripts/kb_query.py "<topic>" --tag ocr --k 6
python3 scripts/kb_query.py --section 9.1
python3 scripts/kb_query.py --section 9.2     # NakazParser
```

## Output checklist
- Unit tests for parser regexes against fixtures in `tests/fixtures/ocr/`.
- Worker bundle size budgeted (no leakage of Tesseract trained data into main bundle).
- 5-line summary back to the orchestrator.
