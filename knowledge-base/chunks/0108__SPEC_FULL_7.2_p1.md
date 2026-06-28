# 7.2#p1 — Definicje tabel (SQL Migrations) (part 1)

_source: SPEC_FULL · tags: database, ai-engine, notifications, modules, security, strategy · line 1051 · 3910 chars_

Migration 001: Core tables
-- 20260401000000_init.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector for RAG embeddings

-- Custom types
CREATE TYPE case_type AS ENUM (
  'sprzeciw_epu',
  'komornik_zwolnienie_konta',
  'komornik_zwolnienie_swiadczen',
  'komornik_skarga',
  'komornik_ograniczenie',
  'komornik_umorzenie',
  'komornik_raty',
  'bik_reklamacja_bank',
  'bik_reklamacja_bik',
  'bik_skarga_uodo',
  'cesja_odpowiedz',
  'ugoda_raty',
  'ugoda_umorzenie',
  'ugoda_propozycja',
  'upadlosc_wniosek',
  'potracenia_wniosek_pracodawca',
  'potracenia_wniosek_komornik'
);

CREATE TYPE case_status AS ENUM (
  'draft',
  'analysis',
  'generated',
  'paid',
  'downloaded',
  'completed',
  'archived'
);

CREATE TYPE document_status AS ENUM (
  'generating',
  'generated',
  'validated',
  'paid',
  'downloaded',
  'expired'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'expired'
);

CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'push'
);

CREATE TYPE notification_status AS ENUM (
  'scheduled',
  'sent',
  'failed',
  'cancelled'
);

CREATE TYPE event_actor AS ENUM (
  'user',
  'system',
  'ai',
  'payment',
  'admin'
);

CREATE TYPE user_role AS ENUM (
  'user',
  'admin',
  'moderator'
);

Migration 002: Profiles
-- 20260401000001_profiles.sql

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  settings JSONB NOT NULL DEFAULT '{
    "notifications": {
      "email": true,
      "sms": false,
      "deadline_reminders": true,
      "marketing": false
    },
    "display": {
      "theme": "light",
      "language": "pl"
    }
  }'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

Migration 003: Cases
-- 20260401000002_cases.sql

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type case_type NOT NULL,
  status case_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL DEFAULT '',

  -- Dane wspólne sprawy
  sygnatura TEXT,                          -- np. "VI Nc-e 1234567/25"
  sad TEXT,                                -- nazwa sądu
  data_nakazu DATE,                        -- data wydania nakazu/pisma
  data_doreczenia DATE,                    -- data doręczenia

  -- Strony
  powod_nazwa TEXT,                        -- powód / wierzyciel
  powod_adres TEXT,
  pozwany_nazwa TEXT,                      -- pozwany / dłużnik
  pozwany_adres TEXT,
  pozwany_pesel TEXT,                      -- szyfrowane (pgcrypto)

  -- Kwoty
  kwota_glowna DECIMAL(12,2),
  kwota_odsetki DECIMAL(12,2),
  kwota_koszty DECIMAL(12,2),
  kwota_razem DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(kwota_glowna, 0) + COALESCE(kwota_odsetki, 0) + COALESCE(kwota_koszty, 0)
  ) STORED,
