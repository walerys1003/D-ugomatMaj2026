-- =============================================================================
-- Długomat — Tier 2 / Migration 004 — Cases (sprawy)
-- Source: docs/spec/SPEC_FULL.txt §7.2 Migration 003
-- Każda sprawa = jedna instancja modułu D1–D8 prowadzona przez użytkownika.
-- =============================================================================

create table if not exists public.cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  type public.case_type not null,
  status public.case_status not null default 'draft',
  title text not null default '',

  -- Dane wspólne sprawy (wypełniane przez kreator lub OCR) -------------------
  sygnatura text,                          -- np. "VI Nc-e 1234567/25"
  sad text,                                -- nazwa sądu / urzędu
  data_nakazu date,                        -- data wydania pisma
  data_doreczenia date,                    -- data doręczenia pozwanemu

  -- Strony --------------------------------------------------------------------
  powod_nazwa text,                        -- powód / wierzyciel
  powod_adres text,
  pozwany_nazwa text,                      -- pozwany / dłużnik (zazwyczaj user)
  pozwany_adres text,
  pozwany_pesel_enc bytea,                 -- PESEL szyfrowany pgcrypto (Tier 5)

  -- Kwoty ---------------------------------------------------------------------
  kwota_glowna numeric(12,2),
  kwota_odsetki numeric(12,2),
  kwota_koszty numeric(12,2),
  kwota_razem numeric(12,2) generated always as (
    coalesce(kwota_glowna, 0) + coalesce(kwota_odsetki, 0) + coalesce(kwota_koszty, 0)
  ) stored,

  -- Metadata typ-specyficzna (kontrakt JSON udokumentowany per case_type) -----
  metadata jsonb not null default '{}'::jsonb,

  -- Draft kreatora (state machine + odpowiedzi user'a, używane podczas wizard) -
  wizard_state jsonb not null default jsonb_build_object(
    'current_step', 'start',
    'completed_steps', jsonb_build_array(),
    'answers', jsonb_build_object(),
    'last_saved_at', null
  ),

  -- Soft-delete + audyt -------------------------------------------------------
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint cases_kwota_glowna_positive check (kwota_glowna is null or kwota_glowna >= 0),
  constraint cases_kwota_odsetki_positive check (kwota_odsetki is null or kwota_odsetki >= 0),
  constraint cases_kwota_koszty_positive  check (kwota_koszty  is null or kwota_koszty  >= 0)
);

drop trigger if exists cases_touch_updated_at on public.cases;
create trigger cases_touch_updated_at
  before update on public.cases
  for each row execute function public.tg_touch_updated_at();

create index if not exists idx_cases_user_id        on public.cases(user_id);
create index if not exists idx_cases_status         on public.cases(status);
create index if not exists idx_cases_type           on public.cases(type);
create index if not exists idx_cases_user_status    on public.cases(user_id, status) where deleted_at is null;
create index if not exists idx_cases_user_active    on public.cases(user_id, created_at desc) where deleted_at is null;
create index if not exists idx_cases_metadata_gin   on public.cases using gin(metadata);

-- Każda sprawa ma odpowiednią konwencję tytułu jeżeli pusty (auto-fill)
create or replace function public.cases_autofill_title()
returns trigger
language plpgsql
as $$
declare
  pretty text;
begin
  if new.title is null or btrim(new.title) = '' then
    pretty := case new.type
      when 'sprzeciw_epu'                  then 'Sprzeciw od nakazu zapłaty (EPU)'
      when 'komornik_zwolnienie_konta'     then 'Wniosek o zwolnienie rachunku spod egzekucji'
      when 'komornik_zwolnienie_swiadczen' then 'Wniosek o zwolnienie świadczeń spod egzekucji'
      when 'komornik_skarga'               then 'Skarga na czynność komornika'
      when 'komornik_ograniczenie'         then 'Wniosek o ograniczenie egzekucji'
      when 'komornik_umorzenie'            then 'Wniosek o umorzenie egzekucji'
      when 'komornik_raty'                 then 'Wniosek o rozłożenie zaległości na raty'
      when 'potracenia_wniosek_pracodawca' then 'Wniosek do pracodawcy o ograniczenie potrąceń'
      when 'potracenia_wniosek_komornik'   then 'Wniosek do komornika o ograniczenie potrąceń'
      when 'bik_reklamacja_bank'           then 'Reklamacja do banku (BIK)'
      when 'bik_reklamacja_bik'            then 'Reklamacja do BIK'
      when 'bik_skarga_uodo'               then 'Skarga do UODO (BIK)'
      when 'cesja_odpowiedz'               then 'Odpowiedź na wezwanie funduszu (cesja)'
      when 'ugoda_raty'                    then 'Propozycja ugody — raty'
      when 'ugoda_umorzenie'               then 'Propozycja ugody — częściowe umorzenie'
      when 'ugoda_propozycja'              then 'Propozycja ugody — indywidualna'
      when 'upadlosc_wniosek'              then 'Wniosek o ogłoszenie upadłości konsumenckiej'
      else 'Sprawa Długomat'
    end;
    new.title := pretty;
  end if;
  return new;
end;
$$;

drop trigger if exists cases_autofill_title_trg on public.cases;
create trigger cases_autofill_title_trg
  before insert on public.cases
  for each row execute function public.cases_autofill_title();

comment on table public.cases is
  'Sprawa = jedna instancja modułu D1–D8. Trzyma wspólne dane oraz state machine kreatora.';
comment on column public.cases.metadata is
  'Typ-specyficzne pola per case_type. Kontrakt JSON udokumentowany w docs/spec/SPEC_FULL.txt §7.2.';
comment on column public.cases.wizard_state is
  'Persisted draft kreatora — pozwala wrócić do nieukończonej sprawy.';
