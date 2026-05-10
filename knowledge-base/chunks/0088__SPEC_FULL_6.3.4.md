# 6.3.4 — AI Engine (/api/ai/)

_source: SPEC_FULL · tags: frontend, backend, ai-engine, ocr · line 903 · 568 chars_

POST /api/ai/generate — główny endpoint generowania pisma. Body:
{
  case_id: string;
  document_type: DocumentType;  // enum: 'sprzeciw_epu' | 'wniosek_zwolnienie_konta' | ...
  form_data: Record<string, unknown>;  // dane z formularza wizarda
  ocr_data?: OcrExtractedData;         // dane z OCR (opcjonalne)
  options?: {
    model?: 'sonnet' | 'haiku' | 'opus';  // domyślnie 'sonnet'
    include_rag?: boolean;                  // domyślnie true
    language_style?: 'formal' | 'standard'; // domyślnie 'formal'
  };
}

Pipeline (szczegółowo opisany w sekcji 10):
