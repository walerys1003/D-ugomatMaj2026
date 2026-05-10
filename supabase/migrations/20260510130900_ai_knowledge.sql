-- =============================================================================
-- Długomat — Tier 2 / Migration 011 — AI / RAG infrastructure
-- Source: docs/spec/SPEC_FULL.txt §7.2 + §8 (RAG pipeline)
-- Tabele:
--   legal_knowledge   — chunks aktów prawnych + komentarzy z embeddings (Tier 3)
--   prompt_templates  — wersjonowane prompty per case_type
--   validation_runs   — audit każdego wywołania Haiku (validator)
-- =============================================================================

-- Pełen indeks pgvector zostanie aktywowany w Tier 3 razem z back-fillem.
-- Schema jest gotowa już teraz, by migracje były spójne i deterministyczne.

create table if not exists public.legal_knowledge (
  id uuid primary key default uuid_generate_v4(),

  -- Klasyfikacja ------------------------------------------------------------
  category text not null,                  -- 'kpc' | 'kk' | 'kc' | 'ustawa_komornicza' | 'orzecznictwo' | 'praktyka'
  subcategory text,                        -- np. 'art_485_kpc'

  -- Treść -------------------------------------------------------------------
  title text not null,
  content text not null,                   -- pełny chunk (cleaned)
  source text not null,                    -- np. 'Dz.U. 1964 nr 43 poz. 296' lub 'wew_komentarz'
  source_url text,
  effective_date date,                     -- data wejścia w życie aktu (gdy dotyczy)

  -- Embedding (1536 dim — OpenAI ada-002 / text-embedding-3-small) ---------
  embedding vector(1536),

  -- Audyt -------------------------------------------------------------------
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists legal_knowledge_touch_updated_at on public.legal_knowledge;
create trigger legal_knowledge_touch_updated_at
  before update on public.legal_knowledge
  for each row execute function public.tg_touch_updated_at();

create index if not exists idx_legal_knowledge_category    on public.legal_knowledge(category);
create index if not exists idx_legal_knowledge_subcategory on public.legal_knowledge(subcategory);
-- ivfflat index utworzymy w Tier 3 po wgraniu danych:
-- create index idx_legal_knowledge_embedding on public.legal_knowledge
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- =============================================================================
-- Prompt templates — wersjonowane prompty per case_type
-- =============================================================================
create table if not exists public.prompt_templates (
  id uuid primary key default uuid_generate_v4(),
  case_type public.case_type not null,
  variant text not null default 'default', -- np. 'default' | 'experimental_a' | 'fallback'
  version integer not null default 1,

  -- Prompt body -------------------------------------------------------------
  system_prompt text not null,
  user_prompt_template text not null,      -- z placeholderami {{kwota_glowna}} itd.
  required_variables text[] not null default '{}',

  -- Konfiguracja modelu ----------------------------------------------------
  model text not null default 'claude-sonnet-4-5',  -- Haiku/Sonnet/Opus
  temperature numeric(3,2) not null default 0.20,
  max_tokens integer not null default 4096,

  -- Stan -------------------------------------------------------------------
  is_active boolean not null default false,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint prompt_templates_unique_active_per_type
    exclude (case_type with =, variant with =)
    where (is_active),
  constraint prompt_templates_temperature_range
    check (temperature between 0 and 2)
);

drop trigger if exists prompt_templates_touch_updated_at on public.prompt_templates;
create trigger prompt_templates_touch_updated_at
  before update on public.prompt_templates
  for each row execute function public.tg_touch_updated_at();

create index if not exists idx_prompt_templates_case_type
  on public.prompt_templates(case_type, version desc);
create index if not exists idx_prompt_templates_active
  on public.prompt_templates(case_type, variant)
  where is_active = true;

-- =============================================================================
-- Validation runs — wywołania Haiku do walidacji wygenerowanych pism (Tier 3)
-- =============================================================================
create table if not exists public.validation_runs (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  model text not null default 'claude-haiku-4-5',
  pass boolean not null,
  score integer not null,                  -- 0..100
  issues jsonb not null default '[]'::jsonb,
  raw_response jsonb,

  tokens_input integer,
  tokens_output integer,
  cost_usd numeric(8,6),
  duration_ms integer,

  created_at timestamptz not null default now(),

  constraint validation_runs_score_range check (score between 0 and 100)
);

create index if not exists idx_validation_runs_document on public.validation_runs(document_id, created_at desc);
create index if not exists idx_validation_runs_pass     on public.validation_runs(pass);

comment on table public.legal_knowledge is
  'Chunks aktów prawnych + komentarzy z embeddings (pgvector). Source dla RAG retrievera (Tier 3).';
comment on table public.prompt_templates is
  'Wersjonowane prompty per case_type. Aktywny może być tylko jeden wariant na raz.';
comment on table public.validation_runs is
  'Audit każdego wywołania Haiku. Niska score → eskalacja do Opus 4.6 (Tier 3).';
