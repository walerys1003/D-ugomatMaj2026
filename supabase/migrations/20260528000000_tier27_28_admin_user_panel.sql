-- Tier 27-28: Admin dashboard + User settings tables.

-- 1) profiles — uzupełnienie kolumn dla profilu użytkownika
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'pl' CHECK (locale IN ('pl','en','uk','cs','ro')),
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 2) notification_preferences — kanały i częstotliwości per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_deadlines BOOLEAN DEFAULT TRUE,
  email_case_updates BOOLEAN DEFAULT TRUE,
  email_payments BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  sms_deadlines BOOLEAN DEFAULT FALSE,
  sms_critical BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  push_quiet_start TEXT DEFAULT '22:00',
  push_quiet_end TEXT DEFAULT '07:00',
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('off','daily','weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS np_select_own ON notification_preferences;
CREATE POLICY np_select_own ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS np_upsert_own ON notification_preferences;
CREATE POLICY np_upsert_own ON notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) incidents — tabela dla dashboardu admina (alerty operacyjne)
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor','major','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','closed')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_opened_at ON incidents(opened_at DESC);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS incidents_admin_all ON incidents;
CREATE POLICY incidents_admin_all ON incidents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );
