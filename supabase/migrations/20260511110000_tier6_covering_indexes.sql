-- Tier 6 zad. 267 — Covering indexes for hot-path queries.
--
-- Cel: zmniejszyć latency p95 dla:
--   - "list my cases" (/app/sprawy)
--   - "load case detail" (/app/sprawy/[id])
--   - "list ai_generation_runs for case"
--   - "audit log by user/timeframe" (/admin/audit)
--
-- Strategia: INCLUDE (covering) indexes — pozwalają na index-only scans
-- (PostgreSQL Visibility Map), bez random I/O na heap.

-- ----------------------------------------------------------------------
-- cases: user list page
-- ----------------------------------------------------------------------
-- Query: SELECT id,title,type,status,updated_at FROM cases
--        WHERE user_id=? AND deleted_at IS NULL
--        ORDER BY updated_at DESC LIMIT 50;
CREATE INDEX IF NOT EXISTS idx_cases_user_active_covering
  ON public.cases (user_id, updated_at DESC)
  INCLUDE (id, title, type, status)
  WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------
-- ai_generation_runs: case detail page
-- ----------------------------------------------------------------------
-- Query: SELECT id,status,model_id,created_at,cost_pln
--        FROM ai_generation_runs WHERE case_id=? ORDER BY created_at DESC;
CREATE INDEX IF NOT EXISTS idx_ai_runs_case_covering
  ON public.ai_generation_runs (case_id, created_at DESC)
  INCLUDE (id, status, model_id, cost_pln);

-- ----------------------------------------------------------------------
-- audit_log: admin search
-- ----------------------------------------------------------------------
-- Query: SELECT id,event_type,actor_id,created_at
--        FROM audit_log WHERE created_at >= now()-interval '30 days'
--        ORDER BY created_at DESC LIMIT 200;
CREATE INDEX IF NOT EXISTS idx_audit_log_recent_covering
  ON public.audit_log (created_at DESC)
  INCLUDE (id, event_type, actor_id)
  WHERE created_at >= (now() - interval '90 days');

-- ----------------------------------------------------------------------
-- notifications: DLQ admin viewer
-- ----------------------------------------------------------------------
-- Query: SELECT id,channel,status,attempts,last_error,created_at
--        FROM notifications WHERE status IN ('dead_letter','failed')
--        ORDER BY created_at DESC LIMIT 100;
CREATE INDEX IF NOT EXISTS idx_notifications_dlq_covering
  ON public.notifications (status, created_at DESC)
  INCLUDE (id, channel, attempts, last_error)
  WHERE status IN ('dead_letter', 'failed');

-- ----------------------------------------------------------------------
-- idempotency_records: lookup hot path (scope+key)
-- ----------------------------------------------------------------------
-- Już mamy UNIQUE(scope, key) z poprzedniej migracji — sprawdźmy INCLUDE
-- dla result/http_status żeby uniknąć heap fetch.
CREATE INDEX IF NOT EXISTS idx_idempotency_lookup_covering
  ON public.idempotency_records (scope, key)
  INCLUDE (status, result, http_status, created_at);

-- ----------------------------------------------------------------------
-- Maintenance: ANALYZE wszystkich tabel po stworzeniu indexów.
-- ----------------------------------------------------------------------
ANALYZE public.cases;
ANALYZE public.ai_generation_runs;
ANALYZE public.audit_log;
ANALYZE public.notifications;
ANALYZE public.idempotency_records;

COMMENT ON INDEX public.idx_cases_user_active_covering IS
  'Tier 6 zad. 267 — covering index for /app/sprawy list. Enables index-only scans.';
COMMENT ON INDEX public.idx_ai_runs_case_covering IS
  'Tier 6 zad. 267 — covering index for case detail timeline view.';
COMMENT ON INDEX public.idx_audit_log_recent_covering IS
  'Tier 6 zad. 267 — partial covering index for last 90 days audit (admin).';
COMMENT ON INDEX public.idx_notifications_dlq_covering IS
  'Tier 6 zad. 267 — partial covering index for /admin/dlq viewer.';
COMMENT ON INDEX public.idx_idempotency_lookup_covering IS
  'Tier 6 zad. 267 — covering index for idempotency cache lookup (sub-50ms).';
