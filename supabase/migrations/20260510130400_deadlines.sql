-- =============================================================================
-- Długomat — Tier 2 / Migration 006 — Deadlines (terminy procesowe)
-- Source: docs/spec/SPEC_FULL.txt §7.2 Migration 005
-- Każda sprawa może rodzić jeden lub więcej terminów (np. 14 dni na sprzeciw).
-- CRON Edge Function (Tier 3+) skanuje tę tabelę i wysyła powiadomienia.
-- =============================================================================

create table if not exists public.deadlines (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  kind public.deadline_kind not null,
  description text not null,               -- np. 'Termin na złożenie sprzeciwu'

  start_date date not null,                -- data doręczenia / start biegu
  deadline_date date not null,             -- obliczona data graniczna

  -- Notification tracking (jeden boolean per okno powiadomienia) -------------
  notif_d7_sent boolean not null default false,
  notif_d5_sent boolean not null default false,
  notif_d3_sent boolean not null default false,
  notif_d1_sent boolean not null default false,
  notif_d0_morning_sent boolean not null default false,
  notif_d0_evening_sent boolean not null default false,

  -- Stan ----------------------------------------------------------------------
  is_completed boolean not null default false,  -- user oznaczył pismo jako złożone
  completed_at timestamptz,

  created_at timestamptz not null default now(),

  constraint deadline_after_start check (deadline_date >= start_date)
);

create index if not exists idx_deadlines_user_id        on public.deadlines(user_id);
create index if not exists idx_deadlines_case_id        on public.deadlines(case_id);
create index if not exists idx_deadlines_deadline_date  on public.deadlines(deadline_date)
  where is_completed = false;
create index if not exists idx_deadlines_upcoming       on public.deadlines(deadline_date, user_id)
  where is_completed = false and deadline_date >= current_date;

comment on table public.deadlines is
  'Terminy procesowe / administracyjne. CRON Edge Function (Tier 3) przesyła powiadomienia.';
comment on column public.deadlines.kind is
  'Logiczny rodzaj terminu — wpływa na kanały i template powiadomienia.';
