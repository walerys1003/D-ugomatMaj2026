-- =============================================================================
-- Długomat — Tier 5 zad. 229 — Web Vitals dashboard table
-- =============================================================================
-- Tabela do agregacji metryk Core Web Vitals (CLS, INP, LCP, FCP, TTFB, FID)
-- wysyłanych z `app/web-vitals.tsx` przez `/api/observability/vitals`.
--
-- Cel: P75 dashboards w panelu admin (zamiast wyłącznie strukturalnych logów).
-- =============================================================================

create table if not exists public.web_vitals (
  id bigserial primary key,
  metric_name text not null,                -- 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB' | 'FID'
  value numeric(12, 3) not null,
  rating text,                              -- 'good' | 'needs-improvement' | 'poor'
  delta numeric(12, 3),
  navigation_type text,
  url_path text,
  ip_hash text,                             -- hashed IP (no PII)
  user_agent_short text,
  created_at timestamptz not null default now(),

  constraint web_vitals_metric_known check (
    metric_name in ('LCP', 'CLS', 'INP', 'FCP', 'TTFB', 'FID')
  ),
  constraint web_vitals_rating_known check (
    rating is null or rating in ('good', 'needs-improvement', 'poor')
  )
);

-- Indeksy do dashboardu P75 (filter by name + bucket by day).
create index if not exists idx_web_vitals_name_created
  on public.web_vitals(metric_name, created_at desc);
create index if not exists idx_web_vitals_url_path
  on public.web_vitals(url_path)
  where url_path is not null;

-- RLS: tylko admin (przez service-role bypass) — zwykli userzy nie czytają.
alter table public.web_vitals enable row level security;
alter table public.web_vitals force row level security;
-- INSERT: tylko service role (endpoint /api/observability/vitals).
-- SELECT: tylko service role (admin queries).

comment on table public.web_vitals is
  'Core Web Vitals zebrane z klienta (CLS/INP/LCP/FCP/TTFB/FID) — Tier 5 zad. 229.';
