-- Audyt 2026-06-27 (iter. 38, #6): brakujące tabele wykryte przy usuwaniu
-- castów `as any`. Kod produkcyjny odwoływał się do nich, lecz migracje nie
-- istniały (latentny bug maskowany przez `supabase as any`).

-- scheduled_reminders — kolejka przypomnień termin. (lib/letters/auto-deadline-tagger.ts)
create table if not exists public.scheduled_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid,
  deadline_id uuid,
  remind_at timestamptz not null,
  title text not null,
  days_before integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists scheduled_reminders_due_idx
  on public.scheduled_reminders (remind_at) where sent_at is null;
alter table public.scheduled_reminders enable row level security;

-- legal_references — baza orzecznictwa/przepisów (RAG + precedensy)
create table if not exists public.legal_references (
  id uuid primary key default gen_random_uuid(),
  citation text not null,
  signature text,
  abbreviation text,
  article_number text,
  ref_type text not null default 'other',
  legal_area text,
  body text,
  url text,
  publication_date date,
  verified boolean not null default false,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
create index if not exists legal_references_ref_type_idx on public.legal_references (ref_type);
create index if not exists legal_references_verified_idx on public.legal_references (verified) where verified;
alter table public.legal_references enable row level security;
