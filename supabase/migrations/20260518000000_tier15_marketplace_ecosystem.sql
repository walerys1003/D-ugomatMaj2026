-- Tier 15 — Marketplace + ecosystem (zad. 701-750)
-- Tables: marketplace_listings, marketplace_reviews, plugin_installations,
-- marketplace_partners, marketplace_earnings, marketplace_payout_batches,
-- resellers, reseller_referrals, marketplace_featured.

create extension if not exists "pgcrypto";

-- ── Listings ──────────────────────────────────────────────────────────────
create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('template','plugin','integration')),
  name text not null,
  slug text not null unique,
  short_description text not null,
  long_description text,
  category text not null,
  tags text[] not null default '{}',
  pricing_model text not null check (pricing_model in ('free','one_time','subscription','revenue_share')),
  price_cents integer not null default 0,
  currency text not null default 'PLN' check (currency in ('PLN','EUR','USD')),
  revenue_share_pct numeric(4,3) not null default 0.700,
  icon_url text,
  homepage_url text,
  source_repo_url text,
  manifest jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft','in_review','approved','rejected','deprecated')),
  reviewed_by uuid references auth.users(id),
  rejection_reason text,
  average_rating numeric(3,2) not null default 0,
  install_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_marketplace_listings_type_status on marketplace_listings(type, status);
create index if not exists idx_marketplace_listings_category on marketplace_listings(category);
create index if not exists idx_marketplace_listings_publisher on marketplace_listings(publisher_id);

alter table marketplace_listings enable row level security;
do $$ begin
  create policy "listings_select_approved_or_owner" on marketplace_listings
    for select using (status = 'approved' or publisher_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "listings_modify_owner" on marketplace_listings
    for all using (publisher_id = auth.uid()) with check (publisher_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── Reviews ───────────────────────────────────────────────────────────────
create table if not exists marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);
create index if not exists idx_marketplace_reviews_listing on marketplace_reviews(listing_id);

alter table marketplace_reviews enable row level security;
do $$ begin
  create policy "reviews_select_all" on marketplace_reviews for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "reviews_modify_owner" on marketplace_reviews
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── Plugin installations (per org) ────────────────────────────────────────
create table if not exists plugin_installations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  plugin_id text not null,
  version text not null,
  status text not null default 'active' check (status in ('active','disabled','updating','failed')),
  granted_permissions text[] not null default '{}',
  config jsonb not null default '{}',
  risk_score integer not null default 0,
  sandbox_profile jsonb not null default '{}',
  installed_by uuid references auth.users(id),
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  uninstalled_at timestamptz,
  unique (org_id, plugin_id)
);
create index if not exists idx_plugin_installations_org on plugin_installations(org_id);

alter table plugin_installations enable row level security;
do $$ begin
  create policy "plugin_installations_org_members" on plugin_installations
    for all using (
      exists (select 1 from org_memberships m where m.org_id = plugin_installations.org_id and m.user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- ── Partner / developer program ──────────────────────────────────────────
create table if not exists marketplace_partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  contact_email text not null,
  website_url text,
  pitch text not null,
  expected_listings integer not null default 0,
  status text not null default 'applied' check (status in ('applied','approved','rejected','suspended')),
  tier text not null default 'bronze' check (tier in ('bronze','silver','gold','platinum')),
  revenue_share_pct numeric(4,3) not null default 0.700,
  payout_method text check (payout_method in ('bank_transfer','stripe','paypal')),
  tax_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table marketplace_partners enable row level security;
do $$ begin
  create policy "partners_select_self" on marketplace_partners for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "partners_insert_self" on marketplace_partners for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── Earnings + payouts ───────────────────────────────────────────────────
create table if not exists marketplace_earnings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  partner_id uuid not null references marketplace_partners(id) on delete cascade,
  buyer_org_id uuid not null references organizations(id) on delete cascade,
  gross_cents integer not null,
  currency text not null default 'PLN' check (currency in ('PLN','EUR','USD')),
  revenue_share_pct numeric(4,3) not null,
  creator_gross_cents integer not null,
  platform_fee_cents integer not null,
  net_cents integer not null,
  settled boolean not null default false,
  payout_batch_id uuid,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);
create index if not exists idx_earnings_partner_settled on marketplace_earnings(partner_id, settled);

create table if not exists marketplace_payout_batches (
  id uuid primary key default gen_random_uuid(),
  line_count integer not null default 0,
  total_net_cents bigint not null default 0,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  lines jsonb not null default '[]',
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ── Reseller / white-label ───────────────────────────────────────────────
create table if not exists resellers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text not null,
  brand_subdomain text not null unique,
  status text not null default 'applied' check (status in ('applied','active','suspended','terminated')),
  tier text not null default 'starter' check (tier in ('starter','growth','enterprise')),
  commission_pct numeric(4,3) not null default 0.150,
  primary_color text,
  logo_url text,
  support_email text not null,
  referred_org_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reseller_referrals (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references resellers(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (reseller_id, org_id)
);
create index if not exists idx_reseller_referrals_reseller on reseller_referrals(reseller_id);

alter table resellers enable row level security;
do $$ begin
  create policy "resellers_select_owner" on resellers for select using (owner_user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "resellers_insert_owner" on resellers for insert with check (owner_user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── Featured slots ───────────────────────────────────────────────────────
create table if not exists marketplace_featured (
  id uuid primary key default gen_random_uuid(),
  position integer not null,
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  headline text not null,
  badge text check (badge in ('editors_pick','new','trending','verified')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_marketplace_featured_window on marketplace_featured(starts_at, ends_at);

-- ── RPC helpers ──────────────────────────────────────────────────────────
create or replace function increment_listing_install_count(p_listing_id uuid)
returns void language sql security definer as $$
  update marketplace_listings set install_count = install_count + 1 where id = p_listing_id;
$$;

create or replace function increment_review_helpful(p_review_id uuid)
returns void language sql security definer as $$
  update marketplace_reviews set helpful_count = helpful_count + 1 where id = p_review_id;
$$;
