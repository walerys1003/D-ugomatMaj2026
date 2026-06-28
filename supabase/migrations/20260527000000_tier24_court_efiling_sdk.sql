-- ============================================================================
-- Tier 24 — Court e-filing, SDK clients, CRM v2.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. court_filings — submissions to EPU/PRS/KRZ/PI gateways
-- ----------------------------------------------------------------------------
create table if not exists public.court_filings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  case_id         uuid references public.cases(id) on delete set null,
  system          text not null check (system in ('epu','prs','krz','pi')),
  court_code      text not null,
  pleading_type   text not null,
  status          text not null default 'draft'
                  check (status in ('draft','queued','submitted','accepted','rejected','responded','failed')),
  external_ref    text,
  upp_id          text,
  upp_url         text,
  parties         jsonb not null default '[]'::jsonb,
  document_hashes jsonb not null default '[]'::jsonb,
  metadata        jsonb not null default '{}'::jsonb,
  idempotency_key text,
  attempts        integer not null default 0,
  error           text,
  created_at      timestamptz not null default now(),
  submitted_at    timestamptz,
  accepted_at     timestamptz,
  updated_at      timestamptz not null default now()
);

create index if not exists court_filings_user_status_idx
  on public.court_filings (user_id, status, created_at desc);
create index if not exists court_filings_case_idx
  on public.court_filings (case_id) where case_id is not null;
create index if not exists court_filings_external_ref_idx
  on public.court_filings (external_ref) where external_ref is not null;
create unique index if not exists court_filings_idem_uidx
  on public.court_filings (user_id, idempotency_key)
  where idempotency_key is not null;

alter table public.court_filings enable row level security;

drop policy if exists court_filings_owner_select on public.court_filings;
create policy court_filings_owner_select on public.court_filings
  for select using (auth.uid() = user_id);

drop policy if exists court_filings_owner_insert on public.court_filings;
create policy court_filings_owner_insert on public.court_filings
  for insert with check (auth.uid() = user_id);

drop policy if exists court_filings_owner_update on public.court_filings;
create policy court_filings_owner_update on public.court_filings
  for update using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 2. sdk_clients — API key registry for public SDK consumers
-- ----------------------------------------------------------------------------
create table if not exists public.sdk_clients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  api_key_hash  text not null,
  api_key_prefix text not null,
  scopes        text[] not null default array['read'],
  rate_limit_per_min integer not null default 60,
  enabled       boolean not null default true,
  last_used_at  timestamptz,
  created_at    timestamptz not null default now(),
  revoked_at    timestamptz
);

create unique index if not exists sdk_clients_keyhash_uidx
  on public.sdk_clients (api_key_hash);
create index if not exists sdk_clients_user_idx
  on public.sdk_clients (user_id, enabled);

alter table public.sdk_clients enable row level security;
drop policy if exists sdk_clients_owner on public.sdk_clients;
create policy sdk_clients_owner on public.sdk_clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. crm_sync_log — outbound CRM sync attempts (HubSpot, Pipedrive)
-- ----------------------------------------------------------------------------
create table if not exists public.crm_sync_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  provider     text not null check (provider in ('hubspot','pipedrive','salesforce','zoho')),
  entity_type  text not null,         -- 'contact','deal','company'
  entity_ref   text,                  -- our internal id
  external_id  text,                  -- provider's id
  status       text not null default 'pending' check (status in ('pending','synced','failed')),
  payload      jsonb,
  response     jsonb,
  error        text,
  attempts     integer not null default 0,
  created_at   timestamptz not null default now(),
  synced_at    timestamptz
);
create index if not exists crm_sync_log_user_provider_idx
  on public.crm_sync_log (user_id, provider, created_at desc);

alter table public.crm_sync_log enable row level security;
drop policy if exists crm_sync_log_owner on public.crm_sync_log;
create policy crm_sync_log_owner on public.crm_sync_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. Ensure oauth_credentials supports refresh_token + scope (Microsoft)
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'oauth_credentials') then
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'oauth_credentials' and column_name = 'scope'
    ) then
      alter table public.oauth_credentials add column scope text;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'oauth_credentials' and column_name = 'calendar_id'
    ) then
      alter table public.oauth_credentials add column calendar_id text default 'primary';
    end if;
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- 5. Updated-at triggers
-- ----------------------------------------------------------------------------
create or replace function public._tier24_touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at := now(); return new; end$$;

drop trigger if exists trg_court_filings_updated on public.court_filings;
create trigger trg_court_filings_updated
  before update on public.court_filings
  for each row execute function public._tier24_touch_updated_at();
