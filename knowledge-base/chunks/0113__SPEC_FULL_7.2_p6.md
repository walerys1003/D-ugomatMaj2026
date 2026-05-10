# 7.2#p6 — Definicje tabel (SQL Migrations) (part 6)

_source: SPEC_FULL · tags: database · line 1051 · 750 chars_

-- Case events: read own (through case ownership)
CREATE POLICY "Users can view events for own cases" ON case_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE id = case_id AND user_id = auth.uid())
  );

-- Document versions: read own
CREATE POLICY "Users can view versions of own documents" ON document_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND user_id = auth.uid())
  );

-- Legal knowledge: public read
CREATE POLICY "Anyone can read legal knowledge" ON legal_knowledge
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage legal knowledge" ON legal_knowledge
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
