# 6.3.7 — Notifications (/api/notifications/)

_source: SPEC_FULL · tags: notifications · line 941 · 279 chars_

GET /api/notifications/deadlines — lista nadchodzących terminów użytkownika z odliczaniem.
POST /api/notifications/send — (wewnętrzne, wywoływane przez CRON Edge Function) — wysyłka powiadomień o terminach. Logika: D-7, D-5, D-3, D-1, D-0 (rano), D-0 (wieczór — OSTATNIA SZANSA).
