-- Tier 32-33-34 — Infrastructure, drips, A/B activation, status history, GDPR v2.
--
-- Tabele dodawane:
--   webhook_nonces             (T32-3 replay protection)
--   rum_samples                (T32-2 Web Vitals telemetry)
--   email_queue                (T33-1 drip queue, jeśli nie istnieje)
--   email_sends                (T33-1 idempotency)
--   ai_prompts                 (T33-4 prompt registry, jeśli nie istnieje)
--   ai_prompt_versions         (T33-4 versioning)
--   ai_invocations             (T34-5 GDPR export source)
--   rate_limit_window          (T34-3 live RPM tracker)
--   rate_limit_endpoint_stats_24h (view, T34-3)
--   plan_quota_usage_view      (view, T34-3)
--   blocked_ips                (T34-3 fail2ban)
--   status_incidents           (T34-4 public history)
--   status_uptime_daily        (T34-4 90d uptime)
--   gdpr_export_jobs           (T34-5 async export)
--
-- RLS: tabele user-facing (gdpr_export_jobs) mają policy "own rows".
-- Tabele admin-facing/observability (rum_samples, rate_limit_*, blocked_ips,
-- status_*) — service_role only.

-- =============================================================
-- TIER 32-3 — Webhook replay protection
-- =============================================================
CREATE TABLE IF NOT EXISTS webhook_nonces (
  id BIGSERIAL PRIMARY KEY,
  nonce TEXT NOT NULL,
  source TEXT NOT NULL,                       -- stripe / postmark / custom
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (source, nonce)
);
CREATE INDEX IF NOT EXISTS idx_webhook_nonces_expires_at ON webhook_nonces (expires_at);

-- Auto-cleanup expired nonces (cron oczyszcza co 1h)
CREATE OR REPLACE FUNCTION purge_expired_webhook_nonces() RETURNS INT AS $$
DECLARE deleted INT;
BEGIN
  DELETE FROM webhook_nonces WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- TIER 32-2 — RUM (Real User Monitoring) samples
-- =============================================================
CREATE TABLE IF NOT EXISTS rum_samples (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NULL,
  metric_name TEXT NOT NULL,                  -- LCP / FID / CLS / INP / FCP / TTFB
  value DOUBLE PRECISION NOT NULL,
  rating TEXT NOT NULL,                       -- good / needs-improvement / poor
  page_path TEXT NOT NULL,
  navigation_type TEXT NULL,
  connection_type TEXT NULL,
  user_agent TEXT NULL,
  country TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rum_samples_metric_created ON rum_samples (metric_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rum_samples_page ON rum_samples (page_path, created_at DESC);

-- =============================================================
-- TIER 33-1 — Email drips queue + sends ledger
-- =============================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',     -- pending / sending / sent / failed
  priority SMALLINT NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts SMALLINT NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_queue_status_sched ON email_queue (status, scheduled_at);

CREATE TABLE IF NOT EXISTS email_sends (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_message_id TEXT NULL,
  UNIQUE (user_id, template_key, sent_at)
);
CREATE INDEX IF NOT EXISTS idx_email_sends_user_template ON email_sends (user_id, template_key);

-- =============================================================
-- TIER 33-4 — AI Prompts versioning
-- =============================================================
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  version TEXT NOT NULL,                      -- semver
  status TEXT NOT NULL DEFAULT 'draft',       -- draft / staged / production / deprecated
  body TEXT NOT NULL,
  commit_message TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  promoted_at TIMESTAMPTZ NULL,
  promoted_by TEXT NULL,
  metrics JSONB NULL,                         -- {avg_latency_ms, avg_quality_score, error_rate, invocations_24h}
  UNIQUE (prompt_id, version)
);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_versions_prompt ON ai_prompt_versions (prompt_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_versions_status ON ai_prompt_versions (prompt_id, status);

-- Tylko 1 wersja `production` per prompt (warunkowy unique)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_prompt_one_production
  ON ai_prompt_versions (prompt_id) WHERE status = 'production';

-- =============================================================
-- TIER 34-5 — AI invocations log (GDPR export source)
-- =============================================================
CREATE TABLE IF NOT EXISTS ai_invocations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_key TEXT NULL,
  input_redacted TEXT NULL,                   -- z PII redaction
  output_redacted TEXT NULL,
  latency_ms INT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  cost_usd NUMERIC(10,5) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_invocations_user_created ON ai_invocations (user_id, created_at DESC);

-- =============================================================
-- TIER 34-3 — Rate limits + quota
-- =============================================================
CREATE TABLE IF NOT EXISTS rate_limit_window (
  id BIGSERIAL PRIMARY KEY,
  identity TEXT NOT NULL,
  identity_kind TEXT NOT NULL,                -- user_id / api_key / ip
  rpm INT NOT NULL DEFAULT 0,
  rpm_limit INT NOT NULL,
  plan TEXT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (identity, identity_kind, window_started_at)
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_rpm ON rate_limit_window (rpm DESC);

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  identity TEXT NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms INT NULL,
  status_code INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_endpoint_created ON rate_limit_log (endpoint, created_at DESC);

CREATE OR REPLACE VIEW rate_limit_endpoint_stats_24h AS
SELECT
  endpoint,
  COUNT(*) AS hits_24h,
  COUNT(*) FILTER (WHERE blocked = TRUE) AS blocked_24h,
  COALESCE(
    (PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms))::INT,
    0
  ) AS p95_latency_ms
FROM rate_limit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint;

CREATE OR REPLACE VIEW plan_quota_usage_view AS
SELECT
  plan,
  COUNT(*) AS active_subs,
  COALESCE(AVG(usage_pct), 0)::FLOAT AS avg_usage_pct,
  COUNT(*) FILTER (WHERE usage_pct > 100) AS over_quota_count
FROM (
  SELECT
    s.plan,
    s.user_id,
    LEAST(
      100.0 * COALESCE((SELECT COUNT(*) FROM cases c
                        WHERE c.user_id = s.user_id
                          AND c.created_at >= s.period_start), 0)
        / NULLIF(s.quota_per_period, 0),
      999
    ) AS usage_pct
  FROM subscriptions s
  WHERE s.status = 'active'
) sub
GROUP BY plan;

CREATE TABLE IF NOT EXISTS blocked_ips (
  ip INET PRIMARY KEY,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  hits_count INT NOT NULL DEFAULT 0,
  blocked_by TEXT NULL                        -- 'auto' / admin email
);

-- =============================================================
-- TIER 34-4 — Public status: incidents + daily uptime
-- =============================================================
CREATE TABLE IF NOT EXISTS status_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity TEXT NOT NULL,                     -- sev1 / sev2 / sev3 / sev4
  status TEXT NOT NULL DEFAULT 'investigating', -- investigating / identified / monitoring / resolved
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL,
  affected_components TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  summary TEXT NULL,
  postmortem_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_status_incidents_started_at ON status_incidents (started_at DESC);

CREATE TABLE IF NOT EXISTS status_uptime_daily (
  id BIGSERIAL PRIMARY KEY,
  component TEXT NOT NULL,                    -- web / api / database / ai / storage
  day DATE NOT NULL,
  uptime_pct NUMERIC(7,4) NOT NULL,
  downtime_minutes INT NOT NULL DEFAULT 0,
  UNIQUE (component, day)
);
CREATE INDEX IF NOT EXISTS idx_status_uptime_day ON status_uptime_daily (day DESC);

-- =============================================================
-- TIER 34-5 — GDPR export v2 jobs
-- =============================================================
CREATE TABLE IF NOT EXISTS gdpr_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',      -- queued / running / completed / failed
  schema_version TEXT NOT NULL DEFAULT '2.0.0',
  file_path TEXT NULL,                        -- storage key w bucketcie `gdpr-exports`
  file_bytes BIGINT NULL,
  manifest_signature TEXT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  error_message TEXT NULL
);
CREATE INDEX IF NOT EXISTS idx_gdpr_export_user_completed ON gdpr_export_jobs (user_id, completed_at DESC);

ALTER TABLE gdpr_export_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gdpr_export_jobs_own ON gdpr_export_jobs;
CREATE POLICY gdpr_export_jobs_own ON gdpr_export_jobs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS gdpr_export_jobs_own_insert ON gdpr_export_jobs;
CREATE POLICY gdpr_export_jobs_own_insert ON gdpr_export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- TIER 33-3 — Experiments table (jeśli nie istnieje)
-- =============================================================
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  hypothesis TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  layer TEXT NULL,
  traffic_percent INT NOT NULL DEFAULT 100,
  variants JSONB NOT NULL,
  control_variant TEXT NOT NULL,
  goal_event TEXT NOT NULL,
  guardrail_events TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  min_sample_size INT NOT NULL DEFAULT 500,
  mde_percent NUMERIC NOT NULL DEFAULT 5,
  description TEXT NULL,
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Done. Migration 20260530000000.
-- =============================================================
