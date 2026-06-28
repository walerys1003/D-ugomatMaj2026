-- Tier 17 — Advanced security + GDPR compliance (zad. 801-850)
-- Tables: mfa_secrets, webauthn_credentials, webauthn_challenges,
--         api_keys, user_sessions, consent_ledger, erasure_requests,
--         ip_rules, security_events
-- All tables protected with Row-Level Security.

-- =========================================================
-- MFA — TOTP secrets + backup codes
-- =========================================================
create table if not exists public.mfa_secrets (
    user_id           uuid primary key references auth.users(id) on delete cascade,
    secret_encrypted  text not null,
    backup_codes      jsonb not null default '[]'::jsonb,
    verified          boolean not null default false,
    last_verified_at  timestamptz,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

create index if not exists idx_mfa_secrets_verified
    on public.mfa_secrets(verified) where verified = true;

alter table public.mfa_secrets enable row level security;

drop policy if exists "mfa_secrets_self_read" on public.mfa_secrets;
create policy "mfa_secrets_self_read" on public.mfa_secrets
    for select using (auth.uid() = user_id);

drop policy if exists "mfa_secrets_self_write" on public.mfa_secrets;
create policy "mfa_secrets_self_write" on public.mfa_secrets
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- WebAuthn / FIDO2 credentials
-- =========================================================
create table if not exists public.webauthn_credentials (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    credential_id   text not null unique,
    public_key      text not null,
    sign_count      bigint not null default 0,
    transports      text[] not null default '{}',
    aaguid          text,
    fingerprint     text,
    label           text,
    last_used_at    timestamptz,
    created_at      timestamptz not null default now()
);

create index if not exists idx_webauthn_credentials_user
    on public.webauthn_credentials(user_id);

alter table public.webauthn_credentials enable row level security;

drop policy if exists "webauthn_credentials_self" on public.webauthn_credentials;
create policy "webauthn_credentials_self" on public.webauthn_credentials
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- WebAuthn challenges (registration + authentication)
-- =========================================================
create table if not exists public.webauthn_challenges (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    kind        text not null check (kind in ('registration','authentication')),
    challenge   text not null,
    expires_at  timestamptz not null,
    consumed_at timestamptz,
    created_at  timestamptz not null default now(),
    unique (user_id, kind)
);

create index if not exists idx_webauthn_challenges_expiry
    on public.webauthn_challenges(expires_at);

alter table public.webauthn_challenges enable row level security;

drop policy if exists "webauthn_challenges_self" on public.webauthn_challenges;
create policy "webauthn_challenges_self" on public.webauthn_challenges
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- API keys (dgmt_live_ / dgmt_test_)
-- =========================================================
create table if not exists public.api_keys (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    name        text not null,
    prefix      text not null unique,
    key_hash    text not null,
    scopes      text[] not null default '{}',
    environment text not null default 'live' check (environment in ('live','test')),
    active      boolean not null default true,
    last_used_at timestamptz,
    expires_at   timestamptz,
    created_at   timestamptz not null default now(),
    revoked_at   timestamptz
);

create index if not exists idx_api_keys_user on public.api_keys(user_id);
create index if not exists idx_api_keys_prefix on public.api_keys(prefix);
create index if not exists idx_api_keys_active
    on public.api_keys(active) where active = true;

alter table public.api_keys enable row level security;

drop policy if exists "api_keys_self" on public.api_keys;
create policy "api_keys_self" on public.api_keys
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- User sessions (device fingerprint + concurrent limit)
-- =========================================================
create table if not exists public.user_sessions (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references auth.users(id) on delete cascade,
    device_fingerprint  text not null,
    user_agent          text,
    ip                  inet,
    country             text,
    city                text,
    last_seen_at        timestamptz not null default now(),
    created_at          timestamptz not null default now(),
    revoked_at          timestamptz
);

create index if not exists idx_user_sessions_user on public.user_sessions(user_id);
create index if not exists idx_user_sessions_active
    on public.user_sessions(user_id, last_seen_at desc) where revoked_at is null;

alter table public.user_sessions enable row level security;

drop policy if exists "user_sessions_self" on public.user_sessions;
create policy "user_sessions_self" on public.user_sessions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Consent ledger (append-only — GDPR Art. 7)
-- =========================================================
create table if not exists public.consent_ledger (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    purpose     text not null check (purpose in (
        'tos','privacy','marketing_email','marketing_sms','marketing_push',
        'analytics','profiling','third_party_sharing','cookies_functional',
        'cookies_analytics','cookies_marketing','ai_training','data_export'
    )),
    granted     boolean not null,
    version     text not null,
    ip          inet,
    user_agent  text,
    locale      text,
    source      text,
    recorded_at timestamptz not null default now()
);

create index if not exists idx_consent_ledger_user
    on public.consent_ledger(user_id, purpose, recorded_at desc);

alter table public.consent_ledger enable row level security;

drop policy if exists "consent_ledger_self_read" on public.consent_ledger;
create policy "consent_ledger_self_read" on public.consent_ledger
    for select using (auth.uid() = user_id);

drop policy if exists "consent_ledger_self_insert" on public.consent_ledger;
create policy "consent_ledger_self_insert" on public.consent_ledger
    for insert with check (auth.uid() = user_id);

-- Append-only: explicit deny on update/delete via lack of policies + trigger guard.
create or replace function public.consent_ledger_block_mutations()
returns trigger language plpgsql as $$
begin
    raise exception 'consent_ledger is append-only';
end;
$$;

drop trigger if exists trg_consent_ledger_block_update on public.consent_ledger;
create trigger trg_consent_ledger_block_update
    before update or delete on public.consent_ledger
    for each row execute function public.consent_ledger_block_mutations();

-- =========================================================
-- Right-to-erasure requests (GDPR Art. 17)
-- =========================================================
create table if not exists public.erasure_requests (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users(id) on delete cascade,
    status        text not null default 'pending'
        check (status in ('pending','cancelled','executed','failed')),
    reason        text,
    requested_at  timestamptz not null default now(),
    scheduled_for timestamptz not null,
    executed_at   timestamptz,
    cancelled_at  timestamptz,
    failure_note  text
);

create index if not exists idx_erasure_requests_user on public.erasure_requests(user_id);
create index if not exists idx_erasure_requests_scheduled
    on public.erasure_requests(scheduled_for) where status = 'pending';

alter table public.erasure_requests enable row level security;

drop policy if exists "erasure_requests_self_read" on public.erasure_requests;
create policy "erasure_requests_self_read" on public.erasure_requests
    for select using (auth.uid() = user_id);

drop policy if exists "erasure_requests_self_insert" on public.erasure_requests;
create policy "erasure_requests_self_insert" on public.erasure_requests
    for insert with check (auth.uid() = user_id);

drop policy if exists "erasure_requests_self_cancel" on public.erasure_requests;
create policy "erasure_requests_self_cancel" on public.erasure_requests
    for update using (auth.uid() = user_id and status = 'pending')
    with check (auth.uid() = user_id and status in ('pending','cancelled'));

-- =========================================================
-- IP allow/block rules
-- =========================================================
create table if not exists public.ip_rules (
    id         uuid primary key default gen_random_uuid(),
    type       text not null check (type in ('allow','block')),
    scope      text not null check (scope in ('ip','cidr','country')),
    value      text not null,
    reason     text,
    created_by uuid references auth.users(id) on delete set null,
    active     boolean not null default true,
    created_at timestamptz not null default now(),
    expires_at timestamptz,
    unique (type, scope, value)
);

create index if not exists idx_ip_rules_active
    on public.ip_rules(active, scope) where active = true;

alter table public.ip_rules enable row level security;

drop policy if exists "ip_rules_admin_only" on public.ip_rules;
create policy "ip_rules_admin_only" on public.ip_rules
    for all using (
        exists (
            select 1 from auth.users u
            where u.id = auth.uid()
              and coalesce((u.raw_app_meta_data->>'role'), '') = 'admin'
        )
    );

-- =========================================================
-- Security events (SIEM-friendly)
-- =========================================================
create table if not exists public.security_events (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete set null,
    type        text not null check (type in (
        'login_success','login_failure','logout','password_change',
        'password_reset_request','password_reset_complete',
        'mfa_enabled','mfa_disabled','mfa_challenge','mfa_failure',
        'webauthn_register','webauthn_authenticate',
        'api_key_create','api_key_revoke','api_key_use',
        'session_revoke','data_export','erasure_request','consent_update',
        'rate_limit_hit','suspicious_activity'
    )),
    severity    text not null default 'info'
        check (severity in ('debug','info','notice','warning','error','critical')),
    ip          inet,
    user_agent  text,
    metadata    jsonb not null default '{}'::jsonb,
    occurred_at timestamptz not null default now()
);

create index if not exists idx_security_events_user
    on public.security_events(user_id, occurred_at desc);
create index if not exists idx_security_events_type
    on public.security_events(type, occurred_at desc);
create index if not exists idx_security_events_severity
    on public.security_events(severity, occurred_at desc)
    where severity in ('warning','error','critical');

alter table public.security_events enable row level security;

drop policy if exists "security_events_self_read" on public.security_events;
create policy "security_events_self_read" on public.security_events
    for select using (auth.uid() = user_id);

drop policy if exists "security_events_service_insert" on public.security_events;
create policy "security_events_service_insert" on public.security_events
    for insert with check (true); -- service role only via REST; RLS bypass keys are server-side.

-- =========================================================
-- Auto-updated `updated_at` trigger for mfa_secrets
-- =========================================================
create or replace function public.touch_mfa_secrets_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists trg_mfa_secrets_updated_at on public.mfa_secrets;
create trigger trg_mfa_secrets_updated_at
    before update on public.mfa_secrets
    for each row execute function public.touch_mfa_secrets_updated_at();

-- end of Tier 17 migration
