-- Tier 10 — Final polish: error tracking, admin tooling, feature flags,
-- performance budgets, lighthouse scorecards.
-- Idempotent / additive: safe to apply alongside existing schema.

-- ============================================================================
-- error_reports — Sentry-compatible DB fallback (when SENTRY_DSN unset).
-- ============================================================================
create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  message text not null,
  stack text,
  source text,
  url text,
  user_id uuid,
  metadata jsonb default '{}'::jsonb,
  count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  resolved boolean not null default false,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_error_reports_fingerprint on public.error_reports(fingerprint);
create index if not exists idx_error_reports_open on public.error_reports(resolved, last_seen_at desc);

alter table public.error_reports enable row level security;
do $$ begin
  create policy error_reports_admin_select on public.error_reports for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy error_reports_admin_modify on public.error_reports for all
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

-- ============================================================================
-- admin_audit_log — append-only.
-- ============================================================================
create table if not exists public.admin_audit_log (
  id bigserial primary key,
  actor_id uuid not null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_admin_audit_created on public.admin_audit_log(created_at desc);
create index if not exists idx_admin_audit_actor on public.admin_audit_log(actor_id, created_at desc);

alter table public.admin_audit_log enable row level security;
do $$ begin
  create policy admin_audit_admin_select on public.admin_audit_log for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_audit_service_insert on public.admin_audit_log for insert
    with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- feature_flags
-- ============================================================================
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout_pct numeric(5,2) not null default 0 check (rollout_pct between 0 and 100),
  description text,
  user_overrides jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  created_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;
do $$ begin
  create policy feature_flags_public_read on public.feature_flags for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy feature_flags_admin_write on public.feature_flags for all
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;

-- Seed common flags
insert into public.feature_flags (key, enabled, rollout_pct, description)
values
  ('pricing_v2_promo', false, 0, 'Show Pricing v2 launch banner'),
  ('affiliate_program_visible', true, 100, 'Expose /program-afiliacyjny links'),
  ('cee_markets_enabled', false, 0, 'Enable CEE market routes (cz/sk/hu/ro)'),
  ('mobile_offline_sync', true, 100, 'Use IndexedDB offline sync queue')
on conflict (key) do nothing;

-- ============================================================================
-- performance_budgets — historical Web Vitals snapshots
-- ============================================================================
create table if not exists public.performance_snapshots (
  id bigserial primary key,
  url text not null,
  metric text not null,
  value numeric not null,
  verdict text not null,
  measured_at timestamptz not null default now()
);
create index if not exists idx_perf_url_metric on public.performance_snapshots(url, metric, measured_at desc);

alter table public.performance_snapshots enable row level security;
do $$ begin
  create policy perf_admin_select on public.performance_snapshots for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy perf_service_insert on public.performance_snapshots for insert with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- lighthouse_scorecards
-- ============================================================================
create table if not exists public.lighthouse_scorecards (
  id bigserial primary key,
  url text not null,
  performance int,
  accessibility int,
  best_practices int,
  seo int,
  pwa int,
  overall int,
  overall_grade text,
  recommendations jsonb default '[]'::jsonb,
  collected_at timestamptz not null default now()
);
create index if not exists idx_lh_url_when on public.lighthouse_scorecards(url, collected_at desc);

alter table public.lighthouse_scorecards enable row level security;
do $$ begin
  create policy lh_admin_select on public.lighthouse_scorecards for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy lh_service_insert on public.lighthouse_scorecards for insert with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- accessibility_reports — auditHtml output history
-- ============================================================================
create table if not exists public.accessibility_reports (
  id bigserial primary key,
  url text not null,
  score int,
  violations jsonb default '[]'::jsonb,
  passed jsonb default '[]'::jsonb,
  collected_at timestamptz not null default now()
);
create index if not exists idx_a11y_url_when on public.accessibility_reports(url, collected_at desc);

alter table public.accessibility_reports enable row level security;
do $$ begin
  create policy a11y_admin_select on public.accessibility_reports for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy a11y_service_insert on public.accessibility_reports for insert with check (true);
exception when duplicate_object then null; end $$;
