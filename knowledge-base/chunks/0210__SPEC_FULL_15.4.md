# 15.4 — Input Validation

_source: SPEC_FULL · tags: backend, database, ai-engine · line 2251 · 400 chars_

Every API endpoint: Zod schema validation. File uploads: MIME type validation (buffer magic bytes, not just extension), virus scanning (ClamAV — opcjonalne, V2), rozmiar limit (10MB). SQL injection: Supabase client uses parameterized queries (never raw SQL in API routes). Prompt injection: user input sanitized before inclusion in AI prompt (strip control characters, limit length, escape markdown).
