-- =============================================================================
-- Długomat — Tier 4 / Migration 014 — Promo codes
-- PLAN.md task 160
--
-- Schema:
--   - public.promo_codes — definicje kodów (kupon → procent / kwota)
--   - public.promo_redemptions — rejestr użyć (idempotencja + audit)
--
-- Reguły walidacji (egzekwowane DB constraint + walidator app-level):
--   - kod uppercase, alfanumeryczny + dash (3-32 znaków)
--   - dokładnie jeden z (discount_pct, discount_grosze) musi być NOT NULL
--   - max_uses NULL = unlimited; per_user_limit zawsze ≥ 1
--   - valid_from < valid_to
--   - applies_to_case_types NULL = all; pusta tablica = invalid
--
-- RLS (Tier 4):
--   - SELECT: każdy zalogowany user może odczytać kod aktywny (do walidatora);
--     wynik filtruje wrażliwe kolumny (max_uses, current_uses ukryte przez view).
--   - INSERT/UPDATE/DELETE: tylko service_role (admin panel) — domyślne RLS off
--     bo brak polityk = no rows for non-service.
--   - promo_redemptions: SELECT własne, INSERT przez serwer (service-role w
--     stripe-webhook → tylko po payment.completed).
-- =============================================================================

create table if not exists public.promo_codes (
  id uuid primary key default uuid_generate_v4(),

  -- Klucz publiczny — wpisywany przez użytkownika w checkout
  code text not null unique,

  -- Discount — dokładnie jeden z dwóch
  discount_pct numeric(5,2),                    -- 1.00..100.00 (procent)
  discount_grosze integer,                      -- kwota w groszach

  -- Limity
  max_uses integer,                             -- NULL = unlimited
  per_user_limit integer not null default 1,    -- max użyć per user
  current_uses integer not null default 0,      -- inkrementowany w webhook

  -- Walidacja czasowa
  valid_from timestamptz not null default now(),
  valid_to timestamptz,                         -- NULL = bezterminowy

  -- Filtry zastosowania
  applies_to_case_types public.case_type[],     -- NULL = wszystkie typy
  applies_to_bundle_ids text[],                 -- NULL = wszystkie pakiety
  min_amount_grosze integer not null default 0, -- minimum order value

  -- Metadane
  campaign text,                                -- np. 'black_friday_2026'
  notes text,                                   -- internal admin notes
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,

  -- Constraints
  constraint promo_codes_code_format check (
    code = upper(code) and length(code) between 3 and 32
    and code ~ '^[A-Z0-9-]+$'
  ),
  constraint promo_codes_discount_xor check (
    (discount_pct is not null and discount_grosze is null
      and discount_pct > 0 and discount_pct <= 100)
    or
    (discount_pct is null and discount_grosze is not null
      and discount_grosze > 0)
  ),
  constraint promo_codes_max_uses_positive check (
    max_uses is null or max_uses > 0
  ),
  constraint promo_codes_per_user_limit_positive check (
    per_user_limit >= 1
  ),
  constraint promo_codes_current_uses_nonneg check (
    current_uses >= 0
  ),
  constraint promo_codes_max_uses_window check (
    max_uses is null or current_uses <= max_uses
  ),
  constraint promo_codes_valid_window check (
    valid_to is null or valid_to > valid_from
  ),
  constraint promo_codes_min_amount_nonneg check (
    min_amount_grosze >= 0
  )
);

create index if not exists promo_codes_code_active_idx
  on public.promo_codes (code)
  where is_active = true;

create index if not exists promo_codes_campaign_idx
  on public.promo_codes (campaign)
  where campaign is not null;

drop trigger if exists promo_codes_touch_updated_at on public.promo_codes;
create trigger promo_codes_touch_updated_at
  before update on public.promo_codes
  for each row execute function public.tg_touch_updated_at();

-- =============================================================================
-- promo_redemptions — log użyć (audit + per-user-limit enforcement)
-- =============================================================================
create table if not exists public.promo_redemptions (
  id uuid primary key default uuid_generate_v4(),
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,

  -- Snapshot kwot (na wypadek zmiany definicji kodu po zastosowaniu)
  original_amount_grosze integer not null,
  discount_grosze integer not null,
  final_amount_grosze integer not null,

  redeemed_at timestamptz not null default now(),

  constraint promo_redemptions_amounts_consistent check (
    original_amount_grosze >= 0
    and discount_grosze >= 0
    and final_amount_grosze >= 0
    and final_amount_grosze = original_amount_grosze - discount_grosze
  )
);

-- Idempotencja: jeden payment może użyć max jednego kodu, jeden kod max raz
-- na payment.
create unique index if not exists promo_redemptions_payment_uniq
  on public.promo_redemptions (payment_id);

create index if not exists promo_redemptions_promo_code_idx
  on public.promo_redemptions (promo_code_id);

create index if not exists promo_redemptions_user_idx
  on public.promo_redemptions (user_id);

-- =============================================================================
-- RLS — promo_codes
-- =============================================================================
alter table public.promo_codes enable row level security;
alter table public.promo_codes force row level security;

-- SELECT: zalogowani użytkownicy widzą tylko aktywne kody w okienku.
-- Walidator po stronie serwera używa service-role (bypass RLS), więc ta
-- polityka jest tylko dla rzadkiego case'u client-side preview.
drop policy if exists promo_codes_select_active on public.promo_codes;
create policy promo_codes_select_active
  on public.promo_codes
  for select
  using (
    is_active = true
    and valid_from <= now()
    and (valid_to is null or valid_to > now())
  );

-- =============================================================================
-- RLS — promo_redemptions
-- =============================================================================
alter table public.promo_redemptions enable row level security;
alter table public.promo_redemptions force row level security;

drop policy if exists promo_redemptions_select_own on public.promo_redemptions;
create policy promo_redemptions_select_own
  on public.promo_redemptions
  for select
  using (user_id = auth.uid());

-- INSERT robi tylko service-role (Stripe webhook). Brak polityki insert =
-- wszystkim użytkownikom zablokowane.

-- =============================================================================
-- Helper function: atomic increment z respektem max_uses
-- =============================================================================
create or replace function public.fn_promo_increment_use(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.promo_codes
     set current_uses = current_uses + 1,
         updated_at = now()
   where code = upper(btrim(p_code))
     and is_active = true
     and valid_from <= now()
     and (valid_to is null or valid_to > now())
     and (max_uses is null or current_uses < max_uses);
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke all on function public.fn_promo_increment_use(text) from public;
grant execute on function public.fn_promo_increment_use(text) to service_role;

comment on table public.promo_codes is
  'Tier 4 / PLAN.md task 160 — definicje kodów rabatowych dla Stripe Checkout.';
comment on table public.promo_redemptions is
  'Tier 4 / PLAN.md task 160 — log użyć kodów (audit + per-user-limit).';
comment on function public.fn_promo_increment_use(text) is
  'Atomowa inkrementacja current_uses; zwraca true jeśli kod jest nadal valid.';
