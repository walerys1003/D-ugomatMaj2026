-- Tier 13 — Enterprise + multi-tenant: orgs, workspaces, RBAC, SSO, SCIM, domains, audit chain.

create table if not exists public.organizations (
  id uuid primary key,
  slug text unique not null,
  name text not null,
  plan text not null default 'team',
  seats_purchased int not null default 5,
  data_residency text not null default 'eu-warsaw',
  domain text,
  created_at timestamptz not null default now()
);
create index if not exists idx_organizations_slug on public.organizations(slug);

alter table public.organizations enable row level security;
do $$ begin
  create policy org_member_read on public.organizations for select
    using (exists (select 1 from public.org_memberships m where m.org_id = id and m.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

create table if not exists public.org_memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  last_active_at timestamptz,
  primary key (org_id, user_id)
);
create index if not exists idx_org_mem_user on public.org_memberships(user_id);

alter table public.org_memberships enable row level security;
do $$ begin
  create policy org_mem_self on public.org_memberships for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy org_mem_owner on public.org_memberships for all
    using (exists (select 1 from public.org_memberships m where m.org_id = org_memberships.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')))
    with check (exists (select 1 from public.org_memberships m where m.org_id = org_memberships.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')));
exception when duplicate_object then null; end $$;

create table if not exists public.org_invitations (
  id bigserial primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token text not null unique,
  invited_by uuid,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_org_inv_org on public.org_invitations(org_id);
create index if not exists idx_org_inv_token on public.org_invitations(token);

alter table public.org_invitations enable row level security;
do $$ begin
  create policy org_inv_token_read on public.org_invitations for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy org_inv_admin_write on public.org_invitations for all
    using (exists (select 1 from public.org_memberships m where m.org_id = org_invitations.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')))
    with check (exists (select 1 from public.org_memberships m where m.org_id = org_invitations.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')));
exception when duplicate_object then null; end $$;

create table if not exists public.workspaces (
  id uuid primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_workspaces_org on public.workspaces(org_id);

alter table public.workspaces enable row level security;
do $$ begin
  create policy ws_member_read on public.workspaces for select
    using (exists (select 1 from public.org_memberships m where m.org_id = workspaces.org_id and m.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

create table if not exists public.org_sso_configs (
  org_id uuid not null references public.organizations(id) on delete cascade,
  protocol text not null,
  idp_entity_id text,
  idp_sso_url text,
  idp_x509_cert text,
  oidc_issuer text,
  oidc_client_id text,
  oidc_client_secret text,
  attribute_mapping jsonb not null default '{}'::jsonb,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (org_id, protocol)
);
alter table public.org_sso_configs enable row level security;
do $$ begin
  create policy sso_admin on public.org_sso_configs for all
    using (exists (select 1 from public.org_memberships m where m.org_id = org_sso_configs.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')))
    with check (exists (select 1 from public.org_memberships m where m.org_id = org_sso_configs.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')));
exception when duplicate_object then null; end $$;

create table if not exists public.custom_domains (
  id uuid primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null unique,
  verification_token text not null,
  status text not null default 'pending',
  ssl_status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_cd_org on public.custom_domains(org_id);

alter table public.custom_domains enable row level security;
do $$ begin
  create policy cd_admin on public.custom_domains for all
    using (exists (select 1 from public.org_memberships m where m.org_id = custom_domains.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')))
    with check (exists (select 1 from public.org_memberships m where m.org_id = custom_domains.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')));
exception when duplicate_object then null; end $$;

create table if not exists public.org_audit_log (
  id bigserial primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid not null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  prev_hash text,
  hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_oal_org on public.org_audit_log(org_id, created_at desc);

alter table public.org_audit_log enable row level security;
do $$ begin
  create policy oal_admin_read on public.org_audit_log for select
    using (exists (select 1 from public.org_memberships m where m.org_id = org_audit_log.org_id and m.user_id = auth.uid() and m.role in ('owner','admin','billing')));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy oal_service_insert on public.org_audit_log for insert with check (true);
exception when duplicate_object then null; end $$;

-- Add workspace_id + org_id columns to cases (idempotent)
do $$ begin
  alter table public.cases add column if not exists org_id uuid references public.organizations(id);
  alter table public.cases add column if not exists workspace_id uuid references public.workspaces(id);
exception when others then null; end $$;

-- Profiles extra fields used by SCIM
do $$ begin
  alter table public.profiles add column if not exists provisioned_via text;
  alter table public.profiles add column if not exists external_id text;
  alter table public.profiles add column if not exists active boolean default true;
exception when others then null; end $$;
