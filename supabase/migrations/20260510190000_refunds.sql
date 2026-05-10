-- =============================================================================
-- Długomat — Tier 4 zad. 156 — Refunds (admin tool + Stripe webhook integration)
-- =============================================================================
-- Każdy refund w Stripe odpowiada jednemu rekordowi w `refunds`.
-- Refund może być pełny (amount = payment.amount) albo częściowy.
-- Webhook `charge.refunded` aktualizuje status + payments.refunded_at.
-- =============================================================================

create table if not exists public.refunds (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- Stripe -----------------------------------------------------------------
  stripe_refund_id text unique,
  stripe_payment_intent_id text not null,

  -- Amounts (grosze) -------------------------------------------------------
  amount integer not null,                 -- np. 15900 = 159.00 PLN
  currency text not null default 'pln',

  -- Reason -----------------------------------------------------------------
  reason text,                              -- 'duplicate' | 'fraudulent' | 'requested_by_customer'
  internal_note text,                       -- audit note od admina

  -- Status -----------------------------------------------------------------
  status text not null default 'pending',   -- 'pending' | 'succeeded' | 'failed' | 'canceled'

  -- Audit ------------------------------------------------------------------
  initiated_by_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  succeeded_at timestamptz,

  constraint refunds_amount_positive check (amount > 0),
  constraint refunds_status_known check (status in ('pending', 'succeeded', 'failed', 'canceled'))
);

drop trigger if exists refunds_touch_updated_at on public.refunds;
create trigger refunds_touch_updated_at
  before update on public.refunds
  for each row execute function public.tg_touch_updated_at();

create index if not exists idx_refunds_payment_id   on public.refunds(payment_id);
create index if not exists idx_refunds_user_id      on public.refunds(user_id);
create index if not exists idx_refunds_status       on public.refunds(status);
create index if not exists idx_refunds_stripe_id    on public.refunds(stripe_refund_id);

comment on table public.refunds is
  'Refundy Stripe (Tier 4 zad. 156) — full + partial, audytowane per admin.';

-- RLS: user widzi tylko swoje refundy; admin widzi wszystkie (RLS bypass via service role).
alter table public.refunds enable row level security;
alter table public.refunds force row level security;

drop policy if exists refunds_select_own on public.refunds;
create policy refunds_select_own on public.refunds
  for select to authenticated
  using (user_id = auth.uid());

-- INSERT/UPDATE/DELETE: tylko service role (admin server action + webhook).
