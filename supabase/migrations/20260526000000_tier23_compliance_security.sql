-- =====================================================================
-- Tier 23 — Fine-grained RBAC + impersonation + audit chain + secret vault
--           + compliance reports + e-discovery (zad. 1101-1150)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. rbac_policies (fine-grained ABAC)
-- ---------------------------------------------------------------------
create table if not exists public.rbac_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  effect text not null check (effect in ('allow','deny')),
  actions text[] not null default '{}',
  resources text[] not null default '{}',
  subjects jsonb not null default '{}'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  priority integer not null default 100,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rbac_policies_enabled_priority_idx
  on public.rbac_policies (enabled, priority desc);
create index if not exists rbac_policies_resources_gin
  on public.rbac_policies using gin (resources);
create index if not exists rbac_policies_actions_gin
  on public.rbac_policies using gin (actions);

alter table public.rbac_policies enable row level security;

drop policy if exists rbac_policies_admin_all on public.rbac_policies;
create policy rbac_policies_admin_all on public.rbac_policies
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated users can read enabled policies (for client-side decision cache hints)
drop policy if exists rbac_policies_read_enabled on public.rbac_policies;
create policy rbac_policies_read_enabled on public.rbac_policies
  for select to authenticated
  using (enabled = true);

-- ---------------------------------------------------------------------
-- 2. impersonation_sessions
-- ---------------------------------------------------------------------
create table if not exists public.impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  scope text not null check (scope in ('read_only','support','debug','full')),
  token_hash text not null unique,
  ip_address text,
  user_agent text,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  use_count integer not null default 0
);

create index if not exists impersonation_sessions_admin_idx
  on public.impersonation_sessions (admin_id, started_at desc);
create index if not exists impersonation_sessions_target_idx
  on public.impersonation_sessions (target_user_id, started_at desc);
create index if not exists impersonation_sessions_active_idx
  on public.impersonation_sessions (expires_at)
  where revoked_at is null;

alter table public.impersonation_sessions enable row level security;

drop policy if exists impersonation_sessions_admin on public.impersonation_sessions;
create policy impersonation_sessions_admin on public.impersonation_sessions
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Impersonated user can see active session targeting them
drop policy if exists impersonation_sessions_target_read on public.impersonation_sessions;
create policy impersonation_sessions_target_read on public.impersonation_sessions
  for select to authenticated
  using (target_user_id = auth.uid() and revoked_at is null);

-- ---------------------------------------------------------------------
-- 3. audit_chain (tamper-evident HMAC chain)
-- ---------------------------------------------------------------------
create table if not exists public.audit_chain (
  id uuid primary key default gen_random_uuid(),
  seq bigint not null unique,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  prev_hash text not null,
  curr_hash text not null,
  hmac text not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_chain_actor_idx
  on public.audit_chain (actor_id, created_at desc);
create index if not exists audit_chain_action_idx
  on public.audit_chain (action, created_at desc);
create index if not exists audit_chain_target_idx
  on public.audit_chain (target_type, target_id);

alter table public.audit_chain enable row level security;

-- Append-only: insert allowed, no update/delete
drop policy if exists audit_chain_admin_read on public.audit_chain;
create policy audit_chain_admin_read on public.audit_chain
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists audit_chain_self_read on public.audit_chain;
create policy audit_chain_self_read on public.audit_chain
  for select to authenticated
  using (actor_id = auth.uid());

drop policy if exists audit_chain_authenticated_insert on public.audit_chain;
create policy audit_chain_authenticated_insert on public.audit_chain
  for insert to authenticated
  with check (actor_id = auth.uid() or actor_id is null);

-- Forbid UPDATE / DELETE via trigger
create or replace function public.audit_chain_no_modify()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_chain is append-only';
end;
$$;

drop trigger if exists audit_chain_no_update on public.audit_chain;
create trigger audit_chain_no_update
  before update or delete on public.audit_chain
  for each row execute function public.audit_chain_no_modify();

-- ---------------------------------------------------------------------
-- 4. secret_vault (encrypted secrets)
-- ---------------------------------------------------------------------
create table if not exists public.secret_vault (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  key text not null,
  description text,
  ciphertext text not null,
  version integer not null default 1,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  access_count integer not null default 0,
  rotation_due_at timestamptz,
  unique (organization_id, key)
);

create index if not exists secret_vault_org_idx
  on public.secret_vault (organization_id, key);
create index if not exists secret_vault_rotation_idx
  on public.secret_vault (rotation_due_at)
  where rotation_due_at is not null;

alter table public.secret_vault enable row level security;

drop policy if exists secret_vault_admin_all on public.secret_vault;
create policy secret_vault_admin_all on public.secret_vault
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------
-- 5. legal_holds (e-discovery)
-- ---------------------------------------------------------------------
create table if not exists public.legal_holds (
  id uuid primary key default gen_random_uuid(),
  case_reference text not null,
  description text not null,
  target_user_ids uuid[] not null default '{}',
  target_organization_id uuid,
  resource_types text[] not null default '{}',
  active boolean not null default true,
  imposed_by uuid not null references auth.users(id) on delete restrict,
  imposed_at timestamptz not null default now(),
  released_at timestamptz,
  release_reason text
);

create index if not exists legal_holds_active_idx
  on public.legal_holds (active, imposed_at desc)
  where active = true;
create index if not exists legal_holds_target_users_gin
  on public.legal_holds using gin (target_user_ids);
create index if not exists legal_holds_resources_gin
  on public.legal_holds using gin (resource_types);

alter table public.legal_holds enable row level security;

drop policy if exists legal_holds_admin_all on public.legal_holds;
create policy legal_holds_admin_all on public.legal_holds
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Target users may see they are under hold
drop policy if exists legal_holds_target_read on public.legal_holds;
create policy legal_holds_target_read on public.legal_holds
  for select to authenticated
  using (auth.uid() = any(target_user_ids));

-- ---------------------------------------------------------------------
-- 6. ediscovery_queries
-- ---------------------------------------------------------------------
create table if not exists public.ediscovery_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  filters jsonb not null default '{}'::jsonb,
  requested_by uuid not null references auth.users(id) on delete restrict,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  result_count integer not null default 0,
  custody_hash text,
  completed_at timestamptz
);

create index if not exists ediscovery_queries_requested_by_idx
  on public.ediscovery_queries (requested_by, requested_at desc);

alter table public.ediscovery_queries enable row level security;

drop policy if exists ediscovery_queries_admin on public.ediscovery_queries;
create policy ediscovery_queries_admin on public.ediscovery_queries
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------
-- 7. compliance_evidence (saved reports)
-- ---------------------------------------------------------------------
create table if not exists public.compliance_evidence (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('dpia','ropa','soc2','iso27001','audit_integrity')),
  organization_id uuid,
  generated_at timestamptz not null default now(),
  period_start timestamptz not null,
  period_end timestamptz not null,
  data jsonb not null,
  format text not null default 'json' check (format in ('json','markdown','pdf'))
);

create index if not exists compliance_evidence_kind_idx
  on public.compliance_evidence (kind, generated_at desc);
create index if not exists compliance_evidence_org_idx
  on public.compliance_evidence (organization_id, generated_at desc);

alter table public.compliance_evidence enable row level security;

drop policy if exists compliance_evidence_admin on public.compliance_evidence;
create policy compliance_evidence_admin on public.compliance_evidence
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------
comment on table public.rbac_policies is
  'Tier 23: fine-grained ABAC policies (subject × action × resource × conditions × effect).';
comment on table public.impersonation_sessions is
  'Tier 23: admin impersonation tokens with TTL, scope, audit, revoke.';
comment on table public.audit_chain is
  'Tier 23: tamper-evident audit log; HMAC-SHA256 chain (prev_hash → curr_hash). Append-only.';
comment on table public.secret_vault is
  'Tier 23: encrypted secrets (AES-256-GCM envelope, PBKDF2 600k KEK, version, rotation).';
comment on table public.legal_holds is
  'Tier 23: e-discovery legal holds — freezes retention/purge for users/orgs/resource_types.';
comment on table public.ediscovery_queries is
  'Tier 23: e-discovery query history with chain-of-custody hash.';
comment on table public.compliance_evidence is
  'Tier 23: saved compliance reports (DPIA/RoPA/SOC2/ISO27001/audit_integrity).';
