-- =====================================================================
-- Tier 21 — Realtime channels + presence + bulk operations + audit replay
-- (zad. 1001-1050)
-- =====================================================================
--
-- Tabele:
--  1. realtime_events    — pub/sub broker event log + replay source
--  2. presence_state     — kto online + w jakim topicu + status + color
--  3. bulk_operations    — masowe operacje z progress trackingiem
--
-- Wszystkie z RLS (self-policy + admin-where-appropriate).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. realtime_events — event log dla SSE broker + audit replay
-- ---------------------------------------------------------------------
create table if not exists public.realtime_events (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  kind text not null check (kind in (
    'case.updated','case.commented','doc.updated','doc.cursor',
    'deadline.fired','notification.delivered','presence.join','presence.leave',
    'ai.generation.progress','ocr.progress','bulk.progress','system.broadcast'
  )),
  payload jsonb not null default '{}'::jsonb,
  user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index if not exists realtime_events_topic_time_idx
  on public.realtime_events (topic, occurred_at desc);
create index if not exists realtime_events_user_time_idx
  on public.realtime_events (user_id, occurred_at desc) where user_id is not null;
create index if not exists realtime_events_kind_time_idx
  on public.realtime_events (kind, occurred_at desc);
create index if not exists realtime_events_topic_prefix_idx
  on public.realtime_events using btree (topic text_pattern_ops);

alter table public.realtime_events enable row level security;

-- Self-policy: user widzi swoje zdarzenia
drop policy if exists realtime_events_self_select on public.realtime_events;
create policy realtime_events_self_select on public.realtime_events
  for select to authenticated
  using (
    user_id = auth.uid()
    -- topicowe (case:* / doc:*) — widoczność delegujemy do warstwy aplikacji
    or topic like 'system%'
  );

-- Admin sees all
drop policy if exists realtime_events_admin_all on public.realtime_events;
create policy realtime_events_admin_all on public.realtime_events
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Insert: tylko service_role / admin / signed-in users na topicach gdzie user_id = self
drop policy if exists realtime_events_self_insert on public.realtime_events;
create policy realtime_events_self_insert on public.realtime_events
  for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- TTL retention (90 dni) — funkcja do crona
create or replace function public.purge_old_realtime_events(retention_days int default 90)
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  delete from public.realtime_events
   where occurred_at < (now() - (retention_days || ' days')::interval);
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. presence_state — kto online + status + topic + color
-- ---------------------------------------------------------------------
create table if not exists public.presence_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  status text not null default 'online'
    check (status in ('online','away','busy','offline')),
  topic text,
  device text not null default 'web'
    check (device in ('web','ios','android','desktop')),
  color text not null default '#7C3AED',
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 seconds'),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists presence_state_topic_expires_idx
  on public.presence_state (topic, expires_at desc)
  where status <> 'offline';
create index if not exists presence_state_status_idx
  on public.presence_state (status, expires_at desc);

alter table public.presence_state enable row level security;

drop policy if exists presence_state_self_modify on public.presence_state;
create policy presence_state_self_modify on public.presence_state
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Read presence — wszyscy uwierzytelnieni mogą widzieć kto jest w danym topicu
drop policy if exists presence_state_authenticated_read on public.presence_state;
create policy presence_state_authenticated_read on public.presence_state
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 3. bulk_operations — masowe operacje + progress
-- ---------------------------------------------------------------------
create table if not exists public.bulk_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in (
    'cases.update','cases.archive','cases.unarchive','cases.delete','cases.export',
    'deadlines.reassign','deadlines.complete',
    'notifications.send',
    'documents.tag','documents.move'
  )),
  status text not null default 'pending'
    check (status in ('pending','running','completed','completed_with_errors','canceled','failed')),
  total integer not null default 0,
  processed integer not null default 0,
  failed integer not null default 0,
  target_ids text[] not null default '{}',
  params jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  result_url text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bulk_operations_user_created_idx
  on public.bulk_operations (user_id, created_at desc);
create index if not exists bulk_operations_status_idx
  on public.bulk_operations (status, created_at desc);
create index if not exists bulk_operations_running_idx
  on public.bulk_operations (status)
  where status in ('pending','running');

alter table public.bulk_operations enable row level security;

drop policy if exists bulk_operations_self on public.bulk_operations;
create policy bulk_operations_self on public.bulk_operations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists bulk_operations_admin_read on public.bulk_operations;
create policy bulk_operations_admin_read on public.bulk_operations
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------
-- Helper: NOTIFY trigger dla realtime_events (Postgres LISTEN/NOTIFY)
-- ---------------------------------------------------------------------
create or replace function public.realtime_events_notify()
returns trigger
language plpgsql
as $$
begin
  perform pg_notify(
    'realtime_events',
    json_build_object(
      'id', new.id,
      'topic', new.topic,
      'kind', new.kind,
      'user_id', new.user_id,
      'occurred_at', new.occurred_at
    )::text
  );
  return new;
end;
$$;

drop trigger if exists realtime_events_notify_trg on public.realtime_events;
create trigger realtime_events_notify_trg
  after insert on public.realtime_events
  for each row execute function public.realtime_events_notify();

-- ---------------------------------------------------------------------
-- Helper: bulk_operations progress percent (computed view)
-- ---------------------------------------------------------------------
create or replace view public.bulk_operations_progress as
select
  id,
  user_id,
  kind,
  status,
  total,
  processed,
  failed,
  case when total = 0 then 0
       else round((processed::numeric / total::numeric) * 100, 1)
  end as percent,
  started_at,
  finished_at,
  created_at,
  extract(epoch from coalesce(finished_at, now()) - coalesce(started_at, created_at))::int as elapsed_seconds
from public.bulk_operations;

grant select on public.bulk_operations_progress to authenticated;

-- ---------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------
comment on table public.realtime_events is
  'Tier 21: pub/sub event log dla SSE broker + audit replay; 90d retention.';
comment on table public.presence_state is
  'Tier 21: presence (online/away/busy/offline) z TTL 60s + stable color per user.';
comment on table public.bulk_operations is
  'Tier 21: masowe operacje (max 50k targets) z chunkowym progressem + cancel.';
