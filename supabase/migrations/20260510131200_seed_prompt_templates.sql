-- =============================================================================
-- Długomat — Tier 2 / Migration 014 — Seed prompt templates (placeholder for Tier 3)
-- Tier 2 wstawia placeholdery, by API miało po czym renderować. Pełne prompty
-- wgramy w Tier 3 razem z aktywacją Claude Sonnet/Haiku/Opus.
-- =============================================================================

insert into public.prompt_templates
  (case_type, variant, version, system_prompt, user_prompt_template, required_variables, model, temperature, max_tokens, is_active, notes)
values
  -- D2 Sprzeciw EPU (główny moduł — Tier 2 vertical slice używa template'a statycznego)
  (
    'sprzeciw_epu', 'default', 1,
    'Jesteś prawnikiem specjalizującym się w polskim postępowaniu nakazowym (EPU). Pisz rzeczowo, formalnie, w II osobie.',
    'Wygeneruj sprzeciw od nakazu zapłaty w EPU dla klienta:\nSygnatura: {{sygnatura}}\nSąd: {{sad}}\nData doręczenia: {{data_doreczenia}}\nKwota: {{kwota_glowna}} PLN\nZarzuty: {{zarzuty}}\n',
    array['sygnatura','sad','data_doreczenia','kwota_glowna','zarzuty'],
    'claude-sonnet-4-5', 0.20, 4096, false,
    'Tier 2 placeholder. Aktywujemy w Tier 3 po wgraniu finalnego prompt v2.'
  ),
  -- D5 BIK reklamacja do banku
  (
    'bik_reklamacja_bank', 'default', 1,
    'Jesteś prawnikiem specjalizującym się w sprawach BIK / reklamacji bankowych.',
    'Wygeneruj reklamację do banku w sprawie wpisu BIK:\nBank: {{bank_nazwa}}\nNumer umowy: {{numer_umowy}}\nKwota: {{kwota_kredytu}} PLN\nZarzuty: {{zarzuty}}',
    array['bank_nazwa','numer_umowy','kwota_kredytu','zarzuty'],
    'claude-sonnet-4-5', 0.20, 4096, false,
    'Tier 2 placeholder.'
  )
on conflict do nothing;

comment on table public.prompt_templates is
  'Wersjonowane prompty per case_type. Tier 2 wstawia placeholdery, Tier 3 podmienia na produkcyjne.';
