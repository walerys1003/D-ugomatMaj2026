-- =====================================================================
-- Tier 22 — AI agents + automation workflows (zad. 1051-1100)
-- =====================================================================
--
-- Tabele:
--  1. agent_runs        — uruchomienia agenta (goal, status, cost)
--  2. agent_steps       — kroki konkretnego runa (thought/action/observation)
--  3. agent_memory      — semantic memory z embeddingami (pgvector)
--  4. automation_workflows — definicje workflowów (trigger+conditions+actions)
--  5. automation_runs   — historia wykonań workflowów
--
-- Dodatkowo: RPC search_agent_memory dla recallMemory().
-- Wszystkie tabele z RLS (self-policy + admin-where-appropriate).
-- =====================================================================

create extension if not exists vector;

-- ---------------------------------------------------------------------
-- 1. agent_runs
-- ---------------------------------------------------------------------
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null,
  status text not null default 'running'
    check (status in ('running','completed','failed','canceled','budget_exceeded')),
  final_answer text,
  total_cost_grosze integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists agent_runs_user_created_idx
  on public.agent_runs (user_id, started_at desc);
create index if not exists agent_runs_status_idx
  on public.agent_runs (status, started_at desc);

alter table public.agent_runs enable row level security;

drop policy if exists agent_runs_self on public.agent_runs;
create policy agent_runs_self on public.agent_runs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 2. agent_steps
-- ---------------------------------------------------------------------
create table if not exists public.agent_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  index numeric not null,
  role text not null check (role in ('thought','action','observation','final')),
  content text not null,
  action_name text,
  action_args jsonb,
  observation text,
  cost_grosze integer not null default 0,
  latency_ms integer not null default 0,
  at timestamptz not null default now()
);

create index if not exists agent_steps_run_idx
  on public.agent_steps (run_id, index);

alter table public.agent_steps enable row level security;

drop policy if exists agent_steps_via_run on public.agent_steps;
create policy agent_steps_via_run on public.agent_steps
  for all to authenticated
  using (
    exists (
      select 1 from public.agent_runs r
      where r.id = agent_steps.run_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.agent_runs r
      where r.id = agent_steps.run_id and r.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- 3. agent_memory (semantic memory z embeddingiem)
-- ---------------------------------------------------------------------
create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('fact','preference','case_pattern','user_correction','summary')),
  content text not null,
  embedding vector(1536),
  importance real not null default 0.5 check (importance >= 0 and importance <= 1),
  source_run_id uuid references public.agent_runs(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  access_count integer not null default 0
);

create index if not exists agent_memory_user_idx
  on public.agent_memory (user_id, last_accessed_at desc);
create index if not exists agent_memory_kind_idx
  on public.agent_memory (kind, last_accessed_at desc);
create index if not exists agent_memory_embedding_idx
  on public.agent_memory using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.agent_memory enable row level security;

drop policy if exists agent_memory_self on public.agent_memory;
create policy agent_memory_self on public.agent_memory
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RPC: top-K cosine z recency+importance boost
create or replace function public.search_agent_memory(
  p_user_id uuid,
  p_query_embedding vector(1536),
  p_k integer default 8,
  p_kinds text[] default null
)
returns table (
  id uuid,
  user_id uuid,
  kind text,
  content text,
  importance real,
  source_run_id uuid,
  metadata jsonb,
  created_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer,
  similarity real
)
language plpgsql
stable
as $$
begin
  return query
  select
    m.id,
    m.user_id,
    m.kind,
    m.content,
    m.importance,
    m.source_run_id,
    m.metadata,
    m.created_at,
    m.last_accessed_at,
    m.access_count,
    (1 - (m.embedding <=> p_query_embedding))::real as similarity
  from public.agent_memory m
  where m.user_id = p_user_id
    and m.embedding is not null
    and (p_kinds is null or m.kind = any(p_kinds))
  order by
    -- combined score: similarity * 0.6 + importance * 0.25 + recency * 0.15
    (
      (1 - (m.embedding <=> p_query_embedding)) * 0.6
      + m.importance * 0.25
      + greatest(0, 1 - extract(epoch from (now() - m.last_accessed_at)) / (90 * 86400))::real * 0.15
    ) desc
  limit p_k;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. automation_workflows
-- ---------------------------------------------------------------------
create table if not exists public.automation_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  trigger jsonb not null,
  conditions jsonb not null default '[]'::jsonb,
  actions jsonb not null,
  enabled boolean not null default true,
  last_run_at timestamptz,
  run_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists automation_workflows_user_idx
  on public.automation_workflows (user_id, created_at desc);
create index if not exists automation_workflows_enabled_idx
  on public.automation_workflows (enabled, last_run_at desc)
  where enabled = true;
create index if not exists automation_workflows_trigger_event_idx
  on public.automation_workflows ((trigger->>'kind'), ((trigger->'config'->>'event_kind')))
  where (trigger->>'kind') = 'event';

alter table public.automation_workflows enable row level security;

drop policy if exists automation_workflows_self on public.automation_workflows;
create policy automation_workflows_self on public.automation_workflows
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. automation_runs
-- ---------------------------------------------------------------------
create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.automation_workflows(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  trigger_payload jsonb not null default '{}'::jsonb,
  status text not null check (status in ('running','completed','failed','skipped')),
  steps jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists automation_runs_workflow_idx
  on public.automation_runs (workflow_id, started_at desc);
create index if not exists automation_runs_user_idx
  on public.automation_runs (user_id, started_at desc);
create index if not exists automation_runs_status_idx
  on public.automation_runs (status, started_at desc);

alter table public.automation_runs enable row level security;

drop policy if exists automation_runs_self on public.automation_runs;
create policy automation_runs_self on public.automation_runs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Helper: extend deadlines table with notified_24h flag (if missing)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'deadlines' and column_name = 'notified_24h'
  ) then
    alter table public.deadlines add column notified_24h boolean not null default false;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------
comment on table public.agent_runs is
  'Tier 22: uruchomienia AI agenta (ReAct loop) z goal/status/cost tracking.';
comment on table public.agent_steps is
  'Tier 22: kroki agent loop (thought / action / observation / final).';
comment on table public.agent_memory is
  'Tier 22: semantic long-term memory z pgvector (1536), recall RRF z importance+recency boost.';
comment on table public.automation_workflows is
  'Tier 22: definicje workflowów no-code (trigger+conditions+actions, JSON-Logic-lite).';
comment on table public.automation_runs is
  'Tier 22: historia wykonań workflowów (step-by-step audit trail).';
