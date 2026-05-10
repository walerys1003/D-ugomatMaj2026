-- Tier 7 supporting tables (zad. 327, 329, 330, 334, 339-342, 346)
-- Push subscriptions, lawyer shares, generation jobs, evidence uploads,
-- case events, knowledge articles, template variants.

-- ============================================================================
-- push_subscriptions — PWA push notifications (zad. 341)
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  failed_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS push_subs_owner_select ON push_subscriptions;
CREATE POLICY push_subs_owner_select ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS push_subs_owner_modify ON push_subscriptions;
CREATE POLICY push_subs_owner_modify ON push_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- lawyer_share_tokens — share-with-lawyer RBAC (zad. 346)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lawyer_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  scopes TEXT[] NOT NULL,
  lawyer_email TEXT,
  lawyer_name TEXT,
  allow_download BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  used_count INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lawyer_share_scopes_chk CHECK (
    scopes <@ ARRAY['case_summary','documents_read','documents_comment','full_read']::TEXT[]
  )
);
CREATE INDEX IF NOT EXISTS idx_lawyer_share_user ON lawyer_share_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_share_case ON lawyer_share_tokens (case_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_share_active ON lawyer_share_tokens (token_hash) WHERE revoked_at IS NULL;

ALTER TABLE lawyer_share_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lawyer_share_owner ON lawyer_share_tokens;
CREATE POLICY lawyer_share_owner ON lawyer_share_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- generation_jobs — async generation queue (zad. 339, 340)
-- ============================================================================
CREATE TABLE IF NOT EXISTS generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('generation','revision','polish','summary','ocr')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical','high','normal','low')),
  priority_rank INT NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','cancelled')),
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  result JSONB,
  error TEXT,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  worker_id TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_queue ON generation_jobs (status, priority_rank DESC, scheduled_at)
  WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_gen_jobs_user ON generation_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_case ON generation_jobs (case_id, created_at DESC);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gen_jobs_owner_select ON generation_jobs;
CREATE POLICY gen_jobs_owner_select ON generation_jobs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS gen_jobs_owner_insert ON generation_jobs;
CREATE POLICY gen_jobs_owner_insert ON generation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS gen_jobs_owner_update ON generation_jobs;
CREATE POLICY gen_jobs_owner_update ON generation_jobs FOR UPDATE USING (auth.uid() = user_id);

-- RPC: claim next job using SKIP LOCKED
CREATE OR REPLACE FUNCTION claim_next_generation_job(p_worker_id TEXT)
RETURNS SETOF generation_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed generation_jobs;
BEGIN
  WITH next_job AS (
    SELECT id FROM generation_jobs
    WHERE status = 'queued'
      AND scheduled_at <= NOW()
    ORDER BY priority_rank DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  UPDATE generation_jobs g
  SET status = 'running',
      started_at = NOW(),
      worker_id = p_worker_id,
      attempts = attempts + 1
  FROM next_job
  WHERE g.id = next_job.id
  RETURNING g.* INTO claimed;

  IF claimed.id IS NOT NULL THEN
    RETURN NEXT claimed;
  END IF;
  RETURN;
END;
$$;

-- ============================================================================
-- evidence_uploads — links between cases and uploaded evidence (zad. 329)
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL,           -- matches Evidence Request `id` (e.g. "umowa_zrodlowa")
  storage_path TEXT,                    -- path in storage bucket
  filename TEXT,
  file_size_bytes INT,
  mime_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, evidence_id)
);
CREATE INDEX IF NOT EXISTS idx_evidence_uploads_case ON evidence_uploads (case_id);

ALTER TABLE evidence_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS evidence_uploads_owner ON evidence_uploads;
CREATE POLICY evidence_uploads_owner ON evidence_uploads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- case_events — free-form chronological events (hearings, rulings, notes) — zad. 330
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                  -- timeline kind
  occurred_at TIMESTAMPTZ NOT NULL,
  title TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_case_events_case ON case_events (case_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_events_user ON case_events (user_id, occurred_at DESC);

ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS case_events_owner ON case_events;
CREATE POLICY case_events_owner ON case_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- knowledge_articles — for Q&A panel (zad. 334)
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_articles (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  embedding VECTOR(1536),               -- pgvector; optional
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_published ON knowledge_articles (published) WHERE published;

-- ============================================================================
-- template_variants — embedding-based template selection (zad. 314)
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  description TEXT,
  body_markdown TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  embedding VECTOR(1536),
  popularity INT NOT NULL DEFAULT 0,
  win_rate NUMERIC(3,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_template_variants_type ON template_variants (case_type) WHERE active;

-- ============================================================================
-- Note: VECTOR extension is optional. Wrap in conditional to avoid failure if missing.
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    -- Try to create; ignore if not available
    BEGIN
      CREATE EXTENSION IF NOT EXISTS vector;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'pgvector not available — embedding columns will not be usable until extension is installed.';
    END;
  END IF;
END $$;
