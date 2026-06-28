-- =============================================================================
-- Długomat — Tier 2 / Migration 013 — Row-Level Security policies
-- Source: docs/spec/SPEC_FULL.txt §7.4 (RLS)
-- Reguła ogólna:
--   * SELECT/UPDATE/DELETE — tylko user_id = auth.uid()
--   * INSERT — only with check (user_id = auth.uid())
--   * service_role bypass-uje RLS (admin / CRON / webhooks)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- CASES
-- ----------------------------------------------------------------------------
alter table public.cases enable row level security;
alter table public.cases force row level security;

drop policy if exists cases_select_own on public.cases;
drop policy if exists cases_insert_self on public.cases;
drop policy if exists cases_update_own on public.cases;
drop policy if exists cases_delete_own on public.cases;

create policy cases_select_own on public.cases
  for select to authenticated
  using (user_id = auth.uid() and deleted_at is null);

create policy cases_insert_self on public.cases
  for insert to authenticated
  with check (user_id = auth.uid());

create policy cases_update_own on public.cases
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- DELETE — soft-delete (poprzez UPDATE deleted_at) jest preferowane,
-- ale pozwalamy też na hard-delete dla draftów.
create policy cases_delete_own on public.cases
  for delete to authenticated
  using (user_id = auth.uid() and status = 'draft');

-- ----------------------------------------------------------------------------
-- DOCUMENTS  — user czyta swoje, ale write robi tylko serwer (service_role)
-- ----------------------------------------------------------------------------
alter table public.documents enable row level security;
alter table public.documents force row level security;

drop policy if exists documents_select_own on public.documents;

create policy documents_select_own on public.documents
  for select to authenticated
  using (user_id = auth.uid());

-- (no INSERT/UPDATE/DELETE policies → klient nie może modyfikować bezpośrednio)

-- ----------------------------------------------------------------------------
-- DOCUMENT_VERSIONS — read-only przez join na documents
-- ----------------------------------------------------------------------------
alter table public.document_versions enable row level security;
alter table public.document_versions force row level security;

drop policy if exists doc_versions_select_own on public.document_versions;

create policy doc_versions_select_own on public.document_versions
  for select to authenticated
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_versions.document_id
        and d.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- DEADLINES — user widzi swoje; UPDATE pozwalamy na is_completed/completed_at
-- ----------------------------------------------------------------------------
alter table public.deadlines enable row level security;
alter table public.deadlines force row level security;

drop policy if exists deadlines_select_own on public.deadlines;
drop policy if exists deadlines_update_own on public.deadlines;

create policy deadlines_select_own on public.deadlines
  for select to authenticated
  using (user_id = auth.uid());

create policy deadlines_update_own on public.deadlines
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- INSERT i DELETE — tylko serwer (service_role)

-- ----------------------------------------------------------------------------
-- OCR_RESULTS — user widzi swoje, INSERT też (klient triguje OCR)
-- ----------------------------------------------------------------------------
alter table public.ocr_results enable row level security;
alter table public.ocr_results force row level security;

drop policy if exists ocr_select_own  on public.ocr_results;
drop policy if exists ocr_insert_self on public.ocr_results;
drop policy if exists ocr_update_own  on public.ocr_results;

create policy ocr_select_own on public.ocr_results
  for select to authenticated
  using (user_id = auth.uid());

create policy ocr_insert_self on public.ocr_results
  for insert to authenticated
  with check (user_id = auth.uid());

create policy ocr_update_own on public.ocr_results
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- PAYMENTS — read-only po stronie klienta (write tylko Stripe webhook → server)
-- ----------------------------------------------------------------------------
alter table public.payments enable row level security;
alter table public.payments force row level security;

drop policy if exists payments_select_own on public.payments;

create policy payments_select_own on public.payments
  for select to authenticated
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS — user czyta swoje (np. inbox); INSERT/UPDATE robi serwer
-- ----------------------------------------------------------------------------
alter table public.notifications enable row level security;
alter table public.notifications force row level security;

drop policy if exists notifications_select_own on public.notifications;

create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- CASE_EVENTS — append-only audit; user czyta wpisy ze swoich spraw
-- ----------------------------------------------------------------------------
alter table public.case_events enable row level security;
alter table public.case_events force row level security;

drop policy if exists case_events_select_own on public.case_events;
drop policy if exists case_events_insert_self on public.case_events;

create policy case_events_select_own on public.case_events
  for select to authenticated
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_events.case_id
        and c.user_id = auth.uid()
    )
  );

-- INSERT z poziomu klienta — tylko dla zdarzeń typu user_*
create policy case_events_insert_self on public.case_events
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and actor = 'user'
    and exists (
      select 1 from public.cases c
      where c.id = case_id and c.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- LEGAL_KNOWLEDGE — czytelne dla wszystkich zalogowanych (RAG retriever)
-- (Embeddingi i treść aktów = informacja publiczna.)
-- ----------------------------------------------------------------------------
alter table public.legal_knowledge enable row level security;
alter table public.legal_knowledge force row level security;

drop policy if exists legal_knowledge_select_all on public.legal_knowledge;

create policy legal_knowledge_select_all on public.legal_knowledge
  for select to authenticated
  using (true);

-- WRITE — wyłącznie service_role (admin panel + skrypty seed)

-- ----------------------------------------------------------------------------
-- PROMPT_TEMPLATES — sekretne (zawierają know-how). Dostęp tylko serwer + admin.
-- ----------------------------------------------------------------------------
alter table public.prompt_templates enable row level security;
alter table public.prompt_templates force row level security;

drop policy if exists prompt_templates_admin_select on public.prompt_templates;

create policy prompt_templates_admin_select on public.prompt_templates
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'moderator')
    )
  );

-- ----------------------------------------------------------------------------
-- VALIDATION_RUNS — user widzi tylko własne (transparency)
-- ----------------------------------------------------------------------------
alter table public.validation_runs enable row level security;
alter table public.validation_runs force row level security;

drop policy if exists validation_runs_select_own on public.validation_runs;

create policy validation_runs_select_own on public.validation_runs
  for select to authenticated
  using (user_id = auth.uid());

comment on schema public is
  'Długomat application schema. RLS enabled+forced on all tables. service_role bypasses RLS.';
