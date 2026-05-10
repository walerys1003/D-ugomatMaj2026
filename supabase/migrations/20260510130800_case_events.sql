-- =============================================================================
-- Długomat — Tier 2 / Migration 010 — Case events (audit log)
-- Source: docs/spec/SPEC_FULL.txt §7.2 — case_events table
-- Każda istotna akcja w sprawie ląduje tutaj. Append-only, używane przez
-- panel administracyjny (Tier 5) oraz user-facing timeline w /panel/sprawa/[id].
-- =============================================================================

create table if not exists public.case_events (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,

  event_type text not null,                -- np. 'wizard_step_completed', 'document_generated'
  actor public.event_actor not null default 'user',
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_case_events_case_id    on public.case_events(case_id, created_at desc);
create index if not exists idx_case_events_user_id    on public.case_events(user_id, created_at desc);
create index if not exists idx_case_events_event_type on public.case_events(event_type);

comment on table public.case_events is
  'Append-only audit log każdej zmiany sprawy. Używane przez timeline + admin panel.';
