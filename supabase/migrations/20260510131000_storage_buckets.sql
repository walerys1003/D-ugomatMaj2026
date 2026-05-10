-- =============================================================================
-- Długomat — Tier 2 / Migration 012 — Storage buckets
-- Source: docs/spec/SPEC_FULL.txt §7.3 (Storage)
-- Buckets:
--   ocr-uploads      — skany / PDF wgrane przez user'a (private, 30 dni TTL)
--   documents-pdf    — wygenerowane finalne PDFy pism (private, 365 dni TTL)
--   public-assets    — public assets (logo, hero ilustracje)
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'ocr-uploads', 'ocr-uploads', false,
    20 * 1024 * 1024,  -- 20 MB
    array[
      'application/pdf',
      'image/png', 'image/jpeg', 'image/heic', 'image/heif', 'image/webp'
    ]
  ),
  (
    'documents-pdf', 'documents-pdf', false,
    10 * 1024 * 1024,  -- 10 MB
    array['application/pdf']
  ),
  (
    'public-assets', 'public-assets', true,
    5 * 1024 * 1024,   -- 5 MB
    array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
  )
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- Storage RLS policies
-- Convention: pierwszy segment ścieżki = user_id (auth.uid()).
-- Np. ocr-uploads / <auth.uid()> / 2026-05-10 / nakaz.pdf
-- ----------------------------------------------------------------------------

-- ocr-uploads — user może czytać i wgrywać tylko własne pliki ----------------
drop policy if exists "ocr_uploads_select_own"      on storage.objects;
drop policy if exists "ocr_uploads_insert_own"      on storage.objects;
drop policy if exists "ocr_uploads_update_own"      on storage.objects;
drop policy if exists "ocr_uploads_delete_own"      on storage.objects;

create policy "ocr_uploads_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'ocr-uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "ocr_uploads_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'ocr-uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "ocr_uploads_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'ocr-uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'ocr-uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "ocr_uploads_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'ocr-uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- documents-pdf — user czyta tylko własne; insert/update tylko service_role -
-- (PDF tworzy serwer po opłaceniu — nie pozwalamy klientowi wgrywać)
drop policy if exists "documents_pdf_select_own" on storage.objects;
create policy "documents_pdf_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents-pdf'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- public-assets — czyta każdy (bucket public, ale dodajemy explicit policy)
drop policy if exists "public_assets_read_anyone" on storage.objects;
create policy "public_assets_read_anyone" on storage.objects
  for select to public
  using (bucket_id = 'public-assets');

comment on table storage.buckets is
  'Długomat buckets: ocr-uploads (private, 20MB), documents-pdf (private, 10MB), public-assets (public, 5MB).';
