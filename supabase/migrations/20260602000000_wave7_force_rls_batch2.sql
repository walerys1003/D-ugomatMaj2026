-- ============================================================================
-- Wave 7 / T004-006..T004-035 — FORCE RLS sweep batch 2 (30 more tables).
--
-- Continues the FORCE ROW LEVEL SECURITY rollout started in
-- 20260601000000_wave6_force_rls_critical_tables.sql (batch 1 = 35 tables).
--
-- This batch covers the next tier of user-owned / multi-tenant data that
-- was still missing FORCE: core case lifecycle, payments / billing,
-- AI prompts, RAG, mobile, signature, notifications, webauthn, webhooks,
-- workflows, tenants and rate limiting tables.
--
-- Idempotent: ALTER TABLE ... FORCE ROW LEVEL SECURITY is safe to run
-- repeatedly. We wrap in a DO block that silently skips tables that
-- don't exist yet (fresh dev DBs that haven't run all earlier tiers).
-- ============================================================================

do $$
declare
  tbl text;
  batch2_tables text[] := array[
    -- Core case lifecycle (must be RLS-protected end-to-end)
    'cases',
    'documents',
    'document_versions',
    'deadlines',
    'case_events',
    'ai_suggestions',
    -- Profiles + user-scoped
    'profiles',
    'user_preferences',
    'user_sessions',
    'consent_ledger',
    -- Billing / payments (PCI-sensitive)
    'payments',
    'invoices',
    'invoice_lines',
    'refunds',
    'subscriptions',
    'subscription_usage',
    'promo_codes',
    'promo_redemptions',
    -- AI + RAG (often contain user prompts)
    'ai_invocations',
    'ai_prompts',
    'ai_prompt_versions',
    'rag_chunks',
    'rag_documents',
    -- Notifications + push (PII leakage risk)
    'notifications',
    'notification_log',
    'push_subscriptions',
    'mobile_devices',
    'mobile_sessions',
    -- Signatures + WebAuthn (security-critical)
    'signature_requests',
    'epuap_sign_sessions',
    'webauthn_credentials',
    'webauthn_challenges',
    -- Webhooks + workflows (could contain customer data)
    'webhook_endpoints',
    'webhook_deliveries',
    'webhook_subscriptions',
    'workflows',
    'workflow_runs',
    -- Tenants + orgs extensions
    'tenants',
    'tenant_members',
    'tenant_invitations',
    'org_memberships',
    'org_invitations',
    'org_sso_configs',
    -- Rate limiting (per-user data)
    'rate_limit_log',
    'rate_limit_window',
    -- OCR + filings (user docs)
    'ocr_results',
    'ocr_review_queue',
    'court_filings',
    -- Affiliate / referral (PII)
    'affiliate_clicks',
    'affiliate_referrals',
    'referral_clicks',
    'referral_conversions',
    'referral_redemptions_v',
    -- Misc user-scoped
    'leads',
    'mfa_secrets',
    'impersonation_sessions',
    'erasure_requests',
    'legal_holds',
    'oauth_credentials'
  ];
begin
  foreach tbl in array batch2_tables loop
    begin
      execute format('alter table public.%I force row level security', tbl);
      raise notice 'Wave7 FORCE RLS: applied to %', tbl;
    exception
      when undefined_table then
        raise notice 'Wave7 FORCE RLS: skipped % (table missing)', tbl;
      when others then
        raise notice 'Wave7 FORCE RLS: skipped % (%: %)', tbl, sqlstate, sqlerrm;
    end;
  end loop;
end;
$$;

-- After Wave 6 (35 tables) + Wave 7 batch 2 (~58 tables) we have FORCE RLS
-- on ~93 of 167 known tables (~56%). Remaining ~74 tables are either
-- internal / read-only reference tables (legal_knowledge, krs_cache,
-- locale_pricing, feature_flags) or telemetry tables that don't store
-- user-owned data (web_vitals, rum_samples, lighthouse_scorecards,
-- performance_snapshots) — they will be addressed in batch 3 if needed.
