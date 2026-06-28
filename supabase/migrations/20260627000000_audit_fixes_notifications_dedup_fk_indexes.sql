-- =============================================================================
-- Wdrożenie audytu 2026-06-27 — naprawy integralności / wydajności DB
--
-- Obejmuje błędy z audytu:
--   #7  — partial UNIQUE index na `notifications` (anti-TOCTOU, anty-duplikat
--         maili/SMS); idempotency po (user_id, template, recipient, deadline_id,
--         dzień UTC) dla statusów aktywnych.
--   #19 — indeksy na kluczach obcych (PG nie tworzy ich automatycznie) —
--         przyspiesza JOIN-y i kaskadowe DELETE na najgorętszych relacjach.
--
-- Wszystkie operacje IF NOT EXISTS / idempotentne — bezpieczne do re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- #7 — Notifications: partial unique index na deduplikację.
-- Kolumna pomocnicza `dedup_day` (data UTC z created_at) jako generated column,
-- by indeks był deterministyczny (expression w UNIQUE wymaga IMMUTABLE).
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'notifications'
  ) then
    -- Kolumna generowana z daty utworzenia (UTC). IMMUTABLE-safe.
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'notifications'
        and column_name = 'dedup_day'
    ) then
      alter table public.notifications
        add column dedup_day date
        generated always as ((created_at at time zone 'UTC')::date) stored;
    end if;

    -- Partial unique — tylko aktywne statusy (sent/scheduled).
    -- coalesce(deadline_id, ...) zapewnia, że NULL deadline_id też jest unikalny.
    create unique index if not exists notifications_dedup_uidx
      on public.notifications (
        user_id,
        template,
        recipient,
        coalesce(deadline_id, '00000000-0000-0000-0000-000000000000'::uuid),
        dedup_day
      )
      where status in ('sent', 'scheduled');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- #19 — Indeksy na najczęściej używanych kluczach obcych.
-- Tworzymy tylko gdy tabela+kolumna istnieją (defensywnie).
-- -----------------------------------------------------------------------------
do $$
declare
  rec record;
  fk_targets text[][] := array[
    array['cases','user_id'],
    array['documents','case_id'],
    array['documents','user_id'],
    array['deadlines','case_id'],
    array['deadlines','user_id'],
    array['case_events','case_id'],
    array['payments','case_id'],
    array['payments','user_id'],
    array['notifications','user_id'],
    array['notifications','case_id'],
    array['notifications','deadline_id'],
    array['refunds','payment_id'],
    array['org_memberships','org_id'],
    array['org_memberships','user_id'],
    array['ai_usage_log','user_id'],
    array['ai_usage_log','case_id']
  ];
  i int;
  tbl text;
  col text;
  idx text;
begin
  for i in 1 .. array_length(fk_targets, 1) loop
    tbl := fk_targets[i][1];
    col := fk_targets[i][2];
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = col
    ) then
      idx := format('idx_%s_%s', tbl, col);
      execute format(
        'create index if not exists %I on public.%I (%I)',
        idx, tbl, col
      );
    end if;
  end loop;
end $$;
