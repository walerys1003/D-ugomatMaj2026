-- =============================================================================
-- Długomat — Tier 2 / Migration 005 — Documents + document_versions
-- Source: docs/spec/SPEC_FULL.txt §7.2 Migration 004
-- Wygenerowane pisma. Każda sprawa może mieć N dokumentów (paczka pism).
-- =============================================================================

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  type public.case_type not null,
  status public.document_status not null default 'generating',

  -- Treść --------------------------------------------------------------------
  content_markdown text,
  content_html text,
  pdf_url text,                            -- Supabase Storage path

  -- Wersjonowanie ------------------------------------------------------------
  version integer not null default 1,
  is_template boolean not null default false,  -- true = static fallback (pre-AI)

  -- AI metadata --------------------------------------------------------------
  ai_model_used text,                      -- np. 'claude-sonnet-4.6'
  tokens_input integer,
  tokens_output integer,
  ai_cost_usd numeric(8,6),
  generation_time_ms integer,
  validation_score integer,
  validation_issues jsonb not null default '[]'::jsonb,

  -- Prompt audit (Tier 5) ----------------------------------------------------
  prompt_hash text,                        -- hash promptu bez danych user'a

  -- Lifecycle ----------------------------------------------------------------
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  downloaded_at timestamptz,
  expires_at timestamptz,                  -- 30 dni od paid_at

  constraint validation_score_range check (
    validation_score is null or (validation_score between 0 and 100)
  )
);

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
  before update on public.documents
  for each row execute function public.tg_touch_updated_at();

create index if not exists idx_documents_case_id on public.documents(case_id);
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_status  on public.documents(status);
create index if not exists idx_documents_type    on public.documents(type);
create index if not exists idx_documents_expiry  on public.documents(expires_at)
  where status in ('paid', 'downloaded');

-- ----------------------------------------------------------------------------
-- Document versions (każda zmiana pisma tworzy snapshot — pełny audyt)
-- ----------------------------------------------------------------------------
create table if not exists public.document_versions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number integer not null,
  content_markdown text not null,
  changed_by public.event_actor not null default 'user',
  change_summary text,
  created_at timestamptz not null default now(),

  constraint unique_doc_version unique(document_id, version_number)
);

create index if not exists idx_doc_versions_doc_id
  on public.document_versions(document_id, version_number desc);

comment on table public.documents is
  'Wygenerowane pismo (Markdown + HTML + PDF). Wersjonowane przez document_versions.';
comment on column public.documents.is_template is
  'true = statyczny szablon (Tier 2). false = treść z LLM (Tier 3+).';
comment on column public.documents.expires_at is
  'Po 30 dniach od paid_at link do PDF wygasa, ale wpis pozostaje w bazie (RODO).';
