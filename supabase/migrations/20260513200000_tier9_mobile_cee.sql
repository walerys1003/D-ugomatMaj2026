-- =============================================================================
-- Długomat — Tier 9 (zad. 401-450) — Mobile + CEE expansion
-- =============================================================================
-- Tabele:
--  - mobile_devices (iOS/Android device registry + push tokens)
--  - cee_cases (CZ/SK/HU/RO cases — isolated from main cases table)
--  - cee_documents (per-locale generated documents)
--  - locale_pricing (per-locale Stripe Price IDs)
--  - translations_overrides (admin-editable translations w/o redeploy)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MOBILE DEVICES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mobile_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL CHECK (platform IN ('ios','android')),
  push_token text NULL,
  app_version text NOT NULL,
  os_version text NULL,
  locale text NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_user ON public.mobile_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_last_seen ON public.mobile_devices(last_seen_at);

-- -----------------------------------------------------------------------------
-- CEE CASES (isolated from PL `cases` to avoid type pollution)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('cs','sk','hu','ro')),
  case_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  title text NULL,
  wizard_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cee_cases_user_locale ON public.cee_cases(user_id, locale);
CREATE INDEX IF NOT EXISTS idx_cee_cases_type ON public.cee_cases(locale, case_type);

CREATE TABLE IF NOT EXISTS public.cee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cee_cases(id) ON DELETE CASCADE,
  locale text NOT NULL,
  status text NOT NULL DEFAULT 'generating',
  content_md text NULL,
  pdf_url text NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cee_documents_case ON public.cee_documents(case_id);

-- -----------------------------------------------------------------------------
-- LOCALE PRICING (Stripe price IDs per locale × case_type × cycle)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locale_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL CHECK (locale IN ('pl','cs','sk','hu','ro','en')),
  product_key text NOT NULL,  -- np. 'plan:pro:monthly' lub 'case:exekucni_namitka'
  currency text NOT NULL,     -- PLN/CZK/EUR
  amount_minor int NOT NULL,  -- w jednostkach minor (grosz/halíř/cent)
  vat_rate int NOT NULL,
  stripe_price_id text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locale, product_key)
);
CREATE INDEX IF NOT EXISTS idx_locale_pricing_product ON public.locale_pricing(product_key);

-- -----------------------------------------------------------------------------
-- TRANSLATIONS OVERRIDES (admin can patch strings w/o redeploy)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.translations_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL,
  translation_key text NOT NULL,
  value text NOT NULL,
  updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locale, translation_key)
);
CREATE INDEX IF NOT EXISTS idx_translations_overrides_locale ON public.translations_overrides(locale);

-- -----------------------------------------------------------------------------
-- MOBILE SESSIONS (optional — for analytics)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mobile_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  app_version text NOT NULL,
  duration_seconds int NULL,
  events_count int NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_device ON public.mobile_sessions(device_id, started_at DESC);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cee_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cee_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mobile_dev_own ON public.mobile_devices;
CREATE POLICY mobile_dev_own ON public.mobile_devices
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS cee_cases_own ON public.cee_cases;
CREATE POLICY cee_cases_own ON public.cee_cases
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS cee_docs_own ON public.cee_documents;
CREATE POLICY cee_docs_own ON public.cee_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cee_cases c
       WHERE c.id = cee_documents.case_id AND c.user_id = auth.uid()
    )
  );
