-- =============================================================================
-- Długomat — Tier 6 zad. 255/257/262 — idempotency keys + circuit state
-- =============================================================================
-- Tabele wspierające:
--  1) idempotency_records  — Idempotency-Key cache (24 h TTL)
--  2) circuit_breaker_log  — historia stanów circuit breakerów (audyt)
--  3) audit_log_archive    — referencja: retention policy 13 mies. (zad. 262)
-- =============================================================================

-- 1) Idempotency records ------------------------------------------------------
create table if not exists public.idempotency_records (
  id          bigserial primary key,
  scope       text not null,                   -- 'ai-generate', 'stripe-checkout', ...
  key         text not null,                   -- klient-prepared idempotency key
  user_id     uuid references auth.users(id) on delete cascade,
  status      text not null default 'in_progress',  -- 'in_progress' | 'completed'
  result      jsonb,                           -- response body cache
  http_status integer,                         -- response HTTP status
  created_at  timestamptz not null default now(),
  completed_at timestamptz,

  constraint idempotency_status_known check (status in ('in_progress', 'completed')),
  constraint idempotency_scope_key_unique unique (scope, key)
);

create index if not exists idx_idempotency_user
  on public.idempotency_records(user_id, created_at desc)
  where user_id is not null;

create index if not exists idx_idempotency_created_at
  on public.idempotency_records(created_at);

-- RLS: admin-only (service-role). Endpoint korzysta z createSupabaseAdminClient.
alter table public.idempotency_records enable row level security;
alter table public.idempotency_records force row level security;

comment on table public.idempotency_records is
  'Idempotency-Key cache (Tier 6 zad. 255). TTL 24h — cron czyści.';

-- 2) Circuit breaker state log -----------------------------------------------
create table if not exists public.circuit_breaker_log (
  id            bigserial primary key,
  circuit_name  text not null,        -- 'stripe' | 'anthropic' | 'resend' | 'smsapi'
  from_state    text not null,        -- 'closed' | 'open' | 'half-open'
  to_state      text not null,
  failure_count integer not null default 0,
  reason        text,
  recorded_at   timestamptz not null default now(),

  constraint circuit_state_known check (
    from_state in ('closed','open','half-open')
    and to_state in ('closed','open','half-open')
  )
);

create index if not exists idx_circuit_log_recorded
  on public.circuit_breaker_log(circuit_name, recorded_at desc);

alter table public.circuit_breaker_log enable row level security;
alter table public.circuit_breaker_log force row level security;

comment on table public.circuit_breaker_log is
  'Audyt zmian stanu circuit breakerów (Tier 6 zad. 257).';

-- 3) Audit log archive ref (Tier 6 zad. 262) ---------------------------------
-- Dla istniejącej tabeli `audit_log` dodajemy referencję na partycję miesięczną.
-- Nie tworzymy partycji teraz (vendor lock-in z Supabase), ale dokumentujemy.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'audit_log') then
    -- Dodajemy indeks pod retention policy (partition pruning equiv.).
    if not exists (
      select 1 from pg_indexes
      where schemaname = 'public' and indexname = 'idx_audit_log_retention'
    ) then
      create index idx_audit_log_retention
        on public.audit_log(created_at)
        where created_at < (now() - interval '13 months');
    end if;
  end if;
end $$;
