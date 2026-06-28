-- =============================================================================
-- Długomat — Tier 3 / Migration 015 — RAG match function + ivfflat index
-- Source: docs/spec/SPEC_FULL.txt §8 (RAG pipeline)
-- Wymagane przez `apps/web/lib/ai/rag-retriever.ts` → retrieveFromPgvector().
-- =============================================================================

-- IVFFlat index na embedding (cosine). `lists = 100` to rozsądny start dla
-- 10k–100k chunks; podbijamy do 200 gdy katalog urośnie (Tier 5 monitoring).
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_legal_knowledge_embedding'
  ) then
    -- Index można utworzyć tylko gdy są dane — gdy tabela jest pusta,
    -- pomijamy (zostanie utworzony przez seed script po wgraniu chunków).
    if exists (select 1 from public.legal_knowledge where embedding is not null limit 1) then
      execute $idx$
        create index idx_legal_knowledge_embedding
        on public.legal_knowledge
        using ivfflat (embedding vector_cosine_ops) with (lists = 100)
      $idx$;
    end if;
  end if;
end $$;

-- =============================================================================
-- match_legal_knowledge — semantic search RPC
-- =============================================================================
create or replace function public.match_legal_knowledge(
  query_embedding vector(1536),
  match_count int default 6,
  filter_category text default null
)
returns table (
  id uuid,
  title text,
  content text,
  source text,
  category text,
  similarity float
)
language sql stable
security definer
set search_path = public, extensions
as $$
  select
    lk.id,
    lk.title,
    lk.content,
    lk.source,
    lk.category,
    1 - (lk.embedding <=> query_embedding) as similarity
  from public.legal_knowledge lk
  where lk.embedding is not null
    and (filter_category is null or lk.category = filter_category)
  order by lk.embedding <=> query_embedding
  limit greatest(1, least(match_count, 50));
$$;

revoke all on function public.match_legal_knowledge(vector, int, text) from public;
grant execute on function public.match_legal_knowledge(vector, int, text)
  to authenticated, service_role;

comment on function public.match_legal_knowledge(vector, int, text) is
  'RAG semantic search — zwraca top match_count chunks z legal_knowledge sortując cosine similarity. SECURITY DEFINER bo legal_knowledge ma RLS, ale czytanie jest dozwolone dla wszystkich authenticated.';
