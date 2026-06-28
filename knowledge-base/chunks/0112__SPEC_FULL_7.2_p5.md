# 7.2#p5 — Definicje tabel (SQL Migrations) (part 5)

_source: SPEC_FULL · tags: backend, database, ocr, notifications, modules, strategy · line 1051 · 3888 chars_

  -- Metadata
  source TEXT,                             -- np. 'Dz.U. 2023 poz. 1610', 'II CSK 123/22'
  source_url TEXT,
  effective_date DATE,                     -- data wejścia w życie / data orzeczenia
  is_active BOOLEAN NOT NULL DEFAULT true, -- false = uchylony przepis

  -- Tags for filtering
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],     -- np. ['epu', 'przedawnienie', 'cesja']
  applicable_case_types case_type[] DEFAULT ARRAY[]::case_type[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX idx_legal_knowledge_embedding ON legal_knowledge
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX idx_legal_knowledge_category ON legal_knowledge(category, subcategory);
CREATE INDEX idx_legal_knowledge_tags ON legal_knowledge USING GIN(tags);
CREATE INDEX idx_legal_knowledge_case_types ON legal_knowledge USING GIN(applicable_case_types);
CREATE INDEX idx_legal_knowledge_active ON legal_knowledge(is_active) WHERE is_active = true;

Migration 011: RLS Policies
-- 20260401000010_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_knowledge ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read/update own profile, admin can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cases: user can CRUD own cases (not deleted)
CREATE POLICY "Users can view own cases" ON cases
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can soft-delete own cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (deleted_at IS NOT NULL);  -- only allow setting deleted_at

-- Documents: user can view/edit own documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create documents for own cases" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM cases WHERE id = case_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Deadlines: read own
CREATE POLICY "Users can view own deadlines" ON deadlines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage deadlines" ON deadlines
  FOR ALL USING (true)  -- service role only (API routes use service role for deadline ops)
  WITH CHECK (true);

-- OCR: read own
CREATE POLICY "Users can view own OCR results" ON ocr_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create OCR for own cases" ON ocr_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: read own
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications: read own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
