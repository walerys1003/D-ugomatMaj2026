-- Tier 16 — PWA + mobile + i18n + push (zad. 751-800)
-- Tables: push_subscriptions, offline_queue, user_preferences (i18n + theme).

create extension if not exists "pgcrypto";

-- ── Push subscriptions (Web Push / VAPID) ────────────────────────────────
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  endpoint_hash text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, endpoint_hash)
);
create index if not exists idx_push_subscriptions_user on push_subscriptions(user_id, active);

alter table push_subscriptions enable row level security;
do $$ begin
  create policy "push_subscriptions_owner" on push_subscriptions
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── Offline queue (drainable on reconnect) ───────────────────────────────
create table if not exists offline_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  op text not null check (op in ('case.create','case.update','document.draft','message.send','deadline.snooze')),
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending','done','failed')),
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists idx_offline_queue_user_status on offline_queue(user_id, status);

alter table offline_queue enable row level security;
do $$ begin
  create policy "offline_queue_owner" on offline_queue
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ── User preferences (locale, theme, a11y, mobile defaults) ──────────────
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'pl' check (locale in ('pl','en','uk')),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  high_contrast boolean not null default false,
  reduce_motion boolean not null default false,
  font_scale numeric(3,2) not null default 1.00 check (font_scale between 0.8 and 1.5),
  haptics_enabled boolean not null default true,
  push_enabled boolean not null default true,
  email_digest text not null default 'daily' check (email_digest in ('off','daily','weekly')),
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;
do $$ begin
  create policy "user_preferences_owner" on user_preferences
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Upsert helper to avoid race conditions on first preference write.
create or replace function upsert_user_preferences(
  p_user_id uuid,
  p_locale text default null,
  p_theme text default null,
  p_high_contrast boolean default null,
  p_reduce_motion boolean default null,
  p_font_scale numeric default null,
  p_haptics_enabled boolean default null,
  p_push_enabled boolean default null,
  p_email_digest text default null
) returns user_preferences language plpgsql security definer as $$
declare
  result user_preferences;
begin
  insert into user_preferences (user_id, locale, theme, high_contrast, reduce_motion, font_scale, haptics_enabled, push_enabled, email_digest)
  values (
    p_user_id,
    coalesce(p_locale, 'pl'),
    coalesce(p_theme, 'system'),
    coalesce(p_high_contrast, false),
    coalesce(p_reduce_motion, false),
    coalesce(p_font_scale, 1.00),
    coalesce(p_haptics_enabled, true),
    coalesce(p_push_enabled, true),
    coalesce(p_email_digest, 'daily')
  )
  on conflict (user_id) do update set
    locale = coalesce(p_locale, user_preferences.locale),
    theme = coalesce(p_theme, user_preferences.theme),
    high_contrast = coalesce(p_high_contrast, user_preferences.high_contrast),
    reduce_motion = coalesce(p_reduce_motion, user_preferences.reduce_motion),
    font_scale = coalesce(p_font_scale, user_preferences.font_scale),
    haptics_enabled = coalesce(p_haptics_enabled, user_preferences.haptics_enabled),
    push_enabled = coalesce(p_push_enabled, user_preferences.push_enabled),
    email_digest = coalesce(p_email_digest, user_preferences.email_digest),
    updated_at = now()
  returning * into result;
  return result;
end;
$$;
