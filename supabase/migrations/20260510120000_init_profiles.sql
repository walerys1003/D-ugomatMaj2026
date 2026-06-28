-- =========================================================================
-- Migration: 20260510120000_init_profiles
-- Purpose : Bootstrap the public.profiles table — 1:1 with auth.users.
--           Establishes RLS-default-deny baseline + minimal owner policies.
-- Tier    : 1.6 (auth + profile + RLS scaffold)
-- Rollback: DROP TABLE public.profiles CASCADE; DROP TRIGGER ...
-- =========================================================================

-- 1. Profiles table -------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique,
  full_name       text,
  phone           text,
  locale          text not null default 'pl',
  marketing_opt_in boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.profiles is 'Application-side user profile, 1:1 with auth.users.';
comment on column public.profiles.locale is 'BCP-47 language tag — drives UI + email language.';

-- 2. updated_at auto-touch trigger ---------------------------------------
create or replace function public.tg_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.tg_touch_updated_at();

-- 3. Auto-create a profile row when a new auth user signs up -------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4. RLS: default deny + owner-only policies ------------------------------
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Deletion is the deletion of the auth.users row (cascades). No direct
-- delete policy on profiles — closing the door explicitly.

-- 5. Indexes (FK already indexed by PK; add lookup index on email) ------
create index if not exists idx_profiles_email on public.profiles (email);

-- 6. Grants — anon must NOT read profiles directly. authenticated does
--    everything via RLS-protected paths. service_role bypasses RLS.
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
