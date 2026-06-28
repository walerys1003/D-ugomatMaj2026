# 7.2#p3 — Definicje tabel (SQL Migrations) (part 3)

_source: SPEC_FULL · tags: database, ai-engine, ocr, payments, notifications, modules, strategy · line 1051 · 3920 chars_

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_doc_versions_doc_id ON document_versions(document_id);

Migration 005: Deadlines
-- 20260401000005_deadlines.sql

CREATE TABLE deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL,                      -- np. 'sprzeciw_14dni', 'skarga_7dni'
  description TEXT NOT NULL,               -- np. 'Termin na złożenie sprzeciwu'

  start_date DATE NOT NULL,                -- data doręczenia
  deadline_date DATE NOT NULL,             -- obliczona data terminu

  -- Notification tracking
  notif_d7_sent BOOLEAN NOT NULL DEFAULT false,
  notif_d5_sent BOOLEAN NOT NULL DEFAULT false,
  notif_d3_sent BOOLEAN NOT NULL DEFAULT false,
  notif_d1_sent BOOLEAN NOT NULL DEFAULT false,
  notif_d0_morning_sent BOOLEAN NOT NULL DEFAULT false,
  notif_d0_evening_sent BOOLEAN NOT NULL DEFAULT false,

  is_completed BOOLEAN NOT NULL DEFAULT false,  -- user potwierdził złożenie pisma
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT deadline_after_start CHECK (deadline_date >= start_date)
);

CREATE INDEX idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX idx_deadlines_deadline_date ON deadlines(deadline_date)
  WHERE is_completed = false;
CREATE INDEX idx_deadlines_upcoming ON deadlines(deadline_date, user_id)
  WHERE is_completed = false AND deadline_date >= CURRENT_DATE;

Migration 006: OCR Results
-- 20260401000006_ocr.sql

CREATE TABLE ocr_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- File info
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,                  -- Supabase Storage URL
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- OCR output
  raw_text TEXT,                           -- pełny rozpoznany tekst
  extracted_data JSONB DEFAULT '{}'::jsonb, -- sparsowane pola
  confidence DECIMAL(5,2),                 -- 0.00 - 100.00

  -- Provider info
  provider TEXT NOT NULL DEFAULT 'tesseract',  -- 'tesseract' | 'textract'
  processing_time_ms INTEGER,

  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- extracted_data schema:
-- {
--   "sygnatura": "VI Nc-e 1234567/25",
--   "sad": "Sąd Rejonowy Lublin-Zachód w Lublinie",
--   "data_wydania": "2025-12-15",
--   "powod": { "nazwa": "Fundusz XYZ", "adres": "..." },
--   "pozwany": { "nazwa": "Jan Kowalski", "adres": "..." },
--   "kwota_glowna": 5432.10,
--   "kwota_odsetki": 1234.56,
--   "kwota_koszty": 30.00,
--   "podstawa_prawna": "umowa pożyczki z dnia...",
--   "detected_issues": ["possible_przedawnienie", "cesja_detected"]
-- }

CREATE INDEX idx_ocr_case_id ON ocr_results(case_id);
CREATE INDEX idx_ocr_status ON ocr_results(status);

Migration 007: Payments
-- 20260401000004_payments.sql

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

  -- Stripe
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Amounts
  amount INTEGER NOT NULL,                 -- kwota w groszach (np. 15900 = 159.00 PLN)
  currency TEXT NOT NULL DEFAULT 'pln',
