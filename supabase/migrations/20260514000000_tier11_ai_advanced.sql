-- Tier 11 — Advanced AI: RAG, usage tracking, response cache, evaluations.

-- Optional pgvector extension. Falls back to text-stored embeddings if not available.
do $$ begin
  create extension if not exists vector;
exception when others then null; end $$;

-- ============================================================================
-- rag_documents — chunked corpus with embeddings
-- ============================================================================
create table if not exists public.rag_documents (
  id text primary key,
  corpus text not null,
  source_ref text not null,
  title text not null,
  chunk_index int not null default 0,
  text text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_rag_corpus on public.rag_documents(corpus);
create index if not exists idx_rag_source on public.rag_documents(source_ref);

alter table public.rag_documents enable row level security;
do $$ begin
  create policy rag_public_read on public.rag_documents for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy rag_admin_write on public.rag_documents for all
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

-- ============================================================================
-- ai_usage_log — per-call token + cost ledger
-- ============================================================================
create table if not exists public.ai_usage_log (
  id bigserial primary key,
  user_id uuid not null,
  model_id text not null,
  task_type text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_grosze int not null default 0,
  template_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_user on public.ai_usage_log(user_id, created_at desc);
create index if not exists idx_ai_usage_model on public.ai_usage_log(model_id, created_at desc);

alter table public.ai_usage_log enable row level security;
do $$ begin
  create policy ai_usage_self_read on public.ai_usage_log for select
    using (user_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy ai_usage_service_insert on public.ai_usage_log for insert with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- ai_response_cache
-- ============================================================================
create table if not exists public.ai_response_cache (
  key text primary key,
  model_id text not null,
  text text not null,
  cost_grosze_saved int not null default 0,
  hit_count int not null default 0,
  last_hit_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_cache_recent on public.ai_response_cache(created_at desc);
create index if not exists idx_ai_cache_hits on public.ai_response_cache(hit_count desc);

alter table public.ai_response_cache enable row level security;
do $$ begin
  create policy ai_cache_service on public.ai_response_cache for all
    using (true) with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- ai_eval_runs — historical evaluation scores
-- ============================================================================
create table if not exists public.ai_eval_runs (
  id bigserial primary key,
  run_at timestamptz not null default now(),
  pass_rate numeric(4,3) not null,
  avg_score numeric(4,3) not null,
  results jsonb not null default '[]'::jsonb,
  model_chain text
);
create index if not exists idx_eval_recent on public.ai_eval_runs(run_at desc);

alter table public.ai_eval_runs enable row level security;
do $$ begin
  create policy eval_admin_read on public.ai_eval_runs for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy eval_service_write on public.ai_eval_runs for insert with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- rag_search RPC (only created if pgvector available; otherwise no-op stub)
-- ============================================================================
do $$ begin
  if exists (select 1 from pg_extension where extname = 'vector') then
    execute $RAG$
      create or replace function public.rag_search(
        query_embedding jsonb,
        filter_corpus text,
        match_count int
      ) returns table (
        id text, corpus text, source_ref text, title text,
        chunk_index int, text text, metadata jsonb, score float
      ) language plpgsql as $fn$
      begin
        return query
        select r.id, r.corpus, r.source_ref, r.title, r.chunk_index, r.text, r.metadata,
               0::float as score
        from public.rag_documents r
        where (filter_corpus is null or r.corpus = filter_corpus)
        limit match_count;
      end $fn$;
    $RAG$;
  end if;
end $$;
