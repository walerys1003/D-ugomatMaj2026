# 13.2 — Deadline CRON (Edge Function)

_source: SPEC_FULL · tags: database, notifications · line 2224 · 474 chars_

Supabase Edge Function deadline-checker uruchamiana co godzinę (CRON: 0 * * * *). Algorytm: query deadlines WHERE is_completed = false AND deadline_date >= CURRENT_DATE. Dla każdego deadline’u: sprawdź które powiadomienia jeszcze nie wysłane (notif_d7_sent, etc.). Jeśli dzisiaj = deadline_date - 7 AND notif_d7_sent = false → wyślij email + update notif_d7_sent = true. Analogicznie D-5, D-3, D-1, D-0 (rano, godzina 8:00), D-0 (wieczór, godzina 19:00 — „OSTATNIA SZANSA").
