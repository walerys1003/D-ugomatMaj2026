-- Tier 18 — OCR enhancement + deadlines + multi-channel notifications + court integrations (zad. 851-900)
-- Tables: deadlines, notification_preferences, notification_log, epuap_sign_sessions, krs_cache, ocr_review_queue

-- =========================================================
-- Deadlines (procesowe terminy)
-- =========================================================
create table if not exists public.deadlines (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references auth.users(id) on delete cascade,
    case_id             uuid,
    kind                text not null check (kind in (
        'sprzeciw_epu','zarzuty_nakaz','zazalenie','apelacja',
        'skarga_kasacyjna','skarga_komornicza','odpowiedz_pozew',
        'wniosek_o_uzasadnienie','rps_termin','custom'
    )),
    title               text not null,
    start_date          timestamptz not null,
    end_date            timestamptz not null,
    effective_end_date  timestamptz not null,
    legal_basis         text,
    snoozed_until       timestamptz,
    completed_at        timestamptz,
    reminders_sent      text[] not null default '{}',
    created_at          timestamptz not null default now()
);

create index if not exists idx_deadlines_user_active
    on public.deadlines(user_id, effective_end_date)
    where completed_at is null;
create index if not exists idx_deadlines_case on public.deadlines(case_id);
create index if not exists idx_deadlines_due
    on public.deadlines(effective_end_date) where completed_at is null;

alter table public.deadlines enable row level security;

drop policy if exists "deadlines_self" on public.deadlines;
create policy "deadlines_self" on public.deadlines
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Notification preferences (DND + caps + per-kategoria)
-- =========================================================
create table if not exists public.notification_preferences (
    user_id     uuid primary key references auth.users(id) on delete cascade,
    channels    jsonb not null default '{"email":true,"sms":true,"push":true,"whatsapp":false,"inapp":true}'::jsonb,
    categories  jsonb not null default '{}'::jsonb,
    dnd_start   text,
    dnd_end     text,
    timezone    text not null default 'Europe/Warsaw',
    quiet_days  integer[] not null default '{}',
    caps        jsonb not null default '{"perHour":6,"perDay":30,"perWeek":120}'::jsonb,
    updated_at  timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notif_prefs_self" on public.notification_preferences;
create policy "notif_prefs_self" on public.notification_preferences
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Notification log (delivery history + frequency cap source)
-- =========================================================
create table if not exists public.notification_log (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users(id) on delete cascade,
    channel       text not null check (channel in ('email','sms','push','whatsapp','inapp')),
    category      text not null,
    priority      text not null check (priority in ('low','normal','high','critical')),
    delivered     boolean not null,
    error_message text,
    external_id   text,
    sent_at       timestamptz not null default now()
);

create index if not exists idx_notif_log_user_channel_time
    on public.notification_log(user_id, channel, sent_at desc);
create index if not exists idx_notif_log_recent_delivered
    on public.notification_log(user_id, channel, sent_at desc)
    where delivered = true;

alter table public.notification_log enable row level security;

drop policy if exists "notif_log_self_read" on public.notification_log;
create policy "notif_log_self_read" on public.notification_log
    for select using (auth.uid() = user_id);

drop policy if exists "notif_log_service_insert" on public.notification_log;
create policy "notif_log_service_insert" on public.notification_log
    for insert with check (true);

-- =========================================================
-- ePUAP signing sessions
-- =========================================================
create table if not exists public.epuap_sign_sessions (
    id               uuid primary key default gen_random_uuid(),
    session_id       text not null unique,
    user_id          uuid not null references auth.users(id) on delete cascade,
    case_id          uuid,
    document_hashes  text[] not null default '{}',
    status           text not null default 'pending'
        check (status in ('pending','signed','hash_mismatch','expired','submitted','failed')),
    signed_at        timestamptz,
    submitted_at     timestamptz,
    upp_id           text,
    expires_at       timestamptz not null,
    created_at       timestamptz not null default now()
);

create index if not exists idx_epuap_sign_user on public.epuap_sign_sessions(user_id);
create index if not exists idx_epuap_sign_status on public.epuap_sign_sessions(status);

alter table public.epuap_sign_sessions enable row level security;

drop policy if exists "epuap_sign_self" on public.epuap_sign_sessions;
create policy "epuap_sign_self" on public.epuap_sign_sessions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- KRS cache (per-call cache 24h)
-- =========================================================
create table if not exists public.krs_cache (
    key         text primary key,             -- "krs:0000123456" lub "nip:1234567890"
    payload     jsonb not null,
    fingerprint text,
    fetched_at  timestamptz not null default now(),
    expires_at  timestamptz not null
);

create index if not exists idx_krs_cache_expiry on public.krs_cache(expires_at);

-- read-only via service role; nie wystawiamy do klienta przez RLS
alter table public.krs_cache enable row level security;

drop policy if exists "krs_cache_authenticated_read" on public.krs_cache;
create policy "krs_cache_authenticated_read" on public.krs_cache
    for select using (auth.role() = 'authenticated');

-- =========================================================
-- OCR review queue — low-confidence dokumenty do ludzkiego review
-- =========================================================
create table if not exists public.ocr_review_queue (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references auth.users(id) on delete cascade,
    case_id             uuid,
    document_id         uuid,
    decision            text not null check (decision in ('accept','review','escalate')),
    score               numeric(4,3) not null,
    signals             jsonb not null default '{}'::jsonb,
    reasons             text[] not null default '{}',
    parser_fields_found integer not null default 0,
    parser_fields_expected integer not null default 0,
    resolved_at         timestamptz,
    resolved_by         uuid,
    resolution          text,
    created_at          timestamptz not null default now()
);

create index if not exists idx_ocr_review_pending
    on public.ocr_review_queue(decision, created_at desc)
    where resolved_at is null;
create index if not exists idx_ocr_review_user
    on public.ocr_review_queue(user_id, created_at desc);

alter table public.ocr_review_queue enable row level security;

drop policy if exists "ocr_review_self" on public.ocr_review_queue;
create policy "ocr_review_self" on public.ocr_review_queue
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- end of Tier 18 migration
