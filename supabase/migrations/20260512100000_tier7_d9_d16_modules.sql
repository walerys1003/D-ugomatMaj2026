-- Tier 7 zad. 301-308 — D9..D16 case types + supporting schema.
--
-- Rozszerza enum `case_type` o 8 nowych modułów (Upadłość-Pro, zwrot opłat,
-- reklamacja bank/RF, skarga PUODO, raty sądowe, zwolnienie z kosztów,
-- zażalenie na klauzulę, pozbawienie tytułu wykonalności).
--
-- Dodatkowo:
--   - rozszerza `deadline_kind` enum
--   - tworzy `document_versions` (zad. 320 — version history)
--   - tworzy `wizard_branch_log` (zad. 309 — debug warunkowych kroków)
--   - tworzy `ai_suggestions` (zad. 312 — „radca podpowiada")

-- ----------------------------------------------------------------------
-- 1) Enum extensions — case_type
-- ----------------------------------------------------------------------
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'upadlosc_pelny_wniosek';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'pozew_zwrot_oplat_windykacyjnych';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'reklamacja_bank_rf';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'skarga_puodo';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'wniosek_raty_sadowe';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'wniosek_zwolnienie_kosztow_sadowych';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'zazalenie_klauzula_wykonalnosci';
ALTER TYPE public.case_type ADD VALUE IF NOT EXISTS 'pozbawienie_tytulu_wykonalnosci';

-- ----------------------------------------------------------------------
-- 2) Enum extensions — deadline_kind
-- ----------------------------------------------------------------------
ALTER TYPE public.deadline_kind ADD VALUE IF NOT EXISTS 'reklamacja_bank_30dni';
ALTER TYPE public.deadline_kind ADD VALUE IF NOT EXISTS 'puodo_30dni';
ALTER TYPE public.deadline_kind ADD VALUE IF NOT EXISTS 'zazalenie_7dni';
ALTER TYPE public.deadline_kind ADD VALUE IF NOT EXISTS 'powodztwo_przeciwegzekucyjne';

-- ----------------------------------------------------------------------
-- 3) document_versions — Tier 7 zad. 320
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  document_id  UUID NULL REFERENCES public.case_documents(id) ON DELETE SET NULL,
  version_no   INT NOT NULL,
  parent_id    UUID NULL REFERENCES public.document_versions(id) ON DELETE SET NULL,
  source       TEXT NOT NULL CHECK (source IN ('generation','manual_edit','ai_revision','restore')),
  content_md   TEXT NOT NULL,
  diff_summary TEXT NULL,
  ai_run_id    UUID NULL,
  created_by   UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_case
  ON public.document_versions (case_id, version_no DESC);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY document_versions_select_own
  ON public.document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = document_versions.case_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY document_versions_insert_own
  ON public.document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = document_versions.case_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

COMMENT ON TABLE public.document_versions IS
  'Tier 7 zad. 320 — version history for generated documents (restore + diff view).';

-- ----------------------------------------------------------------------
-- 4) wizard_branch_log — Tier 7 zad. 309
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wizard_branch_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  step_id      TEXT NOT NULL,
  branch_taken TEXT NOT NULL,
  reason       TEXT NULL,
  inputs       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wizard_branch_log_case
  ON public.wizard_branch_log (case_id, created_at DESC);

ALTER TABLE public.wizard_branch_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wizard_branch_log FORCE ROW LEVEL SECURITY;

CREATE POLICY wizard_branch_log_select_own
  ON public.wizard_branch_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = wizard_branch_log.case_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

-- ----------------------------------------------------------------------
-- 5) ai_suggestions — Tier 7 zad. 312 ("radca podpowiada")
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  step_id      TEXT NOT NULL,
  suggestion   TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('argument','evidence','legal_basis','strategy','warning')),
  severity     TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','tip','warning','critical')),
  applied      BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed    BOOLEAN NOT NULL DEFAULT FALSE,
  model_id     TEXT NULL,
  cost_pln     NUMERIC(10,4) NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at   TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_case_active
  ON public.ai_suggestions (case_id, created_at DESC)
  WHERE applied = FALSE AND dismissed = FALSE;

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions FORCE ROW LEVEL SECURITY;

CREATE POLICY ai_suggestions_select_own
  ON public.ai_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = ai_suggestions.case_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY ai_suggestions_update_own
  ON public.ai_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = ai_suggestions.case_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

COMMENT ON TABLE public.ai_suggestions IS
  'Tier 7 zad. 312 — in-wizard AI suggestions ("radca podpowiada"). User can apply/dismiss.';
