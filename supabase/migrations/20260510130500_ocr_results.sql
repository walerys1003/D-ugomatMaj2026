-- =============================================================================
-- Długomat — Tier 2 / Migration 007 — OCR results (skany nakazów)
-- Source: docs/spec/SPEC_FULL.txt §7.2 Migration 006
-- D1 "Skaner nakazu": Tesseract w przeglądarce → fallback AWS Textract.
-- =============================================================================

create table if not exists public.ocr_results (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references public.cases(id) on delete cascade,  -- nullable: skan może być przed sprawą
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- File info ---------------------------------------------------------------
  original_filename text not null,
  file_url text not null,                  -- Supabase Storage path (bucket 'ocr-uploads')
  file_size_bytes integer not null,
  mime_type text not null,

  -- OCR output --------------------------------------------------------------
  raw_text text,
  extracted_data jsonb not null default '{}'::jsonb,
  confidence numeric(5,2),                 -- 0.00 - 100.00

  -- Provider info -----------------------------------------------------------
  provider text not null default 'tesseract',  -- 'tesseract' | 'textract'
  processing_time_ms integer,

  status text not null default 'pending',  -- pending | processing | completed | failed
  error_message text,

  created_at timestamptz not null default now(),

  constraint ocr_provider_known check (provider in ('tesseract', 'textract')),
  constraint ocr_status_known check (status in ('pending', 'processing', 'completed', 'failed')),
  constraint ocr_confidence_range check (confidence is null or (confidence between 0 and 100)),
  constraint ocr_size_positive check (file_size_bytes > 0)
);

create index if not exists idx_ocr_case_id on public.ocr_results(case_id);
create index if not exists idx_ocr_user_id on public.ocr_results(user_id);
create index if not exists idx_ocr_status  on public.ocr_results(status);
create index if not exists idx_ocr_data_gin on public.ocr_results using gin(extracted_data);

comment on table public.ocr_results is
  'Wynik OCR pojedynczego skanu/pliku. extracted_data — patrz schema w docs/spec/SPEC_FULL.txt §7.2.';
comment on column public.ocr_results.extracted_data is
  E'Schemat: { sygnatura, sad, data_wydania, powod{nazwa,adres}, pozwany{nazwa,adres},\n  kwota_glowna, kwota_odsetki, kwota_koszty, podstawa_prawna,\n  detected_issues[] (np. possible_przedawnienie, cesja_detected) }';
