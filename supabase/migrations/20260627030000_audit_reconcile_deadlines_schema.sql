-- =============================================================================
-- Długomat — Audyt 2026-06-27 — REALNY BUG: kolizja schematu tabeli `deadlines`
-- =============================================================================
-- WYKRYTO PODCZAS USUWANIA `as any` (Audyt #6):
--   Istnieją DWIE migracje `create table if not exists public.deadlines`:
--     • 20260510130400_deadlines.sql            (Tier 2  — schemat STARY)
--         kolumny: description, deadline_date, notif_d{7,5,3,1}_sent,
--                  notif_d0_{morning,evening}_sent, is_completed; kind = enum
--                  public.deadline_kind ('sprzeciw_14dni', ...)
--     • 20260521000000_tier18_ocr_deadlines_courts.sql (Tier 18 — schemat NOWY)
--         kolumny: title, end_date, effective_end_date, legal_basis,
--                  snoozed_until, completed_at, reminders_sent text[];
--                  kind = text CHECK ('sprzeciw_epu', ...)
--
--   Przez `if not exists` wygrywa migracja URUCHOMIONA WCZEŚNIEJ (Tier 2),
--   a Tier 18 jest po cichu pomijana. Tymczasem KOD aplikacji
--   (lib/deadlines/deadline-tracker.ts + deadline-engine.ts) używa WYŁĄCZNIE
--   schematu NOWEGO (title, effective_end_date, reminders_sent, snoozed_until,
--   legal_basis, completed_at, kind='sprzeciw_epu'...). Rzutowanie `as any`
--   maskowało, że na bazie ze starym schematem te zapytania PADAJĄ w runtime
--   (kolumny nie istnieją / enum nie zawiera wartości).
--
-- TA MIGRACJA — IDEMPOTENTNE POGODZENIE do schematu Tier 18 (zgodnego z kodem),
-- niezależnie od tego, która `create table` zadziałała pierwsza. Bezpieczna na
-- świeżej bazie (kolumny już są → no-op) i na starej (dodaje brakujące kolumny
-- + backfill ze starych).
-- =============================================================================

-- 1) Tabela musi istnieć (gdyby żadna create-table nie zadziałała).
create table if not exists public.deadlines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  case_id     uuid,
  created_at  timestamptz not null default now()
);

-- 2) Dodaj kolumny schematu Tier 18 (zgodne z kodem). IF NOT EXISTS → idempotentne.
alter table public.deadlines add column if not exists kind               text;
alter table public.deadlines add column if not exists title              text;
alter table public.deadlines add column if not exists start_date         timestamptz;
alter table public.deadlines add column if not exists end_date           timestamptz;
alter table public.deadlines add column if not exists effective_end_date timestamptz;
alter table public.deadlines add column if not exists legal_basis        text;
alter table public.deadlines add column if not exists snoozed_until      timestamptz;
alter table public.deadlines add column if not exists completed_at       timestamptz;
alter table public.deadlines add column if not exists reminders_sent     text[] not null default '{}';

-- 3) Backfill ze STAREGO schematu (Tier 2), jeśli stare kolumny istnieją.
--    Wykonujemy warunkowo, by nie wywrócić migracji na świeżej bazie.
do $$
begin
  -- description -> title
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'deadlines'
      and column_name = 'description'
  ) then
    update public.deadlines
       set title = coalesce(title, description)
     where title is null;
  end if;

  -- deadline_date -> end_date / effective_end_date (gdy brak nowych)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'deadlines'
      and column_name = 'deadline_date'
  ) then
    update public.deadlines
       set end_date           = coalesce(end_date, deadline_date::timestamptz),
           effective_end_date = coalesce(effective_end_date, deadline_date::timestamptz),
           start_date         = coalesce(start_date, start_date::timestamptz)
     where end_date is null or effective_end_date is null;
  end if;

  -- is_completed=true -> completed_at (gdy brak completed_at)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'deadlines'
      and column_name = 'is_completed'
  ) then
    update public.deadlines
       set completed_at = coalesce(completed_at, now())
     where completed_at is null and is_completed = true;
  end if;

  -- stare okna notif_*_sent -> reminders_sent[] (mapowanie d7/d3/d1/d0)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'deadlines'
      and column_name = 'notif_d7_sent'
  ) then
    update public.deadlines d
       set reminders_sent = (
         select coalesce(array_agg(w), '{}')
         from (
           select 'd7'::text as w where d.notif_d7_sent
           union all select 'd3' where d.notif_d3_sent
           union all select 'd1' where d.notif_d1_sent
           union all select 'd0' where d.notif_d0_morning_sent or d.notif_d0_evening_sent
         ) s
       )
     where reminders_sent = '{}';
  end if;
end $$;

-- 4) Indeksy z Tier 18 (idempotentne).
create index if not exists idx_deadlines_user_active
  on public.deadlines(user_id, effective_end_date)
  where completed_at is null;
create index if not exists idx_deadlines_case on public.deadlines(case_id);
create index if not exists idx_deadlines_due
  on public.deadlines(effective_end_date) where completed_at is null;

-- 5) RLS (idempotentne).
alter table public.deadlines enable row level security;
drop policy if exists "deadlines_self" on public.deadlines;
create policy "deadlines_self" on public.deadlines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

comment on table public.deadlines is
  'Terminy procesowe. Schemat ujednolicony do wersji Tier 18 (zgodnej z '
  'lib/deadlines/deadline-tracker.ts). Audyt 2026-06-27 — naprawa kolizji '
  'dwóch migracji create-table-if-not-exists.';
