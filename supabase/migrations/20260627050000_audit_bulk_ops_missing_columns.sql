-- =============================================================================
-- Długomat — Audyt 2026-06-27 (iter. 7) — REALNY BUG: bulk-engine vs schemat
-- =============================================================================
-- WYKRYTO podczas usuwania `as any` w lib/bulk-ops/bulk-engine.ts:
--   Handlery operacji masowych aktualizują kolumny, których NIE MA w żadnej
--   migracji — czyli te operacje padałyby w runtime:
--     • cases.archived_at      (cases.archive / cases.unarchive)
--     • cases.purge_at         (cases.delete — soft delete + TTL na czyszczenie)
--     • cases.tags             (cases.update z tagami)
--     • documents.tags         (documents.tag)
--     • deadlines.assignee_id  (deadlines.reassign)
--   `as any` maskowało, że typowany klient odrzuciłby te zapytania.
--
-- To są zamierzone funkcje (archiwizacja / soft-delete / tagowanie / reassign),
-- więc poprawne rozwiązanie = DODAĆ brakujące kolumny (additive, idempotentne),
-- a nie usuwać funkcjonalność.
--
-- UWAGA: osobno (w kodzie) poprawiamy też `cases.case_type` → `cases.type`
-- w handlerze cases.update — `cases` ma kolumnę `type`, nie `case_type`.
-- =============================================================================

-- cases: archiwizacja + soft-delete TTL + tagi
alter table public.cases add column if not exists archived_at timestamptz;
alter table public.cases add column if not exists purge_at    timestamptz;
alter table public.cases add column if not exists tags        text[] not null default '{}';

create index if not exists idx_cases_archived
  on public.cases(user_id, archived_at) where archived_at is not null;
create index if not exists idx_cases_purge
  on public.cases(purge_at) where purge_at is not null;

-- documents: tagi
alter table public.documents add column if not exists tags text[] not null default '{}';

-- deadlines: przypisanie właściciela (reassign w bulk-ops)
alter table public.deadlines add column if not exists assignee_id uuid;
create index if not exists idx_deadlines_assignee
  on public.deadlines(assignee_id) where assignee_id is not null;

comment on column public.cases.archived_at is
  'Audyt 2026-06-27 — wsparcie bulk cases.archive/unarchive.';
comment on column public.cases.purge_at is
  'Audyt 2026-06-27 — soft-delete TTL (bulk cases.delete).';
comment on column public.deadlines.assignee_id is
  'Audyt 2026-06-27 — przypisany właściciel terminu (bulk deadlines.reassign).';
