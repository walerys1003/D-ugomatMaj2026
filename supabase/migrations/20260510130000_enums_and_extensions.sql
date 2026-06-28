-- =============================================================================
-- Długomat — Tier 2 / Migration 002 — Extensions, custom types (enums), helpers
-- Source: docs/spec/SPEC_FULL.txt §7.2 (KB chunks 0108–0110)
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";  -- pgvector for RAG embeddings (Tier 3)

-- =============================================================================
-- Enum types (case domain) — wrapped in idempotent guards so re-running is safe
-- =============================================================================
do $$ begin
  create type public.case_type as enum (
    -- D2: Sprzeciw EPU
    'sprzeciw_epu',
    -- D3: KomornikShield (4 pisma)
    'komornik_zwolnienie_konta',
    'komornik_zwolnienie_swiadczen',
    'komornik_skarga',
    'komornik_ograniczenie',
    'komornik_umorzenie',
    'komornik_raty',
    -- D4: PotrąceniaStop
    'potracenia_wniosek_pracodawca',
    'potracenia_wniosek_komornik',
    -- D5: BIK-Fix
    'bik_reklamacja_bank',
    'bik_reklamacja_bik',
    'bik_skarga_uodo',
    -- D6: CesjaCheck
    'cesja_odpowiedz',
    -- D7: UgodoMat
    'ugoda_raty',
    'ugoda_umorzenie',
    'ugoda_propozycja',
    -- D8: Upadłość-Lite
    'upadlosc_wniosek'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.case_status as enum (
    'draft',         -- wizard in progress, not submitted
    'analysis',      -- AI is analyzing / generating
    'generated',     -- pisma ready, awaiting payment
    'paid',          -- payment received, document unlocked
    'downloaded',    -- user downloaded the PDF
    'completed',     -- user marked submitted to the court / authority
    'archived'       -- soft archived
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_status as enum (
    'generating',
    'generated',
    'validated',
    'paid',
    'downloaded',
    'expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending',
    'completed',
    'failed',
    'refunded',
    'expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_channel as enum ('email', 'sms', 'push');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_status as enum (
    'scheduled', 'sent', 'failed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_actor as enum (
    'user', 'system', 'ai', 'payment', 'admin'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('user', 'admin', 'moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.deadline_kind as enum (
    'sprzeciw_14dni',
    'skarga_komornicza_7dni',
    'skarga_uodo_30dni',
    'reklamacja_30dni',
    'odpowiedz_cesja_14dni',
    'wniosek_raty',
    'wniosek_upadlosc',
    'custom'
  );
exception when duplicate_object then null; end $$;

-- =============================================================================
-- Helpers — only the trigger function is added here.
-- (`tg_touch_updated_at` already exists from Migration 001 / profiles.)
-- =============================================================================
create or replace function public.tg_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.tg_touch_updated_at() is
  'Reusable BEFORE UPDATE trigger that bumps updated_at to now(). Tier 2.';
