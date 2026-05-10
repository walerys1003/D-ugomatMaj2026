-- =============================================================================
-- Długomat — Tier 2 / Migration 009 — Notifications (email + SMS + push)
-- Source: docs/spec/SPEC_FULL.txt §7.2 Migration 008
-- Wstawiane przez CRON (deadline reminders), webhooki Stripe (confirmations),
-- ale również ad-hoc z poziomu kodu (np. po wygenerowaniu pisma).
-- =============================================================================

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  deadline_id uuid references public.deadlines(id) on delete set null,

  channel public.notification_channel not null,
  template text not null,                  -- np. 'deadline_d3_warning'
  status public.notification_status not null default 'scheduled',

  -- Adres docelowy (snapshot — user może zmienić email/phone, my zachowujemy)
  recipient text not null,                 -- email lub telefon

  -- Treść (snapshot rendered) ----------------------------------------------
  subject text,                            -- tylko email
  body_text text,                          -- plaintext fallback
  body_html text,                          -- email html

  -- Provider tracking ------------------------------------------------------
  provider text,                           -- 'resend' | 'smsapi' | 'webpush'
  provider_message_id text,                -- ID od dostawcy
  provider_response jsonb,

  -- Lifecycle --------------------------------------------------------------
  scheduled_for timestamptz,               -- gdy null = wyślij teraz
  sent_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  retry_count integer not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id        on public.notifications(user_id);
create index if not exists idx_notifications_case_id        on public.notifications(case_id);
create index if not exists idx_notifications_status         on public.notifications(status);
create index if not exists idx_notifications_scheduled_due  on public.notifications(scheduled_for)
  where status = 'scheduled';
create index if not exists idx_notifications_template_status
  on public.notifications(template, status);

comment on table public.notifications is
  'Wysłane / zaplanowane powiadomienia. CRON Edge Function odpytuje status=scheduled.';
