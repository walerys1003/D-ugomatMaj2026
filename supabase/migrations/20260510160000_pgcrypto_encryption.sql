-- =============================================================================
-- Długomat — Tier 5 / Migration — pgcrypto encryption-at-rest helpers (zad. 207)
--
-- Cel: szyfrowanie wrażliwych danych osobowych (PESEL, NIP pozwanego, raw OCR
-- text) na poziomie kolumny w bazie. Klucz pochodzi z parametru sesji
-- `app.encryption_key` (ustawianego z env DB_ENCRYPTION_KEY na poziomie
-- aplikacji), aby nigdy nie był persystowany ani w bazie, ani w migracjach.
--
-- Algorytm: pgp_sym_encrypt z compress-algo=2 (zlib) i cipher-algo=aes256.
-- Format: bytea (już mamy pozwany_pesel_enc bytea).
--
-- Threat model:
-- - Ochrona przed dump'em bazy (backup wycieka → ciphertext bez klucza
--   bezużyteczny).
-- - Ochrona przed read-only access do bazy (np. analytics replica).
-- - NIE chroni przed kompromitacją aplikacji — klucz musi być dostępny
--   dla aplikacji żeby działała funkcjonalność.
--
-- Bezpieczeństwo klucza:
-- - Trzymany w env (Vercel: DB_ENCRYPTION_KEY, ≥ 32 bajty).
-- - Przy każdym połączeniu aplikacja wywołuje
--   `select set_config('app.encryption_key', $1, false)` przez RPC
--   `fn_set_encryption_key()` poniżej.
-- =============================================================================

create extension if not exists pgcrypto with schema public;

-- ---------------------------------------------------------------------------
-- Helper: ustaw klucz w bieżącej sesji (per-connection).
--
-- Wywoływane przez aplikację (Supabase JS client) tuż po nawiązaniu połączenia
-- przez RPC. Funkcja musi być SECURITY DEFINER — w przeciwnym wypadku Supabase
-- z anon/authenticated rolą nie ma uprawnień do `set_config`.
-- ---------------------------------------------------------------------------

create or replace function public.fn_set_encryption_key(p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Walidacja: klucz min 32 bajty (256 bit). Defense in depth.
  if p_key is null or length(p_key) < 32 then
    raise exception 'fn_set_encryption_key: klucz musi mieć co najmniej 32 znaki'
      using errcode = '22023';
  end if;
  -- `false` = setting visible w bieżącej sesji do końca transakcji /
  -- transakcyjnie poza nią (per-session).
  perform set_config('app.encryption_key', p_key, false);
end;
$$;

revoke all on function public.fn_set_encryption_key(text) from public;
grant execute on function public.fn_set_encryption_key(text) to authenticated, service_role;

comment on function public.fn_set_encryption_key(text) is
  'Tier 5 zad. 207 — ustawia per-session klucz szyfrowania dla pgcrypto. '
  'Wywoływane przez aplikację po pollingu połączenia.';

-- ---------------------------------------------------------------------------
-- Helpery do szyfrowania / deszyfrowania.
--
-- Używane jako wrapper w UPDATE / SELECT zamiast bezpośredniego pgp_sym_*,
-- żeby:
--   1) ujednolicić format (cipher-algo, compress-algo)
--   2) wyrzucać przyjazny błąd gdy klucz nie został ustawiony
--   3) automatycznie zwracać NULL dla pustego inputu (NULL-safe)
-- ---------------------------------------------------------------------------

create or replace function public.fn_encrypt_pii(p_plain text)
returns bytea
language plpgsql
immutable
security invoker
as $$
declare
  v_key text;
begin
  if p_plain is null or length(trim(p_plain)) = 0 then
    return null;
  end if;
  v_key := current_setting('app.encryption_key', true);
  if v_key is null or length(v_key) < 32 then
    raise exception 'fn_encrypt_pii: brak klucza w sesji (app.encryption_key); '
                    'wywołaj fn_set_encryption_key() po nawiązaniu połączenia'
      using errcode = '28000';
  end if;
  return pgp_sym_encrypt(
    p_plain,
    v_key,
    'cipher-algo=aes256, compress-algo=2'
  );
end;
$$;

revoke all on function public.fn_encrypt_pii(text) from public;
grant execute on function public.fn_encrypt_pii(text) to authenticated, service_role;

comment on function public.fn_encrypt_pii(text) is
  'Szyfruje text → bytea (AES-256, zlib). NULL-safe. Wymaga app.encryption_key.';

create or replace function public.fn_decrypt_pii(p_cipher bytea)
returns text
language plpgsql
security invoker
as $$
declare
  v_key text;
begin
  if p_cipher is null then
    return null;
  end if;
  v_key := current_setting('app.encryption_key', true);
  if v_key is null or length(v_key) < 32 then
    raise exception 'fn_decrypt_pii: brak klucza w sesji (app.encryption_key)'
      using errcode = '28000';
  end if;
  return pgp_sym_decrypt(p_cipher, v_key);
exception
  when others then
    -- Nie wycieka szczegółów błędu kryptograficznego do klienta.
    raise exception 'fn_decrypt_pii: deszyfrowanie nie powiodło się'
      using errcode = '22023';
end;
$$;

revoke all on function public.fn_decrypt_pii(bytea) from public;
grant execute on function public.fn_decrypt_pii(bytea) to authenticated, service_role;

comment on function public.fn_decrypt_pii(bytea) is
  'Deszyfruje bytea → text. Wymaga app.encryption_key. Maskuje błędy kryptograficzne.';

-- ---------------------------------------------------------------------------
-- Rozszerz schemę o dodatkowe kolumny szyfrowane (NIP pozwanego, OCR raw).
--
-- pozwany_pesel_enc już istnieje (z migracji 004). Dodajemy:
--   - cases.pozwany_nip_enc (bytea) — NIP pozwanego (niektóre sprawy B2B)
--   - ocr_results.raw_text_enc (bytea) — raw OCR (skan PDF) szyfrowany,
--     bo zawiera kompletne dane sprawy łącznie z numerami rachunków,
--     PESEL-ami stron, adresami.
-- ---------------------------------------------------------------------------

alter table public.cases
  add column if not exists pozwany_nip_enc bytea;

comment on column public.cases.pozwany_nip_enc is
  'NIP pozwanego (B2B), pgcrypto AES-256. Plain NIP nigdy nie zapisywany.';

-- ocr_results — tylko jeśli tabela istnieje (migracja 005 ją tworzy).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'ocr_results'
  ) then
    execute 'alter table public.ocr_results
              add column if not exists raw_text_enc bytea';
    execute $cmt$ comment on column public.ocr_results.raw_text_enc is
      'Pełny tekst OCR (potencjalnie zawiera PESEL-e, IBAN-y, dane stron) '
      'zaszyfrowany pgcrypto AES-256. Plaintext raw_text deprecated.' $cmt$;
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Widok pomocniczy: cases_decrypted (tylko service_role) — zwraca kolumny
-- szyfrowane jako plain text. Używany przez admin pulpit i przez procesy
-- generacji pism (które potrzebują plain PESEL do prompt template).
--
-- Brak grant'u dla anon/authenticated — RLS w tabeli i tak by zablokował,
-- ale defense-in-depth.
-- ---------------------------------------------------------------------------

create or replace view public.cases_decrypted as
  select
    c.id,
    c.user_id,
    c.pozwany_pesel_enc,
    case when c.pozwany_pesel_enc is not null
         then public.fn_decrypt_pii(c.pozwany_pesel_enc)
         else null end                                    as pozwany_pesel,
    c.pozwany_nip_enc,
    case when c.pozwany_nip_enc is not null
         then public.fn_decrypt_pii(c.pozwany_nip_enc)
         else null end                                    as pozwany_nip
  from public.cases c
  where c.deleted_at is null;

revoke all on public.cases_decrypted from public, anon, authenticated;
grant select on public.cases_decrypted to service_role;

comment on view public.cases_decrypted is
  'Deszyfrowany widok cases (service_role only). Używany przez generacje '
  'pism i admin tooling. RLS via underlying table.';
