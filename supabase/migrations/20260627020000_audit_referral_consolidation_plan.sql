-- =============================================================================
-- Długomat — Audyt 2026-06-27 — #16 Konsolidacja referral v1/v2 (PLAN, NON-DESTRUCTIVE)
-- =============================================================================
-- USTALENIA Z ANALIZY KODU (apps/web):
--   v1  referral_codes            (5 użyć)  — model afiliacyjny: reward_pct,
--                                             total_revenue_grosze, liczniki
--   v2  referral_codes_v2         (3 użycia)— prosty invite→credit (uses, code)
--       referral_redemptions_v2  (4 użycia)
--       referral_credits_v2      (5 użyć)
--   osobny system affiliate_*    (accounts/referrals/commissions/payouts/clicks)
--
-- WNIOSEK: v1 i v2 NIE są równoważne 1:1 (inna semantyka: prowizje % vs
-- kredyty kwotowe). Ślepy backfill/merge zniekształciłby dane. Dlatego ta
-- migracja jest WYŁĄCZNIE NIEDESTRUKCYJNA — tworzy widok diagnostyczny do
-- oceny nakładania się systemów na żywych danych przed decyzją o cutover.
--
-- REKOMENDOWANY CUTOVER (osobny PR, po przejrzeniu danych przez właściciela):
--   1. Wybrać docelowy model (rekomendacja: v2 invite-credit dla użytkowników
--      końcowych + affiliate_* dla partnerów B2B; v1 referral_codes → retire).
--   2. Zmapować aktywne v1 referral_codes z reward_pct>0 do affiliate_accounts.
--   3. Codemod call-site'ów v1 (callback/route.ts, referral-actions.ts) → v2.
--   4. Po potwierdzeniu zero ruchu na v1: DROP referral_codes (+clicks/conversions).
-- =============================================================================

-- Widok diagnostyczny — pokazuje użytkowników mających kody w obu systemach,
-- co pozwala oszacować zakres migracji (bez modyfikacji danych).
create or replace view public.referral_systems_overlap as
select
  coalesce(v1.user_id, v2.user_id)                  as user_id,
  v1.code                                           as v1_code,
  v1.reward_pct                                     as v1_reward_pct,
  v1.total_revenue_grosze                           as v1_revenue_grosze,
  v1.is_active                                       as v1_active,
  v2.code                                           as v2_code,
  v2.uses                                           as v2_uses,
  (v1.user_id is not null and v2.user_id is not null) as in_both_systems
from public.referral_codes v1
full outer join public.referral_codes_v2 v2
  on v1.user_id = v2.user_id;

comment on view public.referral_systems_overlap is
  'Audyt #16 — diagnostyka nakładania się referral v1 (referral_codes) i v2 '
  '(referral_codes_v2). Read-only. Do oceny zakresu migracji przed cutover. '
  'NIE jest źródłem prawdy aplikacji.';
