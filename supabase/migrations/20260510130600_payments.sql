-- =============================================================================
-- Długomat — Tier 2 / Migration 008 — Payments (Stripe + Fakturownia)
-- Source: docs/spec/SPEC_FULL.txt §7.2 Migration 007
-- Tier 2: schema + indexes (RLS + webhooks integrated in Tier 4).
-- =============================================================================

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,

  -- Stripe ------------------------------------------------------------------
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,

  -- Amounts (grosze, czyli 1/100 PLN) ---------------------------------------
  amount integer not null,                 -- np. 15900 = 159.00 PLN
  currency text not null default 'pln',
  vat_rate numeric(5,2) not null default 23.00,
  vat_amount integer not null default 0,   -- liczone serwerowo

  -- Product -----------------------------------------------------------------
  product_type text not null,              -- 'sprzeciw_epu' | 'komornik_pakiet' | 'bik_fix' ...
  product_name text not null,

  -- Customer (B2B / B2C) ----------------------------------------------------
  customer_type text not null default 'b2c',  -- 'b2c' | 'b2b'
  invoice_company_name text,
  invoice_nip text,
  invoice_address text,

  -- Fakturownia -------------------------------------------------------------
  fakturownia_invoice_id bigint,
  fakturownia_invoice_number text,
  fakturownia_invoice_url text,

  -- Status ------------------------------------------------------------------
  status public.payment_status not null default 'pending',
  failure_reason text,

  -- Lifecycle ---------------------------------------------------------------
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,

  constraint payments_amount_positive check (amount >= 0),
  constraint payments_currency_lower check (currency = lower(currency)),
  constraint payments_customer_type_known check (customer_type in ('b2c', 'b2b')),
  constraint payments_b2b_has_nip check (
    customer_type = 'b2c' or (invoice_nip is not null and length(btrim(invoice_nip)) >= 10)
  )
);

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
  before update on public.payments
  for each row execute function public.tg_touch_updated_at();

create index if not exists idx_payments_user_id          on public.payments(user_id);
create index if not exists idx_payments_case_id          on public.payments(case_id);
create index if not exists idx_payments_status           on public.payments(status);
create index if not exists idx_payments_stripe_session   on public.payments(stripe_session_id);
create index if not exists idx_payments_paid_at          on public.payments(paid_at desc) where status = 'completed';

comment on table public.payments is
  'Każda transakcja Stripe + jej powiązanie z fakturą Fakturownia (Tier 4).';
