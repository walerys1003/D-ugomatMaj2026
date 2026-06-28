# 7.2#p2 — Definicje tabel (SQL Migrations) (part 2)

_source: SPEC_FULL · tags: database, ai-engine, modules, strategy · line 1051 · 3896 chars_

  -- Metadata (typ-specyficzne dane w JSON)
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT cases_kwota_glowna_positive CHECK (kwota_glowna IS NULL OR kwota_glowna >= 0),
  CONSTRAINT cases_kwota_odsetki_positive CHECK (kwota_odsetki IS NULL OR kwota_odsetki >= 0)
);

-- Metadata schema per case_type (documented, not enforced in DB):
-- sprzeciw_epu: { zarzuty: string[], data_wymagalnosci: date, podstawa_roszczenia: string,
--                 cesja: boolean, cesja_data: date, fundusz_nazwa: string }
-- komornik_*:   { komornik_nazwa: string, komornik_adres: string, komornik_sygnatura: string,
--                 kwota_wolna: decimal, typ_dochodu: string, swiadczenia: string[] }
-- bik_*:        { bank_nazwa: string, numer_umowy: string, data_umowy: date,
--                 kwota_kredytu: decimal, status_bik: string }
-- cesja_*:      { fundusz_nazwa: string, cedent_nazwa: string, data_cesji: date,
--                 umowa_pierwotna: string }
-- ugoda_*:      { wierzyciele: jsonb[], laczna_kwota: decimal, miesieczny_dochod: decimal,
--                 miesieczne_wydatki: decimal, propozycja_rat: integer }
-- upadlosc_*:   { wierzyciele: jsonb[], majatek: jsonb[], przyczyna_niewypłacalnosci: string,
--                 miesieczny_dochod: decimal, osoby_na_utrzymaniu: integer }

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_type ON cases(type);
CREATE INDEX idx_cases_user_status ON cases(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_metadata ON cases USING GIN(metadata);

Migration 004: Documents
-- 20260401000003_documents.sql

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type case_type NOT NULL,
  status document_status NOT NULL DEFAULT 'generating',

  -- Content
  content_markdown TEXT,                   -- treść pisma w Markdown
  content_html TEXT,                       -- renderowany HTML
  pdf_url TEXT,                            -- URL do PDF w Supabase Storage

  -- Version control
  version INTEGER NOT NULL DEFAULT 1,
  is_template BOOLEAN NOT NULL DEFAULT false,  -- true = fallback template

  -- AI metadata
  ai_model_used TEXT,                      -- np. 'claude-sonnet-4.6'
  tokens_input INTEGER,
  tokens_output INTEGER,
  ai_cost_usd DECIMAL(8,6),               -- koszt wywołania AI w USD
  generation_time_ms INTEGER,              -- czas generowania w ms
  validation_score INTEGER CHECK (validation_score BETWEEN 0 AND 100),
  validation_issues JSONB DEFAULT '[]'::jsonb,

  -- Prompt (do debugowania i polepszania promptów)
  prompt_hash TEXT,                        -- hash promptu (bez danych user)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ                   -- dokument wygasa po 30 dniach od paid_at
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_markdown TEXT NOT NULL,
  changed_by event_actor NOT NULL DEFAULT 'user',
  change_summary TEXT,                     -- opis zmian (auto lub user)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_doc_version UNIQUE(document_id, version_number)
);
