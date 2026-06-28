# 7.3 — Supabase Storage Buckets

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr · line 1638 · 872 chars_

-- Storage configuration (via Supabase dashboard or API)

-- Bucket: ocr-uploads (prywatny)
-- Max file size: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png
-- Path pattern: {user_id}/{case_id}/{filename}
-- Retention: 30 days after case archived

-- Bucket: generated-pdfs (prywatny)
-- Max file size: 5MB
-- Allowed MIME types: application/pdf
-- Path pattern: {user_id}/{document_id}/v{version}.pdf
-- Retention: 90 days after document expired

-- Bucket: avatars (publiczny)
-- Max file size: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Path pattern: {user_id}/avatar.{ext}

-- Storage RLS
-- ocr-uploads: SELECT/INSERT where auth.uid() = path_tokens[1]::uuid
-- generated-pdfs: SELECT where auth.uid() = path_tokens[1]::uuid AND document is paid
-- avatars: SELECT for all, INSERT/UPDATE where auth.uid() = path_tokens[1]::uuid
