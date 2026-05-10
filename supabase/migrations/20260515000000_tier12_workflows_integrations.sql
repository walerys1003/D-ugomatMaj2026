-- Tier 12 — Workflow automation + integrations
-- Webhooks v2, scheduled jobs, e-signing, OAuth, workflows.

-- ============================================================================
-- webhook_endpoints + webhook_deliveries (v2 with retries + dead letter)
-- ============================================================================
create table if not exists public.webhook_endpoints (
  id uuid primary key,
  user_id uuid not null,
  url text not null,
  secret text not null,
  events jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  failure_count int not null default 0,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_webhook_endpoints_user on public.webhook_endpoints(user_id);

alter table public.webhook_endpoints enable row level security;
do $$ begin
  create policy whe_owner_all on public.webhook_endpoints for all
    using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create table if not exists public.webhook_deliveries (
  id uuid primary key,
  endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempts int not null default 0,
  next_attempt_at timestamptz,
  last_response_status int,
  last_response_body text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_whd_due on public.webhook_deliveries(status, next_attempt_at);
create index if not exists idx_whd_endpoint on public.webhook_deliveries(endpoint_id, created_at desc);

alter table public.webhook_deliveries enable row level security;
do $$ begin
  create policy whd_owner_read on public.webhook_deliveries for select
    using (exists (select 1 from public.webhook_endpoints e where e.id = endpoint_id and e.user_id = auth.uid()));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy whd_service_all on public.webhook_deliveries for all using (true) with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- signature_requests (e-sign)
-- ============================================================================
create table if not exists public.signature_requests (
  id uuid primary key,
  user_id uuid not null,
  document_id text not null,
  provider text not null,
  signers jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  provider_ref text,
  signing_url text,
  signed_pdf_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_sigreq_user on public.signature_requests(user_id, created_at desc);
create index if not exists idx_sigreq_provider on public.signature_requests(provider_ref);

alter table public.signature_requests enable row level security;
do $$ begin
  create policy sigreq_owner_all on public.signature_requests for all
    using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ============================================================================
-- oauth_credentials (3rd party connections)
-- ============================================================================
create table if not exists public.oauth_credentials (
  user_id uuid not null,
  provider text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  raw jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, provider)
);

alter table public.oauth_credentials enable row level security;
do $$ begin
  create policy oauth_owner_all on public.oauth_credentials for all
    using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ============================================================================
-- workflows + workflow_runs
-- ============================================================================
create table if not exists public.workflows (
  id uuid primary key,
  user_id uuid not null,
  name text not null,
  enabled boolean not null default true,
  trigger text not null,
  conditions jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_workflows_user on public.workflows(user_id);
create index if not exists idx_workflows_trigger on public.workflows(trigger) where enabled = true;

alter table public.workflows enable row level security;
do $$ begin
  create policy wf_owner_all on public.workflows for all
    using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create table if not exists public.workflow_runs (
  id bigserial primary key,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  trigger text not null,
  payload jsonb not null default '{}'::jsonb,
  executed_at timestamptz not null default now()
);
create index if not exists idx_wfr_workflow on public.workflow_runs(workflow_id, executed_at desc);

alter table public.workflow_runs enable row level security;
do $$ begin
  create policy wfr_owner_read on public.workflow_runs for select
    using (exists (select 1 from public.workflows w where w.id = workflow_id and w.user_id = auth.uid()));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy wfr_service_insert on public.workflow_runs for insert with check (true);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- scheduled_job_runs — audit log of cron job executions
-- ============================================================================
create table if not exists public.scheduled_job_runs (
  id bigserial primary key,
  job_key text not null,
  result jsonb not null default '{}'::jsonb,
  duration_ms int not null default 0,
  error text,
  run_at timestamptz not null default now()
);
create index if not exists idx_sjr_key on public.scheduled_job_runs(job_key, run_at desc);

alter table public.scheduled_job_runs enable row level security;
do $$ begin
  create policy sjr_admin_read on public.scheduled_job_runs for select
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sjr_service_insert on public.scheduled_job_runs for insert with check (true);
exception when duplicate_object then null; end $$;
