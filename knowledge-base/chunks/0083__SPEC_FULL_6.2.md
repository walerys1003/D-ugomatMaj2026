# 6.2 — Standaryzacja odpowiedzi API

_source: SPEC_FULL · tags: backend, ai-engine, ocr · line 866 · 787 chars_

Wszystkie API Routes zwracają zunifikowaną strukturę:
// types/api.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;          // np. "VALIDATION_ERROR", "OCR_FAILED", "AI_TIMEOUT"
    message: string;       // przyjazna wiadomość po polsku
    details?: unknown;     // dodatkowe info dla debugowania (tylko dev)
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    requestId: string;     // UUID do śledzenia w logach
  };
}

HTTP status codes: 200 (sukces z danymi), 201 (utworzono), 204 (sukces bez danych), 400 (błąd walidacji), 401 (brak autoryzacji), 403 (brak uprawnień), 404 (nie znaleziono), 409 (konflikt — np. duplikat sprawy), 429 (rate limit), 500 (błąd serwera), 503 (AI service unavailable → fallback).
