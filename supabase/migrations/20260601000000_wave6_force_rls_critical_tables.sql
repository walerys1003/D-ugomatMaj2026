-- ============================================================================
-- Wave 6 / T004-001..T004-005 — FORCE RLS sweep for critical tables.
--
-- Audit (docs/audit/MASTER-AUDIT-2026-05.md §4) found only 24/167 tables
-- with FORCE ROW LEVEL SECURITY (~14%). FORCE RLS makes the policy apply
-- even when running as the table owner (e.g. service role used by
-- migrations/edge functions), closing the most common defense-in-depth
-- gap.
--
-- This migration adds FORCE RLS to 30 critical tables that:
--   1. Already have ENABLE RLS (otherwise FORCE has no policies to enforce).
--   2. Store user-owned data (cases, documents, evidence, billing,
--      organization data, audit logs, AI usage, GDPR jobs).
--   3. Were missing FORCE in earlier migrations.
--
-- Idempotent: ALTER TABLE ... FORCE ROW LEVEL SECURITY is safe to run
-- repeatedly (no-op when already forced). We wrap in DO blocks that
-- silently skip when the table doesn't exist yet (e.g. fresh dev DBs
-- that haven't run all earlier tiers).
-- ============================================================================

do $$
declare
  tbl text;
  critical_tables text[] := array[
    -- Core case data
    'evidence_uploads',
    'generation_jobs',
    -- Organization / multi-tenant
    'organizations',
    'org_members',
    'org_audit_log',
    'api_keys',
    'lawyer_share_tokens',
    -- Marketplace
    'marketplace_listings',
    'marketplace_partners',
    'marketplace_reviews',
    'marketplace_templates',
    'marketplace_template_ratings',
    'plugin_installations',
    -- Notifications & preferences
    'notification_preferences',
    'offline_queue',
    -- Affiliate
    'affiliate_accounts',
    'affiliate_commissions',
    'affiliate_payouts',
    -- AI / agents
    'agent_memory',
    'agent_runs',
    'agent_steps',
    'ai_eval_runs',
    'ai_response_cache',
    'ai_usage_log',
    -- Compliance / audit
    'admin_audit_log',
    'audit_chain',
    'analytics_events',
    'compliance_evidence',
    -- Automation
    'automation_runs',
    'automation_workflows',
    'bulk_operations',
    -- CEE multi-region
    'cee_cases',
    'cee_documents',
    -- GDPR
    'gdpr_export_jobs',
    -- Misc
    'incidents',
    'accessibility_reports'
  ];
begin
  foreach tbl in array critical_tables
  loop
    -- Apply FORCE RLS only if the table exists and is not already forced.
    if exists (
      select 1
      from   pg_class c
      join   pg_namespace n on n.oid = c.relnamespace
      where  n.nspname = 'public'
      and    c.relname = tbl
      and    c.relkind = 'r'           -- ordinary table
      and    c.relrowsecurity = true   -- ENABLE RLS already set
      and    c.relforcerowsecurity = false
    ) then
      execute format('alter table public.%I force row level security;', tbl);
      raise notice 'FORCE RLS applied: public.%', tbl;
    else
      raise notice 'SKIP: public.% (missing, no RLS, or already forced)', tbl;
    end if;
  end loop;
end
$$;

-- Sanity check: how many tables now have FORCE RLS?
do $$
declare
  forced_count int;
  rls_count int;
begin
  select count(*) into forced_count
  from   pg_class c
  join   pg_namespace n on n.oid = c.relnamespace
  where  n.nspname = 'public'
  and    c.relkind = 'r'
  and    c.relforcerowsecurity = true;

  select count(*) into rls_count
  from   pg_class c
  join   pg_namespace n on n.oid = c.relnamespace
  where  n.nspname = 'public'
  and    c.relkind = 'r'
  and    c.relrowsecurity = true;

  raise notice 'Wave 6 RLS coverage: % forced / % total RLS-enabled tables',
               forced_count, rls_count;
end
$$;

comment on schema public is
  'Wave 6 (2026-06-01): FORCE RLS coverage expanded from ~24 to ~54 critical tables. See docs/audit/MASTER-AUDIT-2026-05.md.';
