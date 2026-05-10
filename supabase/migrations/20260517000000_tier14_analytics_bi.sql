-- Tier 14 — Analytics + BI: event stream, NPS, materialized snapshots.

create table if not exists public.analytics_events (
  id text primary key,
  user_id uuid,
  org_id uuid,
  session_id text,
  anonymous_id text,
  event text not null,
  properties jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  received_at timestamptz not null default now()
);
create index if not exists idx_ae_event on public.analytics_events(event, occurred_at desc);
create index if not exists idx_ae_user on public.analytics_events(user_id, occurred_at desc);
create index if not exists idx_ae_org on public.analytics_events(org_id, occurred_at desc) where org_id is not null;

alter table public.analytics_events enable row level security;
do $$ begin
  create policy ae_admin_read on public.analytics_events for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy ae_service_insert on public.analytics_events for insert with check (true);
exception when duplicate_object then null; end $$;

create table if not exists public.nps_responses (
  id bigserial primary key,
  user_id uuid not null,
  score int not null check (score between 0 and 10),
  comment text,
  channel text not null default 'email',
  created_at timestamptz not null default now()
);
create index if not exists idx_nps_recent on public.nps_responses(created_at desc);

alter table public.nps_responses enable row level security;
do $$ begin
  create policy nps_self_insert on public.nps_responses for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy nps_admin_read on public.nps_responses for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

create table if not exists public.metric_snapshots (
  id bigserial primary key,
  metric text not null,
  value numeric not null,
  dimensions jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);
create index if not exists idx_ms_metric on public.metric_snapshots(metric, captured_at desc);

alter table public.metric_snapshots enable row level security;
do $$ begin
  create policy ms_admin_read on public.metric_snapshots for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy ms_service_insert on public.metric_snapshots for insert with check (true);
exception when duplicate_object then null; end $$;

create table if not exists public.warehouse_export_runs (
  id bigserial primary key,
  table_name text not null,
  rows_exported int not null default 0,
  bytes int not null default 0,
  destination text,
  status text not null default 'completed',
  run_at timestamptz not null default now()
);
create index if not exists idx_wer_recent on public.warehouse_export_runs(run_at desc);

alter table public.warehouse_export_runs enable row level security;
do $$ begin
  create policy wer_admin_read on public.warehouse_export_runs for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy wer_service_insert on public.warehouse_export_runs for insert with check (true);
exception when duplicate_object then null; end $$;
