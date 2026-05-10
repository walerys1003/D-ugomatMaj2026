-- =============================================================================
-- Długomat — Tier 8 (zad. 351-400) — Pricing v2 + Affiliate + Referral + Growth
-- =============================================================================
-- Tabele:
--  - subscriptions, subscription_usage
--  - affiliate_accounts, affiliate_clicks, affiliate_referrals,
--    affiliate_commissions, affiliate_payouts
--  - referral_codes_v2, referral_redemptions_v2, referral_credits_v2
--  - subscription_coupons, subscription_coupon_redemptions
--  - email_campaign_enrollments, email_send_log
--  - experiments, experiment_events
--  - invoices
--  - conversion_events
--  - leads
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  plan_id text NOT NULL CHECK (plan_id IN ('free','starter','pro','family','company')),
  cycle text NOT NULL CHECK (cycle IN ('monthly','annual')),
  status text NOT NULL,
  stripe_customer_id text NULL,
  stripe_subscription_id text UNIQUE,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  trial_end timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  cases_created int NOT NULL DEFAULT 0,
  ai_generations int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user ON public.subscription_usage(user_id, period_start);

CREATE OR REPLACE FUNCTION public.fn_increment_subscription_usage(
  p_user_id uuid, p_period_start timestamptz, p_period_end timestamptz,
  p_field text, p_delta int
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_field NOT IN ('cases_created','ai_generations') THEN
    RAISE EXCEPTION 'invalid field: %', p_field;
  END IF;
  EXECUTE format('
    INSERT INTO public.subscription_usage (user_id, period_start, period_end, %I)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, period_start) DO UPDATE
       SET %I = public.subscription_usage.%I + EXCLUDED.%I,
           updated_at = now()
  ', p_field, p_field, p_field, p_field) USING p_user_id, p_period_start, p_period_end, p_delta;
END $$;

-- -----------------------------------------------------------------------------
-- AFFILIATE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliate_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  payout_email text NOT NULL,
  commission_first_payment_pct int NOT NULL DEFAULT 20,
  commission_recurring_pct int NOT NULL DEFAULT 10,
  commission_recurring_months int NOT NULL DEFAULT 12,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  payout_method text NULL,
  payout_details jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_accounts_slug ON public.affiliate_accounts(slug);

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_accounts(id) ON DELETE CASCADE,
  slug text NOT NULL,
  ip_hash text NULL,
  user_agent text NULL,
  referer text NULL,
  landing_path text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON public.affiliate_clicks(affiliate_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'signed_up'
    CHECK (status IN ('signed_up','converted','expired')),
  attributed_at timestamptz NOT NULL DEFAULT now(),
  attribution_expires_at timestamptz NOT NULL,
  converted_at timestamptz NULL,
  UNIQUE (affiliate_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user ON public.affiliate_referrals(user_id);

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_accounts(id) ON DELETE CASCADE,
  referral_id uuid NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id uuid NULL,
  amount_grosze int NOT NULL,
  commission_pct int NOT NULL,
  is_first_payment boolean NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','cancelled','reversed')),
  payout_id uuid NULL,
  paid_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON public.affiliate_commissions(affiliate_id, status);

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_accounts(id) ON DELETE CASCADE,
  amount_grosze int NOT NULL,
  period_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','transferred','failed')),
  commission_count int NOT NULL DEFAULT 0,
  external_ref text NULL,
  transferred_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON public.affiliate_payouts(affiliate_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- REFERRALS v2 (peer-to-peer invite)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_codes_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  uses int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_redemptions_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'signed_up'
    CHECK (status IN ('signed_up','credited','limit_exceeded','expired')),
  credited_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referrer_user_id, invitee_user_id)
);
CREATE INDEX IF NOT EXISTS idx_referral_redemptions_invitee ON public.referral_redemptions_v2(invitee_user_id);

CREATE TABLE IF NOT EXISTS public.referral_credits_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_grosze int NOT NULL,
  used_grosze int NOT NULL DEFAULT 0,
  source_redemption_id uuid NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referral_credits_user ON public.referral_credits_v2(user_id, expires_at);

CREATE OR REPLACE FUNCTION public.fn_increment_referral_uses(p_code text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.referral_codes_v2 SET uses = uses + 1 WHERE code = p_code;
END $$;

-- -----------------------------------------------------------------------------
-- COUPONS (subscription-level)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  stripe_coupon_id text NOT NULL,
  stripe_promotion_code_id text NOT NULL,
  discount_pct int NULL,
  discount_grosze int NULL,
  duration text NOT NULL CHECK (duration IN ('once','repeating','forever')),
  duration_in_months int NULL,
  max_redemptions int NULL,
  current_redemptions int NOT NULL DEFAULT 0,
  applies_to_plans text[] NULL,
  valid_until timestamptz NULL,
  is_active boolean NOT NULL DEFAULT true,
  campaign_label text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.subscription_coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id)
);

CREATE OR REPLACE FUNCTION public.fn_increment_coupon_redemption(p_coupon_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.subscription_coupons
     SET current_redemptions = current_redemptions + 1
   WHERE id = p_coupon_id;
END $$;

-- -----------------------------------------------------------------------------
-- EMAIL CAMPAIGNS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_campaign_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_key text NOT NULL,
  start_at timestamptz NOT NULL DEFAULT now(),
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','cancelled','completed')),
  cancelled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, campaign_key, start_at)
);
CREATE INDEX IF NOT EXISTS idx_email_enrollments_status ON public.email_campaign_enrollments(status, campaign_key);

CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.email_campaign_enrollments(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed','skipped')),
  detail text NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, step_id)
);
CREATE INDEX IF NOT EXISTS idx_email_send_log_enrollment ON public.email_send_log(enrollment_id);

-- -----------------------------------------------------------------------------
-- A/B EXPERIMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text NOT NULL,
  variants text[] NOT NULL,
  traffic_split numeric[] NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','running','paused','completed')),
  primary_metric text NOT NULL DEFAULT 'conversion',
  started_at timestamptz NULL,
  ended_at timestamptz NULL,
  winner_variant text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_key text NOT NULL,
  variant text NOT NULL,
  seed text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('exposure','conversion')),
  metric_name text NULL,
  metric_value numeric NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_experiment_events_key ON public.experiment_events(experiment_key, event_type);
CREATE UNIQUE INDEX IF NOT EXISTS uq_experiment_exposure
  ON public.experiment_events (experiment_key, seed, event_type)
  WHERE event_type = 'exposure';

-- -----------------------------------------------------------------------------
-- INVOICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  payment_id uuid NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_address text NULL,
  customer_city text NULL,
  customer_zip text NULL,
  customer_country text NOT NULL DEFAULT 'PL',
  customer_nip text NULL,
  customer_vat_id text NULL,
  customer_type text NOT NULL CHECK (customer_type IN ('b2c','b2b')),
  items jsonb NOT NULL,
  vat_summary jsonb NOT NULL,
  total_net_grosze int NOT NULL,
  total_vat_grosze int NOT NULL,
  total_gross_grosze int NOT NULL,
  issue_date timestamptz NOT NULL,
  sell_date timestamptz NOT NULL,
  is_correction boolean NOT NULL DEFAULT false,
  original_invoice_number text NULL,
  correction_reason text NULL,
  pdf_url text NULL,
  fakturownia_id text NULL,
  status text NOT NULL DEFAULT 'issued'
    CHECK (status IN ('draft','issued','sent','paid','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id, issue_date DESC);

CREATE TABLE IF NOT EXISTS public.invoice_sequence (
  year int NOT NULL,
  prefix text NOT NULL,
  last_seq int NOT NULL DEFAULT 0,
  PRIMARY KEY (year, prefix)
);

CREATE OR REPLACE FUNCTION public.fn_next_invoice_number(
  p_year int, p_is_correction boolean
) RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  v_prefix text;
  v_next int;
BEGIN
  v_prefix := CASE WHEN p_is_correction THEN 'KOR' ELSE 'FV' END;
  INSERT INTO public.invoice_sequence (year, prefix, last_seq)
    VALUES (p_year, v_prefix, 1)
    ON CONFLICT (year, prefix)
    DO UPDATE SET last_seq = public.invoice_sequence.last_seq + 1
    RETURNING last_seq INTO v_next;
  RETURN v_next;
END $$;

-- -----------------------------------------------------------------------------
-- CONVERSION EVENTS + LEADS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id text NULL,
  case_id uuid NULL,
  payment_id uuid NULL,
  amount_grosze int NULL,
  attribution jsonb NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event ON public.conversion_events(event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user ON public.conversion_events(user_id);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  magnet_slug text NOT NULL,
  source text NULL,
  medium text NULL,
  campaign text NULL,
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_at timestamptz NULL,
  tags text[] NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, magnet_slug)
);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- -----------------------------------------------------------------------------
-- RLS — owner-only access for user-scoped tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_credits_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sub_own ON public.subscriptions;
CREATE POLICY sub_own ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sub_usage_own ON public.subscription_usage;
CREATE POLICY sub_usage_own ON public.subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS aff_acc_own ON public.affiliate_accounts;
CREATE POLICY aff_acc_own ON public.affiliate_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS aff_comm_own ON public.affiliate_commissions;
CREATE POLICY aff_comm_own ON public.affiliate_commissions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS aff_payouts_own ON public.affiliate_payouts;
CREATE POLICY aff_payouts_own ON public.affiliate_payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_accounts a
       WHERE a.id = affiliate_payouts.affiliate_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS ref_codes_own ON public.referral_codes_v2;
CREATE POLICY ref_codes_own ON public.referral_codes_v2
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ref_credits_own ON public.referral_credits_v2;
CREATE POLICY ref_credits_own ON public.referral_credits_v2
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS inv_own ON public.invoices;
CREATE POLICY inv_own ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS email_enroll_own ON public.email_campaign_enrollments;
CREATE POLICY email_enroll_own ON public.email_campaign_enrollments
  FOR SELECT USING (auth.uid() = user_id);
