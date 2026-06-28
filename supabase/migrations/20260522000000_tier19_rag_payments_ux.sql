-- Tier 19 — Hybrid RAG + payments + UX (zad. 901-950)
-- Tables: rag_chunks (+RPCs), subscriptions, invoices, invoice_lines

-- =========================================================
-- RAG chunks (hybrid retrieval: BM25 tsv + pgvector embedding)
-- =========================================================
create extension if not exists vector;
create extension if not exists pg_trgm;

create table if not exists public.rag_chunks (
    id           uuid primary key default gen_random_uuid(),
    document_id  uuid not null,
    tenant_id    uuid,
    case_type    text,
    text         text not null,
    embedding    vector(1536),
    tsv          tsvector,
    metadata     jsonb not null default '{}'::jsonb,
    created_at   timestamptz not null default now()
);

create index if not exists idx_rag_chunks_doc on public.rag_chunks(document_id);
create index if not exists idx_rag_chunks_tsv on public.rag_chunks using gin(tsv);
create index if not exists idx_rag_chunks_embedding
    on public.rag_chunks using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

create or replace function public.rag_chunks_tsv_update()
returns trigger language plpgsql as $$
begin
    new.tsv := to_tsvector('simple', coalesce(new.text, ''));
    return new;
end;
$$;

drop trigger if exists trg_rag_chunks_tsv on public.rag_chunks;
create trigger trg_rag_chunks_tsv
    before insert or update on public.rag_chunks
    for each row execute function public.rag_chunks_tsv_update();

alter table public.rag_chunks enable row level security;

drop policy if exists "rag_chunks_authenticated_read" on public.rag_chunks;
create policy "rag_chunks_authenticated_read" on public.rag_chunks
    for select using (auth.role() = 'authenticated');

-- RPC: BM25-style ranking over tsv
create or replace function public.rag_bm25_search(
    query_text text,
    max_results integer default 30,
    filter_document_ids uuid[] default null,
    filter_tenant_id uuid default null,
    filter_case_type text default null
) returns table (
    id uuid,
    document_id uuid,
    text text,
    score double precision,
    metadata jsonb
) language sql stable as $$
    select
        c.id,
        c.document_id,
        c.text,
        ts_rank_cd(c.tsv, plainto_tsquery('simple', query_text))::double precision as score,
        c.metadata
    from public.rag_chunks c
    where c.tsv @@ plainto_tsquery('simple', query_text)
      and (filter_document_ids is null or c.document_id = any(filter_document_ids))
      and (filter_tenant_id is null or c.tenant_id = filter_tenant_id)
      and (filter_case_type is null or c.case_type = filter_case_type)
    order by score desc
    limit max_results;
$$;

-- RPC: cosine vector search
create or replace function public.rag_vector_search(
    query_embedding vector(1536),
    max_results integer default 30,
    filter_document_ids uuid[] default null,
    filter_tenant_id uuid default null,
    filter_case_type text default null
) returns table (
    id uuid,
    document_id uuid,
    text text,
    score double precision,
    metadata jsonb
) language sql stable as $$
    select
        c.id,
        c.document_id,
        c.text,
        (1 - (c.embedding <=> query_embedding))::double precision as score,
        c.metadata
    from public.rag_chunks c
    where c.embedding is not null
      and (filter_document_ids is null or c.document_id = any(filter_document_ids))
      and (filter_tenant_id is null or c.tenant_id = filter_tenant_id)
      and (filter_case_type is null or c.case_type = filter_case_type)
    order by c.embedding <=> query_embedding
    limit max_results;
$$;

-- =========================================================
-- Subscriptions (lifecycle FSM)
-- =========================================================
create table if not exists public.subscriptions (
    id                       uuid primary key default gen_random_uuid(),
    user_id                  uuid not null references auth.users(id) on delete cascade,
    org_id                   uuid,
    plan_code                text not null check (plan_code in ('free','lite','pro','business','enterprise')),
    status                   text not null check (status in (
        'trialing','active','past_due','paused','canceled','incomplete','incomplete_expired'
    )),
    trial_end                timestamptz,
    current_period_start     timestamptz not null,
    current_period_end       timestamptz not null,
    cancel_at_period_end     boolean not null default false,
    paused_at                timestamptz,
    paused_until             timestamptz,
    past_due_retries         integer not null default 0,
    stripe_subscription_id   text unique,
    stripe_customer_id       text,
    pending_plan_change      text,
    pending_effective_at     timestamptz,
    metadata                 jsonb not null default '{}'::jsonb,
    created_at               timestamptz not null default now(),
    updated_at               timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_active
    on public.subscriptions(user_id)
    where status in ('trialing','active','past_due','paused');
create index if not exists idx_subscriptions_period_end
    on public.subscriptions(current_period_end)
    where status in ('active','trialing');

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_self" on public.subscriptions;
create policy "subscriptions_self" on public.subscriptions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Invoices (Polish VAT)
-- =========================================================
create table if not exists public.invoices (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references auth.users(id) on delete cascade,
    org_id              uuid,
    number              text not null unique,
    issue_date          date not null,
    sale_date           date not null,
    payment_due_date    date not null,
    payment_method      text not null check (payment_method in ('transfer','card','blik','cash')),
    currency            text not null default 'PLN' check (currency in ('PLN','EUR','USD')),
    exchange_rate       numeric(10,4),
    exchange_rate_date  date,

    seller_name         text not null,
    seller_address      text not null,
    seller_nip          text,

    buyer_name          text not null,
    buyer_address       text not null,
    buyer_country       text not null default 'PL',
    buyer_nip           text,
    buyer_vat_id        text,
    buyer_pesel         text,
    buyer_kind          text not null check (buyer_kind in ('consumer','business_pl','business_eu','business_world')),

    net_cents           bigint not null,
    vat_cents           bigint not null,
    gross_cents         bigint not null,
    breakdown           jsonb not null default '{}'::jsonb,
    annotations         text[] not null default '{}',
    mpp_required        boolean not null default false,
    reverse_charge      boolean not null default false,

    status              text not null default 'draft'
        check (status in ('draft','issued','paid','overdue','canceled')),
    paid_at             timestamptz,
    pdf_url             text,
    ksef_reference      text,
    created_at          timestamptz not null default now()
);

create index if not exists idx_invoices_user on public.invoices(user_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_issue_date on public.invoices(issue_date desc);

alter table public.invoices enable row level security;

drop policy if exists "invoices_self" on public.invoices;
create policy "invoices_self" on public.invoices
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Invoice lines
-- =========================================================
create table if not exists public.invoice_lines (
    id                      uuid primary key default gen_random_uuid(),
    invoice_id              uuid not null references public.invoices(id) on delete cascade,
    line_no                 integer not null,
    description             text not null,
    quantity                numeric(12,4) not null,
    unit                    text not null,
    unit_price_net_cents    bigint not null,
    net_cents               bigint not null,
    vat_rate                text not null check (vat_rate in ('23','8','5','0','zw','np')),
    vat_cents               bigint not null,
    gross_cents             bigint not null,
    pkwiu                   text,
    appendix15              boolean not null default false,
    unique (invoice_id, line_no)
);

create index if not exists idx_invoice_lines_invoice on public.invoice_lines(invoice_id);

alter table public.invoice_lines enable row level security;

drop policy if exists "invoice_lines_self" on public.invoice_lines;
create policy "invoice_lines_self" on public.invoice_lines
    for all using (
        exists (
            select 1 from public.invoices i
            where i.id = invoice_lines.invoice_id and i.user_id = auth.uid()
        )
    ) with check (
        exists (
            select 1 from public.invoices i
            where i.id = invoice_lines.invoice_id and i.user_id = auth.uid()
        )
    );

-- end of Tier 19 migration
