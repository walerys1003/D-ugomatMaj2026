-- Tier 6 zad. 268 — Row-level work claim via SKIP LOCKED.
--
-- Funkcje RPC dla `claimWork()` w lib/db/row-lock.ts.
-- Wymaga, aby target tables (np. `notifications`) miały kolumny:
--   - claimed_by TEXT NULL
--   - claimed_at TIMESTAMPTZ NULL
--   - status TEXT (filtered)

-- ----------------------------------------------------------------------
-- Dodaj kolumny claim do tabel cron-driven (jeśli brak).
-- ----------------------------------------------------------------------
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS claimed_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_claim
  ON public.notifications (status, claimed_at)
  WHERE status = 'queued';

-- ----------------------------------------------------------------------
-- Advisory lock helpers (per-scope cron lock).
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.try_advisory_lock(lock_key BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN pg_try_advisory_lock(lock_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_advisory_lock(lock_key BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN pg_advisory_unlock(lock_key);
END;
$$;

-- ----------------------------------------------------------------------
-- Claim batch of work rows (SKIP LOCKED pattern).
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_work_batch(
  p_table TEXT,
  p_status_filter TEXT DEFAULT 'queued',
  p_limit INT DEFAULT 50,
  p_worker_id TEXT DEFAULT 'unknown',
  p_lock_ttl_seconds INT DEFAULT 300
)
RETURNS SETOF JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Whitelist tabel — zapobiega SQL injection przez p_table.
  IF p_table NOT IN ('notifications') THEN
    RAISE EXCEPTION 'Table % not allowed for claim_work_batch', p_table;
  END IF;

  sql := format($f$
    WITH picked AS (
      SELECT id FROM public.%I
      WHERE status = $1
        AND (claimed_at IS NULL OR claimed_at < now() - ($2 || ' seconds')::interval)
      ORDER BY created_at ASC
      LIMIT $3
      FOR UPDATE SKIP LOCKED
    )
    UPDATE public.%I AS t
    SET claimed_by = $4,
        claimed_at = now()
    FROM picked
    WHERE t.id = picked.id
    RETURNING to_jsonb(t.*);
  $f$, p_table, p_table);

  RETURN QUERY EXECUTE sql
    USING p_status_filter, p_lock_ttl_seconds, p_limit, p_worker_id;
END;
$$;

-- ----------------------------------------------------------------------
-- Release batch — clear claimed_by after success/fail.
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_work_batch(
  p_table TEXT,
  p_ids UUID[],
  p_worker_id TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  sql TEXT;
  affected INT;
BEGIN
  IF p_table NOT IN ('notifications') THEN
    RAISE EXCEPTION 'Table % not allowed for release_work_batch', p_table;
  END IF;

  sql := format($f$
    UPDATE public.%I
    SET claimed_by = NULL, claimed_at = NULL
    WHERE id = ANY($1) AND claimed_by = $2
  $f$, p_table);

  EXECUTE sql USING p_ids, p_worker_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.try_advisory_lock(BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_advisory_lock(BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_work_batch(TEXT, TEXT, INT, TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_work_batch(TEXT, UUID[], TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.try_advisory_lock(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_advisory_lock(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_work_batch(TEXT, TEXT, INT, TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_work_batch(TEXT, UUID[], TEXT) TO service_role;

COMMENT ON FUNCTION public.claim_work_batch IS
  'Tier 6 zad. 268 — Atomic SKIP LOCKED claim for cron workers. Whitelisted tables only.';
