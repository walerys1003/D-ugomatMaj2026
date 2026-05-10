-- ============================================================================
-- Tier 5 zad. 246 — Affiliate / Referral program scaffold
-- ============================================================================
--
-- Scope (V1):
--   * `referral_codes`     — kod per użytkownik (slug + tracking + status)
--   * `referral_clicks`    — anonimowe klikni\u0119cia (bez PII)
--   * `referral_conversions` — kliknięcie → płatne case (revenue split)
--
-- RLS:
--   * referral_codes      — owner czyta swoje (select_own); insert/update przez
--                           server-side (service_role) — kod przyznaje admin
--                           lub auto-creation hook
--   * referral_clicks     — pełny dostęp tylko service_role; userzy nie widzą
--                           anonimowych klików (RODO).
--   * referral_conversions— owner widzi swoje (select_own); reszta zablokowana.
--
-- Reward model:
--   * Każda konwersja: 15% od `payments.amount_grosze` (konfigurowalne per
--     code → `reward_pct`). Naliczane przy webhooku Stripe (payment.succeeded).
--   * Wypłata: manualna (admin reviewuje listę "due_payouts" i wykonuje
--     przelew). V2 kiedyś — automatyczne payout via Stripe Connect.
--
-- Anty-fraud (basic):
--   * UNIQUE (referrer_user_id, referee_user_id) — nie można polecać 2× tego
--     samego usera.
--   * Self-referral guard: trigger blokuje insert gdy referrer == referee.
--   * `first_seen_at` IP-bucket nie wpisany — robimy server-side rate-limit.
--
-- Endpoint flow:
--   1) GET /r/<code>           → set cookie `dlugomat-ref` (90 dni) + log click
--   2) POST /api/auth/sign-up  → odczytaj cookie → wpisz `referred_by_code`
--                                 do profiles
--   3) Webhook Stripe payment  → jeśli profile.referred_by_code → INSERT do
--                                 referral_conversions (status='pending')
--   4) Admin → ręczna akceptacja → status='approved' → trigger payout
-- ============================================================================

-- ─── 1) Tabela kodów ─────────────────────────────────────────────────────────

create table if not exists public.referral_codes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  code            text not null,
  reward_pct      numeric(5,2) not null default 15.00
                    check (reward_pct >= 0 and reward_pct <= 50),
  is_active       boolean not null default true,
  -- Liczniki cache'owane (denormalizacja dla szybkiego dashboardu).
  -- Aktualizowane triggerami przy insercie do clicks/conversions.
  total_clicks    integer not null default 0,
  total_signups   integer not null default 0,
  total_revenue_grosze bigint not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Każdy user ma maks. 1 aktywny kod. (Kod może być rotowany — historyczne
-- zostają jako is_active=false dla audytu.)
create unique index if not exists uq_referral_codes_user_active
  on public.referral_codes (user_id) where is_active = true;

-- Code musi być globalnie unikalny (URL slug).
create unique index if not exists uq_referral_codes_code
  on public.referral_codes (lower(code));

-- Walidacja formatu kodu: 6–24 znaków, alfanumeryczne + dash/underscore.
alter table public.referral_codes
  add constraint referral_codes_code_format
  check (code ~ '^[a-zA-Z0-9_-]{6,24}$');

-- ─── 2) Tabela kliknięć (anonimowe) ──────────────────────────────────────────

create table if not exists public.referral_clicks (
  id              uuid primary key default gen_random_uuid(),
  code            text not null,
  -- Hash IP (sha256 z salt env) — nie trzymamy plain IP (RODO).
  ip_hash         text,
  -- User-agent capping na 200 znaków (nie loggujemy fingerprintu).
  ua              text,
  -- Page where click landed (np. /skaner-nakazu)
  landing_path    text,
  -- UTM (opcjonalnie, gdy partner użył pełnego URL z ?utm_*)
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  -- Referrer header z przeglądarki — bez query stringa (chronimy PII).
  http_referrer   text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_referral_clicks_code_created
  on public.referral_clicks (code, created_at desc);

-- ─── 3) Tabela konwersji ─────────────────────────────────────────────────────

-- Konwersja = referee zapłacił za case → liczymy revenue share.
create table if not exists public.referral_conversions (
  id                  uuid primary key default gen_random_uuid(),
  referrer_user_id    uuid not null references auth.users(id) on delete cascade,
  referee_user_id     uuid not null references auth.users(id) on delete cascade,
  code                text not null,
  payment_id          uuid references public.payments(id) on delete set null,
  case_id             uuid references public.cases(id) on delete set null,
  -- Snapshot: ile referee zapłacił, ile reward_pct było aktywne, ile groszy
  -- należy się polecającemu. Snapshot, bo reward_pct może się zmieniać.
  amount_grosze       bigint not null check (amount_grosze >= 0),
  reward_pct          numeric(5,2) not null check (reward_pct >= 0),
  reward_grosze       bigint not null check (reward_grosze >= 0),
  status              text not null default 'pending'
                        check (status in ('pending', 'approved', 'paid', 'rejected')),
  rejection_reason    text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Idempotencja: jedna konwersja per (referrer, referee, payment).
create unique index if not exists uq_referral_conv_payment
  on public.referral_conversions (referrer_user_id, referee_user_id, payment_id)
  where payment_id is not null;

-- Anti-self-referral guard.
create or replace function public.fn_check_no_self_referral()
returns trigger
language plpgsql
as $$
begin
  if new.referrer_user_id = new.referee_user_id then
    raise exception 'Self-referral nie jest dozwolony.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_no_self_referral on public.referral_conversions;
create trigger trg_check_no_self_referral
  before insert or update on public.referral_conversions
  for each row execute function public.fn_check_no_self_referral();

-- ─── 4) Trigger: aktualizuj liczniki w referral_codes ────────────────────────

create or replace function public.fn_referral_code_inc_click()
returns trigger
language plpgsql
as $$
begin
  update public.referral_codes
     set total_clicks = total_clicks + 1
   where lower(code) = lower(new.code) and is_active = true;
  return new;
end;
$$;

drop trigger if exists trg_referral_code_inc_click on public.referral_clicks;
create trigger trg_referral_code_inc_click
  after insert on public.referral_clicks
  for each row execute function public.fn_referral_code_inc_click();

create or replace function public.fn_referral_code_inc_conversion()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('approved', 'paid') and
     (old is null or old.status not in ('approved', 'paid')) then
    update public.referral_codes
       set total_signups = total_signups + 1,
           total_revenue_grosze = total_revenue_grosze + new.reward_grosze
     where lower(code) = lower(new.code) and is_active = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_referral_code_inc_conv on public.referral_conversions;
create trigger trg_referral_code_inc_conv
  after insert or update of status on public.referral_conversions
  for each row execute function public.fn_referral_code_inc_conversion();

-- ─── 5) Auto-update updated_at ───────────────────────────────────────────────

create or replace function public.fn_referral_touch_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_referral_codes_touch on public.referral_codes;
create trigger trg_referral_codes_touch
  before update on public.referral_codes
  for each row execute function public.fn_referral_touch_updated();

drop trigger if exists trg_referral_conv_touch on public.referral_conversions;
create trigger trg_referral_conv_touch
  before update on public.referral_conversions
  for each row execute function public.fn_referral_touch_updated();

-- ─── 6) RLS ──────────────────────────────────────────────────────────────────

alter table public.referral_codes enable row level security;
alter table public.referral_codes force row level security;

alter table public.referral_clicks enable row level security;
alter table public.referral_clicks force row level security;

alter table public.referral_conversions enable row level security;
alter table public.referral_conversions force row level security;

-- referral_codes: select_own + admin all
drop policy if exists "referral_codes_select_own" on public.referral_codes;
create policy "referral_codes_select_own"
  on public.referral_codes for select
  using (auth.uid() = user_id);

drop policy if exists "referral_codes_service_all" on public.referral_codes;
create policy "referral_codes_service_all"
  on public.referral_codes for all
  to service_role
  using (true) with check (true);

-- referral_clicks: tylko service_role (anonimowe → prywatność).
drop policy if exists "referral_clicks_service_all" on public.referral_clicks;
create policy "referral_clicks_service_all"
  on public.referral_clicks for all
  to service_role
  using (true) with check (true);

-- referral_conversions: select_own (jako referrer), reszta service_role.
drop policy if exists "referral_conv_select_own" on public.referral_conversions;
create policy "referral_conv_select_own"
  on public.referral_conversions for select
  using (auth.uid() = referrer_user_id);

drop policy if exists "referral_conv_service_all" on public.referral_conversions;
create policy "referral_conv_service_all"
  on public.referral_conversions for all
  to service_role
  using (true) with check (true);

-- ─── 7) Profile extension: referred_by_code ──────────────────────────────────
--
-- Dodajemy referred_by_code do profiles, żeby wiedzieć kto kogo polecił —
-- ustawiane przy sign-up gdy cookie 'dlugomat-ref' obecny.

alter table public.profiles
  add column if not exists referred_by_code text;

-- Bez foreign key (kod może być wycofany, ale historia zostaje).
create index if not exists idx_profiles_referred_by_code
  on public.profiles (referred_by_code) where referred_by_code is not null;

-- ─── 8) Dokumentacja ─────────────────────────────────────────────────────────

comment on table public.referral_codes is
  'Tier 5 zad. 246 — kody polecające (1 aktywny per user, reward_pct 0–50%).';

comment on table public.referral_clicks is
  'Anonimowe kliknięcia w linki polecające (IP zhashowane, RODO-safe).';

comment on table public.referral_conversions is
  'Płatne konwersje przyniesione przez polecenie. Workflow: pending → approved → paid.';

comment on column public.profiles.referred_by_code is
  'Kod referrera ustawiony przy sign-up (jeśli cookie dlugomat-ref było obecne).';
