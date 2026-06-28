-- =============================================================================
-- Długomat — Audyt 2026-06-27 — REALNY BUG: kolizja schematu `subscriptions`
-- =============================================================================
-- WYKRYTO podczas usuwania `as any` (Audyt #6) w lib/billing/subscriptions.ts:
--   Istnieją DWIE migracje `create table if not exists public.subscriptions`
--   o NIEZGODNYCH schematach:
--     • 20260513100000 (Tier 8):  plan_id ('free','starter','pro','family',
--         'company'), cycle ('monthly','annual'), tenant_id, status text;
--         + subscription_usage + fn_increment_subscription_usage
--     • 20260522000000 (Tier 19): plan_code ('free','lite','pro','business',
--         'enterprise'), org_id, paused_at/until, past_due_retries,
--         pending_plan_change, pending_effective_at, metadata; status CHECK
--
--   `if not exists` → wygrywa Tier 8 (wcześniejsza). Ale KOD jest podzielony:
--     - lib/billing/*            → schemat Tier 8 (plan_id/cycle/tenant_id)
--     - lib/payments/subscription/* + panel/.../platnosci → schemat Tier 19
--       (plan_code/org_id/paused_*). Te zapytania PADAŁYBY na żywej bazie.
--   Rzutowania `as any` maskowały tę rozbieżność.
--
-- DECYZJA: zamiast wybierać jeden schemat i psuć drugą połowę kodu, tworzymy
-- IDEMPOTENTNY SUPERSET — tabela ma kolumny OBU schematów (ADD COLUMN IF NOT
-- EXISTS). Dzięki temu oba ścieżki kodu działają bez utraty danych. Docelowa
-- konsolidacja (jeden model planów: plan_id↔plan_code mapping) to osobny PR
-- z decyzją produktową — patrz docs/audit/wdrozenie.
-- =============================================================================

-- 0) Tabela musi istnieć (gdyby żadna create-table nie zadziałała).
create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  status      text not null,
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 1) Kolumny Tier 8 ---------------------------------------------------------
alter table public.subscriptions add column if not exists plan_id     text;
alter table public.subscriptions add column if not exists cycle       text;
alter table public.subscriptions add column if not exists tenant_id   uuid;

-- 2) Kolumny Tier 19 --------------------------------------------------------
alter table public.subscriptions add column if not exists plan_code            text;
alter table public.subscriptions add column if not exists org_id               uuid;
alter table public.subscriptions add column if not exists trial_end            timestamptz;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.subscriptions add column if not exists paused_at            timestamptz;
alter table public.subscriptions add column if not exists paused_until         timestamptz;
alter table public.subscriptions add column if not exists past_due_retries     integer not null default 0;
alter table public.subscriptions add column if not exists pending_plan_change  text;
alter table public.subscriptions add column if not exists pending_effective_at timestamptz;
alter table public.subscriptions add column if not exists metadata             jsonb not null default '{}'::jsonb;
alter table public.subscriptions add column if not exists stripe_customer_id   text;
alter table public.subscriptions add column if not exists stripe_subscription_id text;

-- 3) Spójność plan_id <-> plan_code (best-effort mapping, gdy jedno NULL).
--    Mapowanie planów: starter↔lite, family/company↔business (przybliżone).
do $$
begin
  -- plan_code z plan_id
  update public.subscriptions
     set plan_code = case plan_id
       when 'free'    then 'free'
       when 'starter' then 'lite'
       when 'pro'     then 'pro'
       when 'family'  then 'business'
       when 'company' then 'business'
       else plan_code
     end
   where plan_code is null and plan_id is not null;

  -- plan_id z plan_code
  update public.subscriptions
     set plan_id = case plan_code
       when 'free'       then 'free'
       when 'lite'       then 'starter'
       when 'pro'        then 'pro'
       when 'business'   then 'company'
       when 'enterprise' then 'company'
       else plan_id
     end
   where plan_id is null and plan_code is not null;
end $$;

-- 4) Indeksy z obu wersji (idempotentne).
create index if not exists idx_subscriptions_user        on public.subscriptions(user_id, status);
create index if not exists idx_subscriptions_period_end  on public.subscriptions(current_period_end);

-- 5) RLS (idempotentne) — właściciel widzi swoje.
alter table public.subscriptions enable row level security;
drop policy if exists sub_own on public.subscriptions;
create policy sub_own on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

comment on table public.subscriptions is
  'Subskrypcje. SUPERSET schematu Tier 8 (plan_id/cycle/tenant_id) + Tier 19 '
  '(plan_code/org_id/paused_*). Audyt 2026-06-27 — naprawa kolizji dwóch '
  'migracji create-table-if-not-exists. Docelowa konsolidacja planów = osobny PR.';
