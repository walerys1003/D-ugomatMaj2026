-- Tier 20 — Observability + feature flags + experiments + job queue + CRDT (zad. 951-1000)
-- Tables: feature_flags, experiments, experiment_assignments, experiment_exposures,
--         experiment_goals, job_queue, crdt_updates, crdt_awareness

-- =========================================================
-- Feature flags
-- =========================================================
create table if not exists public.feature_flags (
    key              text primary key,
    kind             text not null check (kind in ('boolean','multivariate','json')),
    enabled          boolean not null default false,
    description      text not null default '',
    variants         jsonb not null default '[]'::jsonb,
    rules            jsonb not null default '[]'::jsonb,
    default_variant  text not null default 'off',
    kill_switch      boolean not null default false,
    environment      text not null default 'all' check (environment in ('dev','staging','prod','all')),
    updated_at       timestamptz not null default now(),
    created_at       timestamptz not null default now()
);

create index if not exists idx_feature_flags_enabled
    on public.feature_flags(enabled) where enabled = true;

alter table public.feature_flags enable row level security;

drop policy if exists "feature_flags_authenticated_read" on public.feature_flags;
create policy "feature_flags_authenticated_read" on public.feature_flags
    for select using (auth.role() = 'authenticated');

drop policy if exists "feature_flags_admin_write" on public.feature_flags;
create policy "feature_flags_admin_write" on public.feature_flags
    for all using (
        exists (
            select 1 from auth.users u
            where u.id = auth.uid()
              and coalesce((u.raw_app_meta_data->>'role'), '') = 'admin'
        )
    );

-- =========================================================
-- Experiments (A/B testing)
-- =========================================================
create table if not exists public.experiments (
    id                uuid primary key default gen_random_uuid(),
    key               text not null unique,
    hypothesis        text not null default '',
    status            text not null default 'draft'
        check (status in ('draft','running','paused','completed','archived')),
    layer             text,
    traffic_percent   numeric(5,2) not null default 100 check (traffic_percent >= 0 and traffic_percent <= 100),
    variants          jsonb not null default '[]'::jsonb,
    control_variant   text not null default 'control',
    goal_event        text not null,
    guardrail_events  text[] not null default '{}',
    min_sample_size   integer not null default 1000,
    mde_percent       numeric(6,3) not null default 5,
    started_at        timestamptz,
    completed_at      timestamptz,
    created_at        timestamptz not null default now()
);

create index if not exists idx_experiments_status on public.experiments(status);
create index if not exists idx_experiments_layer on public.experiments(layer);

alter table public.experiments enable row level security;

drop policy if exists "experiments_authenticated_read" on public.experiments;
create policy "experiments_authenticated_read" on public.experiments
    for select using (auth.role() = 'authenticated');

-- =========================================================
-- Experiment assignments (sticky bucketing + layer exclusion)
-- =========================================================
create table if not exists public.experiment_assignments (
    id              uuid primary key default gen_random_uuid(),
    experiment_key  text not null,
    user_id         uuid not null references auth.users(id) on delete cascade,
    layer           text,
    variant         text not null,
    assigned_at     timestamptz not null default now(),
    unique (experiment_key, user_id)
);

create index if not exists idx_exp_assign_user on public.experiment_assignments(user_id);
create index if not exists idx_exp_assign_layer_user
    on public.experiment_assignments(user_id, layer) where layer is not null;

alter table public.experiment_assignments enable row level security;

drop policy if exists "exp_assign_self" on public.experiment_assignments;
create policy "exp_assign_self" on public.experiment_assignments
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Experiment exposures (dedupe per user/day)
-- =========================================================
create table if not exists public.experiment_exposures (
    id              uuid primary key default gen_random_uuid(),
    experiment_key  text not null,
    user_id         uuid not null references auth.users(id) on delete cascade,
    variant         text not null,
    exposure_date   date not null,
    first_seen_at   timestamptz not null default now(),
    context         jsonb not null default '{}'::jsonb,
    unique (experiment_key, user_id, exposure_date)
);

create index if not exists idx_exp_exposures_key_date
    on public.experiment_exposures(experiment_key, exposure_date);

alter table public.experiment_exposures enable row level security;

drop policy if exists "exp_exposures_self_insert" on public.experiment_exposures;
create policy "exp_exposures_self_insert" on public.experiment_exposures
    for insert with check (auth.uid() = user_id);

drop policy if exists "exp_exposures_self_read" on public.experiment_exposures;
create policy "exp_exposures_self_read" on public.experiment_exposures
    for select using (auth.uid() = user_id);

-- =========================================================
-- Experiment goals
-- =========================================================
create table if not exists public.experiment_goals (
    id              uuid primary key default gen_random_uuid(),
    experiment_key  text not null,
    user_id         uuid not null references auth.users(id) on delete cascade,
    goal_event      text not null,
    value           numeric not null default 1,
    metadata        jsonb not null default '{}'::jsonb,
    occurred_at     timestamptz not null default now()
);

create index if not exists idx_exp_goals_key_event
    on public.experiment_goals(experiment_key, goal_event, occurred_at desc);
create index if not exists idx_exp_goals_user
    on public.experiment_goals(user_id, occurred_at desc);

alter table public.experiment_goals enable row level security;

drop policy if exists "exp_goals_self_insert" on public.experiment_goals;
create policy "exp_goals_self_insert" on public.experiment_goals
    for insert with check (auth.uid() = user_id);

drop policy if exists "exp_goals_self_read" on public.experiment_goals;
create policy "exp_goals_self_read" on public.experiment_goals
    for select using (auth.uid() = user_id);

-- =========================================================
-- Job queue (BullMQ-style on Postgres)
-- =========================================================
create table if not exists public.job_queue (
    id               uuid primary key default gen_random_uuid(),
    kind             text not null,
    payload          jsonb not null default '{}'::jsonb,
    status           text not null default 'pending'
        check (status in ('pending','claimed','running','completed','failed','dead_letter')),
    priority         integer not null default 5 check (priority between 1 and 10),
    attempts         integer not null default 0,
    max_attempts     integer not null default 5,
    run_after        timestamptz not null default now(),
    claimed_at       timestamptz,
    claimed_by       text,
    heartbeat_at     timestamptz,
    completed_at     timestamptz,
    failed_at        timestamptz,
    last_error       text,
    idempotency_key  text,
    trace_id         text,
    created_at       timestamptz not null default now()
);

create index if not exists idx_job_queue_pending
    on public.job_queue(priority, run_after)
    where status = 'pending';
create index if not exists idx_job_queue_kind on public.job_queue(kind);
create index if not exists idx_job_queue_idempotency
    on public.job_queue(idempotency_key) where idempotency_key is not null;
create index if not exists idx_job_queue_heartbeat
    on public.job_queue(heartbeat_at) where status in ('claimed','running');

alter table public.job_queue enable row level security;

drop policy if exists "job_queue_admin_only" on public.job_queue;
create policy "job_queue_admin_only" on public.job_queue
    for all using (
        exists (
            select 1 from auth.users u
            where u.id = auth.uid()
              and coalesce((u.raw_app_meta_data->>'role'), '') = 'admin'
        )
    );

-- RPC: atomic claim z FOR UPDATE SKIP LOCKED
create or replace function public.claim_next_job(
    worker_id text,
    kinds text[] default null,
    visibility_timeout_ms integer default 300000
) returns setof public.job_queue
language plpgsql as $$
declare
    claimed_row public.job_queue;
begin
    with next_job as (
        select id from public.job_queue
        where status = 'pending'
          and run_after <= now()
          and (kinds is null or kind = any(kinds))
        order by priority asc, run_after asc
        limit 1
        for update skip locked
    )
    update public.job_queue jq
    set status = 'claimed',
        claimed_at = now(),
        claimed_by = worker_id,
        heartbeat_at = now()
    from next_job
    where jq.id = next_job.id
    returning jq.* into claimed_row;

    if claimed_row.id is not null then
        return next claimed_row;
    end if;
    return;
end;
$$;

-- =========================================================
-- CRDT updates (Yjs-style append-only)
-- =========================================================
create table if not exists public.crdt_updates (
    id              uuid primary key default gen_random_uuid(),
    doc_id          uuid not null,
    user_id         uuid not null references auth.users(id) on delete cascade,
    client_id       text not null,
    update_base64   text not null,
    size_bytes      integer not null,
    is_snapshot     boolean not null default false,
    replaces_ids    uuid[],
    created_at      timestamptz not null default now()
);

create index if not exists idx_crdt_updates_doc_time
    on public.crdt_updates(doc_id, created_at);
create index if not exists idx_crdt_updates_snapshot
    on public.crdt_updates(doc_id, is_snapshot) where is_snapshot = true;

alter table public.crdt_updates enable row level security;

drop policy if exists "crdt_updates_doc_owner" on public.crdt_updates;
create policy "crdt_updates_doc_owner" on public.crdt_updates
    for all using (
        exists (
            select 1 from public.documents d
            where d.id = crdt_updates.doc_id and d.user_id = auth.uid()
        )
    ) with check (
        exists (
            select 1 from public.documents d
            where d.id = crdt_updates.doc_id and d.user_id = auth.uid()
        )
    );

-- =========================================================
-- CRDT awareness (ephemeral cursor / selection state)
-- =========================================================
create table if not exists public.crdt_awareness (
    doc_id      uuid not null,
    client_id   text not null,
    user_id     uuid not null references auth.users(id) on delete cascade,
    state       jsonb not null default '{}'::jsonb,
    updated_at  timestamptz not null default now(),
    expires_at  timestamptz not null,
    primary key (doc_id, client_id)
);

create index if not exists idx_crdt_awareness_expiry on public.crdt_awareness(expires_at);

alter table public.crdt_awareness enable row level security;

drop policy if exists "crdt_awareness_doc_owner" on public.crdt_awareness;
create policy "crdt_awareness_doc_owner" on public.crdt_awareness
    for all using (
        exists (
            select 1 from public.documents d
            where d.id = crdt_awareness.doc_id and d.user_id = auth.uid()
        )
    ) with check (
        exists (
            select 1 from public.documents d
            where d.id = crdt_awareness.doc_id and d.user_id = auth.uid()
        )
    );

-- end of Tier 20 migration
