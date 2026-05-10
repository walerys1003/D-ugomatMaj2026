-- =============================================================================
-- Długomat — Tier 2 / Migration 003 — Extend profiles to spec §7.2 (Migration 002)
-- Adds role, avatar_url, settings JSONB, onboarding_completed.
-- Tier 1 already created profiles with id/email/full_name/phone/locale/marketing_opt_in.
-- =============================================================================

alter table public.profiles
  add column if not exists role public.user_role not null default 'user',
  add column if not exists avatar_url text,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists settings jsonb not null default jsonb_build_object(
    'notifications', jsonb_build_object(
      'email', true,
      'sms', false,
      'deadline_reminders', true,
      'marketing', false
    ),
    'display', jsonb_build_object(
      'theme', 'system',
      'language', 'pl'
    ),
    'privacy', jsonb_build_object(
      'analytics_opt_in', false
    )
  );

-- Helpful indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email_lower on public.profiles(lower(email));

comment on column public.profiles.settings is
  'User preferences (notifications, display, privacy). Updated via /panel/ustawienia.';
comment on column public.profiles.role is
  'Authorization level. Admin/moderator gates access to /panel/admin (Tier 5).';
