# 7.2#p4 — Definicje tabel (SQL Migrations) (part 4)

_source: SPEC_FULL · tags: database, ai-engine, ocr, payments, notifications, modules, strategy · line 1051 · 3922 chars_

  -- Product info
  product_type TEXT NOT NULL,              -- np. 'sprzeciw_epu', 'pakiet_komornik'
  product_name TEXT NOT NULL,              -- np. 'Sprzeciw od nakazu zapłaty EPU'
  pricing_tier TEXT,                       -- 'basic', 'standard', 'premium'

  -- Status
  status payment_status NOT NULL DEFAULT 'pending',

  -- Incubator fee tracking
  incubator_fee INTEGER,                   -- opłata inkubatora w groszach
  incubator_model TEXT,                    -- '5_percent' | 'flat_490'

  -- Invoice
  invoice_url TEXT,                        -- URL faktury z Fakturownia
  invoice_number TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb       -- dodatkowe dane (kupon, utm, etc.)
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_product_type ON payments(product_type);

Migration 008: Notifications
-- 20260401000007_notifications.sql

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  deadline_id UUID REFERENCES deadlines(id) ON DELETE SET NULL,

  channel notification_channel NOT NULL,
  template TEXT NOT NULL,                  -- nazwa szablonu
  subject TEXT,                            -- tytuł (email) lub treść (SMS)
  body TEXT,                               -- treść HTML (email)

  recipient TEXT NOT NULL,                 -- email lub numer telefonu

  status notification_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- Tracking
  opened_at TIMESTAMPTZ,                   -- email open tracking
  clicked_at TIMESTAMPTZ,                  -- link click tracking

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_notifications_status ON notifications(status);

Migration 009: Case Events (Audit Log)
-- 20260401000008_case_events.sql

CREATE TABLE case_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  event_type TEXT NOT NULL,                -- np. 'created', 'ocr_completed', 'document_generated',
                                           --     'payment_completed', 'downloaded', 'deadline_set'
  actor event_actor NOT NULL DEFAULT 'system',
  description TEXT,                        -- opis zdarzenia po polsku
  metadata JSONB DEFAULT '{}'::jsonb,      -- dodatkowe dane per event

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_events_case_id ON case_events(case_id);
CREATE INDEX idx_case_events_created_at ON case_events(created_at DESC);
CREATE INDEX idx_case_events_type ON case_events(event_type);

Migration 010: Legal Knowledge (RAG)
-- 20260401000009_legal_knowledge.sql

CREATE TABLE legal_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  category TEXT NOT NULL,                  -- 'przepis', 'orzecznictwo', 'procedura', 'wzor'
  subcategory TEXT NOT NULL,               -- np. 'przedawnienie', 'epu', 'cesja', 'komornik'

  title TEXT NOT NULL,                     -- np. 'Art. 118 KC - terminy przedawnienia'
  content TEXT NOT NULL,                   -- pełna treść (przepis, teza orzeczenia)

  -- RAG embedding
  embedding vector(1536),                  -- OpenAI text-embedding-3-small lub Cohere
