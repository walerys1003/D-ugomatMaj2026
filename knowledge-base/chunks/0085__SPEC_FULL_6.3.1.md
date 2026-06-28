# 6.3.1 — Auth (/api/auth/)

_source: SPEC_FULL · tags: database, notifications · line 887 · 609 chars_

POST /api/auth/register — rejestracja: email + password (min 8 znaków, 1 cyfra, 1 wielka litera) lub magic link. Tworzy konto w Supabase Auth, wiersz w profiles, wysyła e-mail powitalny (AWS SES). Zwraca { user_id, session_token }.
POST /api/auth/login — logowanie: email + password lub magic link. Zwraca { session_token, expires_at }. Błędne hasło → throttling (1s, 2s, 4s, 8s delay do max 30s).
POST /api/auth/logout — unieważnienie sesji, czyszczenie cookie.
POST /api/auth/reset-password — wysyłka linku reset (ważny 1h) na e-mail.
POST /api/auth/callback — obsługa callbacku magic link i OAuth (Google).
